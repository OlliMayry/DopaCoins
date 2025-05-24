import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Alert, ImageBackground, Image } from 'react-native';
import BetModal from './BetModal';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

interface CoinProps {
  navigation: StackNavigationProp<RootStackParamList, 'Coin'>;
  tokenCount: number;
  setTokenCount: React.Dispatch<React.SetStateAction<number>>;
}

const coinImages: { [key: string]: any } = {
  // Heads
  "Heads": require("../assets/Coins/Heads_klaava.png"),
  // Tails
  "Tails": require("../assets/Coins/Tails_kruuna.png"),
  // Edge
  "Edge": require("../assets/Coins/Egde_pysty.png"),
  // Default
  "Default": require("../assets/Coins/default.png"),
  // Default
  "Background": require("../assets/Coins/Background1.png"),
};

const Coin: React.FC<CoinProps> = ({ navigation, tokenCount, setTokenCount }) => {
  const [side, setSide] = useState<'Heads' | 'Tails' | 'Edge' | null>(null);
  const [selectedColor, setSelectedColor] = useState<'Heads' | 'Tails' | 'Edge' | null>(null);
  const [headsCount, setHeadsCount] = useState(0);
  const [tailsCount, setTailsCount] = useState(0);
  const [standingCount, setStandingCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [betAmount, setBetAmount] = useState(0);  // Track the bet amount
  const [betModalVisible, setBetModalVisible] = useState(false);
  const [showBetWarning, setShowBetWarning] = useState(false);
  const [winAmount, setWinAmount] = useState(0);  // Track the win amount
  const [showWinAmount, setShowWinAmount] = useState(false);  // Control win amount visibility
  
  const handlePlaceBet = (color: 'Heads' | 'Tails' | 'Edge', amount: number) => {
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
      setSide('Edge');
      winMultiplier = selectedColor === 'Edge' ? 20 : 0;
    } else {
      const randomSide = Math.random() < 0.5 ? 'Heads' : 'Tails';
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
    setHeadsCount(0);
    setTailsCount(0);
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
        case 'Heads':
          setHeadsCount((prevCount) => prevCount + 1);
          break;
        case 'Tails':
          setTailsCount((prevCount) => prevCount + 1);
          break;
        case 'Edge':
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

  return (
    <ImageBackground source={coinImages["Background"]} style={styles.background}>
    <View style={styles.container}>
      <View style={styles.coinContainer}>
        <Animated.View style={[styles.front, { transform: [{ rotateY: frontSpin }] }]}>
          <Animated.Image
            source={
              isAnimating || !side
                ? require('../assets/Coins/default.png')
                : coinImages[side]
            }
            style={[
          styles.coinImage,
          side === 'Edge' && styles.edgeStyle // 👈 tämä rivi
        ]}
        resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={[styles.back, { transform: [{ rotateY: backSpin }] }]}>
          <Animated.Image
            source={
              isAnimating || !side
                ? require('../assets/Coins/default.png')
                : coinImages[side]
            }
            style={[
              styles.coinImage,
              side === 'Edge' && styles.edgeStyle // 👈 tämä rivi
            ]}
            resizeMode="contain"
              />
        </Animated.View>
      </View>

  <View style={styles.results}>
        <Text style={{ color: '#ffff', fontWeight: 'bold' }}>{`History:`}</Text>

                {/* Heads Text and Image */}
        <View style={styles.historyItem}><Image source={coinImages["Heads"]} style={styles.resultImage} />
          <Text style={{ color: '#ffff' }}>{`Heads: ${headsCount}`}</Text>
        
      </View>
      
      {/* Tails Text and Image */}
      <View style={styles.historyItem}><Image source={coinImages["Tails"]} style={styles.resultImage} />
        <Text style={{ color: '#ffff' }}>{`Tails: ${tailsCount}`}</Text>
        
      </View>

      {/* Edge Text and Image */}
      <View style={styles.historyItem}><Image source={coinImages["Edge"]} style={styles.resultImage} />
      <Text style={{ color: '#ffff' }}>{`Edge: ${standingCount}`}</Text>
      
      </View>
            <TouchableOpacity onPress={resetResults} style={styles.buttonClear}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
  </View>

  <View style={styles.tokenContainer}>
          <Text style={styles.tokenLabel}>Coins</Text>
          <Text style={styles.tokenText}>{tokenCount.toFixed(2)}</Text>
        </View>

  <View style={styles.conaContainer}>
        <TouchableOpacity
          onPress={flipCoin}
          style={[
            styles.button,
            (!selectedColor || isAnimating) && styles.disabledButton
          ]}
          disabled={!selectedColor || isAnimating}
        >
          <Text style={styles.buttonText}>Flip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setBetModalVisible(true)}
          style={[styles.button1, isAnimating && styles.disabledButton]}
          disabled={isAnimating}
        >
          <Text style={styles.buttonText}>Bet</Text>
        </TouchableOpacity>
  </View>

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
      {showWinAmount && <Text style={styles.winAmountText}>{winAmount > 0 ? `Win: ${winAmount.toFixed(2)}` : ''}</Text>}
        {side && !isAnimating && <Text style={styles.resultText}>{`Result: ${side}`}</Text>}
      </View>

      <View style={styles.betContainer}>
        {selectedColor && (
          <Text style={styles.betText}>{`Current Bet: ${betAmount.toFixed(2)} on ${selectedColor}`}</Text>
        )}
      </View>
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover", // Tämä varmistaa, että kuva kattaa koko taustan
  },
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
    top: 20,
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
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginTop: 15,
    top: 20,
  },
  button1: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginTop: 15,
    marginBottom: 10,
    top: 20,
  },
  buttonText: {
    color: '#fff',
  },
  resultText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 10,
  },
  results: {
    marginTop: 10,
    position: 'absolute',
    top: 10,
    left: 10,
   //alignItems: 'center',
  //  justifyContent: 'center',
  },
   tokenContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#222',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 6,
  },
  tokenLabel: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600',
  },
  tokenText: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  betContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    marginBottom: 50,
  },
  betText: {
    fontSize: 16,
    color: '#fff',
    position: 'absolute',
    top: 20,
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
    top: 105,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  winAmountText: {
    fontSize: 18,
    color: '#0FFF50', //'#4CAF50'
    fontWeight: 'bold',
    //bottom: 360,
  },
  buttonClear: {
    padding: 5,
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    marginTop: 5,
    //position: 'absolute',
   // top: 100,
    left: -5,
  },
  coinImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  edgeStyle: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,  // Adds some space between rows
  },
  resultImage: {
    width: 20,  // Adjust the size of the image
    height: 20, // Adjust the size of the image
    marginRight: 5, // Adds some space between the text and the image
  },
  conaContainer:{
    marginBottom: 20,
  },
});

export default Coin;
