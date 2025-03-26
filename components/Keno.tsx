import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

interface KenoProps {
  tokenCount: number;
  setTokenCount: React.Dispatch<React.SetStateAction<number>>;
}

// Helper function to generate random numbers for Keno draw
const generateKenoDraw = () => {
  const draw: number[] = [];
  while (draw.length < 20) {
    const num = Math.floor(Math.random() * 20) + 1; // Generate a number between 1 and 20
    if (!draw.includes(num)) {
      draw.push(num);
    }
  }
  return draw;
};

const Keno: React.FC<KenoProps> = ({ tokenCount, setTokenCount }) => {
  const [betAmount, setBetAmount] = useState(1);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]); // Numbers selected by the player
  const [drawNumbers, setDrawNumbers] = useState<number[]>([]); // Numbers drawn by Keno
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [wonAmount, setWonAmount] = useState<number | null>(null);

  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(prev => prev.filter(n => n !== num));
    } else {
      if (selectedNumbers.length < 5) {
        setSelectedNumbers(prev => [...prev, num]);
      }
    }
  };

  const startGame = () => {
    if (tokenCount < betAmount || selectedNumbers.length < 2) return;
    setTokenCount(prev => prev - betAmount);
    setDrawNumbers(generateKenoDraw());
    setResultMessage(null);
    setWonAmount(null);
  };

  const checkResult = () => {
    if (selectedNumbers.length === 0) return;

    const matchedNumbers = selectedNumbers.filter((num) => drawNumbers.includes(num));
    const winnings = matchedNumbers.length * 2; // Let's say each match wins 2 tokens

    setWonAmount(winnings);
    setResultMessage(`You matched ${matchedNumbers.length} numbers! You win ${winnings} tokens!`);
    setTokenCount((prev) => prev + winnings); // Add winnings to token count
  };

  const handleBetAmountChange = (amount: number) => {
    setBetAmount((prev) => Math.max(1, prev + amount));
  };

  return (
    <View style={styles.container}>
      <View style={styles.tokenContainer}>
        <Text style={styles.tokenText}>Coins: {tokenCount.toFixed(2)}</Text>
      </View>

      <Text style={styles.title}>Select Your Numbers</Text>

      <FlatList
        data={Array.from({ length: 20 }, (_, i) => i + 1)} // Numbers 1 to 20
        numColumns={4}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.numberButton, selectedNumbers.includes(item) ? styles.selected : {}]}
            onPress={() => toggleNumber(item)}
          >
            <Text style={styles.numberText}>{item}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.toString()}
      />

      <TouchableOpacity
        onPress={startGame}
        style={[styles.startButton, selectedNumbers.length < 2 ? styles.disabledButton : {}]}
        disabled={selectedNumbers.length < 2}
      >
        <Text style={styles.buttonText}>Start Game</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={checkResult} style={styles.checkButton}>
        <Text style={styles.buttonText}>Check Result</Text>
      </TouchableOpacity>

      {resultMessage && <Text style={styles.resultText}>{resultMessage}</Text>}

      <View style={styles.resultContainer}>
        <Text style={styles.wonText}>
          {wonAmount !== null ? `You won: ${wonAmount.toFixed(2)} tokens` : ''}
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
  title: {
    fontSize: 24,
    marginTop: 40, // Reduced the margin to move the title closer to the buttons
    marginBottom: 10,
  },
  numberButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3498db',
    borderRadius: 20,
    margin: 5,
  },
  selected: {
    backgroundColor: '#e74c3c',
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
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7', // Grey out button
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
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20, // Adjusted for the gap between result and bet controls
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
    marginBottom: 5,
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
});

export default Keno;
