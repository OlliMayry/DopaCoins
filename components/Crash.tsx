import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CrashProps {
  tokenCount: number;
  setTokenCount: React.Dispatch<React.SetStateAction<number>>;
}

// Helper function to generate crash multiplier
const generateCrashMultiplier = () => {
  const r = Math.random();
  if (r < 0.4025) {
    // 0-0.99x: 40.25% chance
    return Math.random() * 0.99;
  } else if (r < 0.7775) {
    // 1-2.99x: 37.5% chance
    return 1 + Math.random() * (2.99 - 1);
  } else if (r < 0.8675) {
    // 3-6.99x: 9% chance
    return 3 + Math.random() * (6.99 - 3);
  } else if (r < 0.9275) {
    // 7-9.99x: 6% chance
    return 7 + Math.random() * (9.99 - 7);
  } else if (r < 0.9575) {
    // 10-17.499x: 3% chance
    return 10 + Math.random() * (17.499 - 10);
  } else if (r < 0.9775) {
    // 17.5-24.99x: 2% chance
    return 17.5 + Math.random() * (24.99 - 17.5);
  } else if (r < 0.995) {
    // 25-32.499x: 1.75% chance
    return 25 + Math.random() * (32.499 - 25);
  } else if (r < 0.9975) {
    // 32.5-49.99x: 0.75% chance
    return 32.5 + Math.random() * (49.99 - 32.5);
  } else {
    // 50-100x: 0.25% chance
    return 50 + Math.random() * (100 - 50);
  }
};  // RTP 374.28%

const Crash: React.FC<CrashProps> = ({ tokenCount, setTokenCount }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [multiplier, setMultiplier] = useState(0);
  const [betAmount, setBetAmount] = useState(1);
  const [cashOutAmount, setCashOutAmount] = useState<number | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [crashMultiplier, setCrashMultiplier] = useState<number | null>(null);
  const [cashOutMultiplier, setCashOutMultiplier] = useState<number | null>(null);


  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setMultiplier((prev) => {
          const nextMultiplier = prev + Math.random() * 0.1;
          if (crashMultiplier !== null && nextMultiplier >= crashMultiplier) {
            clearInterval(timer);
            crash(nextMultiplier);
          }
          return nextMultiplier;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isPlaying, crashMultiplier]);

  const startGame = () => {
    if (isRolling || tokenCount < betAmount) return;
    setTokenCount((prev) => prev - betAmount);
    setIsRolling(true);
    setIsPlaying(true);
    setMultiplier(0);
    setResultMessage(null);
    setCashOutAmount(null);
    // Use our helper to set the crash multiplier based on the probability distribution
    setCrashMultiplier(generateCrashMultiplier());
  };

  const crash = (finalMultiplier: number) => {
    setIsRolling(false);
    setIsPlaying(false);
    setResultMessage(`Crashed At x${finalMultiplier.toFixed(2)}`);
  };

  const cashOut = () => {
    if (isRolling && multiplier > 0) {
      setIsRolling(false);
      const earned = betAmount * multiplier;
      setCashOutAmount(Math.round(earned * 100) / 100);
      setTokenCount((prev) => prev + earned);
      setCashOutMultiplier(multiplier);  // Save the multiplier at the time of cashout
      //setResultMessage(`Cashed Out At x${multiplier.toFixed(2)}`);
    }
  };

  const handleBetAmountChange = (amount: number) => {
    setBetAmount((prev) => Math.max(1, prev + amount));
  };

  return (
    <View style={styles.container}>
      <View style={styles.tokenContainer}>
        <Text style={styles.tokenText}>Coins: {tokenCount.toFixed(2)}</Text>
      </View>

      <Text style={styles.maxMultiplierText}>Max Win 100x</Text>

      {isPlaying ? (
        <Text style={styles.rollingText}>Rolling...</Text>
      ) : (
        <Text style={styles.crashText}>{resultMessage || ''}</Text>
      )}

      <Text style={styles.multiplierText}>Multiplier: x{multiplier.toFixed(2)}</Text>

      <TouchableOpacity
        onPress={startGame}
        style={[styles.startButton, isPlaying ? styles.disabledButton : {}]}
        disabled={isPlaying}
      >
        <Text style={styles.buttonText}>Start Game</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={cashOut}
        style={[styles.cashOutButton, isRolling ? styles.rollingButton : styles.disabledButton]}
        disabled={!isRolling}
      >
        <Text style={styles.buttonText}>Cash Out</Text>
      </TouchableOpacity>

      <View style={styles.resultContainer}>
        <Text style={styles.cashOutText}>
          {cashOutAmount !== null ? `Cashed Out: ${cashOutAmount.toFixed(2)} (x${cashOutMultiplier?.toFixed(2)})` : ''}
        </Text>
      </View>

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
  rollingText: {
    fontSize: 20,
    color: '#f39c12',
    fontWeight: 'bold',
    minHeight: 25,
  },
  crashText: {
    fontSize: 20,
    color: 'red',
    fontWeight: 'bold',
  },
  multiplierText: {
    fontSize: 20,
    marginVertical: 20,
  },
  startButton: {
    width: 200,
    height: 50,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  rollingButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  cashOutButton: {
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  resultContainer: {
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  cashOutText: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 5,
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
  maxMultiplierText: {
    fontSize: 16,
    color: '#333', 
    fontWeight: 'bold',
    //marginTop: 10,
    marginBottom: 20,
  }
});

export default Crash;
