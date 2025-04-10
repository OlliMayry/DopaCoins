import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';

interface RouletteBetProps {
    isVisible: boolean;
    onClose: () => void;
    onPlaceBet: (betType: string, amount: number) => void;
    onClearBet: () => void;
    selectedBet: string | null; // Accepts the bet option (number, color, range, or dozen)
    betAmount: number;           // Accept bet amount
}

const RouletteBet: React.FC<RouletteBetProps> = ({ isVisible, onClose, onPlaceBet, onClearBet }) => {
    // We'll use separate state for each type of bet option.
    const [selectedNumber, setSelectedNumber] = useState<string>(''); // For a specific number bet
    const [selectedColorBet, setSelectedColorBet] = useState<string>(''); // For red or black
    const [selectedRangeBet, setSelectedRangeBet] = useState<string>('');   // For 1-18 or 19-36
    const [selectedDozenBet, setSelectedDozenBet] = useState<string>('');   // For 1st12, 2nd12, 3rd12
    const [betAmount, setBetAmount] = useState('');

    const handlePlaceBet = () => {
        const amount = parseInt(betAmount, 10);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert("Invalid Bet", "Please input a valid bet amount (1 or greater).");
            return;
        }

        // Determine which bet type is active:
        if (selectedColorBet) {
            onPlaceBet(selectedColorBet, amount);
        } else if (selectedNumber) {
            onPlaceBet(selectedNumber, amount);
        } else if (selectedRangeBet) {
            onPlaceBet(selectedRangeBet, amount);
        } else if (selectedDozenBet) {
            onPlaceBet(selectedDozenBet, amount);
        } else {
            Alert.alert("No Bet Selected", "Please select a bet type (number, color, range, or dozen).");
            return;
        }
        onClose();
    };

    const handleClearBet = () => {
        setSelectedNumber('');
        setSelectedColorBet('');
        setSelectedRangeBet('');
        setSelectedDozenBet('');
        setBetAmount('');
        onClearBet();
    };

    const numbers = Array.from({ length: 37 }, (_, i) => i.toString());

    // Function to determine the color of the number
    const getColorForNumber = (num: number) => {
        const redNumbers = [32, 19, 21, 25, 34, 27, 36, 30, 23, 5, 16, 1, 14, 9, 18, 7, 12, 3];
        const blackNumbers = [15, 4, 2, 17, 6, 13, 11, 8, 10, 24, 33, 20, 31, 22, 29, 28, 35, 26];
        if (num === 0) {
            return 'green';
        } else if (redNumbers.includes(num)) {
            return 'red';
        } else if (blackNumbers.includes(num)) {
            return 'black';
        }
        return '';
    };

    const handleNumberSelect = (num: string) => {
        if (selectedNumber === num) {
            setSelectedNumber('');
        } else {
            setSelectedNumber(num);
            // Clear other selections
            setSelectedColorBet('');
            setSelectedRangeBet('');
            setSelectedDozenBet('');
        }
    };

    const handleColorSelect = (color: string) => {
        if (selectedColorBet === color) {
            setSelectedColorBet('');
        } else {
            setSelectedColorBet(color);
            // Clear other selections
            setSelectedNumber('');
            setSelectedRangeBet('');
            setSelectedDozenBet('');
        }
    };

    const handleRangeSelect = (range: string) => {
        if (selectedRangeBet === range) {
            setSelectedRangeBet('');
        } else {
            setSelectedRangeBet(range);
            // Clear others
            setSelectedNumber('');
            setSelectedColorBet('');
            setSelectedDozenBet('');
        }
    };

    const handleDozenSelect = (dozen: string) => {
        if (selectedDozenBet === dozen) {
            setSelectedDozenBet('');
        } else {
            setSelectedDozenBet(dozen);
            // Clear others
            setSelectedNumber('');
            setSelectedColorBet('');
            setSelectedRangeBet('');
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
                                        backgroundColor: selectedNumber === num
                                            ? getColorForNumber(parseInt(num)) === 'red'
                                                ? '#D32F2F'
                                                : getColorForNumber(parseInt(num)) === 'black'
                                                    ? '#212121'
                                                    : getColorForNumber(parseInt(num)) === 'green'
                                                        ? '#388E3C'
                                                        : '#D3D3D3'
                                            : getColorForNumber(parseInt(num)) === 'red'
                                                ? '#FFCDD2'
                                                : getColorForNumber(parseInt(num)) === 'black'
                                                    ? '#BDBDBD'
                                                    : getColorForNumber(parseInt(num)) === 'green'
                                                        ? '#A5D6A7'
                                                        : '#D3D3D3',
                                        borderColor: selectedNumber === num ? 'darkblue' : '#ccc',
                                    },
                                ]}
                                onPress={() => handleNumberSelect(num)}
                            >
                                <Text style={{ color: '#fff' }}>{num}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Color Bet Options: Red and Black */}
                    <View style={styles.colorBetContainer}>
                        <TouchableOpacity
                            style={[
                                styles.colorBetButton,
                                {
                                    backgroundColor: selectedColorBet === 'red' ? '#D32F2F' : '#FFCDD2',
                                    borderColor: selectedColorBet === 'red' ? '#D32F2F' : '#FFCDD2',
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
                                    backgroundColor: selectedColorBet === 'black' ? '#212121' : '#BDBDBD',
                                    borderColor: selectedColorBet === 'black' ? '#212121' : '#BDBDBD',
                                },
                            ]}
                            onPress={() => handleColorSelect('black')}
                        >
                            <Text style={styles.colorBetText}>Black</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Range Bet Options: 1-18 and 19-36 */}
                    <View style={styles.rangeBetContainer}>
                        <TouchableOpacity
                            style={[
                                styles.rangeBetButton,
                                {
                                    backgroundColor: selectedRangeBet === '1-18' ? '#FFA000' : '#FFE082',
                                },
                            ]}
                            onPress={() => handleRangeSelect('1-18')}
                        >
                            <Text style={styles.colorBetText}>1-18</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.rangeBetButton,
                                {
                                    backgroundColor: selectedRangeBet === '19-36' ? '#FFA000' : '#FFE082',
                                },
                            ]}
                            onPress={() => handleRangeSelect('19-36')}
                        >
                            <Text style={styles.colorBetText}>19-36</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Dozen Bet Options: 1st12, 2nd12, 3rd12 */}
                    <View style={styles.dozenBetContainer}>
                        <TouchableOpacity
                            style={[
                                styles.dozenBetButton,
                                {
                                    backgroundColor: selectedDozenBet === '1st12' ? '#FFA000' : '#FFE082',
                                },
                            ]}
                            onPress={() => handleDozenSelect('1st12')}
                        >
                            <Text style={styles.dozenBetText}>1st12</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.dozenBetButton,
                                {
                                    backgroundColor: selectedDozenBet === '2nd12' ? '#FFA000' : '#FFE082',
                                },
                            ]}
                            onPress={() => handleDozenSelect('2nd12')}
                        >
                            <Text style={styles.dozenBetText}>2nd12</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.dozenBetButton,
                                {
                                    backgroundColor: selectedDozenBet === '3rd12' ? '#FFA000' : '#FFE082',
                                },
                            ]}
                            onPress={() => handleDozenSelect('3rd12')}
                        >
                            <Text style={styles.dozenBetText}>3rd12</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bet Amount Input */}
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Bet Amount"
                        keyboardType="numeric"
                        value={betAmount}
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
    rangeBetContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    rangeBetButton: {
        padding: 10,
        borderRadius: 5,
        borderWidth: 2,
        width: 80,
        marginHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dozenBetContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    dozenBetButton: {
        padding: 10,
        borderRadius: 5,
        borderWidth: 2,
        width: 70,
        marginHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dozenBetText: {
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
