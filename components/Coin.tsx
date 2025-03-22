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
  const [side, setSide] = useState<'Blue' | 'Red' | 'Standing'>(null!);
  const [selectedColor, setSelectedColor] = useState<'Blue' | 'Red' | 'Standing' | null>(null);
  const [blueCount, setBlueCount] = useState(0);
  const [redCount, setRedCount] = useState(0);
  const [standingCount, setStandingCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false); // Track animation state
  const [betAmount, setBetAmount] = useState(0); // Initial bet amount
  const [betModalVisible, setBetModalVisible] = useState(false);
  const [showBetWarning, setShowBetWarning] = useState(false);
  const [winAmount, setWinAmount] = useState(0);  // Track win amount
  const [showWinAmount, setShowWinAmount] = useState(false); // Show win amount after animation
  
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
    setShowWinAmount(false);  // Hide win amount initially before flip starts
    setTokenCount((prevCount) => prevCount - betAmount);

    const randomNumber = Math.random();
    let winMultiplier = 1;
    let currentWinAmount = 0;  // Variable to track the win amount

    if (randomNumber < 0.05) {
      setSide('Standing');
      winMultiplier = selectedColor === 'Standing' ? 10 : 0; // User wins 10x tokens for 'Standing'
    } else {
      const randomSide = Math.random() < 0.5 ? 'Blue' : 'Red';
      setSide(randomSide);

      if (randomSide === selectedColor) {
        winMultiplier = 2; // User wins 2x tokens for matching color
      } else {
        winMultiplier = 0; // User loses the bet if it doesn't match the result
      }
    }
    currentWinAmount = betAmount * winMultiplier;

    Animated.timing(spinValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      setIsAnimating(false);
      setTokenCount((prevCount) => prevCount + currentWinAmount); // Update token count after animation
      setWinAmount(currentWinAmount);  // Set win amount after the coin flip
      setShowWinAmount(true);  // Show win amount after animation
    });
    setShowBetWarning(false);
  };

  const resetResults = () => {
    setSide(null!);
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
    outputRange: ['0deg', '90deg', '180deg'],
  });

  const backSpin = spinValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['180deg', '270deg', '360deg'],
  });

  const getCircleColor = (): string => {
    if (isAnimating) {
      return '#ccc';
    } else {
      switch (side) {
        case 'Blue':
          return '#3498db';
        case 'Red':
          return '#e74c3c';
        default:
          return 'transparent';
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.coinContainer}>
        <Animated.View
          style={[
            styles.front,
            { transform: [{ rotateY: frontSpin }], backgroundColor: getCircleColor() },
          ]}
        />
        <Animated.View
          style={[
            styles.back,
            { transform: [{ rotateY: backSpin }], backgroundColor: getCircleColor() },
          ]}
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
          <Text style={styles.warningText}>Not enough coins. Change the bet or get more.</Text>
        </View>
      )}

      <View style={styles.outcomeContainer}>
        {side && !isAnimating && <Text style={styles.resultText}>{`Outcome: ${side}`}</Text>}
        {showWinAmount && <Text style={styles.winAmountText}>{`Win: ${winAmount}`}</Text>}
      </View>

      {/* Move the Current Bet below all buttons */}
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
    color: '#555',
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
    marginTop: 30, // Increased margin
    marginBottom: 50, // Added bottom margin to avoid overlap with outcome
  },
  betText: {
    fontSize: 16,
  },
  warningContainer: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
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
    bottom: 100, // Adjusted the bottom position to give more space
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winAmountText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});


export default Coin;
