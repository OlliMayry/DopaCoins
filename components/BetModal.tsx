import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';

interface BetModalProps {
    isVisible: boolean;
    onClose: () => void;
    onPlaceBet: (color: 'Blue' | 'Red' | 'Standing', amount: number) => void;
    onClearBet: () => void; // Add this prop
}

const BetModal: React.FC<BetModalProps> = ({ isVisible, onClose, onPlaceBet, onClearBet }) => {
    const [selectedColor, setSelectedColor] = useState<'Blue' | 'Red' | 'Standing'>('Blue');
    const [betAmount, setBetAmount] = useState('');

    const handlePlaceBet = () => {
        const amount = parseInt(betAmount, 10);
        if (isNaN(amount) || amount <= 0) {
            // Display an error message or handle invalid input
            return;
        }

        onPlaceBet(selectedColor, amount); // Pass selected color and amount to onPlaceBet callback
        console.log('Selected Color:', selectedColor);
        onClose();
    };

    const handleClearBet = () => {
        setSelectedColor('Blue'); // Reset to default color or any initial value
        setBetAmount(''); // Clear the bet amount
        onClearBet(); // Notify the parent component to clear the bet
    };

    return (
        <Modal transparent={true} visible={isVisible} animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Place Your Bet</Text>
                    <View style={styles.colorPicker}>
                        <TouchableOpacity
                            style={[styles.colorButton, { backgroundColor: selectedColor === 'Blue' ? '#3498db' : '#fff' }]}
                            onPress={() => setSelectedColor('Blue')}
                        >
                            <Text style={{ color: selectedColor === 'Blue' ? '#fff' : '#3498db' }}>Blue</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.colorButton, { backgroundColor: selectedColor === 'Red' ? '#e74c3c' : '#fff' }]}
                            onPress={() => setSelectedColor('Red')}
                        >
                            <Text style={{ color: selectedColor === 'Red' ? '#fff' : '#e74c3c' }}>Red</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.colorButton, { backgroundColor: selectedColor === 'Standing' ? '#f1c40f' : '#fff' }]}
                            onPress={() => setSelectedColor('Standing')}
                        >
                            <Text style={{ color: selectedColor === 'Standing' ? '#fff' : '#555' }}>Standing</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Bet Amount"
                        keyboardType="numeric"
                        value={betAmount}
                        onChangeText={(text) => setBetAmount(text)}
                    />
                    <TouchableOpacity style={styles.placeBetButton} onPress={handlePlaceBet}>
                        <Text style={styles.placeBetButtonText}>Place Bet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.clearBetButton} onPress={handleClearBet}>
                        <Text style={styles.clearBetButtonText}>Clear Bet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    colorPicker: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    colorButton: {
        padding: 10,
        borderRadius: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    placeBetButton: {
        backgroundColor: '#3498db',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    placeBetButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    clearBetButton: {
        backgroundColor: '#e74c3c',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    clearBetButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    closeButton: {
        marginTop: 10,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#555',
        fontSize: 16,
    },
});

export default BetModal;
