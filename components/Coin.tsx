import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Alert } from 'react-native';
import BetModal from './BetModal';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

interface CoinProps {
  navigation: StackNavigationProp<RootStackParamList, 'Coin'>;
  tokenCount: number;
  setTokenCount: React.Dispatch<React.SetStateAction<number>>;
}

const Coin: React.FC<CoinProps> = ({ navigation, tokenCount, setTokenCount }) => {
  const [side, setSide] = useState<'Blue' | 'Red' | 'Standing' | null>(null);
  const [selectedColor, setSelectedColor] = useState<'Blue' | 'Red' | 'Standing' | null>(null);
  const [blueCount, setBlueCount] = useState(0);
  const [redCount, setRedCount] = useState(0);
  const [standingCount, setStandingCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [betAmount, setBetAmount] = useState(0);  // Track the bet amount
  const [betModalVisible, setBetModalVisible] = useState(false);
  const [showBetWarning, setShowBetWarning] = useState(false);
  const [winAmount, setWinAmount] = useState(0);  // Track the win amount
  const [showWinAmount, setShowWinAmount] = useState(false);  // Control win amount visibility
  
  const handlePlaceBet = (color: 'Blue' | 'Red' | 'Standing', amount: number) => {
    console.log(`Placed bet on ${color} with amount ${amount}`);
    setBetAmount(amount);
    setSelectedColor(color);
  };

  const handleClearBet = () => {
    setSelectedColor(null);
    setBetAmount(0);
  };

  const spinValue = useRef(new Animated.Value(0)).current;

  const flipCoin = () => {
    if (!selectedColor || isAnimating || tokenCount < betAmount) {
      if (!selectedColor) {
        Alert.alert('Alert', 'Please place a bet before flipping the coin.');
      } else if (tokenCount < betAmount) {
        setShowBetWarning(true);
        setTimeout(() => setShowBetWarning(false), 3000);
      }
      return;
    }

    setIsAnimating(true);
    setShowWinAmount(false);  // Hide win amount before flip starts
    setTokenCount((prevCount) => prevCount - betAmount);

    const randomNumber = Math.random();
    let winMultiplier = 1;
    let currentWinAmount = 0;

    // Determine the win multiplier
    if (randomNumber < 0.05) {
      setSide('Standing');
      winMultiplier = selectedColor === 'Standing' ? 20 : 0;
    } else {
      const randomSide = Math.random() < 0.5 ? 'Blue' : 'Red';
      setSide(randomSide);

      if (randomSide === selectedColor) {
        winMultiplier = 2;  // User wins 2x tokens
      } else {
        winMultiplier = 0;  // User loses if the result doesn't match
      }
    }

    currentWinAmount = betAmount * winMultiplier;

    const spinAnimation = Animated.sequence([
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,  // Initial fast spin
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,  // Slow down the final spins
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]);

    spinAnimation.start(() => {
      setIsAnimating(false);
      setTokenCount((prevCount) => prevCount + currentWinAmount);
      setWinAmount(currentWinAmount);
      setShowWinAmount(true);
    });

    setShowBetWarning(false);
  };

  const resetResults = () => {
    setSide(null);
    setBlueCount(0);
    setRedCount(0);
    setStandingCount(0);
  };

  useEffect(() => {
    const listener = spinValue.addListener(({ value }) => {
      if (value === 1) {
        spinValue.setValue(0);
      }
    });

    return () => {
      spinValue.removeListener(listener);
    };
  }, []);

  useEffect(() => {
    if (!isAnimating) {
      switch (side) {
        case 'Blue':
          setBlueCount((prevCount) => prevCount + 1);
          break;
        case 'Red':
          setRedCount((prevCount) => prevCount + 1);
          break;
        case 'Standing':
          setStandingCount((prevCount) => prevCount + 1);
          break;
        default:
          break;
      }
    }
  }, [side, isAnimating]);

  const frontSpin = spinValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '1800deg', '3600deg'],
  });

  const backSpin = spinValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['180deg', '1980deg', '3600deg'],
  });

  const getCircleColor = (): string => {
    if (isAnimating) {
      return '#ccc';  // Gray when animating
    } else {
      switch (side) {
        case 'Blue':
          return '#3498db';  // Blue
        case 'Red':
          return '#e74c3c';  // Red
        case 'Standing':
          return '#f1c40f';  // Yellow for Standing
        default:
          return '#999';  // Gray by default
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.coinContainer}>
        <Animated.View
          style={[styles.front, { transform: [{ rotateY: frontSpin }], backgroundColor: getCircleColor() }]}
        />
        <Animated.View
          style={[styles.back, { transform: [{ rotateY: backSpin }], backgroundColor: getCircleColor() }]}
        />
      </View>

      <View style={styles.results}>
        <Text>{`Results:`}</Text>
        <Text>{`Blue: ${blueCount}`}</Text>
        <Text>{`Red: ${redCount}`}</Text>
        <Text>{`Standing: ${standingCount}`}</Text>
      </View>

      <View style={styles.tokenContainer}>
        <Text style={styles.tokenText}>{`Coins: ${tokenCount}`}</Text>
      </View>

      <TouchableOpacity
        onPress={flipCoin}
        style={[styles.button, !selectedColor && styles.disabledButton]}
        disabled={!selectedColor}>
        <Text style={styles.buttonText}>Flip</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setBetModalVisible(true)} style={styles.button}>
        <Text style={styles.buttonText}>Bet</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={resetResults} style={styles.button}>
        <Text style={styles.buttonText}>Clear Results</Text>
      </TouchableOpacity>

      <BetModal
        isVisible={betModalVisible}
        onClose={() => setBetModalVisible(false)}
        onPlaceBet={handlePlaceBet}
        onClearBet={handleClearBet}
      />

      {showBetWarning && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>Not enough coins. Change your bet or earn more.</Text>
        </View>
      )}

      <View style={styles.outcomeContainer}>
        {side && !isAnimating && <Text style={styles.resultText}>{`Result: ${side}`}</Text>}
        {showWinAmount && <Text style={styles.winAmountText}>{winAmount > 0 ? `Win: ${winAmount}` : ''}</Text>}
      </View>

      <View style={styles.betContainer}>
        {selectedColor && (
          <Text style={styles.betText}>{`Current Bet: "${betAmount}" on ${selectedColor}`}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinContainer: {
    width: 100,
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  front: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'transparent',
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  back: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'transparent',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    transform: [{ rotateY: '180deg' }],
  },
  button: {
    padding: 10,
    backgroundColor: '#3498db',
    borderRadius: 5,
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
  },
  resultText: {
    fontSize: 18,
  },
  results: {
    marginTop: 20,
  },
  tokenContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  tokenText: {
    fontSize: 16,
  },
  betContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 35,
    marginBottom: 50,
  },
  betText: {
    fontSize: 16,
  },
  warningContainer: {
    position: 'absolute',
    top: 40,
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningText: {
    color: '#fff',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  outcomeContainer: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  winAmountText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default Coin;
