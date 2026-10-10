import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const CreditAnimation = ({ amount = 0, onAnimationComplete, admin, user }) => {
  // Animation values
  const [slideAnim] = useState(new Animated.Value(height));
  const [scaleAnim] = useState(new Animated.Value(0.7));
  const [amountScale] = useState(new Animated.Value(1));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [displayAmount, setDisplayAmount] = useState(0);
  const [visible, setVisible] = useState(true);
  
  // Coin burst animation values
  const coinAnimations = useRef(
    Array(12).fill().map(() => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.3),
    }))
  ).current;

  const amountValue = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);

  useEffect(() => {
    animateCredit();
    
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      amountValue.removeAllListeners();
    };
  }, [amount]);

  const animateCredit = () => {
    setDisplayAmount(0);
    slideAnim.setValue(height);
    scaleAnim.setValue(0.7);
    opacityAnim.setValue(0);
    setVisible(true);

    // Reset coin animations
    coinAnimations.forEach(anim => {
      anim.translateY.setValue(0);
      anim.translateX.setValue(0);
      anim.rotate.setValue(0);
      anim.opacity.setValue(0);
      anim.scale.setValue(0.3);
    });

    // Main animation sequence
    animationRef.current = Animated.sequence([
      // Slide up and fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      
      // Amount counting animation
      Animated.parallel([
        Animated.timing(amountValue, {
          toValue: amount,
          duration: 1800,
          easing: Easing.out(Easing.exp),
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.timing(amountScale, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(amountScale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]),
      
      // Coin burst animation
      Animated.parallel(
        coinAnimations.map((anim, i) => 
          Animated.sequence([
            Animated.delay(i * 50),
            Animated.parallel([
              Animated.timing(anim.translateY, {
                toValue: Math.random() * -120 - 30,
                duration: 1000,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(anim.translateX, {
                toValue: (Math.random() - 0.5) * 150,
                duration: 1000,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(anim.rotate, {
                toValue: Math.random() * 720,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.spring(anim.scale, {
                toValue: 1,
                speed: 10,
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.delay(800),
                Animated.timing(anim.opacity, {
                  toValue: 0,
                  duration: 500,
                  useNativeDriver: true,
                }),
              ]),
            ]),
          ])
        )
      ),
      
      // Final delay and fade out
      Animated.sequence([
        Animated.delay(1000),
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -height,
            duration: 600,
            easing: Easing.in(Easing.back(1)),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);

    animationRef.current.start(({ finished }) => {
      if (finished) {
        setVisible(false);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }
    });

    amountValue.addListener(({ value }) => {
      setDisplayAmount(Math.floor(value));
    });
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <Animated.View 
        style={[
          styles.card,
          { 
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <View style={styles.header}>
          <Ionicons name="wallet-outline" size={32} color="#5E35B1" />
          <Text style={styles.title}>{admin == 1 ? 'Salary Allocated' : 'Salary Credited'}</Text>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <Animated.Text 
            style={[
              styles.amount,
              { transform: [{ scale: amountScale }] }
            ]}
          >
            {displayAmount.toLocaleString()}
          </Animated.Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {admin == 1 ? 'Funds transferred successfully' : 'Amount added to your account'}
          </Text>
        </View>
        
        {/* Coin burst animation */}
        {coinAnimations.map((anim, i) => {
          const rotateInterpolate = anim.rotate.interpolate({
            inputRange: [0, 360],
            outputRange: ['0deg', '360deg']
          });
          
          return (
            <Animated.View
              key={i}
              style={[
                styles.coin,
                {
                  backgroundColor: '#FFD700',
                  transform: [
                    { translateY: anim.translateY },
                    { translateX: anim.translateX },
                    { rotate: rotateInterpolate },
                    { scale: anim.scale },
                  ],
                  opacity: anim.opacity,
                }
              ]}
            />
          );
        })}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 1000,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: width * 0.85,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5E35B1',
    marginLeft: 10,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: '#5E35B1',
    marginRight: 4,
  },
  amount: {
    fontSize: 42,
    fontWeight: '800',
    color: '#5E35B1',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 16,
    width: '100%',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  coin: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFD700',
    top: '50%',
    left: '50%',
    marginLeft: -8,
    marginTop: -8,
  },
});

export default CreditAnimation;

