import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');
const RED = '#E5252B';

// Mini metro line beneath the title that doubles as a loading indicator: a
// little train sweeps across a row of coloured station dots.
const TRACK_W = Math.min(240, width - 120);
const DOT_COLORS = ['#E5252B', '#F7D117', '#2D6DF6', '#18A558', '#8F00FF'];

const SplashScreen = ({onFinish}) => {
  const fade = useRef(new Animated.Value(1)).current; // whole-screen fade out
  const intro = useRef(new Animated.Value(0)).current; // entrance (0 -> 1)
  const sweep = useRef(new Animated.Value(0)).current; // train loader sweep

  useEffect(() => {
    Animated.timing(intro, {
      toValue: 1,
      duration: 750,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: 1500,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    );
    loop.start();

    const t = setTimeout(() => {
      loop.stop();
      Animated.timing(fade, {
        toValue: 0,
        duration: 380,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => onFinish && onFinish());
    }, 2400);

    return () => {
      clearTimeout(t);
      loop.stop();
    };
  }, [fade, intro, sweep, onFinish]);

  const logoStyle = {
    opacity: intro.interpolate({inputRange: [0, 0.55], outputRange: [0, 1], extrapolate: 'clamp'}),
    transform: [
      {scale: intro.interpolate({inputRange: [0, 1], outputRange: [0.82, 1]})},
      {translateY: intro.interpolate({inputRange: [0, 1], outputRange: [18, 0]})},
    ],
  };
  const contentOpacity = intro.interpolate({
    inputRange: [0.35, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const titleStyle = {
    opacity: contentOpacity,
    transform: [
      {translateY: intro.interpolate({inputRange: [0.35, 1], outputRange: [12, 0], extrapolate: 'clamp'})},
    ],
  };
  const trainX = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, TRACK_W - 18],
  });

  return (
    <Animated.View style={[styles.root, {opacity: fade}]}>
      <LinearGradient
        colors={['#FFECEE', '#FFFFFF', '#FFF3F4']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.fill}>
        <View style={styles.center}>
          {/* Train illustration with a soft glow */}
          <Animated.View style={[styles.logoWrap, logoStyle]}>
            <View style={styles.glow} />
            <Image
              source={require('../assets/Header.png')}
              style={styles.train}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Title */}
          <Animated.View style={[styles.titleWrap, titleStyle]}>
            <Text style={styles.title}>
              Find Train <Text style={styles.titleRed}>Routes</Text>
            </Text>
            <Text style={styles.subtitle}>Delhi Metro Route Planner</Text>
          </Animated.View>

          {/* Metro-line loader */}
          <Animated.View style={[styles.loader, {opacity: contentOpacity}]}>
            <View style={styles.track} />
            {DOT_COLORS.map((c, i) => (
              <View
                key={c}
                style={[
                  styles.dot,
                  {
                    backgroundColor: c,
                    left: (TRACK_W / (DOT_COLORS.length - 1)) * i - 4,
                  },
                ]}
              />
            ))}
            <Animated.View
              style={[styles.trainDot, {transform: [{translateX: trainX}]}]}>
              <Ionicons name="train" size={13} color="#fff" />
            </Animated.View>
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Travel smart • Never miss your stop</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {...StyleSheet.absoluteFillObject, zIndex: 999},
  fill: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  center: {alignItems: 'center', paddingHorizontal: 30},

  logoWrap: {
    width: 260,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  glow: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(229,37,43,0.07)',
  },
  train: {width: '100%', height: '100%'},

  titleWrap: {alignItems: 'center', marginTop: 4},
  title: {fontSize: 30, fontWeight: '800', color: '#1A1A1A', letterSpacing: 0.2},
  titleRed: {color: RED},
  subtitle: {
    fontSize: 15,
    color: '#8A8A8A',
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  loader: {
    width: TRACK_W,
    height: 30,
    marginTop: 34,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EEE1E2',
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 13,
  },
  trainDot: {
    position: 'absolute',
    top: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: RED,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },

  footer: {position: 'absolute', bottom: 48, alignItems: 'center'},
  footerText: {fontSize: 13, color: '#B6A9AA', fontWeight: '500', letterSpacing: 0.3},
});

export default SplashScreen;
