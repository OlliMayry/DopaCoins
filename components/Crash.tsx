import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import RunkoSVG from '../components/RunkoSVG';
import Wheel1SVG from '../components/Wheel1SVG';
import MovingRoad from '../components/MovingRoad';

interface CrashProps {
  tokenCount: number;
  setTokenCount: React.Dispatch<React.SetStateAction<number>>;
}

 // Helper function to generate crash multiplier
const generateCrashMultiplier = () => {
  const r = Math.random();
  
  if (r < 0.4525) {
    // 0-0.99x: 45.25% chance
    return Math.random() * 0.99;
  } else if (r < 0.7775) {
    // 1-2.99x: 32.5% chance
    return 1 + Math.random() * (2.99 - 1);
  } else if (r < 0.8825) {
    // 3-6.99x: 10.5% chance
    return 3 + Math.random() * (6.99 - 3);
  } else if (r < 0.9325) {
    // 7-9.99x: 5% chance
    return 7 + Math.random() * (9.99 - 7);
  } else if (r < 0.9625) {
    // 10-17.499x: 3% chance
    return 10 + Math.random() * (17.499 - 10);
  } else if (r < 0.9825) {
    // 17.5-24.99x: 2% chance
    return 17.5 + Math.random() * (24.99 - 17.5);
  } else if (r < 0.997) {
    // 25-32.499x: 1.5% chance
    return 25 + Math.random() * (32.499 - 25);
  } else if (r < 0.9995) {
    // 32.5-49.99x: 0.5% chance
    return 32.5 + Math.random() * (49.99 - 32.5);
  } else {
    // 50-100x: 0.25% chance
    return 50 + Math.random() * (100 - 50);
  }
}; // RTP 321.75 

// Calculate RTP for a number of trials
const calculateRTP = (trials: number): number => {
  let total = 0;
  
  for (let i = 0; i < trials; i++) {
    const multiplier = generateCrashMultiplier();
    total += multiplier; // Accumulate the multiplier for each trial
  }

  const averageRTP = total / trials;
  console.log("Estimated RTP:", averageRTP);
  return averageRTP;
};

// Run a simulation for 1,000,000 trials
const estimatedRTP = calculateRTP(1000000);

const Crash: React.FC<CrashProps> = ({ tokenCount, setTokenCount }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [multiplier, setMultiplier] = useState(0);
  const [betAmount, setBetAmount] = useState(1);
  const [animationValue] = useState(new Animated.Value(1));
  const [crashEffect, setCrashEffect] = useState(false);
  const [cashOutAmount, setCashOutAmount] = useState<number | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [crashMultiplier, setCrashMultiplier] = useState<number | null>(null);
  const [cashOutMultiplier, setCashOutMultiplier] = useState<number | null>(null);
  const [wheelRotation] = useState(new Animated.Value(0));
  const [tiltValue] = useState(new Animated.Value(0));

  useEffect(() => {
  if (isPlaying) {
    // Wheel rotation continues as long as isPlaying is true
    Animated.loop(
      Animated.timing(wheelRotation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  } else {
    wheelRotation.stopAnimation();
    wheelRotation.setValue(0);  // Stop wheel rotation when not playing
  }
}, [isPlaying]);  // Trigger this when isPlaying state changes

useEffect(() => {
  if (isRolling) {
    // Tilt animation happens when isRolling is true
    Animated.timing(tiltValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad),
    }).start();
  } else {
    // Reset tilt when not rolling
    Animated.timing(tiltValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.in(Easing.quad),
    }).start();
  }
}, [isRolling]);  // Trigger this when isRolling state changes

const spin = wheelRotation.interpolate({
  inputRange: [0, 1],
  outputRange: ['0deg', '360deg'],
});

const tiltInterpolation = tiltValue.interpolate({
  inputRange: [0, 1],
  outputRange: ['0deg', '-50deg'], // negatiivinen = oikea puoli nousee
});

const liftInterpolation = tiltValue.interpolate({
  inputRange: [0, 1],
  outputRange: [0, -37.5], // nostetaan hieman ylöspäin
});

const shiftInterpolation = tiltValue.interpolate({
  inputRange: [0, 1],
  outputRange: [0, -62.5], // siirretään hieman vasemmalle, jotta keula näyttäisi kiertyvän oikeasta päästä
});

const frontWheelX = tiltValue.interpolate({
  inputRange: [0, 1],
  outputRange: [0, -52.5], // Eturengas menee enemmän oikealle
});

const frontWheelY = tiltValue.interpolate({
  inputRange: [0, 1],
  outputRange: [0, -115],  // Eturengas nousee x yksikköä korkeammalle
});



  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setMultiplier((prev) => {
          const nextMultiplier = prev + Math.random() * 0.1;
          if (crashMultiplier !== null && nextMultiplier >= crashMultiplier) {
            clearInterval(timer);
            crash(nextMultiplier);
          }
          return nextMultiplier;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isPlaying, crashMultiplier]);

  const startGame = () => {
    if (isRolling || tokenCount < betAmount) return;
    setTokenCount((prev) => prev - betAmount);
    setIsRolling(true);
    setIsPlaying(true);
    setMultiplier(0);
    setResultMessage(null);
    setCashOutAmount(null);
    // Use our helper to set the crash multiplier based on the probability distribution
    setCrashMultiplier(generateCrashMultiplier());
  };

  const crash = (finalMultiplier: number) => {
    setIsRolling(false);
    setIsPlaying(false);
    setResultMessage(`Crashed At x${finalMultiplier.toFixed(2)}`);
  };

  const cashOut = () => {
    if (isRolling && multiplier > 0) {
      setIsRolling(false);
      const earned = betAmount * multiplier;
      setCashOutAmount(Math.round(earned * 100) / 100);
      setTokenCount((prev) => prev + earned);
      setCashOutMultiplier(multiplier);  // Save the multiplier at the time of cashout
    }
  };

  const handleBetAmountChange = (amount: number) => {
    setBetAmount((prev) => Math.max(1, prev + amount));
  };

  return (
    <View style={styles.container}>
      <View style={styles.tokenContainer}>
        <Text style={styles.tokenText}>Coins: {tokenCount.toFixed(2)}</Text>
      </View>

      <Text style={styles.maxMultiplierText}>Max Win 100x</Text>

      <View style={styles.svgContainer}>
            <Animated.View
        style={[
          styles.runko,
          {
            transform: [
              { translateY: liftInterpolation },
              { translateX: shiftInterpolation },
              { rotate: tiltInterpolation },
            ],
          },
        ]}
      >
        <RunkoSVG width={360} height={250} />
      </Animated.View>
      <Animated.View style={[styles.wheel, { transform: [{ rotate: spin }] }]}>
        <Wheel1SVG width={85} height={185} />
      </Animated.View>
      <Animated.View
  style={[
    styles.wheel2,
    {
      transform: [
        { translateY: frontWheelY },
        { translateX: frontWheelX },
        { rotate: spin },
      ],
    },
  ]}
>
  <Wheel1SVG width={85} height={185} />
</Animated.View>
      <MovingRoad isPlaying={isPlaying} />
      </View>

<View style={styles.info}>
      {isPlaying ? (
        <Text style={styles.rollingText}>Rolling...</Text>
      ) : (
        <Text style={styles.crashText}>{resultMessage || ''}</Text>
      )}

      <Text style={styles.multiplierText}>Multiplier: x{multiplier.toFixed(2)}</Text>

      <TouchableOpacity
        onPress={startGame}
        style={[styles.startButton, isPlaying ? styles.disabledButton : {}]}
        disabled={isPlaying}
      >
        <Text style={styles.buttonText}>Start Game</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={cashOut}
        style={[styles.cashOutButton, isRolling ? styles.rollingButton : styles.disabledButton]}
        disabled={!isRolling}
      >
        <Text style={styles.buttonText}>Cash Out</Text>
      </TouchableOpacity>

      <View style={styles.resultContainer}>
        <Text style={styles.cashOutText}>
          {cashOutAmount !== null ? `Cashed Out: ${cashOutAmount.toFixed(2)} (x${cashOutMultiplier?.toFixed(2)})` : ''}
        </Text>
      </View>

      <View style={styles.betControls}>
        <TouchableOpacity
          onPress={() => handleBetAmountChange(-1)}
          style={[styles.betButton, isPlaying ? styles.disabledButton : {}]} // Disable if isPlaying is true
          disabled={isPlaying}  // Disable if game is playing
        >
          <Text style={styles.betText}>-</Text>
        </TouchableOpacity>
        
        <Text style={styles.betAmount}>Bet: {betAmount}</Text>
        
        <TouchableOpacity
          onPress={() => handleBetAmountChange(1)}
          style={[styles.betButton, isPlaying ? styles.disabledButton : {}]} // Disable if isPlaying is true
          disabled={isPlaying}  // Disable if game is playing
        >
          <Text style={styles.betText}>+</Text>
        </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  tokenText: {
    fontSize: 16,
  },
  rollingText: {
    fontSize: 20,
    color: '#f39c12',
    fontWeight: 'bold',
    minHeight: 25,
  },
  crashText: {
    fontSize: 20,
    color: 'red',
    fontWeight: 'bold',
  },
  multiplierText: {
    fontSize: 20,
    marginVertical: 10,
  },
  startButton: {
    width: 200,
    height: 50,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  rollingButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  cashOutButton: {
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  resultContainer: {
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    //marginTop: 10,
   // top: 10,
  },
  cashOutText: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 440,
  },
  betControls: {
    flexDirection: 'row',
    alignItems: 'center',
    bottom: 30,
  },
  betButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#27ae60',
    borderRadius: 10,
    marginHorizontal: 10,
  },
  betText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  betAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  maxMultiplierText: {
    fontSize: 16,
    color: '#333', 
    fontWeight: 'bold',
    //marginTop: 10,
    top:5,
  },
  svgContainer: {
    width: 360,
    height: 250,
    position: 'relative', // tärkeä, että "absolute" toimii lapsissa
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20, // voit säätää tarvittaessa
  },
  runko: {
    position: 'absolute',
    zIndex: 2, // alempi
  },
  wheel: {
    position: 'absolute',
    zIndex: 1, // ylempi (tai laita pienemmäksi jos haluat taakse)
    left: 68, // säädä sijainti haluamaksesi
    top: 81.5,
  },
  wheel2: {
    position: 'absolute',
    zIndex: 1, // ylempi (tai laita pienemmäksi jos haluat taakse)
    right: 61, // säädä sijainti haluamaksesi
    top: 81.5,
  },
  info:{
bottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Crash;
