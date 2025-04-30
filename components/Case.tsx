import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Image, ImageBackground } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

interface CaseProps {
  navigation: StackNavigationProp<RootStackParamList, 'Case'>;
  tokenCount: number;
  setTokenCount: React.Dispatch<React.SetStateAction<number>>;
}

const ITEM_WIDTH = 150;
const REEL_LENGTH = 50;
const CENTER_INDEX = Math.floor(REEL_LENGTH / 2);
const SPIN_DURATION = 4000;

const caseImages: { [key: string]: any } = {
 // Knife image
 "50x": require("../assets/Cases/Knife.png"),
 "25x": require("../assets/Cases/AWP1.png"),
 "10x": require("../assets/Cases/AK_R.png"),
 "3x": require("../assets/Cases/Dessu.png"),
 "1x": require("../assets/Cases/RK.png"),
 "0x": require("../assets/Cases/Feather.png"),
  "Background": require("../assets/Cases/Case BG1.png"),
  "Case": require("../assets/Cases/Ceissi.png"),
}

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
    if (random < 0.4575) return 'x0';  // Grey (45.75%)
    if (random < 0.9375) return 'x1';  // Blue (47%)
    if (random < 0.9875) return 'x3';  // Violet (5%)
    if (random < 0.9925) return 'x10'; // Pink (1.5%)
    if (random < 0.9975) return 'x25'; // Red (0.5%)
    return 'x50';  // Gold (0.25%)
};
  
  const getPayoutMultiplier = (result: string) => {
    switch (result) {
      case 'x0': return 0;   // Grey (45.75%) - No payout
      case 'x1': return 1;   // Blue (47%) - Payout x1
      case 'x3': return 3;   // Violet (5%) - Payout x3
      case 'x10': return 10;  // Pink (1.5%) - Payout x10
      case 'x25': return 25;  // Red (0.5%) - Payout x25
      case 'x50': return 50;  // Gold (0.25%) - Payout x50
      default: return 1;    // Default case
    }
  };  //RTP 102%
  
  /*const getRandomResult = () => {
    const random = Math.random();
    if (random < 0.455) return 'x0';  // Grey (45.5%)
    if (random < 0.805) return 'x1';  // Blue (35%)
    if (random < 0.905) return 'x5';  // Violet (10%)
    if (random < 0.955) return 'x10'; // Pink (5%)
    if (random < 0.97) return 'x25';  // Red (1.5%)
    return 'x50';  // Gold (0.5%)
  };
  
  const getPayoutMultiplier = (result: string) => {
    switch (result) {
      case 'x0': return 0;   // Grey (45.5%) - No payout
      case 'x1': return 1;   // Blue (35%) - Payout x1
      case 'x5': return 5;   // Violet (10%) - Payout x5
      case 'x10': return 10;  // Pink (5%) - Payout x10
      case 'x25': return 25;  // Red (1.5%) - Payout x25
      case 'x50': return 50;  // Gold (0.5%) - Payout x50
      default: return 1;    // Default case
    }
  };*/

  const openCaseAndSpin = () => {
    if (isRolling || tokenCount < betAmount) return;

    setTokenCount((prev) => prev - betAmount); // Deduct bet
    setIsRolling(true);
    setResultNumber(null);
    setWinAmount(null); // Reset win amount before each spin
    const newReelData = generateReel();
    setReelData(newReelData);

    setTimeout(() => {
        const selectedResult = getRandomResult();
        const resultIndex = newReelData.lastIndexOf(selectedResult);
        const targetOffset = -Math.abs((resultIndex - CENTER_INDEX) * ITEM_WIDTH) + ITEM_WIDTH / 2;

        // Ensure the reel starts from a visible position
       // reelAnim.setValue(0);
         reelAnim.setValue(ITEM_WIDTH * 2);

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

    setFirstVisit(false); // After opening the case, set firstVisit to false
}; 

  const generateReel = () => {
    return Array.from({ length: REEL_LENGTH }, () => getRandomResult());
  };

  const getBoxColor = (value: string) => {
    switch (value) {
      case 'x0': return '#BDC3C7';  // Grey
      case 'x1': return '#3498db';  // Blue
      case 'x3': return '#9B59B6';  // Violet
      case 'x10': return '#FF00BF';  // Pink
      case 'x25': return '#F44336';  // Red
      case 'x50': return;  // Golden
      default: return '#3498db';   // Default blue
    }
  };

  return (
    <ImageBackground source={caseImages["Background"]} style={styles.background}>
    <View style={styles.container}>
      <View style={styles.tokenContainer}>
        <Text style={styles.tokenText}>Coins: {tokenCount.toFixed(2)}</Text>
      </View>

      {/* You Win Text */}
      {winAmount !== null && winAmount > 0 && (
      <Text style={[styles.winText, { position: 'absolute', bottom: 120 }]}>
        {`Win: ${winAmount}`}
      </Text>
    )}

      {/* If it's the first visit, show the black box with a question mark */}
      {firstVisit ? (
        <View style={styles.CaseBox}>
           <Image source={caseImages['Case']} style={styles.image} />
        </View>
      ) : (
        <View style={styles.reelWrapper}>
          <Animated.View style={[styles.reel, { transform: [{ translateX: reelAnim }] }]}>
            {reelData.map((value, index) => (
             <View
             style={[styles.box, { backgroundColor: getBoxColor(value) }]}
             key={index}
           >
             {value === 'x50' ? (
               <Image source={caseImages['50x']} style={styles.image} />
               ) : value === 'x25' ? (
                <Image source={caseImages['25x']} style={styles.image} />
              ) : value === 'x10' ? (
                <Image source={caseImages['10x']} style={styles.image} />
              ) : value === 'x3' ? (
                <Image source={caseImages['3x']} style={styles.image} />
              ) : value === 'x1' ? (
                <Image source={caseImages['1x']} style={styles.image} />
              ) : value === 'x0' ? (
              <Image source={caseImages['0x']} style={styles.image} />
            ) : (
               <Text style={styles.boxText}>{value}</Text>
             )}
           </View>
            ))}
          </Animated.View>
        </View>
      )}

{!firstVisit && <View style={styles.verticalLine} />}
      <View style={styles.rContainer}>
      <Text style={styles.resultText}>
        {resultNumber ? `Result: ${resultNumber}` : isRolling ? 'Rolling...' : 'Press to Open'}
      </Text>

      <TouchableOpacity 
          onPress={openCaseAndSpin} 
          style={[styles.caseBox, { backgroundColor: isRolling ? '#7f8c8d' : '#3498db' }]} 
          disabled={isRolling}
        >
          <Text style={styles.caseText}>Open Case</Text>
      </TouchableOpacity>

      <View style={styles.betControls}>
        <TouchableOpacity
          onPress={() => setBetAmount((prev) => Math.max(1, prev - 1))}
          style={[
            styles.betButton,
            isRolling && styles.betButtonDisabled
          ]}
          disabled={isRolling}
        >
          <Text style={styles.betText}>-</Text>
        </TouchableOpacity>

      <Text style={styles.betAmount}>Bet: {betAmount}</Text>

        <TouchableOpacity
          onPress={() => setBetAmount((prev) => prev + 1)}
          style={[
            styles.betButton,
            isRolling && styles.betButtonDisabled
          ]}
          disabled={isRolling}
        >
          <Text style={styles.betText}>+</Text>
        </TouchableOpacity>
      </View>
</View>    
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover", 
  },
  rContainer:{
alignItems: 'center',
justifyContent: 'center',
position: 'absolute',
top: '52.5%',
  },
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
    color: '#fff',
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
    marginBottom: 187.5,
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
    borderRadius: 10,
  },
  boxText: {
    fontSize: 24,
    color: '#fff', // White text color for numbers
    fontWeight: 'bold',
  },
  verticalLine: {
    position: 'absolute',
    top: '22%',
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
    color: '#fff',
  },
  winText: {
    fontSize: 20,
    color: '#0FFF50', // Green text to indicate winning
    fontWeight: 'bold',
    top: 90,
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
  betButtonDisabled: {
    backgroundColor: '#7f8c8d', // Greyed out color
  },
  betText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  betAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  questionMarkBox: {
    width: 150,
    height: 150,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 187.5,
  },
  questionMark: {
    fontSize: 60,
    color: 'white',
    fontWeight: 'bold',
  },
  image: {
    width: 150,  // Adjust size as needed
    height: 150,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  CaseBox: {
    marginBottom: 187.5, 
  },
});

export default Case;

