import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import Svg, {
  Circle,
  Defs,
  G,
  Path,
  Pattern,
  Polyline,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

// A fully offline, tile-less metro map. It projects the bundled GTFS shapes and
// stops to a fixed SVG canvas and lets the user pan/pinch it around — no Google
// Maps SDK, no API key, no network. Visual parity with the old react-native-maps
// screen: coloured lines, station dots, interchange labels, and a highlighted
// journey with A/B endpoints.

// Web Mercator projection (good enough at city scale; keeps line shapes true).
const mercator = (lat, lon) => ({
  x: (lon * Math.PI) / 180,
  y: Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)),
});

const CANVAS_W = 1000; // virtual canvas width in SVG units; height derives from bbox
const PAD = 40; // inner padding so lines/labels near the edges aren't clipped

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

const BG = '#EEF2F8';

// Static graph-paper backdrop (fixed behind the pannable map) so the canvas
// doesn't read as a flat dull grey.
const GridBackground = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Svg width="100%" height="100%">
      <Defs>
        <Pattern
          id="minorGrid"
          width={26}
          height={26}
          patternUnits="userSpaceOnUse">
          <Path d="M26 0 H0 V26" fill="none" stroke="#E2E8F2" strokeWidth={1} />
        </Pattern>
        <Pattern
          id="grid"
          width={130}
          height={130}
          patternUnits="userSpaceOnUse">
          <Rect width={130} height={130} fill="url(#minorGrid)" />
          <Path
            d="M130 0 H0 V130"
            fill="none"
            stroke="#D3DCEA"
            strokeWidth={1.4}
          />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#grid)" />
    </Svg>
  </View>
);

const OfflineMetroMap = forwardRef(
  (
    {
      shapes = {},
      stations = [],
      selectedRoute = {},
      showRoute = false,
      hiddenSet = new Set(),
      routeInterchangeSet = new Set(),
      currentLocation = null,
      getLineInfo = () => ({color: '#888'}),
    },
    ref,
  ) => {
    // --- Projection -------------------------------------------------------
    // Build a projector from the union of all shape points (falls back to the
    // station coordinates before shapes have loaded).
    const {project, canvasH} = useMemo(() => {
      const pts = [];
      const add = (lat, lon) => {
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          pts.push(mercator(lat, lon));
        }
      };
      Object.values(shapes).forEach(line =>
        line.forEach(p => add(p.latitude, p.longitude)),
      );
      if (pts.length === 0) {
        stations.forEach(s => add(s.coords?.latitude, s.coords?.longitude));
      }
      if (pts.length === 0) {
        return {project: () => ({x: 0, y: 0}), canvasH: CANVAS_W};
      }
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      pts.forEach(({x, y}) => {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      });
      const spanX = maxX - minX || 1;
      const spanY = maxY - minY || 1;
      const innerW = CANVAS_W - PAD * 2;
      const cH = innerW * (spanY / spanX) + PAD * 2;
      const innerH = cH - PAD * 2;
      const projector = (lat, lon) => {
        const m = mercator(lat, lon);
        return {
          x: PAD + ((m.x - minX) / spanX) * innerW,
          // Flip Y: higher latitude (north) should be towards the top.
          y: PAD + (1 - (m.y - minY) / spanY) * innerH,
        };
      };
      return {project: projector, canvasH: cH};
    }, [shapes, stations]);

    // --- Precomputed geometry --------------------------------------------
    const lines = useMemo(
      () =>
        Object.entries(shapes).map(([id, coords]) => ({
          id,
          color: (coords[0]?.shape_color || '#888').trim(),
          points: coords
            .filter(
              c => Number.isFinite(c.latitude) && Number.isFinite(c.longitude),
            )
            .map(c => {
              const p = project(c.latitude, c.longitude);
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            })
            .join(' '),
        })),
      [shapes, project],
    );

    const projectedStations = useMemo(
      () =>
        stations
          .filter(
            s =>
              Number.isFinite(s.coords?.latitude) &&
              Number.isFinite(s.coords?.longitude),
          )
          .map(s => ({
            ...s,
            p: project(s.coords.latitude, s.coords.longitude),
          })),
      [stations, project],
    );

    // Journey segments (white casing + coloured line), grouped by line colour.
    const routeSegments = useMemo(() => {
      if (!showRoute || !selectedRoute?.path?.length) return [];
      const byId = new Map(stations.map(s => [String(s.id), s]));
      const segs = [];
      let cur = null;
      selectedRoute.path.forEach((id, i) => {
        const st = byId.get(String(id));
        if (
          !st ||
          !Number.isFinite(st.coords?.latitude) ||
          !Number.isFinite(st.coords?.longitude)
        )
          return;
        const color = getLineInfo(selectedRoute.colorPath?.[i]).color;
        if (!cur || cur.color !== color) {
          cur = {color, pts: []};
          if (segs.length) cur.pts.push(segs[segs.length - 1].pts.slice(-1)[0]);
          segs.push(cur);
        }
        const p = project(st.coords.latitude, st.coords.longitude);
        cur.pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
      });
      return segs;
    }, [showRoute, selectedRoute, stations, project, getLineInfo]);

    const routeStations = useMemo(() => {
      if (!showRoute || !selectedRoute?.path?.length) return [];
      const byId = new Map(stations.map(s => [String(s.id), s]));
      return selectedRoute.path
        .map((id, i) => {
          const st = byId.get(String(id));
          if (
            !st ||
            !Number.isFinite(st.coords?.latitude) ||
            !Number.isFinite(st.coords?.longitude)
          )
            return null;
          const p = project(st.coords.latitude, st.coords.longitude);
          return {
            id,
            name: st.name,
            p,
            color: getLineInfo(selectedRoute.colorPath?.[i]).color,
            isOrigin: i === 0,
            isDest: i === selectedRoute.path.length - 1,
            isInterchange: routeInterchangeSet.has(id),
          };
        })
        .filter(Boolean);
    }, [
      showRoute,
      selectedRoute,
      stations,
      project,
      getLineInfo,
      routeInterchangeSet,
    ]);

    // --- Pan / pinch ------------------------------------------------------
    const tx = useRef(new Animated.Value(0)).current;
    const ty = useRef(new Animated.Value(0)).current;
    const sc = useRef(new Animated.Value(1)).current;
    // JS-side mirrors so gestures can read the current transform synchronously.
    const txRef = useRef(0);
    const tyRef = useRef(0);
    const scRef = useRef(1);
    const fitRef = useRef({scale: 1, tx: 0, ty: 0});
    const viewport = useRef({w: 0, h: 0});
    const panRef = useRef(null);
    const pinchRef = useRef(null);
    const tapRef = useRef(null);
    const lastPan = useRef({x: 0, y: 0});
    const lastPinch = useRef(1);
    const [ready, setReady] = useState(false);
    const [selected, setSelected] = useState(null);

    const set = (txv, tyv, scv) => {
      txRef.current = txv;
      tyRef.current = tyv;
      scRef.current = scv;
      tx.setValue(txv);
      ty.setValue(tyv);
      sc.setValue(scv);
    };

    const animateTo = (txv, tyv, scv) => {
      txRef.current = txv;
      tyRef.current = tyv;
      scRef.current = scv;
      Animated.parallel([
        Animated.timing(tx, {toValue: txv, duration: 260, useNativeDriver: true}),
        Animated.timing(ty, {toValue: tyv, duration: 260, useNativeDriver: true}),
        Animated.timing(sc, {toValue: scv, duration: 260, useNativeDriver: true}),
      ]).start();
    };

    const fitToScreen = (w, h) => {
      const s = Math.min(w / CANVAS_W, h / canvasH) * 0.96;
      const fit = {
        scale: s,
        tx: (w - s * CANVAS_W) / 2,
        ty: (h - s * canvasH) / 2,
      };
      fitRef.current = fit;
      set(fit.tx, fit.ty, fit.scale);
    };

    const onLayout = e => {
      const {width, height} = e.nativeEvent.layout;
      viewport.current = {w: width, h: height};
      fitToScreen(width, height);
      if (!ready) setReady(true);
    };

    const minScale = () => fitRef.current.scale * 0.7;
    const maxScale = () => fitRef.current.scale * 14;

    // Old-style gesture-handler API (works without reanimated). Pan and pinch
    // apply incremental deltas so they compose cleanly when used together.
    const onPanEvent = ({nativeEvent}) => {
      const dx = nativeEvent.translationX - lastPan.current.x;
      const dy = nativeEvent.translationY - lastPan.current.y;
      lastPan.current = {x: nativeEvent.translationX, y: nativeEvent.translationY};
      set(txRef.current + dx, tyRef.current + dy, scRef.current);
    };
    const onPanState = ({nativeEvent}) => {
      if (nativeEvent.state === State.BEGAN) lastPan.current = {x: 0, y: 0};
    };
    const onPinchEvent = ({nativeEvent}) => {
      const factor = nativeEvent.scale / lastPinch.current;
      lastPinch.current = nativeEvent.scale;
      const next = clamp(scRef.current * factor, minScale(), maxScale());
      const ratio = next / scRef.current;
      const {focalX: fx, focalY: fy} = nativeEvent;
      set(fx - ratio * (fx - txRef.current), fy - ratio * (fy - tyRef.current), next);
    };
    const onPinchState = ({nativeEvent}) => {
      if (nativeEvent.state === State.BEGAN) lastPinch.current = 1;
    };
    // Tap a station to reveal its name. The tap point is in container/screen
    // space, so we invert the current pan/zoom transform to get canvas
    // coordinates, then pick the nearest station within a small radius.
    const onTap = ({nativeEvent}) => {
      if (nativeEvent.state !== State.ACTIVE) return;
      const cx = (nativeEvent.x - txRef.current) / scRef.current;
      const cy = (nativeEvent.y - tyRef.current) / scRef.current;
      const thr = 18 / scRef.current; // ~18 screen px regardless of zoom level
      let best = null;
      let bestD = thr;
      projectedStations.forEach(s => {
        const d = Math.hypot(s.p.x - cx, s.p.y - cy);
        if (d < bestD) {
          bestD = d;
          best = s;
        }
      });
      setSelected(best ? best.id : null);
    };

    // --- Imperative controls (used by the on-screen buttons) --------------
    const zoomByFactor = factor => {
      const {w, h} = viewport.current;
      const next = clamp(scRef.current * factor, minScale(), maxScale());
      const ratio = next / scRef.current;
      const cx = w / 2;
      const cy = h / 2;
      animateTo(cx - ratio * (cx - txRef.current), cy - ratio * (cy - tyRef.current), next);
    };

    useImperativeHandle(ref, () => ({
      zoomIn: () => zoomByFactor(1.6),
      zoomOut: () => zoomByFactor(1 / 1.6),
      reset: () => {
        const {w, h} = viewport.current;
        if (w && h) fitToScreenAnimated(w, h);
      },
      fitToCoordinates: coords => fitTo(coords),
      centerOn: coord => centerOn(coord),
    }));

    const fitToScreenAnimated = (w, h) => {
      const s = Math.min(w / CANVAS_W, h / canvasH) * 0.96;
      animateTo((w - s * CANVAS_W) / 2, (h - s * canvasH) / 2, s);
    };

    const fitTo = coords => {
      const {w, h} = viewport.current;
      if (!w || !h || !coords?.length) return;
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      coords.forEach(c => {
        const p = project(c.latitude, c.longitude);
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
      const bw = maxX - minX || 1;
      const bh = maxY - minY || 1;
      const s = clamp(
        Math.min((w - 80) / bw, (h - 200) / bh),
        minScale(),
        maxScale(),
      );
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      animateTo(w / 2 - s * cx, h / 2 - s * cy, s);
    };

    const centerOn = coord => {
      const {w, h} = viewport.current;
      if (!w || !h || !coord) return;
      const p = project(coord.latitude, coord.longitude);
      const s = scRef.current;
      animateTo(w / 2 - s * p.x, h / 2 - s * p.y, s);
    };

    // --- Render -----------------------------------------------------------
    return (
      <View style={styles.container} onLayout={onLayout}>
        <GridBackground />
        <TapGestureHandler
          ref={tapRef}
          numberOfTaps={1}
          maxDist={12}
          simultaneousHandlers={[panRef, pinchRef]}
          onHandlerStateChange={onTap}>
          <View style={styles.fill}>
        <PinchGestureHandler
          ref={pinchRef}
          simultaneousHandlers={[panRef, tapRef]}
          onGestureEvent={onPinchEvent}
          onHandlerStateChange={onPinchState}>
          <PanGestureHandler
            ref={panRef}
            simultaneousHandlers={[pinchRef, tapRef]}
            avgTouches
            maxPointers={2}
            onGestureEvent={onPanEvent}
            onHandlerStateChange={onPanState}>
            <Animated.View
            style={[
              styles.canvas,
              {
                width: CANVAS_W,
                height: canvasH,
                transform: [{translateX: tx}, {translateY: ty}, {scale: sc}],
              },
            ]}>
            {ready && (
              <Svg width={CANVAS_W} height={canvasH}>
                {/* Base network */}
                {lines.map(l => {
                  if (!l.points || hiddenSet.has(l.color.toLowerCase()))
                    return null;
                  return (
                    <Polyline
                      key={l.id}
                      points={l.points}
                      fill="none"
                      stroke={showRoute ? '#CDD2D9' : l.color}
                      strokeWidth={showRoute ? 2 : 4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                })}

                {/* Highlighted journey: white casing under the coloured line */}
                {routeSegments.map((seg, i) => (
                  <Polyline
                    key={`case-${i}`}
                    points={seg.pts.join(' ')}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
                {routeSegments.map((seg, i) => (
                  <Polyline
                    key={`seg-${i}`}
                    points={seg.pts.join(' ')}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}

                {/* Stations — all-lines view */}
                {!showRoute &&
                  projectedStations.map(s => {
                    if (hiddenSet.has((s.color_code || '').toLowerCase()))
                      return null;
                    if (s.interchange === 'TRUE') {
                      return (
                        <G key={`all-${s.id}`}>
                          <Circle
                            cx={s.p.x}
                            cy={s.p.y}
                            r={5}
                            fill="#fff"
                            stroke={s.color_code}
                            strokeWidth={3}
                          />
                          <SvgText
                            x={s.p.x}
                            y={s.p.y - 9}
                            fontSize={9}
                            fontWeight="700"
                            fill="#1A1A1A"
                            stroke="#fff"
                            strokeWidth={0.6}
                            textAnchor="middle">
                            {s.name}
                          </SvgText>
                        </G>
                      );
                    }
                    return (
                      <Circle
                        key={`all-${s.id}`}
                        cx={s.p.x}
                        cy={s.p.y}
                        r={3}
                        fill={s.color_code}
                        stroke="#fff"
                        strokeWidth={1.2}
                      />
                    );
                  })}

                {/* Stations — journey view */}
                {showRoute &&
                  routeStations.map(s => {
                    if (s.isOrigin || s.isDest) {
                      return (
                        <G key={`route-${s.id}`}>
                          <Circle
                            cx={s.p.x}
                            cy={s.p.y}
                            r={7}
                            fill="#fff"
                            stroke={s.color}
                            strokeWidth={3}
                          />
                          <SvgText
                            x={s.p.x}
                            y={s.p.y + 3.5}
                            fontSize={9}
                            fontWeight="800"
                            fill={s.color}
                            textAnchor="middle">
                            {s.isOrigin ? 'A' : 'B'}
                          </SvgText>
                          <SvgText
                            x={s.p.x}
                            y={s.p.y - 12}
                            fontSize={10}
                            fontWeight="700"
                            fill="#1A1A1A"
                            stroke="#fff"
                            strokeWidth={0.6}
                            textAnchor="middle">
                            {s.name}
                          </SvgText>
                        </G>
                      );
                    }
                    if (s.isInterchange) {
                      return (
                        <G key={`route-${s.id}`}>
                          <Circle
                            cx={s.p.x}
                            cy={s.p.y}
                            r={5}
                            fill="#fff"
                            stroke={s.color}
                            strokeWidth={3}
                          />
                          <SvgText
                            x={s.p.x}
                            y={s.p.y - 9}
                            fontSize={9}
                            fontWeight="700"
                            fill="#1A1A1A"
                            stroke="#fff"
                            strokeWidth={0.6}
                            textAnchor="middle">
                            {s.name}
                          </SvgText>
                        </G>
                      );
                    }
                    return (
                      <Circle
                        key={`route-${s.id}`}
                        cx={s.p.x}
                        cy={s.p.y}
                        r={3.5}
                        fill="#fff"
                        stroke={s.color}
                        strokeWidth={2}
                      />
                    );
                  })}

                {/* Current location */}
                {currentLocation &&
                  Number.isFinite(currentLocation.latitude) &&
                  Number.isFinite(currentLocation.longitude) &&
                  (() => {
                    const p = project(
                      currentLocation.latitude,
                      currentLocation.longitude,
                    );
                    return (
                      <G>
                        <Circle cx={p.x} cy={p.y} r={13} fill="#1A73E8" opacity={0.16} />
                        {/* White backing ring so the dot reads over any line */}
                        <Circle cx={p.x} cy={p.y} r={7} fill="#fff" />
                        <Circle cx={p.x} cy={p.y} r={4.5} fill="#1A73E8" />
                      </G>
                    );
                  })()}

                {/* Tapped-station name tooltip */}
                {(() => {
                  if (selected == null) return null;
                  const s = projectedStations.find(st => st.id === selected);
                  if (!s) return null;
                  const w = Math.max(30, s.name.length * 6.4 + 14);
                  return (
                    <G>
                      <Circle
                        cx={s.p.x}
                        cy={s.p.y}
                        r={6}
                        fill="none"
                        stroke="#1A1A1A"
                        strokeWidth={1.5}
                      />
                      <Rect
                        x={s.p.x - w / 2}
                        y={s.p.y - 28}
                        width={w}
                        height={17}
                        rx={4}
                        fill="#1A1A1A"
                      />
                      <SvgText
                        x={s.p.x}
                        y={s.p.y - 15.5}
                        fontSize={10}
                        fontWeight="700"
                        fill="#FFFFFF"
                        textAnchor="middle">
                        {s.name}
                      </SvgText>
                    </G>
                  );
                })()}
              </Svg>
            )}
          </Animated.View>
          </PanGestureHandler>
        </PinchGestureHandler>
          </View>
        </TapGestureHandler>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {flex: 1, overflow: 'hidden', backgroundColor: BG},
  fill: {flex: 1},
  canvas: {position: 'absolute', top: 0, left: 0, transformOrigin: 'top left'},
});

export default OfflineMetroMap;
