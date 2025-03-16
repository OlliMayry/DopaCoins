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
  const reelAnim = useRef(new Animated.Value(0)).current;

  // Listen to changes in the animation value and update the position ref
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
    if (random < 0.475) return '1';
    if (random < 0.95) return '2';
    return '3';
  };

  const openCaseAndSpin = () => {
    if (isRolling) return;

    setIsRolling(true);
    setResultNumber(null); // Hide result until spin finishes

    // Start the reel data with the same values
    const newReelData = generateReel();
    setReelData(newReelData);

    // Get a random result for the target
    const selectedResult = getRandomResult();
    const resultIndex = newReelData.lastIndexOf(selectedResult);
    const targetOffset = -((resultIndex - CENTER_INDEX) * ITEM_WIDTH);

    // Reset the animation before starting a new one
    reelAnim.setValue(ITEM_WIDTH * 5);

    // Start the reel animation
    Animated.timing(reelAnim, {
      toValue: targetOffset,
      duration: SPIN_DURATION,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      // After animation completes, calculate where the vertical line hits

      // Calculate the index based on the final position
      const finalOffset = position.current;
      const finalIndex = Math.floor(Math.abs(finalOffset) / ITEM_WIDTH) % REEL_LENGTH;

      // Update the result number based on the final position of the vertical line
      setResultNumber(newReelData[finalIndex]);
      setIsRolling(false); // Set rolling state to false
    });
  };

  const generateReel = () => {
    return Array.from({ length: REEL_LENGTH }, () => getRandomResult());
  };

  return (
    <View style={styles.container}>
      <View style={styles.reelWrapper}>
        <Animated.View style={[styles.reel, { transform: [{ translateX: reelAnim }] }]}>
          {reelData.map((value, index) => (
            <View style={styles.box} key={index}>
              <Text style={styles.boxText}>{value}</Text>
            </View>
          ))}
        </Animated.View>
      </View>

      <View style={styles.verticalLine}></View>

      <Text style={styles.resultText}>
        {resultNumber ? `Result: ${resultNumber}` : isRolling ? 'Rolling...' : 'Press to Open'}
      </Text>

      <TouchableOpacity onPress={openCaseAndSpin} style={styles.caseBox} disabled={isRolling}>
        <Text style={styles.caseText}>Open Case</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#3498db',
    marginRight: 5,
  },
  boxText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  verticalLine: {
    position: 'absolute',
    top: '27%',
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
});

export default Case;
