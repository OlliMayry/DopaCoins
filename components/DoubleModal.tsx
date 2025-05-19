import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const options = [
  { label: '🍌', multiplier: 2 },
  { label: '🐵', multiplier: 30 },
  { label: '🥥', multiplier: 2 },
];

interface DoubleModalProps {
  visible: boolean;
  startingAmount: number;
  onClose: () => void;
  onCollect: (finalAmount: number) => void;
}

// Palauttaa satunnaisen indeksin painotetun jakauman perusteella
const weightedRandomIndex = (weights: number[]): number => {
  const total = weights.reduce((sum, w) => sum + w, 0);
  const rand = Math.random() * total;
  let cumulative = 0;

  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) return i;
  }
  return weights.length - 1;
};

const DoubleModal: React.FC<DoubleModalProps> = ({
  visible,
  startingAmount,
  onClose,
  onCollect,
}) => {
  const [currentAmount, setCurrentAmount] = useState(startingAmount);
  const [selected, setSelected] = useState<number | null>(null);
  const [winningIndex, setWinningIndex] = useState(weightedRandomIndex([49.5, 1, 49.5]));
  const [isCollectDisabled, setIsCollectDisabled] = useState(false); // Lisää tila collect-painikkeelle
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (visible) {
      setCurrentAmount(startingAmount);
      setSelected(null);
      setIsCollectDisabled(false); // Resetoi collect-painike mahdollisuus
      setWinningIndex(weightedRandomIndex([49, 2, 49]));
    }
  }, [visible, startingAmount]);

const handlePick = (index: number) => {
  if (selected !== null) return;

  setSelected(index);
    setIsProcessing(true);
  const isCorrect = index === winningIndex;

  if (!isCorrect) {
    setIsCollectDisabled(true); // Harmaa "Collect" heti kun häviää

    // Odota 5 sekuntia ennen sulkemista ja 0:n palautusta
    setTimeout(() => {
      onCollect(0);
      onClose();
    }, 1000);

    return;
  }

  // Jos voittaa, päivitä voitto ja resetoi
  setTimeout(() => {
    const multiplier = options[index].multiplier;
    const newAmount = currentAmount * multiplier;
    setCurrentAmount(newAmount);
    setSelected(null);
    setWinningIndex(weightedRandomIndex([49.5, 1, 49.5]));
    setIsProcessing(false); // Nyt voi taas kerätä
  }, 1000);
};

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Current Win: {currentAmount.toFixed(2)}</Text>
          <Text style={styles.subtitle}>Pick one to double!</Text>

          <View style={styles.optionContainer}>
            {options.map((opt, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  selected !== null && index === winningIndex && styles.correct,
                ]}
                onPress={() => handlePick(index)}
                disabled={selected !== null}
              >
                <Text style={styles.emoji}>{opt.label}</Text>
                <Text style={styles.multiplierText}>{opt.multiplier}x</Text>
              </TouchableOpacity>
            ))}
          </View>

            <TouchableOpacity
  style={[
    styles.collectButton,
    (isCollectDisabled || isProcessing) && styles.collectButtonDisabled,
  ]}
          onPress={() => {
    if (!isCollectDisabled && !isProcessing) {
      onCollect(currentAmount);
      onClose();
    }
  }}
  disabled={isCollectDisabled || isProcessing}
>
            <Text style={styles.collectText}>Collect {currentAmount.toFixed(2)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '85%',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  option: {
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#ddd',
  },
  emoji: {
    fontSize: 40,
  },
  correct: {
    backgroundColor: '#2ecc71',
  },
  collectButton: {
    marginTop: 20,
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  collectText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  collectButtonDisabled: {
  backgroundColor: '#bdc3c7', // selkeä harmaa
},
multiplierText: {
  fontSize: 16,
  fontWeight: 'bold',
  textAlign: 'center',
  marginTop: 4,
  color: '#333',
},
});

export default DoubleModal;
