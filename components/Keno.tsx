import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Animated, Dimensions } from 'react-native';

interface KenoProps {
  tokenCount: number;
  setTokenCount: React.Dispatch<React.SetStateAction<number>>;
}

const generateKenoDraw = () => {
  const draw: number[] = [];
  while (draw.length < 5) {
    const num = Math.floor(Math.random() * 20) + 1;
    if (!draw.includes(num)) {
      draw.push(num);
    }
  }
  return draw;
};

const Keno: React.FC<KenoProps> = ({ tokenCount, setTokenCount }) => {
  const [betAmount, setBetAmount] = useState(1);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawNumbers, setDrawNumbers] = useState<number[]>([]);
  const [hitNumbers, setHitNumbers] = useState<number[]>([]);
  const [wonAmount, setWonAmount] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [animatedBalls, setAnimatedBalls] = useState<{ num: number, anim: Animated.Value }[]>([]);
  const [flyingBalls, setFlyingBalls] = useState<any[]>([]);
  const gridRefs = useRef<Record<number, View>>({});
  const ballIdRef = useRef(0);


  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      // Unselecting a number -> Clear hits and misses
      setSelectedNumbers(prev => prev.filter(n => n !== num));
      setDrawNumbers([]);
      setHitNumbers([]);
    } else {
      if (selectedNumbers.length < 5) {
        setSelectedNumbers(prev => {
          const newSelection = [...prev, num];
  
           // Clear hits/misses EVERY time a number is selected
        setDrawNumbers([]);
        setHitNumbers([]);

          return newSelection;
        });
      }
    }
  };

  const startGame = async () => {
    if (tokenCount < betAmount || selectedNumbers.length < 2) return;
  
    setTokenCount(prev => prev - betAmount);
    setIsDrawing(true);
    setDrawNumbers([]);
    setHitNumbers([]);
    setWonAmount(null);
  
    const newDrawNumbers = generateKenoDraw();
    const revealed: number[] = [];
  
    for (let i = 0; i < newDrawNumbers.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600)); // Reveal delay
      revealed.push(newDrawNumbers[i]);
      setDrawNumbers([...revealed]);
  
      const hitsSoFar = selectedNumbers.filter(num => revealed.includes(num));
      setHitNumbers(hitsSoFar);
    
       // 💥 Fire cannonball if this number is a hit
    if (selectedNumbers.includes(newDrawNumbers[i])) {
      fireCannonAt(newDrawNumbers[i]);
    }
  }
  
    const finalHits = selectedNumbers.filter(num => newDrawNumbers.includes(num));
    setHitNumbers(finalHits);
    calculateWinnings(finalHits.length);
    setIsDrawing(false);
  };

  const calculateWinnings = (hitCount: number) => {
    const winTable: Record<number, number[]> = {
      2: [0, 1, 5],
      3: [0, 0, 3, 20],
      4: [0, 0, 1, 10, 30],
      5: [0, 0, 1, 4, 10, 80]
    };
    const winnings = winTable[selectedNumbers.length]?.[hitCount] ?? 0;
    setWonAmount(winnings * betAmount);
    setTokenCount(prev => prev + winnings * betAmount);
  };

  const handleBetAmountChange = (amount: number) => {
    setBetAmount(prev => Math.max(1, prev + amount));
  };
  const payoutTable: Record<number, { hits: number; win: string }[]> = {
    2: [
      { hits: 2, win: "5x" },
      { hits: 1, win: "1x" },
    ],
    3: [
      { hits: 3, win: "20x" },
      { hits: 2, win: "3x" },
    ],
    4: [
      { hits: 4, win: "30x" },
      { hits: 3, win: "10x" },
      { hits: 2, win: "1x" },
    ],
    5: [
      { hits: 5, win: "80x" },
      { hits: 4, win: "10x" },
      { hits: 3, win: "4x" },
      { hits: 2, win: "1x" },
    ],
  }; 
  const clearBoard = () => {
    setSelectedNumbers([]);
    setDrawNumbers([]);
    setHitNumbers([]);
  };
  const fireCannonAt = (targetNum: number) => {
    const ref = gridRefs.current[targetNum];
    if (!ref) return;
  
    ref.measureInWindow((x, y, width, height) => {
      const startX = Dimensions.get('window').width / 2 - 10;
      const startY = Dimensions.get('window').height - 50;
  
      const translateX = new Animated.Value(startX);
      const translateY = new Animated.Value(startY);
      const id = ballIdRef.current++;
  
      setFlyingBalls(prev => [...prev, { id, translateX, translateY }]);
  
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: x + width / 2 - 10,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: y + height / 2 - 10,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Remove after impact
        setFlyingBalls(prev => prev.filter(ball => ball.id !== id));
      });
    });
  };


  return (
    <View style={styles.container}>
      <View style={styles.tokenContainer}>
        <Text style={styles.tokenText}>Coins: {tokenCount.toFixed(2)}</Text>
      </View>

      <Text style={styles.title}>Select 2-5 numbers</Text>

 <View style={styles.gameContainer}>
 {flyingBalls.map((ball) => (
  <Animated.View
    key={ball.id}
    style={{
      position: 'absolute',
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: 'black',
      transform: [
        { translateX: ball.translateX },
        { translateY: ball.translateY }
      ],
      zIndex: 999,  // Increase the zIndex significantly
      // Adding debug border color to ensure visibility of the flying balls
      borderWidth: 2,
      borderColor: 'black',
    }}
  />
))}
  {/* Number Grid Section */}
  <FlatList
  data={Array.from({ length: 20 }, (_, i) => i + 1)}
  numColumns={4}
  renderItem={({ item }) => (
    <View
      ref={ref => {
        if (ref) {
          gridRefs.current[item] = ref;
        }
      }}
    >
      <TouchableOpacity
        style={[
          styles.numberButton,
          selectedNumbers.includes(item) ? styles.selected : {},
          drawNumbers.includes(item) && hitNumbers.includes(item) ? styles.hit :
          drawNumbers.includes(item) ? styles.missed : {}
        ]}
        onPress={() => !isDrawing && toggleNumber(item)}
        disabled={isDrawing}
      >
        <Text style={styles.numberText}>{item}</Text>
      </TouchableOpacity>
    </View>
  )}
  keyExtractor={(item) => item.toString()}
/>


{/* Payout Table on the Right */}
<View style={styles.payoutTable}>
    <Text style={styles.tableHeader}>Hits | Win</Text>
    {selectedNumbers.length >= 2 && payoutTable[selectedNumbers.length]?.map((row, index) => (
      <Text key={index} style={styles.tableRow}>{row.hits} | {row.win}</Text>
    ))}
  </View>
  </View>

  <View style={styles.resultContainer}>
        {wonAmount !== null && wonAmount > 0 ? (
          <Text style={styles.wonText}>{`Win: ${wonAmount.toFixed(2)}`}</Text>
        ) : null}
      </View>

   {/*    <View style={styles.controls}>   */}
      <TouchableOpacity
        onPress={startGame}
        style={[styles.startButton, selectedNumbers.length < 2 || isDrawing ? styles.disabledButton : {}]}
        disabled={selectedNumbers.length < 2 || isDrawing}
      >
        <Text style={styles.buttonText}>{isDrawing ? 'Drawing...' : 'Start Game'}</Text>
      </TouchableOpacity>

      {/* Clear Button */}
      <TouchableOpacity
        onPress={clearBoard}
        style={[styles.clearButton, isDrawing || selectedNumbers.length === 0 ? styles.disabledButton : styles.clearActiveButton]}
        disabled={isDrawing || selectedNumbers.length === 0}
      >
        <Text style={styles.buttonText}>Clear</Text>
      </TouchableOpacity>

      <View style={styles.betControls}>
        <TouchableOpacity onPress={() => handleBetAmountChange(-1)} style={styles.betButton}>
          <Text style={styles.betText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.betAmount}>Bet: {betAmount}</Text>
        <TouchableOpacity onPress={() => handleBetAmountChange(1)} style={styles.betButton}>
          <Text style={styles.betText}>+</Text>
        </TouchableOpacity>
      </View>
      </View>
  /*   </View> */
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
  title: {
    fontSize: 20,
    marginTop: 100, // Reduced the margin to move the title closer to the buttons
    marginBottom: 5,
  },
  numberButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3498db',
    borderRadius: 5,
    margin: 5,
  },
  selected: {
    backgroundColor: '#f39c12',
  },
  numberText: {
    fontSize: 18,
    color: '#fff',
  },
  startButton: {
    width: 200,
    height: 50,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 5,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7', // Grey out button
  },
  clearButton: {
    width: 75,
    height: 40,
    backgroundColor: '#e74c3c', // Red background when clickable
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  clearActiveButton: {
    backgroundColor: '#e74c3c', // Red background when clickable
  },
  checkButton: {
    width: 200,
    height: 50,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  resultContainer: {
    minHeight: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10, // Adjusted for the gap between result and bet controls
    marginBottom: 10,
  },
  resultText: {
    fontSize: 20,
    color: '#f39c12',
    fontWeight: 'bold',
  },
  wonText: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
   // marginBottom: 10,
  },
  betControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 80,
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
  hit: { 
    backgroundColor: '#2ecc71' 
  },
  missed: {
    backgroundColor: '#e74c3c', // Orange for missed draw numbers
  },
  gameContainer: {
    flexDirection: 'row', // Align game grid and payout table horizontally
    alignItems: 'flex-start', // Prevent pushing other UI elements
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
    marginLeft: 145,  // Adjust this value to shift the container to the left
    overflow: 'visible', 
   // top: 35,
  },
  payoutTable: {
    width: 80, // Fixed width
    minHeight: 100, // Prevent shrinking
    backgroundColor: "#ecf0f1",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 5,  // Space from grid
    flexShrink: 0, // Prevent resizing
    marginRight: 75,
  },
  tableHeader: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  tableRow: {
    fontSize: 14,
    marginBottom: 3,
  },  
 /*  controls: {
bottom: 30,
  }, */
});

export default Keno;
