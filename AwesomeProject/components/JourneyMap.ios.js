import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import MapView, {Marker, Polyline, Callout} from 'react-native-maps';

// iOS journey map — Apple Maps (the default provider on iOS) with the metro
// network drawn on top, matching the app's original behaviour. Android uses the
// offline SVG map instead (see JourneyMap.android.js). Exposes the same
// imperative API as the offline map so RouteMapScreen can drive either one.

// Faded / decluttered base map so the metro overlay stands out. (Apple Maps
// ignores customMapStyle, but we keep it for parity.)
const MINIMAL_MAP_STYLE = [
  {elementType: 'geometry', stylers: [{color: '#f5f5f3'}]},
  {featureType: 'poi', stylers: [{visibility: 'off'}]},
  {featureType: 'transit', stylers: [{visibility: 'off'}]},
  {featureType: 'road', elementType: 'labels', stylers: [{visibility: 'off'}]},
];

const INITIAL_REGION = {
  latitude: 28.6139,
  longitude: 77.209,
  latitudeDelta: 0.4,
  longitudeDelta: 0.4,
};

const CAMERA_ZOOM_RANGE = {
  minCenterCoordinateDistance: 10000,
  maxCenterCoordinateDistance: 60000,
  animated: true,
};

// --- Marker visuals ---------------------------------------------------------
const CustomMarker = ({color, size = 7, borderWidth = 1.5, borderColor = '#FFFFFF'}) => (
  <View
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: size / 2,
      borderWidth,
      borderColor,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    }}
  />
);

const InterchangeMarker = ({name, color}) => (
  <View style={{alignItems: 'center', justifyContent: 'center'}}>
    <Text
      style={{
        color: '#1A1A1A',
        backgroundColor: 'rgba(255,255,255,0.92)',
        fontSize: 9,
        fontWeight: '700',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 5,
        textAlign: 'center',
        marginBottom: 3,
        maxWidth: 76,
        overflow: 'hidden',
      }}>
      {name}
    </Text>
    <View
      style={{
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#fff',
        borderWidth: 3,
        borderColor: color,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.3,
        shadowRadius: 2.5,
      }}
    />
  </View>
);

const RouteDot = ({color}) => (
  <View style={styles.routeDotOuter}>
    <View style={[styles.routeDotInner, {backgroundColor: color}]} />
  </View>
);

const RouteInterchange = ({color}) => (
  <View style={[styles.routeInterchange, {borderColor: color}]} />
);

const RouteEndpoint = ({color, label}) => (
  <View style={[styles.routeEndpoint, {borderColor: color}]}>
    <Text style={[styles.routeEndpointText, {color}]}>{label}</Text>
  </View>
);

const SmallCallout = ({text}) => (
  <View style={styles.callout}>
    <Text style={styles.calloutText}>{text}</Text>
  </View>
);

// react-native-maps freezes a custom marker once tracksViewChanges is false;
// each marker tracks until shortly after it mounts, then freezes itself so it
// renders crisply without per-frame redraw cost.
const FrozenMarker = ({children, ...props}) => {
  const [tracks, setTracks] = useState(true);
  React.useEffect(() => {
    const id = setTimeout(() => setTracks(false), 800);
    return () => clearTimeout(id);
  }, []);
  return (
    <Marker tracksViewChanges={tracks} {...props}>
      {children}
    </Marker>
  );
};

const JourneyMap = forwardRef(
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
    const mapRef = useRef(null);

    const zoomBy = async delta => {
      if (!mapRef.current) return;
      try {
        const cam = await mapRef.current.getCamera();
        if (cam.zoom != null) cam.zoom = Math.max(1, cam.zoom + delta);
        if (cam.altitude != null) {
          cam.altitude = delta > 0 ? cam.altitude / 2 : cam.altitude * 2;
        }
        mapRef.current.animateCamera(cam, {duration: 250});
      } catch (e) {}
    };

    useImperativeHandle(ref, () => ({
      zoomIn: () => zoomBy(1),
      zoomOut: () => zoomBy(-1),
      reset: () => mapRef.current?.animateToRegion(INITIAL_REGION, 600),
      fitToCoordinates: coords =>
        coords?.length &&
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: {top: 160, right: 60, bottom: 220, left: 60},
          animated: true,
        }),
      centerOn: coord =>
        coord &&
        mapRef.current?.animateToRegion(
          {
            latitude: coord.latitude,
            longitude: coord.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
          800,
        ),
      // Like centerOn, but keeps the user's current zoom level (moves the
      // camera centre only). Used for continuous live-tracking follow so the
      // map doesn't snap back to a fixed zoom on every GPS fix.
      followTo: coord =>
        coord &&
        mapRef.current?.animateCamera(
          {center: {latitude: coord.latitude, longitude: coord.longitude}},
          {duration: 500},
        ),
    }));

    return (
      <MapView
        ref={mapRef}
        style={{flex: 1}}
        cameraZoomRange={CAMERA_ZOOM_RANGE}
        initialRegion={INITIAL_REGION}
        moveOnMarkerPress={false}
        onPanDrag={onUserPan}
        mapType="mutedStandard"
        customMapStyle={MINIMAL_MAP_STYLE}
        showsPointsOfInterest={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
        showsCompass={false}>
        {currentLocation && (
          <FrozenMarker
            coordinate={currentLocation}
            title="You are here"
            anchor={{x: 0.5, y: 0.5}}
            zIndex={7}>
            <View style={styles.currentLocationMarker}>
              <View style={styles.currentLocationInner} />
            </View>
          </FrozenMarker>
        )}

        {/* Base network */}
        {Object.entries(shapes).map(([shapeId, coordinates]) => {
          const col = (coordinates[0]?.shape_color || '').toLowerCase();
          if (hiddenSet.has(col)) return null;
          return (
            <Polyline
              key={shapeId}
              coordinates={coordinates}
              strokeColor={showRoute ? '#CDD2D9' : coordinates[0].shape_color}
              strokeWidth={showRoute ? 2 : 4.5}
              lineCap="round"
              lineJoin="round"
            />
          );
        })}

        {/* Highlighted journey casing + line */}
        {showRoute &&
          (() => {
            const path = selectedRoute.path || [];
            const colorPath = selectedRoute.colorPath || [];
            const segs = [];
            let cur = null;
            path.forEach((id, i) => {
              const st = stations.find(s => s.id == id);
              if (!st) return;
              const color = getLineInfo(colorPath[i]).color;
              if (!cur || cur.color !== color) {
                cur = {color, coords: []};
                if (segs.length) {
                  cur.coords.push(segs[segs.length - 1].coords.slice(-1)[0]);
                }
                segs.push(cur);
              }
              cur.coords.push(st.coords);
            });
            return segs.flatMap((seg, i) => [
              <Polyline
                key={`rcase-${i}`}
                coordinates={seg.coords}
                strokeColor="#FFFFFF"
                strokeWidth={9}
                lineCap="round"
                lineJoin="round"
                zIndex={2}
              />,
              <Polyline
                key={`rseg-${i}`}
                coordinates={seg.coords}
                strokeColor={seg.color}
                strokeWidth={5.5}
                lineCap="round"
                lineJoin="round"
                zIndex={3}
              />,
            ]);
          })()}

        {/* Station markers */}
        {showRoute
          ? selectedRoute?.path?.map((marker, index) => {
              const st = stations?.find(p => marker == p.id);
              if (!st) return null;
              const segColor = getLineInfo(selectedRoute.colorPath?.[index]).color;
              const isOrigin = index === 0;
              const isDest = index === selectedRoute.path.length - 1;
              const isInterchange = routeInterchangeSet.has(marker);
              let child;
              if (isOrigin || isDest) {
                child = <RouteEndpoint color={segColor} label={isOrigin ? 'A' : 'B'} />;
              } else if (isInterchange) {
                child = <RouteInterchange color={segColor} />;
              } else {
                child = <RouteDot color={segColor} />;
              }
              return (
                <FrozenMarker
                  key={`route-${st.id}`}
                  coordinate={st.coords}
                  title={st.name}
                  anchor={{x: 0.5, y: 0.5}}
                  zIndex={isOrigin || isDest ? 6 : isInterchange ? 5 : 4}>
                  <View pointerEvents="none">{child}</View>
                </FrozenMarker>
              );
            })
          : stations.map(marker => {
              if (hiddenSet.has((marker.color_code || '').toLowerCase())) return null;
              if (marker.interchange === 'TRUE') {
                return (
                  <FrozenMarker
                    key={`all-${marker.id}`}
                    coordinate={marker.coords}
                    anchor={{x: 0.5, y: 0.5}}>
                    <View pointerEvents="none">
                      <InterchangeMarker name={marker.name} color={marker.color_code} />
                    </View>
                  </FrozenMarker>
                );
              }
              return (
                <FrozenMarker
                  key={`all-${marker.id}`}
                  coordinate={marker.coords}
                  anchor={{x: 0.5, y: 0.5}}>
                  <View pointerEvents="none">
                    <CustomMarker color={marker.color_code} size={7} borderWidth={1.5} />
                  </View>
                  <Callout tooltip alphaHitTest onPress={e => e.stopPropagation()}>
                    <SmallCallout text={marker.name} />
                  </Callout>
                </FrozenMarker>
              );
            })}
      </MapView>
    );
  },
);

const styles = StyleSheet.create({
  routeDotOuter: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  routeDotInner: {width: 7, height: 7, borderRadius: 3.5},
  routeInterchange: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 3.5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 2.5,
  },
  routeEndpoint: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  routeEndpointText: {fontSize: 13, fontWeight: '800', lineHeight: 15},
  callout: {
    backgroundColor: 'white',
    borderRadius: 3,
    padding: 3,
    width: 60,
    borderWidth: 0.5,
    borderColor: '#ccc',
  },
  calloutText: {fontSize: 9, color: '#000', textAlign: 'center', fontWeight: '500'},
  currentLocationMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    borderWidth: 2,
    borderColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationInner: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default JourneyMap;
