import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Alert, Image } from 'react-native';
import RouletteWheelSVG from './RouletteWheelSVG';
import RouletteBet from './RouletteBet';

const wheelNumbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30,
  8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7,
  28, 12, 35, 3, 26
];

interface RouletteProps {
  tokenCount: number;
  setTokenCount: React.Dispatch<React.SetStateAction<number>>;
}

const rouletteImages: { [key: string]: any } = {
  "comp": require("../assets/Roulette/comp1.png"),
  "wheel": require("../assets/Roulette/Wheel.png"),
};

const Roulette: React.FC<RouletteProps> = ({ tokenCount, setTokenCount }) => {
  const [betModalVisible, setBetModalVisible] = useState(false);
  const [selectedBet, setSelectedBet] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState(0);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [pointerNumber, setPointerNumber] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [highlightedSector, setHighlightedSector] = useState<number | null>(null);

  const wheelRotation = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);

  const sectorAngle = 360 / 37;

  useEffect(() => {
    wheelNumbers.forEach((num, idx) => {
      const start = (idx * sectorAngle) % 360;
      const end = ((idx + 1) * sectorAngle) % 360;
      //console.log(`Sector ${idx}: ${num} → ${start.toFixed(1)}° - ${end.toFixed(1)}°`);
    });
  }, []);

  const getColorForNumber = (number: number) => {
    const redNumbers = [32, 19, 21, 25, 34, 27, 36, 30, 23, 5, 16, 1, 14, 9, 18, 7, 12, 3];
    const blackNumbers = [15, 4, 2, 17, 6, 13, 11, 8, 10, 24, 33, 20, 31, 22, 29, 28, 35, 26];
    if (number === 0) return 'green';
    if (redNumbers.includes(number)) return 'red';
    if (blackNumbers.includes(number)) return 'black';
    return '';
  };

  const spinRoulette = () => {
    if (!selectedBet || isSpinning || tokenCount < betAmount) {
      Alert.alert('Alert', 'Please place a valid bet before spinning.');
      return;
    }

    setHighlightedSector(null);
  
    setIsSpinning(true);
    setWinningNumber(null);
    setTokenCount(prev => prev - betAmount);
    setWinAmount(0);
  
    const extraSpins = 5;  // Number of extra full rotations
    const randomAngleWithinCircle = Math.random() * 360;  // Random angle within one circle (0-360 degrees)
    const totalRotation = 360 * extraSpins + randomAngleWithinCircle;
  
    Animated.timing(wheelRotation, {
      toValue: currentRotation.current + totalRotation,
      duration: 4000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      currentRotation.current += totalRotation;
  
      const finalAngle = (currentRotation.current % 360 + 360) % 360;
      const pointerOffset = 90;
      const correctedAngle = (finalAngle + pointerOffset) % 360;
  
      const index = Math.floor(correctedAngle / sectorAngle);
      setPointerNumber(wheelNumbers[index]);
  
      const winningNum = wheelNumbers[index];
      setWinningNumber(winningNum);
      setHighlightedSector(index); // Set the highlighted sector to the winning index
  

      const winningColor = getColorForNumber(winningNum);
let payoutMultiplier = 0;

if (selectedBet === winningNum.toString()) {
    payoutMultiplier = 35; // Yksittäinen numero
} else if (selectedBet?.toLowerCase() === 'red' && winningColor === 'red') {
    payoutMultiplier = 2; // Punainen
} else if (selectedBet?.toLowerCase() === 'black' && winningColor === 'black') {
    payoutMultiplier = 2; // Musta
} else if (selectedBet?.toLowerCase() === '1-18' && winningNum >= 1 && winningNum <= 18) {
    payoutMultiplier = 2; // 1-18
} else if (selectedBet?.toLowerCase() === '19-36' && winningNum >= 19 && winningNum <= 36) {
    payoutMultiplier = 2; // 19-36
} else if (selectedBet?.toLowerCase() === '1st12' && winningNum >= 1 && winningNum <= 12) {
    payoutMultiplier = 3; // 1st12
} else if (selectedBet?.toLowerCase() === '2nd12' && winningNum >= 13 && winningNum <= 24) {
    payoutMultiplier = 3; // 2nd12
} else if (selectedBet?.toLowerCase() === '3rd12' && winningNum >= 25 && winningNum <= 36) {
    payoutMultiplier = 3; // 3rd12 
}

      const currentWinAmount = betAmount * payoutMultiplier;
      setTokenCount(prev => prev + currentWinAmount);
      setWinAmount(currentWinAmount);
      setIsSpinning(false);
    });
  };

  const interpolatedRotation = wheelRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  

  return (
    <View style={styles.container}>
            <View style={styles.outComeContainer}>
        {winningNumber !== null && (
          <Text style={[styles.resultText, { color: getColorForNumber(winningNumber), position: 'absolute', top: '60%' }]}>
            {`Result: ${winningNumber}`}
          </Text>
        )}

        {winAmount > 0 && (
          <Text style={[styles.winText, { position: 'absolute', top: '70%' }]}>
            {`You win: ${winAmount} coins!`}
          </Text>
        )}
{/* 
        {pointerNumber !== null && !isSpinning && (
          <Text style={{ fontSize: 16, position: 'absolute', top: '80%' }}>
            {`Pointer is at: ${pointerNumber}`}
          </Text>
        )} */}
      </View>
     <View style={styles.wheelContainer}>
  <Animated.View style={{ transform: [{ rotate: interpolatedRotation }] }}>
    <RouletteWheelSVG rotation={wheelRotation} highlightedSector={highlightedSector} />
  </Animated.View>

  {/* Center "comp" image */}
  <Image
    source={rouletteImages.comp}
    style={styles.compImage}
    resizeMode="contain"
  />
</View>

      <Text style={styles.tokenText}>Coins: {tokenCount.toFixed(2)}</Text>

      <TouchableOpacity
          onPress={spinRoulette}
          disabled={isSpinning || !selectedBet}   // Disable if spinning or no bet is set
          style={[styles.button, (!selectedBet || isSpinning) && styles.disabledButton]}
        >
          <Text style={styles.buttonText}>Spin</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setBetModalVisible(true)}
          disabled={isSpinning}                      // Disable while spinning
          style={[styles.BetButton, isSpinning && styles.disabledButton]}
        >
          <Text style={styles.buttonText}>Bet</Text>
      </TouchableOpacity>

      <RouletteBet
        isVisible={betModalVisible}
        onClose={() => setBetModalVisible(false)}
        onPlaceBet={(type, amount) => {
          setSelectedBet(type);
          setBetAmount(amount);
        }}
        onClearBet={() => {
          setSelectedBet(null);
          setBetAmount(0);
        }}
        selectedBet={selectedBet}
        betAmount={betAmount}
      />

{selectedBet !== null && (
  <Text style={styles.betText}>
    {`Current Bet: ${betAmount} on `}
    <Text style={{ color: selectedBet.toLowerCase() === 'red' ? 'red' : 'black' }}>
      {selectedBet}
    </Text>
  </Text>
)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginTop: 15,
  },
  BetButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginTop: 15,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
  },
  tokenText: {
    fontSize: 16,
    position: 'absolute',
    top: 20,
    right: 20,
  },
  betText: {
    position: 'absolute',
    fontSize: 16,
    marginTop: 10,
    bottom: 95,
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 40,
  },
  winText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
  },
  outComeContainer: {
    marginBottom: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 45,
  },
  compImage: {
    position: 'absolute',
    width: 150, // Adjust size as needed
    height: 150,
    zIndex: 2,
  },
});

export default Roulette;

