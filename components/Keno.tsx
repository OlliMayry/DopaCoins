import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Animated, Dimensions, ImageBackground, Image } from 'react-native';

interface KenoProps {
  tokenCount: number;
  setTokenCount: React.Dispatch<React.SetStateAction<number>>;
}

const kenoImages: { [key: string]: any } = {
  // Background image
  "Background": require("../assets/Keno/BGG.png"),
 // Cannon
 "Cannon": require("../assets/Keno/Cannon.png"),
};

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
  const [flyingBalls, setFlyingBalls] = useState<any[]>([]);
  const gridRefs = useRef<Record<number, View>>({});
  const ballIdRef = useRef(0);
  const titleOpacity = useRef(new Animated.Value(1)).current;
  const startButtonRef = useRef<View>(null)
  const tableRef = useRef<View>(null);

  const toggleNumber = (num: number) => {
    setWonAmount(null); 
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
      // 💥 Fire cannonball 
      fireCannonAt(newDrawNumbers[i]);
      await new Promise(resolve => setTimeout(resolve, 600)); // Reveal delay
      revealed.push(newDrawNumbers[i]);
      setDrawNumbers([...revealed]);
  
      const hitsSoFar = selectedNumbers.filter(num => revealed.includes(num));
      setHitNumbers(hitsSoFar);
    
       
       // fireCannonAt(newDrawNumbers[i]);
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
    setWonAmount(null); 
    setSelectedNumbers([]);
    setDrawNumbers([]);
    setHitNumbers([]);
  };
  const fireCannonAt = (targetNum: number) => {
    const targetRef = gridRefs.current[targetNum];
    const table = tableRef.current;
    if (!targetRef || !table) return;
  
    // 1) mittaa napin sijainti
    table.measureInWindow((sx, sy, sWidth, sHeight) => {
      const startX = sx + sWidth / 2 - 80 ; 
      const startY = sy + sHeight / 2 - 120;
     // console.log("Start:", startX, startY);
  
      // 2) mittaa kohdenumeron sijainti
      targetRef.measureInWindow((tx, ty, tw, th) => {
        const endX = tx + tw / 2 - 75;
        const endY = ty + th / 2 - 187.5;
       // console.log("End:", endX, endY);
  
        const translateX = new Animated.Value(startX);
        const translateY = new Animated.Value(startY);
        const id = ballIdRef.current++;
  
        setFlyingBalls(prev => [...prev, { id, translateX, translateY }]);
  
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: endX,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: endY,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setFlyingBalls(prev => prev.filter(ball => ball.id !== id));
        });
      });
    });
  };

  useEffect(() => {
    if (selectedNumbers.length >= 2) {
      Animated.timing(titleOpacity, {
        toValue: 0,
        duration: 500, // 0.5 sekunnin häivytys
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedNumbers.length]);

  return (
    <ImageBackground source={kenoImages["Background"]} style={styles.background}>
    <View style={styles.container}>
      <View style={styles.tokenContainer}>
        <Text style={styles.tokenText}>Coins: {tokenCount.toFixed(2)}</Text>
      </View>
      <View style={styles.resultContainer}>
        {wonAmount !== null && wonAmount > 0 ? (
          <Text style={styles.wonText}>{`Win: ${wonAmount.toFixed(2)}`}</Text>
        ) : null}
      </View>

      <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
        Select 2-5 numbers
      </Animated.Text>

      <View style={styles.gameContainer}>
        <View ref={tableRef} style={styles.poyta}>
        {flyingBalls.map((ball) => (
          <Animated.View
            key={ball.id}
            style={{
              position: 'absolute',
              left: 0,         // ➞ Lisää nämä
              top: 0,          // ➞ Lisää nämä
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
        </View>

        {/* Payout Table on the Right */}
        <View style={styles.payoutTable}>
          <Text style={styles.tableHeader}>Hits | Win</Text>
          {selectedNumbers.length >= 2 && payoutTable[selectedNumbers.length]?.map((row, index) => (
            <Text key={index} style={styles.tableRow}>{row.hits} | {row.win}</Text>
          ))}
        </View>
      </View>

      {/* Clear Button */}
      <TouchableOpacity
        onPress={clearBoard}
        style={[styles.clearButton, isDrawing || selectedNumbers.length === 0 ? styles.disabledButton : styles.clearActiveButton]}
        disabled={isDrawing || selectedNumbers.length === 0}
      >
        <Text style={styles.buttonText}>Clear</Text>
      </TouchableOpacity>

      <TouchableOpacity
        ref={tableRef}
        onPress={startGame}
        style={[styles.startButton, selectedNumbers.length < 2 || isDrawing ? styles.disabledButton : {}]}
        disabled={selectedNumbers.length < 2 || isDrawing}
      >
        <Text style={styles.buttonText}>{isDrawing ? 'Drawing...' : 'Start'}</Text>
      </TouchableOpacity>

      <View style={styles.Cannon}>
                     <Image source={kenoImages['Cannon']} style={styles.image} />
          </View>

      <View style={styles.betControls}>
        <TouchableOpacity
            onPress={() => setBetAmount((prev) => Math.max(1, prev - 1))}
            style={[styles.betButton, isDrawing && { backgroundColor: '#BDC3C7' }]} // Grey out when spinning
            disabled={isDrawing} // Disable while spinning
          >
            <Text style={styles.betText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.betAmount}>Bet: {betAmount}</Text>

          <TouchableOpacity
            onPress={() => setBetAmount((prev) => prev + 1)}
            style={[styles.betButton, isDrawing && { backgroundColor: '#BDC3C7' }]} // Grey out when spinning
            disabled={isDrawing} // Disable while spinning
          >
            <Text style={styles.betText}>+</Text>
          </TouchableOpacity>
      </View>
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: '#141d33', 
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
  title: {
    fontSize: 20,
   // marginTop: 100,  Reduced the margin to move the title closer to the buttons
    marginBottom: 20,
    position: 'absolute',
    top: 50,
    color: '#fff',
    fontWeight: 'bold',
  },
  numberButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3498db',//'#059CA7',
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
    width: 125,
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#dfe5ed',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7', // Grey out button
  },
  clearButton: {
    width: 80,
    height: 40,
    backgroundColor: '#e74c3c', // Red background when clickable
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 2.5,
    top: 275,
    borderRadius: 10,
    marginTop: 10,
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
   position: 'relative',
   top: 20, // Adjusted to position the result container above the bet controls
   marginTop: 20,
    marginBottom: 20,
  },
  wonText: {
    fontSize: 20,
    color: '#0FFF50',
    fontWeight: 'bold',
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
    color: '#fff',
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
  },
  poyta: { 
    //marginRight: 5,  Space from grid
    borderColor: '#dfe5ed',
    borderWidth: 3,
    borderRadius: 10,
    backgroundColor: "#262626",
    padding: 2.5,
  },
  payoutTable: {
    width: 80, // Fixed width
    minHeight: 100, // Prevent shrinking
    backgroundColor: "#262626", //#bdc3c7
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 5,  // Space from grid
    flexShrink: 0, // Prevent resizing
    marginRight: 85,
    marginTop: 5,
   // right: 2.5,
  },
  tableHeader: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#ffffff",
  },
  tableRow: {
    fontSize: 14,
    marginBottom: 3,
    color: "#ffffff",
  },
  Cannon: {
    width: 'auto',
    height: 80,
    alignItems: "center",
  justifyContent: "center", // keskittää kuvan pystysuunnassa
 // marginLeft: 10,  väli oikealle
 //borderWidth: 1,
 //borderColor: '#bdc3c7',
 //borderRadius: 10,
 paddingHorizontal: 10,
 //backgroundColor: 'rgba(16, 0, 105, 0.61)', // Musta tausta
  },
  image:{
    width: 50,
    height: 68,
  },
  background: {
    flex: 1,
    resizeMode: "cover", 
  },
});

export default Keno;
