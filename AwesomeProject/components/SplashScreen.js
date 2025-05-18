import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const moveAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const arrowOpacityAnim = useRef(new Animated.Value(1)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const badgeGlowAnim = useRef(new Animated.Value(0)).current;

  // Add a new state variable for cloud animations
  const [cloudAnimations, setCloudAnimations] = useState([]);
  const cloudCount = useRef(0);

  useEffect(() => {
    // Create a new cloud with its own animation
    const generateCloud = () => {
      if (cloudCount.current >= 30) return;
      
      const cloudSize = 15 + Math.random() * 10;
      const cloudOpacity = new Animated.Value(0);
      const cloudY = new Animated.Value(0); // Keep vertical position
      const cloudX = new Animated.Value(95 + (-2 + Math.random() * 4)); // Right side in flipped coordinates (appears as left)
      const cloudScale = new Animated.Value(0.4 + Math.random() * 0.2);
      const cloudId = Date.now();
      cloudCount.current += 1; 
      
      // Add new cloud to state
      setCloudAnimations(prev => [...prev, { 
        id: cloudId, 
        opacity: cloudOpacity, 
        y: cloudY, 
        x: cloudX, 
        scale: cloudScale,
        size: cloudSize
      }]);
      
      // Adjust animation for left-side clouds
      Animated.parallel([
        Animated.timing(cloudOpacity, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(cloudY, {
          toValue: -80 - Math.random() * 40,
          duration: 2500 + Math.random() * 1500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cloudX, {
          toValue: cloudX._value + (30 + Math.random() * 50), // Now moving rightward in flipped coordinates
          duration: 2500 + Math.random() * 1500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cloudScale, {
          toValue: 0.9 + Math.random() * 0.4,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCloudAnimations(prev => prev.filter(cloud => cloud.id !== cloudId));
        cloudCount.current -= 1;
      });

      setTimeout(() => {
        Animated.timing(cloudOpacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }, 1200 + Math.random() * 400);
    };

    // Main animation sequences
    const startMainAnimations = () => {
      // Fade in and scale up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Add continuous track movement animation
      Animated.loop(
        Animated.timing(moveAnim, {
          toValue: -width * 0.2, // Move by the width of one segment
          duration: 6000, // Slower animation for track
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Create pulsing animation for the dot
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Create flashing animation for arrows
      Animated.loop(
        Animated.sequence([
          Animated.timing(arrowOpacityAnim, {
            toValue: 0.3,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(arrowOpacityAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Create glow animation for the Next Stop badge using opacity only
      Animated.loop(
        Animated.sequence([
          Animated.timing(badgeGlowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true, // Using native driver for better performance
          }),
          Animated.timing(badgeGlowAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Generate clouds continuously
      const cloudInterval = setInterval(() => {
        generateCloud();
      }, 150 + Math.random() * 100); // Generate clouds more frequently

      // Final fade out
      setTimeout(() => {
        clearInterval(cloudInterval);
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start(() => {
          if (onFinish) {
            onFinish();
          }
        });
      }, 4500);
      
      return () => clearInterval(cloudInterval);
    };

    // Start everything
    startMainAnimations();
  }, []);

  // Map out the rotation value
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Map the glow animation to opacity for the glow overlay
  const badgeGlowOpacity = badgeGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5]
  });

  return (
    <View style={styles.container}>
      {/* Background elements */}
      <View style={styles.backgroundContainer}>
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.backgroundDot,
              {
                top: Math.random() * height,
                left: Math.random() * width,
                opacity: Math.random() * 0.5 + 0.1,
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
              },
            ]}
          />
        ))}
      </View>  

      {/* Header with logo and text - now at the top */}
      <View style={styles.headerContainer}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim
            },
          ]}
        >
          <View style={styles.steamEngineContainer}>
            {/* Main boiler and body components */}
            <View style={styles.engineBoiler} />
            <View style={styles.engineBoilerRim} />
            <View style={styles.engineBoilerHighlight} />
            <View style={styles.engineCab} />
            <View style={styles.engineCabRoof} />
            <View style={styles.engineFront} />
            <View style={styles.engineCowcatcher} />
            <View style={styles.engineBuffer} />
            
            {/* Wheels and mechanical parts */}
            <View style={styles.engineWheelLarge}>
              <View style={styles.wheelHub} />
              {[...Array(8)].map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.wheelSpoke,
                    { 
                      transform: [{ rotate: `${i * 45}deg` }] 
                    }
                  ]} 
                />
              ))}
            </View>
            <View style={[styles.engineWheelSmall, {left: 20}]}>
              <View style={styles.wheelHubSmall} />
            </View>
            <View style={[styles.engineWheelSmall, {right: 25}]}>
              <View style={styles.wheelHubSmall} />
            </View>
            
            {/* Connecting rods and mechanical details */}
            <View style={styles.connectingRod} />
            <View style={styles.drivePiston} />
            <View style={styles.pistonRod} />
            
            {/* Smokestack and details */}
            <View style={styles.smokestack} />
            <View style={styles.smokestackRim} />
            <View style={styles.smokestackTop} />
            
            {/* Windows and details */}
            <View style={styles.engineWindow} />
            <View style={styles.engineWindowFrame} />
            <View style={styles.engineHeadlight} />
            <View style={styles.engineHeadlightGlow} />
            <View style={styles.engineDome} />
            <View style={styles.engineDomeTop} />
            <View style={styles.engineWhistle} />
            <View style={styles.engineHandrail1} />
            <View style={styles.engineHandrail2} />
            <View style={styles.engineSteps} />
            
            {/* Dynamic clouds from smokestack */}
            {cloudAnimations.map(cloud => (
              <Animated.View
                key={cloud.id}
                style={[
                  styles.cloudBase,
                  {
                    width: cloud.size,
                    height: cloud.size * 0.8,
                    transform: [
                      { translateY: cloud.y },
                      { translateX: cloud.x },
                      { scale: cloud.scale }
                    ],
                    opacity: cloud.opacity
                  }
                ]}
              >
                <View style={[styles.cloudBubble, { left: cloud.size * 0.2, top: cloud.size * 0.1 }]} />
                <View style={[styles.cloudBubble, { right: cloud.size * 0.15, top: cloud.size * 0.15 }]} />
                <View style={[styles.cloudBubble, { left: cloud.size * 0.1, bottom: cloud.size * 0.1 }]} />
                <View style={[styles.cloudBubble, { right: cloud.size * 0.1, bottom: cloud.size * 0.05 }]} />
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.titleContainer}>
          <Animated.View 
            style={[
              styles.nextStopBadge,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Animated.View style={[
              styles.badgeGlow,
              { opacity: badgeGlowOpacity }
            ]} />
            <Animated.View 
              style={[
                styles.badgeDot,
                { transform: [{ scale: pulseAnim }] }
              ]} 
            />
            <Animated.View 
              style={[
                styles.directionArrow, 
                styles.leftArrow,
                { opacity: arrowOpacityAnim }
              ]}
            >
              <Text style={styles.directionArrowText}>◂</Text>
            </Animated.View>
            <Text style={styles.badgeText}>NEXT STOP</Text>
            <Animated.View 
              style={[
                styles.directionArrow, 
                styles.rightArrow,
                { opacity: arrowOpacityAnim }
              ]}
            >
              <Text style={styles.directionArrowText}>▸</Text>
            </Animated.View>
          </Animated.View>
          
          <Animated.Text
            style={[
              styles.title,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            Next Stop
          </Animated.Text>
        </View>

        <Animated.Text
          style={[
            styles.subtitle,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          Never miss your next stop
        </Animated.Text>
      </View>

      {/* Railway track animation at bottom */}
      <Animated.View
        style={[
          styles.trackContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Ground beneath the tracks */}
        <View style={styles.groundBase} />
        <View style={styles.groundShadow} />
        
        <Animated.View style={[
          styles.railwayTrack,
          {
            transform: [{ translateX: moveAnim }]
          }
        ]}>
          {/* Track base (ballast) with texture */}
          <View style={styles.trackBallast} />
          {[...Array(80)].map((_, i) => (
            <View 
              key={`gravel-${i}`} 
              style={[
                styles.ballastGravel,
                {
                  left: Math.random() * width * 2,
                  top: Math.random() * 20 + 28,
                  width: Math.random() * 5 + 2,
                  height: Math.random() * 4 + 2,
                  opacity: Math.random() * 0.5 + 0.3,
                  transform: [{ rotate: `${Math.random() * 360}deg` }],
                }
              ]} 
            />
          ))}
          
          {/* Sleepers (railway ties) */}
          {[...Array(80)].map((_, i) => (
            <View key={i} style={[styles.trackSleeper, { left: i * 24 }]} />
          ))}
          
          {/* Rails */}
          <View style={styles.railTop} />
          <View style={styles.railBottom} />
          
          {/* Rail fasteners */}
          {[...Array(80)].map((_, i) => (
            <React.Fragment key={i}>
              <View style={[styles.railFastener, { left: i * 24 + 6, top: 20 }]} />
              <View style={[styles.railFastener, { left: i * 24 + 6, top: 55 }]} />
              <View style={[styles.railFastener, { left: i * 24 + 22, top: 20 }]} />
              <View style={[styles.railFastener, { left: i * 24 + 22, top: 55 }]} />
            </React.Fragment>
          ))}
          
          {/* Track shine highlights */}
          <View style={styles.railTopHighlight} />
          <View style={styles.railBottomHighlight} />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: height * 0.15,
    width: '100%',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  backgroundDot: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 50,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  steamEngineContainer: {
    width: 150,
    height: 100,
    position: 'relative',
    transform: [{scaleX: -1}], // Flip the engine horizontally
  },
  engineBoiler: {
    position: 'absolute',
    width: 100,
    height: 32,
    backgroundColor: '#1565C0',
    borderRadius: 16,
    bottom: 25,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#0D47A1',
    zIndex: 5,
  },
  engineBoilerRim: {
    position: 'absolute',
    width: 6,
    height: 32,
    backgroundColor: '#0D47A1',
    bottom: 25,
    right: 118,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    zIndex: 5,
  },
  engineBoilerHighlight: {
    position: 'absolute',
    width: 90,
    height: 5,
    backgroundColor: '#1E88E5',
    borderRadius: 2.5,
    bottom: 42,
    right: 25,
    zIndex: 6,
  },
  engineCab: {
    position: 'absolute',
    width: 35,
    height: 40,
    backgroundColor: '#0D47A1',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    bottom: 25,
    left: 15,
    zIndex: 7,
  },
  engineCabRoof: {
    position: 'absolute',
    width: 45,
    height: 8,
    backgroundColor: '#0a3880',
    borderRadius: 4,
    bottom: 65,
    left: 10,
    zIndex: 7,
  },
  engineFront: {
    position: 'absolute',
    width: 15,
    height: 22,
    backgroundColor: '#0D47A1',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    bottom: 30,
    right: 5,
    zIndex: 6,
  },
  engineCowcatcher: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderTopWidth: 0,
    borderRightWidth: 15,
    borderBottomWidth: 15,
    borderLeftWidth: 15,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0D47A1',
    borderLeftColor: 'transparent',
    bottom: 12,
    left: 0, // Back to original left position
    transform: [], // Remove any transforms
    zIndex: 6,
  },
  engineBuffer: {
    position: 'absolute',
    width: 5,
    height: 5,
    backgroundColor: '#424242',
    borderRadius: 2.5,
    bottom: 33.5,
    left: 3,
    zIndex: 7,
  },
  engineWheelLarge: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#263238',
    bottom: 7,
    right: 45,
    borderWidth: 2,
    borderColor: '#212121',
    zIndex: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelHub: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#616161',
    borderWidth: 1,
    borderColor: '#424242',
    zIndex: 9,
  },
  wheelSpoke: {
    position: 'absolute',
    width: 8,
    height: 2,
    backgroundColor: '#78909C',
  },
  engineWheelSmall: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#263238',
    bottom: 7,
    borderWidth: 1.5,
    borderColor: '#212121',
    zIndex: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelHubSmall: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#616161',
    borderWidth: 1,
    borderColor: '#424242',
    zIndex: 9,
  },
  connectingRod: {
    position: 'absolute',
    width: 40,
    height: 3,
    backgroundColor: '#757575',
    bottom: 17,
    right: 30,
    zIndex: 7,
  },
  drivePiston: {
    position: 'absolute',
    width: 12,
    height: 6,
    backgroundColor: '#9E9E9E',
    bottom: 15.5,
    right: 70,
    borderRadius: 3,
    zIndex: 7,
  },
  pistonRod: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: '#BDBDBD',
    bottom: 17,
    right: 80,
    zIndex: 7,
  },
  smokestack: {
    position: 'absolute',
    width: 12,
    height: 22,
    backgroundColor: '#263238',
    top: 10,
    right: 32,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    zIndex: 6,
  },
  smokestackRim: {
    position: 'absolute',
    width: 16,
    height: 3,
    backgroundColor: '#212121',
    top: 12,
    right: 30,
    borderRadius: 1,
    zIndex: 6,
  },
  smokestackTop: {
    position: 'absolute',
    width: 16,
    height: 4,
    backgroundColor: '#212121',
    top: 8,
    right: 30,
    borderRadius: 2,
    zIndex: 7,
  },
  engineWindow: {
    position: 'absolute',
    width: 12,
    height: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 2,
    top: 35,
    left: 25,
    zIndex: 9,
  },
  engineWindowFrame: {
    position: 'absolute',
    width: 14,
    height: 17,
    backgroundColor: 'transparent',
    borderRadius: 3,
    top: 34,
    left: 24,
    borderWidth: 1,
    borderColor: '#90CAF9',
    zIndex: 8,
  },
  engineHeadlight: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#FFEB3B',
    borderRadius: 3,
    bottom: 36,
    right: 7,
    zIndex: 10,
  },
  engineHeadlightGlow: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: 'rgba(255, 235, 59, 0.3)',
    borderRadius: 5,
    bottom: 34,
    right: 5,
    zIndex: 9,
  },
  engineDome: {
    position: 'absolute',
    width: 15,
    height: 12,
    backgroundColor: '#0D47A1',
    borderRadius: 7.5,
    top: 18,
    right: 60,
    zIndex: 6,
  },
  engineDomeTop: {
    position: 'absolute',
    width: 11,
    height: 4,
    backgroundColor: '#1565C0',
    borderRadius: 5.5,
    top: 16,
    right: 62,
    zIndex: 7,
  },
  engineWhistle: {
    position: 'absolute',
    width: 3,
    height: 8,
    backgroundColor: '#FFC107',
    top: 15,
    right: 90,
    borderRadius: 1.5,
    zIndex: 8,
  },
  engineHandrail1: {
    position: 'absolute',
    width: 70,
    height: 2,
    backgroundColor: '#BDBDBD',
    top: 28,
    right: 25,
    zIndex: 8,
  },
  engineHandrail2: {
    position: 'absolute',
    width: 1,
    height: 6,
    backgroundColor: '#BDBDBD',
    top: 28,
    right: 45,
    zIndex: 8,
  },
  engineSteps: {
    position: 'absolute',
    width: 10,
    height: 6,
    backgroundColor: '#757575',
    bottom: 19,
    right: 18,
    borderRadius: 1,
    zIndex: 8,
  },
  nextStopContainer: {
    position: 'absolute',
    bottom: height * 0.25,
    left: -width * 0.8,
    width: width * 0.8,
  },
  digitalDisplayBoard: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#2c2c2c',
    overflow: 'hidden',
    position: 'relative',
  },
  scanLinesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    opacity: 0.1,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#fff',
  },
  edgeDetail: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: 'transparent',
    borderColor: '#444',
    zIndex: 5,
  },
  topLeftCorner: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 6,
  },
  topRightCorner: {
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 6,
  },
  bottomLeftCorner: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 6,
  },
  bottomRightCorner: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 6,
  },
  displayHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    zIndex: 2,
  },
  headerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayHeaderText: {
    color: '#ffcc00',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
    textShadowColor: 'rgba(255, 204, 0, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  headerSeparator: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
    marginHorizontal: 8,
  },
  displayLight: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
  },
  displayContent: {
    backgroundColor: '#111',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  displayDestination: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, 
  },
  destinationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff3b30',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  ledTextContainer: {
    position: 'relative',
  },
  destinationText: {
    color: '#00b9f1',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 185, 241, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  ledGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    opacity: 0.5,
  },
  displayArrows: {
    marginLeft: 10,
  },
  boardArrows: {
    flexDirection: 'row',
  },
  boardArrowText: {
    color: '#ffcc00',
    fontSize: 18,
    marginLeft: 2,
    textShadowColor: 'rgba(255, 204, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  timePanel: {
    backgroundColor: '#1a1a1a',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#ffa500',
    fontWeight: 'bold',
    fontSize: 16,
    textShadowColor: 'rgba(255, 165, 0, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  timeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffa500',
    marginLeft: 6,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#333',
    marginHorizontal: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLight: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3cd83a',
    marginRight: 6,
  },
  statusText: {
    color: '#3cd83a',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(60, 216, 58, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  platformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformLabel: {
    color: '#cccccc',
    fontSize: 12,
    marginRight: 6,
  },
  platformNumber: {
    color: '#ffffff',
    backgroundColor: '#1976D2',
    fontSize: 16,
    fontWeight: 'bold',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    overflow: 'hidden',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: '#2196F3',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontSize: 18,
    color: '#cccccc',
    marginBottom: 40,
  },
  titleContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  nextStopBadge: {
    backgroundColor: '#1565C0',
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#0D47A1',
    position: 'relative',
    overflow: 'hidden',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  badgeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff3b30',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  directionArrow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftArrow: {
    marginRight: 6,
  },
  rightArrow: {
    marginLeft: 6,
  },
  directionArrowText: {
    color: '#ffffff',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  badgeGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: '#64B5F6',
    borderRadius: 30,
    zIndex: -1,
  },
  // Railway track styles
  trackContainer: {
    position: 'absolute',
    bottom: height * 0.18,
    width: width,
    alignItems: 'center',
    overflow: 'hidden',
    height: 100,
  },
  groundBase: {
    position: 'absolute',
    left: -width * 0.1,
    right: -width * 0.1,
    bottom: 0,
    height: 40,
    backgroundColor: '#2E2415',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    transform: [{ scaleX: 1.2 }],
  },
  groundShadow: {
    position: 'absolute',
    left: -width * 0.1,
    right: -width * 0.1,
    bottom: 15,
    height: 25,
    backgroundColor: '#1A1410',
    opacity: 0.6,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    transform: [{ scaleX: 1.1 }],
  },
  railwayTrack: {
    width: width * 2,
    height: 80,
    position: 'relative',
    marginBottom: 10,
  },
  trackBallast: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 30,
    top: 25,
    backgroundColor: '#5D4037',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  ballastGravel: {
    position: 'absolute',
    backgroundColor: '#4E342E',
    borderRadius: 2,
    zIndex: 2,
  },
  trackSleeper: {
    position: 'absolute',
    width: 35,
    height: 16,
    backgroundColor: '#3E2723',
    top: 32,
    borderRadius: 3,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    borderWidth: 1,
    borderColor: '#2D1E1A',
  },
  railTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 10,
    top: 24,
    backgroundColor: '#516161',
    borderRadius: 4,
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
  railBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 10,
    top: 47,
    backgroundColor: '#516161',
    borderRadius: 4,
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
  railTopHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    top: 25,
    backgroundColor: '#9E9E9E',
    zIndex: 4,
    opacity: 0.7,
  },
  railBottomHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    top: 48,
    backgroundColor: '#9E9E9E',
    zIndex: 4,
    opacity: 0.7,
  },
  railFastener: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#424242',
    borderRadius: 1,
    zIndex: 5,
    borderWidth: 0.5,
    borderColor: '#212121',
  },
  // Add cloud styles back
  cloudBase: {
    position: 'absolute',
    borderRadius: 15,
    backgroundColor: 'rgba(240, 240, 240, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 4,
    transform: [{scaleX: -1}], // Flip clouds to counter the container flip
  },
  cloudBubble: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
    opacity: 0.9,
  },
});

export default SplashScreen; 