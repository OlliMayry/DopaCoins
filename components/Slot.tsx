import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, Easing, ImageBackground, Alert } from 'react-native';
import DoubleModal from '../components/DoubleModal';
import BonusModal from '../components/BonusModal';  

interface SlotProps {
  tokenCount: number;
  setTokenCount: React.Dispatch<React.SetStateAction<number>>;
}

const slotImages: { [key: string]: any } = {
  "Camel": require("../assets/Slot/FCAMEL.png"),
  "Donkey": require("../assets/Slot/FDONKEY.png"),
  "Tuctuc": require("../assets/Slot/FTUCTUC.png"),
  "PA": require("../assets/Slot/FPA.png"),
  "MB": require("../assets/Slot/FMC.png"),
  "Car": require("../assets/Slot/F44D.png"),
  "RA": require("../assets/Slot/FRA.png"),
  "Wild": require("../assets/Slot/FWILD.png"),
  "Bonus": require("../assets/Slot/FONUS.png"),
  "Background": require("../assets/Slot/BG.png"),
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
const [doubleLost, setDoubleLost] = useState(false);
const [bonusModalVisible, setBonusModalVisible] = useState(false);
const [spinningReelsState, setSpinningReelsState] = useState<string[][]>([]);
const [hasBonus, setHasBonus] = useState(false);
const [bonusStake, setBonusStake] = useState<number>(0);
const isDisabled = hasBonus || isSpinning || pendingWin !== null;
const bonusFlashAnim = useRef(new Animated.Value(1)).current;

  const slotSymbols = ['Camel', 'Donkey', 'Tuctuc', 'PA', 'MB', 'Car', 'RA', 'Wild', 'Bonus'];

const symbolWeights: { [key: string]: number } = {
  'Camel': 26, //26
  'Donkey': 22, //22
  'Tuctuc': 17, //17
  'PA': 15, //15
  'MB': 13, //13
  'Car': 9, //9
  'RA':6, //6
  'Wild': 6, //6
  'Bonus': 6, //6
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
      for (let j = 0; j < 40; j++) {  // 30 symbols per reel
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

     setDoubleLost(false);
  
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
  setSpinningReelsState(spinningReels);
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

 // Viiveellä avattava BonusModal
  const visibleGrid = [
    spinningReels[0][1], spinningReels[1][1], spinningReels[2][1],
    spinningReels[0][2], spinningReels[1][2], spinningReels[2][2],
    spinningReels[0][3], spinningReels[1][3], spinningReels[2][3],
  ];
const bonusCount = visibleGrid.filter(s => s === 'Bonus').length;
if (bonusCount >= 3 && !bonusModalVisible) {
  setHasBonus(true);

  // 💡 Laske bonusStake: betAmount + mahdollinen voitto
  const bonusBase = betAmount*2 + (pendingWin ?? 0);
  setBonusStake(bonusBase);

  setTimeout(() => {
    setBonusModalVisible(true);
  }, 1500);
}
      setIsSpinning(false);
    });
  };

  const checkWin = (...rows: string[][]) => {
    const multipliers: { [key: string]: number } = {
  'Camel': 3,
  'Donkey': 4,
  'Tuctuc': 6,
  'PA': 9,
  'MB': 14,
  'Car': 18,
  'RA':50,
  'Wild': 50,
  'Bonus': 0,
};
  

    let totalWin = 0;
    let winningPositions: Array<[number, number]> = [];
    const checkRow = (row: string[], positions: Array<[number, number]>, lineName: string, ) => {
     const nonWildSymbols = row.filter(s => s !== 'Wild');
    const baseSymbol = nonWildSymbols.length > 0 ? nonWildSymbols[0] : 'Wild';

    const isWinningRow = row.every(s => s === baseSymbol || s === 'Wild');

    if (isWinningRow) {
      const winMultiplier = multipliers[baseSymbol] || 1;
      const win = betAmount * winMultiplier;
      totalWin += win;
      winningPositions.push(...positions);
      console.log(`Voitto linjasta: ${lineName}, symboli: ${baseSymbol}, voitto: ${win}`);
    }
  };

  
     checkRow(rows[0], [[0, 1], [1, 1], [2, 1]], 'ylärivi'); // Upper row
    checkRow(rows[1], [[0, 2], [1, 2], [2, 2]],'keskirivi' ); // Mid row
    checkRow(rows[2], [[0, 3], [1, 3], [2, 3]], 'Alarivi'); // Lower row 
    checkRow(rows[3], [[0, 1], [1, 2], [2, 3]],'Diagonaali ↘'); // Diagonal ↘
    checkRow(rows[4], [[0, 3], [1, 2], [2, 1]],'Diagonaali ↙'); // Diagonal ↙
  
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
              setFlashingRow(null);
            }, 2000);
          }, [isFlashing]);

useEffect(() => {
  let timeoutId = null;

  if (winAmount !== null && hasBonus) {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bonusFlashAnim, {
          toValue: 0.2,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(bonusFlashAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();

    timeoutId = setTimeout(() => {
      bonusFlashAnim.stopAnimation(() => {
        bonusFlashAnim.setValue(1);
      });
    }, 2000);
  } else {
    bonusFlashAnim.setValue(1);
  }

  return () => {
    if (timeoutId) clearTimeout(timeoutId);
    bonusFlashAnim.stopAnimation();
  };
}, [winAmount, hasBonus]);

const handleBonusComplete = (won: number) => {
 if (won > 0) {
  const combinedWin = (pendingWin ?? 0) + won;
  setPendingWin(combinedWin);
  setWinAmount(combinedWin);
} else {
  setWinAmount(pendingWin ?? 0); // Pidetään aiempi voitto näkyvissä jos bonus ei tuottanut
}
  setBonusModalVisible(false);
  setHasBonus(false);
};

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
                  outputRange: [-1000, 1400],
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
    <Animated.View
        key={rowIndex}
        style={[
          styles.reelSymbolContainer,
          isFlashingSymbol && {
            opacity: flashAnim,
            transform: [{ scale: flashAnim }],
          },
        ]}
      >

      <Image
        source={slotImages[symbol]}
        style={[
          styles.reelImage,
          // isFlashingSymbol && { tintColor: 'yellow' }, valinnainen korostus
        ]}
        resizeMode="contain"
      />
    </Animated.View>
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
    <ImageBackground
  source={slotImages["Background"]}
  style={styles.background}
  imageStyle={styles.backgroundImage} // 🔑
>
    <View style={styles.container}>
      
<View style={styles.tokenContainer}>
        <Text style={styles.tokenLabel}>Coins</Text>
        <Text style={styles.tokenText}>{tokenCount.toFixed(2)}</Text>
      </View>

       <View style={styles.reelsContainer}> 
        {renderReels()}
         {/* {renderWinLines()} */}
      </View>

 <TouchableOpacity
 onPress={() => {
  const bonusPrice = betAmount * 50;

  if (tokenCount >= bonusPrice) {
    Alert.alert(
      "Confirm Purchase",
      `Bonus costs ${bonusPrice} coins. Are you sure?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => {
            setTokenCount(prev => prev - bonusPrice);
            setBonusStake(betAmount);
            setBonusModalVisible(true);
            setHasBonus(true);
          }
        }
      ]
    );
  } else {
    Alert.alert("Not enough coins", `You need ${bonusPrice} coins to buy a bonus.`);
  }
}}
 disabled={isDisabled}
style={[
  styles.bonusButton,
  {
    backgroundColor: isDisabled ? '#bdc3c7' : '#800080',
    marginTop: 10,
  },
]}
>
  <Text style={styles.bonusButtonText}>
    Buy Bonus {'\n'} {'   '} ${betAmount * 50}
  </Text>
</TouchableOpacity>

<BonusModal
  visible={bonusModalVisible}
  onClose={() => {
    setBonusModalVisible(false);
    setHasBonus(false); // palautetaan
  }}
  bonusStake={bonusStake}
  pendingWin={pendingWin ?? 0}
  onComplete={handleBonusComplete}
/>

<View style={styles.controlsContainer}> 
      <TouchableOpacity
        onPress={spin}
        style={[styles.spinButton, { backgroundColor: hasBonus || isSpinning ? '#BDC3C7' : '#3498db' },
        ]}
        disabled={hasBonus || isSpinning}
      >
        <Text style={styles.spinButtonText}>
          {pendingWin !== null ? 'Collect' : 'Spin'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
  onPress={() => setDoubleModalVisible(true)} 
style={[
    styles.spinButton,
    {
      backgroundColor:
        hasBonus || pendingWin === null ? '#bdc3c7' : '#e67e22',
      marginTop: 10,
    },
  ]}
  disabled={hasBonus || pendingWin === null}
>
  <Text style={styles.spinButtonText}>Double</Text>
</TouchableOpacity>


<DoubleModal
  visible={doubleModalVisible}
  startingAmount={pendingWin ?? 0}
  onClose={() => setDoubleModalVisible(false)}
onCollect={(finalAmount) => {
  if (finalAmount > 0) {
    setTokenCount((prev) => prev + finalAmount);
    setWinAmount(finalAmount);      // Päivitetään näkyville voitto
    setDoubleLost(false);           // Jos oli aiemmin häviö, palautetaan tila
  } else {
    setDoubleLost(true);
    setWinAmount(0);                // Näytetään "Try Again" tai "Double Lost"
  }
  setPendingWin(null);             // Nollaa pending win
  setDoubleModalVisible(false);    // Sulje modal (jos haluat tässä)
}}
/>

      <View style={styles.betControls}>
      <TouchableOpacity
          onPress={() => setBetAmount((prev) => Math.max(1, prev - 1))}
          style={[
    styles.betButton,
    isDisabled && {
      backgroundColor: '#BDC3C7',
    },
  ]}
  disabled={isDisabled}
>
          <Text style={styles.betText}>-</Text>
        </TouchableOpacity>

        <Text style={styles.betAmount}>Bet: {betAmount}</Text>

        <TouchableOpacity
          onPress={() => setBetAmount((prev) => prev + 1)}
         style={[
    styles.betButton,
    isDisabled && {
      backgroundColor: '#BDC3C7',
    },
  ]}
  disabled={isDisabled}
>
          <Text style={styles.betText}>+</Text>
        </TouchableOpacity>
      </View>

      </View>

{winAmount !== null && (
  hasBonus ? (
    <Animated.Text style={[styles.winText, { opacity: bonusFlashAnim, zIndex: 2 }]}>
      Bonus!
    </Animated.Text>
  ) : (
    <Text style={[styles.winText, { zIndex: 2 }]}>
      {doubleLost
        ? 'Double Lost!'
        : winAmount > 0
        ? `Win: ${winAmount.toFixed(2)}`
        : 'Try Again!'}
    </Text>
  )
)}
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
backgroundImage: {
  resizeMode: 'cover',
  position: 'absolute',
  bottom: 10,
  width: '100%',
  height: '100%',
},
background: {
  flex: 1,
  justifyContent: 'flex-end', // Tämä vaikuttaa sisältöön (ei kuvaan)
},
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  //  backgroundColor: '#f4f4f4',
   backgroundColor: 'transparent',  // ✅
  },
  reelImage: {
    width: 80, // Adjust the width as needed
    height: 80, // Adjust the height as needed
   // marginVertical: 5,
   // marginHorizontal: 20,,
  // paddingVertical: 35,
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
  reelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    padding: 5,
    backgroundColor: '#fff',
    overflow: 'hidden', //Tämä estää symbolien näkymisen rullien ulkopuolella
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
    width: 60,
    height: 200, // Increased height for more space
    //paddingHorizontal: 10,
    marginHorizontal: 7.5,
  },
  reelSymbol: {
    fontSize: 60,
    textAlign: 'center',
  },
  flashingSymbol: {
    color: 'yellow', // Bright color
    fontWeight: 'bold',
    fontSize: 80, // Increase size for emphasis
    textShadowColor: 'rgba(255, 165, 0, 1)', // Stronger contrast (orange glow)
    textShadowOffset: { width: 4, height: 4 }, // More offset for shadow
    textShadowRadius: 20, // Bigger glow effect
    transform: [{ scale: 1.1 }], // Slightly enlarge the symbol
  },
  spinButton: {
    width: 120,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  spinButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  bonusButton: {
    width: 100,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 7.5,
    //marginTop: 10,
    marginBottom: 5,
    position: 'absolute',
    top: 10,
    left: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
   bonusButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  controlsContainer: {
    padding: 5,
    paddingHorizontal: 10,
    borderWidth: 2,
    paddingBottom:10,
    borderColor: '#fff',
    borderRadius: 10,
    backgroundColor: '#1f1e1e',
    alignItems: 'center',
    marginTop: 10,
  },
  betControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  betButton: {
    width: 40,
    height: 40,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  winText: {
    fontSize: 20,
    color: '#0FFF50',
    fontWeight: 'bold',
    position: 'absolute',
    top: 85,
    textAlign: 'center',
    width: '100%',
  },
  reelSymbolContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60, // Varmistetaan, että kaikki symbolit ovat samassa koossa
    height: 60,
   // top:20,
  // paddingVertical: 40,
  marginVertical:10,
  },
});

export default Slot;



