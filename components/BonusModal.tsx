import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';


const bonusImages: { [key: string]: any } = {
  "Siwa": require("../assets/Slot/Siwa.png"),
}


type BonusModalProps = {
  visible: boolean;
  onClose: () => void;
  pendingWin: number;
  bonusStake: number;
  onComplete: (totalWin: number) => void;
};


type OptionType = 'bust' | 'win' | 'return';


type OptionInfo = {
  type: OptionType;
  multiplier: number;
};


const OPTIONS: OptionInfo[] = [
  { type: 'bust', multiplier: 0 },
  { type: 'win', multiplier: 4 },
  { type: 'return', multiplier: 2 },
];


const BonusModal: React.FC<BonusModalProps> = ({
  visible,
  onClose,
  pendingWin,
  bonusStake,
  onComplete,
}) => {
  const [step, setStep] = useState(0);
 // const [currentOptions, setCurrentOptions] = useState<OptionType[]>([]);
  const [currentOptions, setCurrentOptions] = useState<OptionInfo[]>([]);
  const [totalWin, setTotalWin] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const MAX_STEPS = 6;


  useEffect(() => {
    if (visible) {
      startNewStep();
      setTotalWin(bonusStake);
      setStep(0);
      setSelectedIndex(null);
    }
  }, [visible, bonusStake]);


 
  const shuffle = (array: OptionInfo[]): OptionInfo[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };


  const startNewStep = () => {
    const options = shuffle(OPTIONS);
    setCurrentOptions(options);
    setSelectedIndex(null);
  };


  const handlePick = (index: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(index);
    const selected = currentOptions[index];


    setTimeout(() => {
      if (selected.type === 'bust') {
        onComplete(totalWin);
        onClose();
      } else {
        const updated = totalWin * selected.multiplier;
        setTotalWin(updated);
        nextStepOrFinish(updated);
      }
    }, 1200);
  };


  const nextStepOrFinish = (updatedTotalWin: number) => {
    if (step + 1 < MAX_STEPS) {
      setStep((prev) => prev + 1);
      startNewStep();
    } else {
      onComplete(updatedTotalWin);
      setTimeout(() => onClose(), 200);
    }
  };


  const renderOptionLabel = (option: OptionInfo, revealed: boolean) => {
    if (!revealed) return <Text style={styles.optionText}>?</Text>;


    let emoji = '';
    switch (option.type) {
      case 'bust': emoji = '🧨'; break;
      case 'win': emoji = '🪙'; break;
      case 'return': emoji = '🔄'; break;
    }


    return (
      <>
        <Text style={styles.optionEmoji}>{emoji}</Text>
        <Text style={styles.optionMultiplier}>{option.multiplier}x</Text>
      </>
    );
  };


  return (
     
    <Modal visible={visible} transparent animationType="fade">
     
      <View style={styles.overlay}>
        <ImageBackground
        source={bonusImages["Siwa"]}
        style={styles.background}
        imageStyle={{ borderRadius: 16 }} // Tämä pehmentää reunat taustakuvalta
      >
        <View style={styles.modal}>
          <Text style={styles.title}>Bonus Game – Stop {step + 1} / {MAX_STEPS}</Text>
          <Text style={styles.subtitle}>Choose one of the three options</Text>


          <View style={styles.optionsRow}>
            {currentOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedIndex === index && styles.selectedOption,
                ]}
                disabled={selectedIndex !== null}
                onPress={() => handlePick(index)}
              >
                <Text style={styles.optionText}>
                  {renderOptionLabel(option, selectedIndex !== null)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>


          <Text style={styles.statusText}>Total Win: {totalWin} 💰</Text>
         
         </View>
         </ImageBackground>
      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({
background: {
width: '100%',
  borderRadius: 16,
   overflow: 'hidden', // tärkeä, että borderRadius toimii taustakuvan kanssa
   justifyContent: 'center', alignItems: 'center',
   borderWidth: 2,
   borderColor: '#fff',
},
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center'
  },
  modal: {
   // backgroundColor: '#fff',
     padding: 20, borderRadius: 16, width: '85%', alignItems: 'center',
  },
  title: {
    fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#fff',
  },
  subtitle: {
    fontSize: 16, marginBottom: 20, color: '#fff',
  },
  optionsRow: {
    flexDirection: 'row', justifyContent: 'center', width: '100%'
  },
  optionButton: {
  backgroundColor: '#800080',
  marginHorizontal: 10,
  borderRadius: 10,
  width: 80, // Kiinteä leveys
  height: 80, // Kiinteä korkeus
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
   borderColor: '#fff',
},
optionText: {
  fontSize: 32, // Riittävän suuri emojille
  color: '#fff',
  textAlign: 'center',
  lineHeight: 34,
},
 optionEmoji: {
    fontSize: 32,
    textAlign: 'center',
    color: '#fff',
  },
   optionMultiplier: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
  },
  selectedOption: {
    backgroundColor: '#95a5a6'
  },
  statusText: {
    fontSize: 16, marginTop: 20, color: '#fff'
  }
});


export default BonusModal;