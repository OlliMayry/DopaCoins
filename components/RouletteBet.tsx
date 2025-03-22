import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';

interface RouletteBetProps {
    isVisible: boolean;
    onClose: () => void;
    onPlaceBet: (betType: string, amount: number) => void;
    onClearBet: () => void;
}

const RouletteBet: React.FC<RouletteBetProps> = ({ isVisible, onClose, onPlaceBet, onClearBet }) => {
    const [selectedBet, setSelectedBet] = useState<string>(''); // Initial bet is empty (no selection)
    const [selectedColorBet, setSelectedColorBet] = useState<string>(''); // Track selected color (Red or Black)
    const [betAmount, setBetAmount] = useState('');

    const handlePlaceBet = () => {
        const amount = parseInt(betAmount, 10);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert("Invalid Bet", "Please input a valid bet amount (1 or greater).");
            return;
        }

        if (selectedColorBet) {
            onPlaceBet(selectedColorBet, amount); // Place the color bet (Red or Black)
        } else if (selectedBet) {
            onPlaceBet(selectedBet, amount); // Place the number bet (including '0')
        } else {
            Alert.alert("No Bet Selected", "Please select a bet type (number or color).");
            return;
        }

        onClose();
    };

    const handleClearBet = () => {
        setSelectedBet(''); // Clear selected number
        setSelectedColorBet(''); // Clear selected color
        setBetAmount('');
        onClearBet();
    };

    const numbers = Array.from({ length: 37 }, (_, i) => i.toString());

    // Function to determine the color of the number
    const getColorForNumber = (num: number) => {
        const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

        if (num === 0) {
            return 'green'; // Green for '0'
        } else if (redNumbers.includes(num)) {
            return 'red';
        } else if (blackNumbers.includes(num)) {
            return 'black';
        }
        return ''; // Default case
    };

    const handleNumberSelect = (num: string) => {
        if (selectedBet === num) {
            setSelectedBet(''); // Unselect the current number
        } else {
            setSelectedBet(num); // Select the new number
            setSelectedColorBet(''); // Unselect the color bet if a number is selected
        }
    };

    const handleColorSelect = (color: string) => {
        if (selectedColorBet === color) {
            setSelectedColorBet(''); // Unselect the color if already selected
        } else {
            setSelectedColorBet(color); // Select the new color
            setSelectedBet(''); // Unselect the number if a color is selected
        }
    };

    return (
        <Modal transparent={true} visible={isVisible} animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Place Your Bet</Text>

                    {/* Number Picker */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.numberPicker}>
                        {numbers.map((num) => (
                            <TouchableOpacity
                                key={num}
                                style={[
                                    styles.numberButton,
                                    {
                                        backgroundColor: selectedBet === num
                                            ? getColorForNumber(parseInt(num)) === 'red'
                                                ? '#D32F2F' // Darker Red for selected
                                                : getColorForNumber(parseInt(num)) === 'black'
                                                ? '#212121' // Darker Black for selected
                                                : getColorForNumber(parseInt(num)) === 'green'
                                                ? '#388E3C' // Darker Green for selected
                                                : '#D3D3D3' // Default light color
                                            : getColorForNumber(parseInt(num)) === 'red'
                                            ? '#FFCDD2' // Lighter Red for unselected
                                            : getColorForNumber(parseInt(num)) === 'black'
                                            ? '#BDBDBD' // Lighter Black for unselected
                                            : getColorForNumber(parseInt(num)) === 'green'
                                            ? '#A5D6A7' // Lighter Green for unselected
                                            : '#D3D3D3', // Light grey for unselected
                                        borderColor: selectedBet === num ? 'darkblue' : '#ccc', // Light border when unselected
                                    },
                                ]}
                                onPress={() => handleNumberSelect(num)}
                            >
                                <Text style={{ color: '#fff' }}>
                                    {num === '0' ? '0' : num} {/* Display '0' properly */}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Color Bet Options: Red and Black */}
                    <View style={styles.colorBetContainer}>
                        <TouchableOpacity
                            style={[
                                styles.colorBetButton,
                                {
                                    backgroundColor: selectedColorBet === 'red' ? '#D32F2F' : '#FFCDD2', // Darker red if selected, lighter if not
                                    borderColor: selectedColorBet === 'red' ? '#D32F2F' : '#FFCDD2', // Match the border to the background
                                },
                            ]}
                            onPress={() => handleColorSelect('red')}
                        >
                            <Text style={styles.colorBetText}>Red</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.colorBetButton,
                                {
                                    backgroundColor: selectedColorBet === 'black' ? '#212121' : '#BDBDBD', // Darker black if selected, lighter if not
                                    borderColor: selectedColorBet === 'black' ? '#212121' : '#BDBDBD', // Match the border to the background
                                },
                            ]}
                            onPress={() => handleColorSelect('black')}
                        >
                            <Text style={styles.colorBetText}>Black</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bet Amount Input */}
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Bet Amount"
                        keyboardType="numeric"
                        onChangeText={(text) => setBetAmount(text)}
                    />

                    {/* Place Bet Button */}
                    <TouchableOpacity style={styles.placeBetButton} onPress={handlePlaceBet}>
                        <Text style={styles.placeBetButtonText}>Place Bet</Text>
                    </TouchableOpacity>

                    {/* Clear Bet Button */}
                    <TouchableOpacity style={styles.clearBetButton} onPress={handleClearBet}>
                        <Text style={styles.clearBetButtonText}>Clear Bet</Text>
                    </TouchableOpacity>

                    {/* Close Modal Button */}
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
    numberPicker: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    numberButton: {
        padding: 15,
        marginHorizontal: 5,
        borderRadius: 5,
        borderWidth: 2,
    },
    colorBetContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    colorBetButton: {
        padding: 10,
        borderRadius: 5,
        borderWidth: 2,
        width: 80,
        marginHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorBetText: {
        color: 'white',
        fontWeight: 'bold',
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

export default RouletteBet;
