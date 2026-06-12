import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  Camera,
  CircleLayer,
  LineLayer,
  MapView,
  ShapeSource,
  SymbolLayer,
} from '@maplibre/maplibre-react-native';
import {buildRouteSegments} from '../utilities/routeGeometry';

// Android offline metro map, powered by the MapLibre native GL engine (no API
// key, no tiles, no network). iOS uses Apple Maps via JourneyMap.ios.js; Metro
// picks the platform file, and react-native.config.js keeps MapLibre out of the
// iOS build.
//
// Everything is drawn by the GL engine from our bundled GTFS data as GeoJSON
// layers (lines / circles / text) — NOT as RN view overlays. We deliberately
// avoid MarkerView/PointAnnotation: those are native RN-view overlays that don't
// render under this app's New Architecture, so text labels are SymbolLayers
// instead. SymbolLayer text needs glyph fonts, which we bundle offline at
// android/app/src/main/assets/glyphs/OpenSans/{range}.pbf (Open Sans), referenced
// by the style's `glyphs: asset://...` — so the whole map stays fully offline.

// Warm creamish base, like a typical printed/transit map (cf. iOS' #f5f5f3).
const BG = '#F4F0E6';

// How far past the network edge the user may pan (degrees ≈ 111 km/°). Shared by
// the camera pan constraint (maxBounds) and the background-grid extent.
const PAN_MARGIN = 0.06;

// Minimal, fully-offline style: flat background + local glyphs for labels. No
// tile sources/sprite means MapLibre fetches nothing from the network.
const OFFLINE_STYLE = {
  version: 8,
  glyphs: 'asset://glyphs/{fontstack}/{range}.pbf',
  // Stretchable white-capsule sprite for the label backgrounds (iOS-style pill).
  sprite: 'asset://sprites/labelbg',
  sources: {},
  layers: [
    {id: 'background', type: 'background', paint: {'background-color': BG}},
  ],
};

// Font stack name — must match the assets/glyphs/<name>/ folder we bundle.
// Bold to match the iOS labels (fontWeight 700).
const FONT = ['OpenSansBold'];

const isFinitePair = c =>
  c && Number.isFinite(c.latitude) && Number.isFinite(c.longitude);
// MapLibre/GeoJSON use [longitude, latitude] order.
const lngLat = c => [c.longitude, c.latitude];

// Empty geometry for ShapeSources we keep permanently mounted but want to render
// nothing for. Mounting/unmounting a MapView child re-adds the native Camera,
// which re-applies the Camera's defaultSettings and snaps the map back to its
// default centre/zoom — so sources that toggle on/off (the tapped-label and the
// live-location dot) stay mounted and just swap their data to/from this instead.
const EMPTY_FC = {type: 'FeatureCollection', features: []};

// Mark the tapped station's feature(s) with `tapped: 1` so the base label
// layers can hide it via a STATIC filter (['!=', ['get', 'tapped'], 1]).
// CRITICAL: the filter must never be computed from `tapped` state. Changing a
// layer's `filter` prop re-adds the MapView's native children on the New
// Architecture, which re-fires the Camera's addToMap() — re-applying
// defaultSettings and re-running the last camera stop (the live-follow moveTo
// or the route fitBounds), so the map visibly panned away on every label tap.
// Source DATA updates (setShape) are applied in place natively and are safe.
// Interchanges appear once per line with the same name; marking every match
// hides all their base-label copies, same as the old name-based filter did.
const markTapped = (fc, name) =>
  name && fc.features.some(f => f.properties.name === name)
    ? {
        ...fc,
        features: fc.features.map(f =>
          f.properties.name === name
            ? {...f, properties: {...f.properties, tapped: 1}}
            : f,
        ),
      }
    : fc;

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
      onUserPan = () => {},
    },
    ref,
  ) => {
    const cameraRef = useRef(null);
    const zoomRef = useRef(10);
    const didFitRef = useRef(false);

    // Tap-a-station-to-show-its-name, like the iOS callout. Any station can be
    // tapped — including interchanges and stations whose label was hidden by the
    // collision engine because a neighbour's label sat on top of it. The tap
    // renders the name through the always-on-top `tapped` layer, bringing the
    // back station's label to the front.
    const [tapped, setTapped] = useState(null);
    const tapTsRef = useRef(0);
    const onStationPress = e => {
      const f = e?.features?.[0];
      if (!f) return;
      tapTsRef.current = Date.now();
      setTapped({name: f.properties?.name, coordinate: f.geometry?.coordinates});
    };
    const onRoutePress = e => {
      const f = e?.features?.[0];
      if (!f) return;
      tapTsRef.current = Date.now();
      setTapped({name: f.properties?.name, coordinate: f.geometry?.coordinates});
    };
    // Tapping empty map dismisses the label (skip if a station tap just fired).
    const onMapPress = () => {
      if (Date.now() - tapTsRef.current < 150) return;
      setTapped(null);
    };

    // --- Network bounds (for initial fit + pan constraint) ----------------
    const bounds = useMemo(() => {
      let minLng = Infinity,
        minLat = Infinity,
        maxLng = -Infinity,
        maxLat = -Infinity;
      const add = (lat, lng) => {
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        }
      };
      Object.values(shapes).forEach(line =>
        line.forEach(p => add(p.latitude, p.longitude)),
      );
      if (minLng === Infinity) {
        stations.forEach(s => add(s.coords?.latitude, s.coords?.longitude));
      }
      if (minLng === Infinity) return null;
      return {minLng, minLat, maxLng, maxLat};
    }, [shapes, stations]);

    // --- Background grid (graph-paper lines drawn behind everything) -------
    // Evenly-spaced lat/lng lines spanning the network bounds (+ a small
    // margin so the grid reaches the panned edges). Rendered first, so it
    // z-orders at the very back, under the metro lines and stations.
    const gridFC = useMemo(() => {
      if (!bounds) return {type: 'FeatureCollection', features: []};
      const STEP = 0.05; // ~5.5 km between lines
      const MARGIN = PAN_MARGIN; // match maxBounds panning margin
      const minLng = bounds.minLng - MARGIN;
      const maxLng = bounds.maxLng + MARGIN;
      const minLat = bounds.minLat - MARGIN;
      const maxLat = bounds.maxLat + MARGIN;
      const snap = v => Math.floor(v / STEP) * STEP;
      const features = [];
      for (let lng = snap(minLng); lng <= maxLng; lng += STEP) {
        features.push({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [[lng, minLat], [lng, maxLat]],
          },
        });
      }
      for (let lat = snap(minLat); lat <= maxLat; lat += STEP) {
        features.push({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [[minLng, lat], [maxLng, lat]],
          },
        });
      }
      return {type: 'FeatureCollection', features};
    }, [bounds]);

    // --- Network lines GeoJSON (one LineString per shape, excluding hidden) -
    const networkFC = useMemo(
      () => ({
        type: 'FeatureCollection',
        features: Object.entries(shapes)
          .map(([id, pts]) => {
            const color = (pts[0]?.shape_color || '#888').trim();
            const coordinates = pts
              .filter(isFinitePair)
              .map(p => [p.longitude, p.latitude]);
            return {id, color, coordinates};
          })
          .filter(
            f =>
              f.coordinates.length > 1 && !hiddenSet.has(f.color.toLowerCase()),
          )
          .map(f => ({
            type: 'Feature',
            properties: {color: f.color},
            geometry: {type: 'LineString', coordinates: f.coordinates},
          })),
      }),
      [shapes, hiddenSet],
    );

    // --- All-lines station points (interchange flag + name for labels) -----
    const stationFC = useMemo(
      () => ({
        type: 'FeatureCollection',
        features: stations
          .filter(s => isFinitePair(s.coords))
          .filter(s => !hiddenSet.has((s.color_code || '').toLowerCase()))
          .map(s => ({
            type: 'Feature',
            properties: {
              color: s.color_code || '#888',
              interchange: s.interchange === 'TRUE' ? 1 : 0,
              name: s.name || '',
            },
            geometry: {type: 'Point', coordinates: lngLat(s.coords)},
          })),
      }),
      [stations, hiddenSet],
    );

    // --- Selected-route geometry (segments by line colour) + its stations --
    // Computed whenever a route exists (independent of showRoute) so the route
    // sources can stay permanently mounted and just toggle their data — see the
    // render below and EMPTY_FC. The actual show/hide is gated on showRoute there.
    const routeData = useMemo(() => {
      if (!selectedRoute?.path?.length) return null;
      const byId = new Map(stations.map(s => [String(s.id), s]));

      // Line geometry follows the real track (see routeGeometry.js); convert its
      // {latitude, longitude} coords to GeoJSON [lng, lat].
      const segs = buildRouteSegments(selectedRoute, stations, shapes, getLineInfo);

      // Station markers stay anchored to the actual stop coordinates.
      const points = [];
      selectedRoute.path.forEach((id, i) => {
        const st = byId.get(String(id));
        if (!st || !isFinitePair(st.coords)) return;
        const color = getLineInfo(selectedRoute.colorPath?.[i]).color;
        const isOrigin = i === 0;
        const isDest = i === selectedRoute.path.length - 1;
        const ep = isOrigin || isDest ? 1 : 0;
        const ic = !ep && routeInterchangeSet.has(id) ? 1 : 0;
        points.push({
          type: 'Feature',
          properties: {
            color,
            ep,
            ic,
            lbl: ep || ic ? 1 : 0,
            name: st.name || '',
            letter: isOrigin ? 'A' : isDest ? 'B' : '',
          },
          geometry: {type: 'Point', coordinates: lngLat(st.coords)},
        });
      });
      return {
        lineFC: {
          type: 'FeatureCollection',
          features: segs
            .filter(s => s.coords.length > 1)
            .map(s => ({
              type: 'Feature',
              properties: {color: s.color},
              geometry: {
                type: 'LineString',
                coordinates: s.coords.map(lngLat),
              },
            })),
        },
        pointsFC: {type: 'FeatureCollection', features: points},
      };
    }, [selectedRoute, stations, shapes, getLineInfo, routeInterchangeSet]);

    // Data each permanently-mounted source renders right now. Toggling these
    // (rather than mounting/unmounting the sources) keeps the native layer
    // insertion order fixed, so route labels never fall under the route line and
    // the camera is never re-added (which would reset the view). See EMPTY_FC.
    const routeLineShape = showRoute && routeData ? routeData.lineFC : EMPTY_FC;
    const routePointsShape = useMemo(
      () =>
        showRoute && routeData
          ? markTapped(routeData.pointsFC, tapped?.name)
          : EMPTY_FC,
      [showRoute, routeData, tapped],
    );
    const stationsShape = useMemo(
      () => (!showRoute ? markTapped(stationFC, tapped?.name) : EMPTY_FC),
      [showRoute, stationFC, tapped],
    );

    // --- Imperative API (same surface as the iOS map) ---------------------
    const fitNetwork = (duration = 500) => {
      if (!bounds || !cameraRef.current) return;
      cameraRef.current.fitBounds(
        [bounds.maxLng, bounds.maxLat],
        [bounds.minLng, bounds.minLat],
        40,
        duration,
      );
    };

    // Fit the camera to the active route's geometry (same edge padding as the
    // imperative fitToCoordinates). Returns false when there's no route to fit,
    // so the caller can fall back to the whole-network view.
    const fitRoute = (duration = 600) => {
      if (!routeData || !cameraRef.current) return false;
      let minLng = Infinity,
        minLat = Infinity,
        maxLng = -Infinity,
        maxLat = -Infinity;
      routeData.pointsFC.features.forEach(f => {
        const [lng, lat] = f.geometry.coordinates;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      });
      if (minLng === Infinity) return false;
      // [top, right, bottom, left] — extra bottom room for the route card.
      cameraRef.current.fitBounds(
        [maxLng, maxLat],
        [minLng, minLat],
        [90, 60, 220, 60],
        duration,
      );
      return true;
    };

    useImperativeHandle(ref, () => ({
      zoomIn: () =>
        cameraRef.current?.zoomTo(Math.min(zoomRef.current + 1, 17), 250),
      zoomOut: () =>
        cameraRef.current?.zoomTo(Math.max(zoomRef.current - 1, 9), 250),
      reset: () => fitNetwork(500),
      fitToCoordinates: coords => {
        if (!coords?.length || !cameraRef.current) return;
        let minLng = Infinity,
          minLat = Infinity,
          maxLng = -Infinity,
          maxLat = -Infinity;
        coords.forEach(c => {
          if (!isFinitePair(c)) return;
          if (c.longitude < minLng) minLng = c.longitude;
          if (c.longitude > maxLng) maxLng = c.longitude;
          if (c.latitude < minLat) minLat = c.latitude;
          if (c.latitude > maxLat) maxLat = c.latitude;
        });
        if (minLng === Infinity) return;
        // [top, right, bottom, left] — extra bottom room for the route card.
        cameraRef.current.fitBounds(
          [maxLng, maxLat],
          [minLng, minLat],
          [90, 60, 220, 60],
          600,
        );
      },
      centerOn: coord => {
        if (coord && cameraRef.current)
          cameraRef.current.moveTo(lngLat(coord), 600);
      },
      // Keep the current zoom, just recentre — used for live-tracking follow.
      followTo: coord => {
        if (coord && cameraRef.current)
          cameraRef.current.moveTo(lngLat(coord), 500);
      },
    }));

    // --- Map events -------------------------------------------------------
    const onRegionDidChange = e => {
      const z = e?.properties?.zoomLevel;
      if (typeof z === 'number') zoomRef.current = z;
      if (e?.properties?.isUserInteraction) onUserPan();
    };

    const onMapLoaded = () => {
      if (didFitRef.current) return;
      didFitRef.current = true;
      // When a journey is already active, pan to the route on first load
      // instead of the whole network (otherwise this would override the
      // route fit the parent kicks off as the screen opens).
      if (showRoute && fitRoute(0)) return;
      fitNetwork(0);
    };

    // Constrain panning to the network (plus PAN_MARGIN). Memoised so the object
    // keeps a stable reference across re-renders — the MapLibre Camera re-applies
    // maxBounds to the native map whenever this reference changes.
    const maxBounds = useMemo(
      () =>
        bounds
          ? {
              ne: [bounds.maxLng + PAN_MARGIN, bounds.maxLat + PAN_MARGIN],
              sw: [bounds.minLng - PAN_MARGIN, bounds.minLat - PAN_MARGIN],
            }
          : undefined,
      [bounds],
    );
    const defaultCenter = useMemo(
      () =>
        bounds
          ? [(bounds.minLng + bounds.maxLng) / 2, (bounds.minLat + bounds.maxLat) / 2]
          : [77.209, 28.6139],
      [bounds],
    );

    // Shared label paint — dark text on a white pill (iOS InterchangeMarker /
    // callout look). The pill is the stretchable `pill` sprite wrapped around the
    // text via icon-text-fit; a faint halo is a fallback if the sprite is missing.
    //
    // Collision detection is left ON (allow-overlap / ignore-placement default to
    // false): when two labels are too close MapLibre drops the lower-priority one
    // instead of stacking both into an unreadable blur. `textVariableAnchor` lets
    // a label flip to another side (incl. away from the screen edge) to find room
    // before it's dropped — fixes both the merged labels and the clipped label on
    // stations near the viewport edge (e.g. Adarsh Nagar). It needs
    // `textRadialOffset`/`textJustify` rather than a fixed `textAnchor`/`textOffset`.
    const labelStyle = {
      iconImage: 'pill',
      // 'both' (not 'width') so the pill fits the text in BOTH dimensions —
      // otherwise the height is locked to the sprite's natural size and the
      // top/bottom iconTextFitPadding values are ignored (pill stays tall).
      iconTextFit: 'both',
      iconTextFitPadding: [1, 2, 1, 2],
      iconOpacity: 0.95, // semi-transparent white pill, like iOS
      iconAllowOverlap: false,
      iconOptional: false,
      textField: ['get', 'name'],
      textFont: FONT,
      textSize: 9,
      textColor: '#1A1A1A',
      textHaloColor: '#FFFFFF',
      textHaloWidth: 1,
      textVariableAnchor: ['bottom', 'top', 'left', 'right'],
      textRadialOffset: 0.9,
      textJustify: 'auto',
      textAllowOverlap: false,
      textPadding: 1,
    };

    // Tapped / selected label — always drawn on top, bypassing the collision
    // engine, so tapping a station whose label lost a collision (or is behind a
    // neighbour's) brings its name to the front. It's its own layer, rendered
    // last, so it z-orders above every base label.
    const tappedLabelStyle = {
      ...labelStyle,
      iconAllowOverlap: true,
      iconIgnorePlacement: true,
      textAllowOverlap: true,
      textIgnorePlacement: true,
    };

    // Stable Camera element. CRITICAL: tapping a station updates `tapped` state,
    // re-rendering this component. On the New Architecture, recreating the
    // <Camera> JSX on every render makes React/Fabric re-add the native camera
    // feature, whose addToMap() re-applies defaultSettings — snapping the map
    // back to the default centre/zoom on every tap. Memoising the element (its
    // deps never change after load) gives React the SAME reference each render,
    // so it bails out of reconciling the camera and never re-adds it.
    const cameraEl = useMemo(
      () => (
        <Camera
          ref={cameraRef}
          defaultSettings={{centerCoordinate: defaultCenter, zoomLevel: 10}}
          minZoomLevel={10}
          maxZoomLevel={13}
          maxBounds={maxBounds}
        />
      ),
      [defaultCenter, maxBounds],
    );

    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          mapStyle={OFFLINE_STYLE}
          rotateEnabled={false}
          pitchEnabled={false}
          attributionEnabled={false}
          logoEnabled={false}
          compassEnabled={false}
          onPress={onMapPress}
          onRegionDidChange={onRegionDidChange}
          onDidFinishLoadingMap={onMapLoaded}>
          {cameraEl}

          {/* Background grid — mounted first so it renders at the very back */}
          <ShapeSource id="grid" shape={gridFC}>
            <LineLayer
              id="grid-lines"
              style={{
                lineColor: '#D8D2C2',
                lineWidth: 0.5,
                lineOpacity: 0.7,
              }}
            />
          </ShapeSource>

          {/* Base network */}
          <ShapeSource id="network" shape={networkFC}>
            <LineLayer
              id="network-line"
              style={{
                lineColor: showRoute ? '#CDD2D9' : ['get', 'color'],
                lineWidth: showRoute ? 2 : 4.5,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </ShapeSource>

          {/* Highlighted journey: white casing under the coloured line.
              Permanently mounted (data toggled via routeLineShape) so the layer
              order is fixed — see EMPTY_FC / routeLineShape. */}
          <ShapeSource id="route" shape={routeLineShape}>
            <LineLayer
              id="route-casing"
              style={{
                lineColor: '#FFFFFF',
                lineWidth: 9,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <LineLayer
              id="route-line"
              style={{
                lineColor: ['get', 'color'],
                lineWidth: 5.5,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </ShapeSource>

          {/* Stations + interchange labels — all-lines view. Permanently mounted
              (data toggled via stationsShape). */}
          <ShapeSource id="stations" shape={stationsShape} onPress={onStationPress}>
              <CircleLayer
                id="station-dots"
                filter={['==', ['get', 'interchange'], 0]}
                style={{
                  circleRadius: 3.5,
                  circleColor: ['get', 'color'],
                  circleStrokeColor: '#FFFFFF',
                  circleStrokeWidth: 1.5,
                }}
              />
              <CircleLayer
                id="interchange-rings"
                filter={['==', ['get', 'interchange'], 1]}
                style={{
                  circleRadius: 3.5,
                  circleColor: '#FFFFFF',
                  circleStrokeColor: ['get', 'color'],
                  circleStrokeWidth: 3,
                }}
              />
              <SymbolLayer
                id="interchange-labels"
                // Drop the tapped station's base label so its name is drawn only
                // by the always-on-top `tapped` overlay — otherwise a tapped
                // interchange that already won its collision shows two labels.
                // The tapped flag lives in the source data (see markTapped);
                // the filter itself must stay static.
                filter={[
                  'all',
                  ['==', ['get', 'interchange'], 1],
                  ['!=', ['get', 'tapped'], 1],
                ]}
                style={labelStyle}
              />
              <SymbolLayer
                id="all-station-labels"
                // At the deepest zoom (13) every non-interchange station gets a
                // label. Allow-overlap is forced so none are dropped by the
                // collision engine — the user has zoomed in far enough to see all.
                filter={[
                  'all',
                  ['==', ['get', 'interchange'], 0],
                  ['!=', ['get', 'tapped'], 1],
                  ['>=', ['zoom'], 13],
                ]}
                style={{
                  ...labelStyle,
                  iconAllowOverlap: true,
                  textAllowOverlap: true,
                }}
              />
          </ShapeSource>

          {/* Stations + labels — journey view. Permanently mounted (data toggled
              via routePointsShape) so the route labels keep a fixed z-order above
              the route line instead of falling under it after a view switch. */}
          <ShapeSource
            id="route-stations"
            shape={routePointsShape}
            onPress={onRoutePress}>
              <CircleLayer
                id="route-dots"
                filter={[
                  'all',
                  ['==', ['get', 'ep'], 0],
                  ['==', ['get', 'ic'], 0],
                ]}
                style={{
                  circleRadius: 3.5,
                  circleColor: ['get', 'color'],
                  circleStrokeColor: '#FFFFFF',
                  circleStrokeWidth: 3,
                }}
              />
              <CircleLayer
                id="route-ic"
                filter={['==', ['get', 'ic'], 1]}
                style={{
                  circleRadius: 8,
                  circleColor: '#FFFFFF',
                  circleStrokeColor: ['get', 'color'],
                  circleStrokeWidth: 3.5,
                }}
              />
              <CircleLayer
                id="route-ep"
                filter={['==', ['get', 'ep'], 1]}
                style={{
                  circleRadius: 13,
                  circleColor: '#FFFFFF',
                  circleStrokeColor: ['get', 'color'],
                  circleStrokeWidth: 3,
                }}
              />
              <SymbolLayer
                id="route-ep-letters"
                filter={['==', ['get', 'ep'], 1]}
                style={{
                  textField: ['get', 'letter'],
                  textFont: FONT,
                  textSize: 13,
                  textColor: ['get', 'color'],
                  textAllowOverlap: true,
                  textIgnorePlacement: true,
                }}
              />
              <SymbolLayer
                id="route-labels"
                // Same as interchange-labels: hide the tapped station's base
                // label so it isn't drawn twice (base + on-top overlay). Static
                // filter; the tapped flag is in the data (see markTapped).
                filter={[
                  'all',
                  ['==', ['get', 'lbl'], 1],
                  ['!=', ['get', 'tapped'], 1],
                ]}
                style={{
                  ...labelStyle,
                  // A/B endpoints get a wider radial offset (they sit on a big
                  // ring) and the lowest sort key so collisions resolve in their
                  // favour — an endpoint label must never be dropped.
                  textRadialOffset: ['case', ['==', ['get', 'ep'], 1], 1.4, 1.1],
                  symbolSortKey: ['case', ['==', ['get', 'ep'], 1], 0, 1],
                }}
              />
              <SymbolLayer
                id="all-route-labels"
                // At zoom 13 every mid-route station (lbl=0) also gets a label.
                filter={[
                  'all',
                  ['==', ['get', 'lbl'], 0],
                  ['!=', ['get', 'tapped'], 1],
                  ['>=', ['zoom'], 13],
                ]}
                style={{
                  ...labelStyle,
                  textRadialOffset: 1.1,
                  iconAllowOverlap: true,
                  textAllowOverlap: true,
                }}
              />
          </ShapeSource>

          {/* Current location. Permanently mounted (data toggled). It mounts
              after the route/station node sources, so it z-orders above them with
              no need to remount it on a view change — every map source now keeps a
              fixed mount order, which is what keeps the layer z-order stable. */}
          <ShapeSource
            id="me"
            shape={
              isFinitePair(currentLocation)
                ? {
                    type: 'Feature',
                    properties: {},
                    geometry: {type: 'Point', coordinates: lngLat(currentLocation)},
                  }
                : EMPTY_FC
            }>
            <CircleLayer
              id="me-halo"
              style={{
                circleRadius: 13,
                circleColor: '#1A73E8',
                circleOpacity: 0.16,
              }}
            />
            <CircleLayer
              id="me-bg"
              style={{circleRadius: 7, circleColor: '#FFFFFF'}}
            />
            <CircleLayer
              id="me-dot"
              style={{circleRadius: 4.5, circleColor: '#1A73E8'}}
            />
          </ShapeSource>

          {/* Tapped-station name (regular stops; like the iOS callout).
              Permanently mounted (data toggled via EMPTY_FC), like every other
              source above. Conditionally mounting it changed the MapView child
              count on each tap, and on the New Architecture that native re-add
              re-applied the Camera's defaultSettings — snapping the map back to
              the whole-network view (the same fit as the recenter button), most
              visibly when tapping a far/edge station. Toggling the data instead
              keeps the child count constant so the camera is never re-added. The
              feature carries its name from the first non-empty render, so the
              pill + label still appear together with no empty-pill frame. */}
          <ShapeSource
            id="tapped"
            shape={
              tapped?.coordinate
                ? {
                    type: 'Feature',
                    properties: {name: tapped.name || ''},
                    geometry: {type: 'Point', coordinates: tapped.coordinate},
                  }
                : EMPTY_FC
            }>
            <SymbolLayer id="tapped-label" style={tappedLabelStyle} />
          </ShapeSource>
        </MapView>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {flex: 1, overflow: 'hidden', backgroundColor: BG},
  map: {flex: 1},
});

export default OfflineMetroMap;
