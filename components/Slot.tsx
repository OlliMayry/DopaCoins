import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, Easing } from 'react-native';
import DoubleModal from '../components/DoubleModal'; 

interface SlotProps {
  tokenCount: number;
  setTokenCount: React.Dispatch<React.SetStateAction<number>>;
}

const slotImages: { [key: string]: any } = {
  "Camel": require("../assets/Slot/Camel.png"),
  "Donkey": require("../assets/Slot/Donkey.png"),
 }

const Slot: React.FC<SlotProps> = ({ tokenCount, setTokenCount }) => {
  const [betAmount, setBetAmount] = useState(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<string[][]>([[], [], []]); // Three reels (columns)
  const [winAmount, setWinAmount] = useState<number | null>(null);
  const [flashingRow, setFlashingRow] = useState<Array<[number, number]> | null>(null);
const [isFlashing, setIsFlashing] = useState(false);
const [pendingWin, setPendingWin] = useState<number | null>(null);
const [isDoubleMode, setIsDoubleMode] = useState(false);
const [doubleModalVisible, setDoubleModalVisible] = useState(false);

  // Symbols for the slot machine
  const slotSymbols = ['🍒', '🍋', '🍊', '🍉', '🍇', '🍀', '⭐', '7️⃣'];

  const symbolWeights: { [key: string]: number } = {
    '🍒': 30, // Common
    '🍋': 25,
    '🍊': 20,
    '🍉': 15,
    '🍇': 7,
    '🍀': 5,
    '⭐': 2,
    '7️⃣': 1, // Very rare
  };
  
  const weightedSymbols = Object.entries(symbolWeights).flatMap(([symbol, weight]) =>
    Array(weight).fill(symbol)
  );
  
  const getRandomSymbol = () => {
    const randomIndex = Math.floor(Math.random() * weightedSymbols.length);
    return weightedSymbols[randomIndex];
  };

  // Generate random symbols for each reel (6 symbols per reel)
  const generateReels = () => {
    const newReels: string[][] = [[], [], []];
    for (let i = 0; i < 3; i++) {
      newReels[i] = [];
      for (let j = 0; j < 30; j++) {  // 30 symbols per reel
        newReels[i].push(getRandomSymbol());
      }
    }
    return newReels;
  };

  // Reels animation using Animated.Value
  const reelAnims = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
            // Flashing effect logic
            const flashAnim = useRef(new Animated.Value(1)).current; // Start at full opacity

  // Function to handle the spin
  const spin = () => {
    if (isSpinning) return;
  
    // Jos voitto odottaa, lisää se saldoon
    if (pendingWin !== null) {
      setTokenCount(prev => prev + pendingWin);
      setPendingWin(null);
      setIsDoubleMode(false);
      setWinAmount(null);
      return;
    }
  
    if (tokenCount < betAmount) return;
  
    setTokenCount(prev => prev - betAmount);
    setIsSpinning(true);
    setWinAmount(null);
    setFlashingRow(null);
    setIsFlashing(false);
    flashAnim.setValue(1);
  
    const spinningReels = generateReels();
    setReels(spinningReels);
    reelAnims.forEach(anim => anim.setValue(0));
  
    Animated.stagger(500, reelAnims.map(anim =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true
      })
    )).start(() => {
      const row1 = [spinningReels[0][1], spinningReels[1][1], spinningReels[2][1]];
      const row2 = [spinningReels[0][2], spinningReels[1][2], spinningReels[2][2]];
      const row3 = [spinningReels[0][3], spinningReels[1][3], spinningReels[2][3]];
      const row4 = [spinningReels[0][1], spinningReels[1][2], spinningReels[2][3]];
      const row5 = [spinningReels[0][3], spinningReels[1][2], spinningReels[2][1]];
  
      checkWin(row1, row2, row3, row4, row5);
      setIsSpinning(false);
    });
  };

  const checkWin = (...rows: string[][]) => {
    const multipliers: { [key: string]: number } = {
      '🍒': 3,
      '🍋': 4,
      '🍊': 6,
      '🍉': 9,
      '🍇': 14,
      '🍀': 18,
      '⭐': 30,
      '7️⃣': 60,
    };
  
    let totalWin = 0;
    let winningPositions: Array<[number, number]> = [];
  
    const checkRow = (row: string[], positions: Array<[number, number]>) => {
      if (row[0] === row[1] && row[1] === row[2]) {
        const win = betAmount * (multipliers[row[0]] || 1);
        totalWin += win;
        winningPositions.push(...positions);
      }
    };
  
    checkRow(rows[0], [[0, 1], [1, 1], [2, 1]]); // Middle row
    checkRow(rows[1], [[0, 2], [1, 2], [2, 2]]); // Bottom row
    checkRow(rows[2], [[0, 3], [1, 3], [2, 3]]); // Lower row
    checkRow(rows[3], [[0, 1], [1, 2], [2, 3]]); // Diagonal ↘
    checkRow(rows[4], [[0, 3], [1, 2], [2, 1]]); // Diagonal ↙
  
    if (totalWin > 0) {
      setWinAmount(totalWin);
      setPendingWin(totalWin);
      setIsDoubleMode(true); // aktivoi double-mahdollisuus
      setFlashingRow(winningPositions);
      setIsFlashing(true);
    } else {
      setWinAmount(0);
      setFlashingRow(null);
      setPendingWin(null);
      setIsDoubleMode(false);
    }
  };

          useEffect(() => {
            if (!isFlashing) return;
         
            Animated.loop(
              Animated.sequence([
                Animated.timing(flashAnim, {
                  toValue: 0.2, // Dim effect
                  duration: 200,
                  useNativeDriver: true,
                }),
                Animated.timing(flashAnim, {
                  toValue: 1, // Full brightness
                  duration: 200,
                  useNativeDriver: true,
                }),
              ])
            ).start();
         
            setTimeout(() => {
              flashAnim.setValue(1); // Reset after flashing
              setIsFlashing(false);
            }, 2000);
          }, [isFlashing]);

  // Render each reel
  const renderReels = () => {
    return reels.map((reel, colIndex) => (
      <View key={colIndex} style={styles.reel}>
        <Animated.View
          style={{
            transform: [
              {
                translateY: reelAnims[colIndex].interpolate({
                  inputRange: [0, 1],
                  outputRange: [-1000, 1000],
                }),
              },
            ],
          }}
        >
          {reel.map((symbol, rowIndex) => {
            // Tarkistetaan, kuuluuko symboli voittoyhdistelmään
            const isFlashingSymbol = flashingRow?.some(
              ([winCol, winRow]) => winCol === colIndex && winRow === rowIndex
            );
  
            return (
              <Animated.Text
                key={rowIndex}
                style={[
                  styles.reelSymbol,
                  isFlashingSymbol ? styles.flashingSymbol : null,
                  isFlashingSymbol ? { opacity: flashAnim, transform: [{ scale: flashAnim }] } : {}
                ]}
              >
                {symbol}
              </Animated.Text>
            );
          })}
        </Animated.View>
      </View>
    ));
  }; 

  // Initialize reels with random symbols when the component is first loaded
  useEffect(() => {
    setReels(generateReels());
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.tokenContainer}>
        <Text style={styles.tokenText}>Coins: {tokenCount.toFixed(2)}</Text>
      </View>

      <View style={styles.reelsContainer}>
        {renderReels()}
      </View>
    {/*  <View style={styles.rowContainer}> </View>  */}

      <TouchableOpacity
        onPress={spin}
        style={[styles.spinButton, { backgroundColor: isSpinning ? '#BDC3C7' : '#3498db' }]}
        disabled={isSpinning}
      >
        <Text style={styles.spinButtonText}>
          {pendingWin !== null ? 'Collect' : 'Spin'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
  onPress={() => setDoubleModalVisible(true)} // tämä korjattu
  style={[
    styles.spinButton,
    {
      backgroundColor: pendingWin !== null ? '#e67e22' : '#bdc3c7',
      marginTop: 10,
    },
  ]}
  disabled={pendingWin === null}
>
  <Text style={styles.spinButtonText}>Double</Text>
</TouchableOpacity>

<DoubleModal
  visible={doubleModalVisible}
  startingAmount={pendingWin ?? 0}
  onClose={() => setDoubleModalVisible(false)}
  onCollect={(finalAmount) => {
    // Tee mitä haluat loppusummalla:
    if (finalAmount > 0) {
      // lisää pelaajalle rahat
      console.log('Collected winnings:', finalAmount);
    } else {
      console.log('Player lost the double game.');
    }
    setPendingWin(null); // Nollaa voitto
  }}
/>

      <View style={styles.betControls}>
      <TouchableOpacity
          onPress={() => setBetAmount((prev) => Math.max(1, prev - 1))}
          style={[styles.betButton, isSpinning && { backgroundColor: '#BDC3C7' }]} // Grey out when spinning
          disabled={isSpinning || pendingWin !== null } // Disable while spinning or doublin
        >
          <Text style={styles.betText}>-</Text>
        </TouchableOpacity>

        <Text style={styles.betAmount}>Bet: {betAmount}</Text>

        <TouchableOpacity
          onPress={() => setBetAmount((prev) => prev + 1)}
          style={[styles.betButton, isSpinning && { backgroundColor: '#BDC3C7' }]} // Grey out when spinning
          disabled={isSpinning} // Disable while spinning
        >
          <Text style={styles.betText}>+</Text>
        </TouchableOpacity>
      </View>

      {winAmount !== null && (
        <Text style={[styles.winText, { zIndex: 2 }]}>
          {winAmount > 0 ? `You Win: ${winAmount.toFixed(2)}` : 'Try Again!'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  reelImage: {
    width: 60, // Adjust the width as needed
    height: 60, // Adjust the height as needed
    marginVertical: 5,
  },
  tokenContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  tokenText: {
    fontSize: 16,
  },
  reelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    overflow: 'hidden', // Tämä estää symbolien näkymisen rullien ulkopuolella
    width: '80%',
   // marginTop: -60,
   height: 250,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 80,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
  },
  reel: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: 200, // Increased height for more space
  },
  reelSymbol: {
    fontSize: 60,
    textAlign: 'center',
  },
  flashingSymbol: {
    color: 'yellow', // Bright color
    fontWeight: 'bold',
    fontSize: 60, // Increase size for emphasis
    textShadowColor: 'rgba(255, 165, 0, 1)', // Stronger contrast (orange glow)
    textShadowOffset: { width: 4, height: 4 }, // More offset for shadow
    textShadowRadius: 20, // Bigger glow effect
    transform: [{ scale: 1.1 }], // Slightly enlarge the symbol
  },
  spinButton: {
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 5,
  },
  spinButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  betControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
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
  winText: {
    fontSize: 20,
    color: '#27ae60',
    fontWeight: 'bold',
    position: 'absolute',
    top: 70,
    textAlign: 'center',
    width: '100%',
  },
  reelSymbolContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60, // Varmistetaan, että kaikki symbolit ovat samassa koossa
    height: 60,
  },
});

export default Slot;



