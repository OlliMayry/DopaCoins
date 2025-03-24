import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

interface CaseProps {
  navigation: StackNavigationProp<RootStackParamList, 'Case'>;
  tokenCount: number;
  setTokenCount: React.Dispatch<React.SetStateAction<number>>;
}

const ITEM_WIDTH = 150;
const REEL_LENGTH = 20;
const CENTER_INDEX = Math.floor(REEL_LENGTH / 2);
const SPIN_DURATION = 3000;

const Case: React.FC<CaseProps> = ({ navigation, tokenCount, setTokenCount }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [resultNumber, setResultNumber] = useState<string | null>(null);
  const [reelData, setReelData] = useState<string[]>([]);
  const [betAmount, setBetAmount] = useState(1);
  const [winAmount, setWinAmount] = useState<number | null>(null); // Store win amount
  const [firstVisit, setFirstVisit] = useState(true); // Track first visit state
  
  const reelAnim = useRef(new Animated.Value(0)).current;
  const position = useRef(0);

  useEffect(() => {
    const listenerId = reelAnim.addListener(({ value }) => {
      position.current = value;
    });
    return () => {
      reelAnim.removeListener(listenerId);
    };
  }, []);

  useEffect(() => {
    setReelData(generateReel());
  }, []);

  const getRandomResult = () => {
    const random = Math.random();
    if (random < 0.5) return '1';  // Grey (50%)
    if (random < 0.9) return '2';  // Blue (40%)
    if (random < 0.95) return '3'; // Violet (5%)
    if (random < 0.98) return '4'; // Pink (3%)
    if (random < 0.995) return '5'; // Red (1.5%)
    return '0';  // Gold (0.5%)
  };

  const getPayoutMultiplier = (result: string) => {
    switch (result) {
      case '1': return 0;   // Grey (50%) - No payout
      case '2': return 1;   // Blue (40%) - Payout x1
      case '3': return 5;   // Violet (5%) - Payout x5
      case '4': return 10;  // Pink (3%) - Payout x10
      case '5': return 20;  // Red (1.5%) - Payout x20
      case '0': return 50;  // Gold (0.5%) - Payout x50
      default: return 1;    // Default case
    }
  };

  const openCaseAndSpin = () => {
    if (isRolling || tokenCount < betAmount) return;

    setTokenCount((prev) => prev - betAmount); // Deduct bet
    setIsRolling(true);
    setResultNumber(null);
    setWinAmount(null); // Reset win amount before each spin

    const newReelData = generateReel();
    setReelData([...newReelData]); // Ensure re-render

    setTimeout(() => {
        const selectedResult = getRandomResult();
        const resultIndex = newReelData.lastIndexOf(selectedResult);
        const targetOffset = -((resultIndex - CENTER_INDEX) * ITEM_WIDTH) + ITEM_WIDTH / 2;

        reelAnim.setValue(ITEM_WIDTH * 5); // Reset the position for animation
        
        Animated.timing(reelAnim, {
            toValue: targetOffset,
            duration: SPIN_DURATION,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false, // Temporarily set to false to debug issues
        }).start(() => {
            const finalOffset = Math.round(position.current);
            const finalIndex = Math.round(Math.abs(finalOffset) / ITEM_WIDTH) % REEL_LENGTH;

            setResultNumber(newReelData[finalIndex]);
            setIsRolling(false); // Set isRolling to false only after the animation has finished

            // Calculate and update the token count based on the selected result
            const multiplier = getPayoutMultiplier(newReelData[finalIndex]);
            const win = betAmount * multiplier;
            setWinAmount(win);  // Store the winning amount
            setTokenCount((prev) => prev + win); // Add the winning amount based on the multiplier
        });
    }, 50); // Small delay to ensure state updates before animation

    // After opening the case, set firstVisit to false
    setFirstVisit(false);
};


  const generateReel = () => {
    return Array.from({ length: REEL_LENGTH }, () => getRandomResult());
  };

  const getBoxColor = (value: string) => {
    switch (value) {
      case '1': return '#BDC3C7';  // Grey
      case '2': return '#3498db';  // Blue
      case '3': return '#9B59B6';  // Violet
      case '4': return '#E91E63';  // Pink
      case '5': return '#F44336';  // Red
      case '0': return '#FFD700';  // Golden
      default: return '#3498db';   // Default blue
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tokenContainer}>
        <Text style={styles.tokenText}>{`Coins: ${tokenCount}`}</Text>
      </View>

      {/* If it's the first visit, show the black box with a question mark */}
      {firstVisit ? (
        <View style={styles.questionMarkBox}>
          <Text style={styles.questionMark}>?</Text>
        </View>
      ) : (
        <View style={styles.reelWrapper}>
          <Animated.View style={[styles.reel, { transform: [{ translateX: reelAnim }] }]}>
            {reelData.map((value, index) => (
              <View
                style={[styles.box, { backgroundColor: getBoxColor(value) }]}
                key={index}
              >
                <Text style={styles.boxText}>{value}</Text>
              </View>
            ))}
          </Animated.View>
        </View>
      )}

      <View style={styles.verticalLine}></View>
      <Text style={styles.resultText}>
        {resultNumber ? `Result: ${resultNumber}` : isRolling ? 'Rolling...' : 'Press to Open'}
      </Text>
      <TouchableOpacity onPress={openCaseAndSpin} style={styles.caseBox} disabled={isRolling}>
        <Text style={styles.caseText}>Open Case</Text>
      </TouchableOpacity>

      <View style={styles.betControls}>
        <TouchableOpacity onPress={() => setBetAmount((prev) => Math.max(1, prev - 1))} style={styles.betButton}>
          <Text style={styles.betText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.betAmount}>Bet: {betAmount}</Text>
        <TouchableOpacity onPress={() => setBetAmount((prev) => prev + 1)} style={styles.betButton}>
          <Text style={styles.betText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* You Win Text */}
      {winAmount !== null && winAmount > 0 && (
        <Text style={[styles.winText, { position: 'absolute', bottom: 120 }]}>{`You Win: ${winAmount}`}</Text>
      )}
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
  caseBox: {
    width: 200,
    height: 50,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  caseText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  reelWrapper: {
    width: ITEM_WIDTH * 3,
    height: 150,
    overflow: 'hidden',
    marginBottom: 20,
  },
  reel: {
    flexDirection: 'row',
  },
  box: {
    height: 150,
    width: ITEM_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  boxText: {
    fontSize: 24,
    color: '#fff', // White text color for numbers
    fontWeight: 'bold',
  },
  verticalLine: {
    position: 'absolute',
    top: '21.5%',
    left: '50%',
    width: 4,
    backgroundColor: '#e74c3c',
    height: 180,
    transform: [{ translateX: -2 }],
  },
  resultText: {
    fontSize: 20,
    marginTop: 10,
    fontWeight: 'bold',
  },
  winText: {
    fontSize: 20,
    color: '#27ae60', // Green text to indicate winning
    fontWeight: 'bold',
    marginTop: 10,
  },
  betControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
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
  questionMarkBox: {
    width: 150,
    height: 150,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  questionMark: {
    fontSize: 60,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Case;

