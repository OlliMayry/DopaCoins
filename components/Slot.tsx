import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';

interface SlotProps {
  tokenCount: number;
  setTokenCount: React.Dispatch<React.SetStateAction<number>>;
}

const Slot: React.FC<SlotProps> = ({ tokenCount, setTokenCount }) => {
  const [betAmount, setBetAmount] = useState(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<string[][]>([[], [], []]); // Three reels (columns)
  const [winAmount, setWinAmount] = useState<number | null>(null);
  const [flashingRow, setFlashingRow] = useState<Array<[number, number]> | null>(null);
const [isFlashing, setIsFlashing] = useState(false);

  // Symbols for the slot machine
  const slotSymbols = ['🍒', '🍋', '🍊', '🍉', '🍇', '🍀', '⭐', '7️⃣'];

  // Get a random symbol
  const getRandomSymbol = () => slotSymbols[Math.floor(Math.random() * slotSymbols.length)];

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

  // Function to handle the spin
  const spin = () => {
    if (isSpinning || tokenCount < betAmount) return;

    setTokenCount((prev) => prev - betAmount);
    setIsSpinning(true);
    setWinAmount(null);

    // Reset winning animation
    setFlashingRow(null);
    setIsFlashing(false);
    flashAnim.setValue(1); // Reset opacity and scale animation

    // Generate random reels
    const spinningReels = generateReels();
    setReels(spinningReels);

    // Reset the animation value before starting the spin
    reelAnims.forEach(anim => anim.setValue(0));

    // Animate the reels (create a scrolling effect)
    Animated.stagger(500, reelAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000, // Shortened duration for faster spin
        easing: Easing.inOut(Easing.ease), // Smoother easing
        useNativeDriver: true
      })
    )).start(() => {
      // After the animation, set the final result
      // After the animation, set the final result
    const row1 = [spinningReels[0][1], spinningReels[1][1], spinningReels[2][1]];
    const row2 = [spinningReels[0][2], spinningReels[1][2], spinningReels[2][2]];
    const row3 = [spinningReels[0][3], spinningReels[1][3], spinningReels[2][3]];
    const row4 = [spinningReels[0][1], spinningReels[1][2], spinningReels[2][3]];
    const row5 = [spinningReels[0][3], spinningReels[1][2], spinningReels[2][1]];

          // Check if user wins based on any row
          checkWin(row1, row2, row3, row4, row5);

      setIsSpinning(false);
    });
  };

  const checkWin = (...rows: string[][]) => {
    const multipliers: { [key: string]: number } = {
      '🍒': 2, '🍋': 3, '🍊': 5, '🍉': 8, '🍇': 10, '🍀': 12, '⭐': 15, '7️⃣': 20
    };
  
    const checkRow = (row: string[], positions: Array<[number, number]>) => {
      if (row[0] === row[1] && row[1] === row[2]) {
        const win = betAmount * (multipliers[row[0]] || 1);
        setWinAmount(win);
        setTokenCount((prev) => prev + win);
  
        // Tallenna voittosymbolien sijainnit oikein
        setFlashingRow(positions);
        setIsFlashing(true);
        return true;
      }
      return false;
    };
  
    // Tarkista rivit ja tallenna oikeat koordinaatit
    if (checkRow(rows[0], [[0, 1], [1, 1], [2, 1]])) return; // Suora 1
    if (checkRow(rows[1], [[0, 2], [1, 2], [2, 2]])) return; // Suora 2
    if (checkRow(rows[2], [[0, 3], [1, 3], [2, 3]])) return; // Suora 3
    if (checkRow(rows[3], [[0, 1], [1, 2], [2, 3]])) return; // Viisto ↘
    if (checkRow(rows[4], [[0, 3], [1, 2], [2, 1]])) return; // Viisto ↙
  
    setWinAmount(0);
    setFlashingRow(null); // Ei vilkutusta jos ei voittoa
  };
          // Flashing effect logic
          const flashAnim = useRef(new Animated.Value(1)).current; // Start at full opacity

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
        <Text style={styles.spinButtonText}>Spin</Text>
      </TouchableOpacity>

      <View style={styles.betControls}>
        <TouchableOpacity
          onPress={() => setBetAmount((prev) => Math.max(1, prev - 1))}
          style={styles.betButton}
        >
          <Text style={styles.betText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.betAmount}>Bet: {betAmount}</Text>
        <TouchableOpacity
          onPress={() => setBetAmount((prev) => prev + 1)}
          style={styles.betButton}
        >
          <Text style={styles.betText}>+</Text>
        </TouchableOpacity>
      </View>

      {winAmount !== null && (
        <Text style={[styles.winText, { zIndex: 2 }]}>
          {winAmount > 0 ? `You Win: ${winAmount}` : 'Try Again!'}
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
    marginVertical: 20,
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
    fontSize: 70, // Increase size for emphasis
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
    marginTop: 20,
  },
  spinButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
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
  winText: {
    fontSize: 20,
    color: '#27ae60',
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 80,
    textAlign: 'center',
    width: '100%',
  },
});

export default Slot;



