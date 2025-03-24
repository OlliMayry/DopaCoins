import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Alert } from 'react-native';
import RouletteBet from './RouletteBet';

interface RouletteProps {
    tokenCount: number;
    setTokenCount: React.Dispatch<React.SetStateAction<number>>;
}

const Roulette: React.FC<RouletteProps> = ({ tokenCount, setTokenCount }) => {
    const [betModalVisible, setBetModalVisible] = useState(false);
    const [selectedBet, setSelectedBet] = useState<string | null>(null);
    const [betAmount, setBetAmount] = useState(0);
    const [winningNumber, setWinningNumber] = useState<number | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winAmount, setWinAmount] = useState(0);
    const [wheelColor, setWheelColor] = useState<string>('grey'); // State to track wheel color
    
    const spinValue = useRef(new Animated.Value(0)).current;

    const handlePlaceBet = (betType: string, amount: number) => {
        setSelectedBet(betType);
        setBetAmount(amount);
        console.log(`Placed bet on ${betType} with amount ${amount}`);
    };

    const handleClearBet = () => {
        setSelectedBet(null);
        setBetAmount(0);
    };

    const getColorForNumber = (number: number) => {
        const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
    
        if (number === 0) {
            return 'green';
        } else if (redNumbers.includes(number)) {
            return 'red';
        } else if (blackNumbers.includes(number)) {
            return 'black';
        }
    
        return '';
    };

    const spinRoulette = () => {
        if (!selectedBet || isSpinning || tokenCount < betAmount) {
            Alert.alert('Alert', 'Please place a valid bet before spinning.');
            return;
        }
    
        setIsSpinning(true);
        setTokenCount(prev => prev - betAmount);
        setWinningNumber(null);
        setWinAmount(0); // Hide the win amount
        setWheelColor('grey'); // Reset wheel color to grey before spin
    
        Animated.timing(spinValue, {
            toValue: 1,
            duration: 3000, // Increased duration by 1000ms (1 second)
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
        }).start(() => {
            const result = Math.floor(Math.random() * 37); // Roulette has 0-36
            setWinningNumber(result);
    
            const winningColor = getColorForNumber(result);
            setWheelColor(winningColor); // Set the wheel color based on the result
            
            let payoutMultiplier = 0;
            if (selectedBet === result.toString()) {
                payoutMultiplier = 35; // Straight-up bet
            } else if (selectedBet?.toLowerCase() === 'red' && winningColor === 'red') {
                payoutMultiplier = 2; // Red bet
            } else if (selectedBet?.toLowerCase() === 'black' && winningColor === 'black') {
                payoutMultiplier = 2; // Black bet
            }
    
            let currentWinAmount = betAmount * payoutMultiplier;
            setTokenCount(prev => prev + currentWinAmount);
            setWinAmount(currentWinAmount);
            setIsSpinning(false);
            spinValue.setValue(0);
        });
    };
    
    return (
        <View style={styles.container}>
            <Animated.View style={[styles.wheel, { 
                transform: [{ rotate: spinValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '1440deg'] // Spins 4 full rotations instead of 1
                }) }], 
                backgroundColor: wheelColor // Dynamic background color based on spin result
            }]} >
                <Text style={styles.wheelText}>{winningNumber !== null ? winningNumber : '?'}</Text>
            </Animated.View>

            <View style={styles.tokenContainer}>
                <Text style={styles.tokenText}>{`Coins: ${tokenCount}`}</Text>
            </View>

            <TouchableOpacity onPress={spinRoulette} style={[styles.button, !selectedBet && styles.disabledButton]}>
                <Text style={styles.buttonText}>Spin</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setBetModalVisible(true)} style={styles.button}>
                <Text style={styles.buttonText}>Bet</Text>
            </TouchableOpacity>

            <RouletteBet
                isVisible={betModalVisible}
                onClose={() => setBetModalVisible(false)}
                onPlaceBet={handlePlaceBet}
                onClearBet={handleClearBet}
            />

            {selectedBet !== null && (
                <Text style={styles.betText}>{`Current Bet: ${betAmount} on ${selectedBet}`}</Text>
            )}
            
            {/* Add absolute positioning for outcome texts */}
            {winningNumber !== null && (
                <Text style={[styles.resultText, { color: getColorForNumber(winningNumber), position: 'absolute', top: '60%' }]}>
                    {`Winning Number: ${winningNumber}`}
                </Text>
            )}
            
            {winAmount > 0 && (
                <Text style={[styles.winText, { position: 'absolute', top: '70%' }]}>
                    {`You won: ${winAmount} coins!`}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative', // Ensure absolute positioning works within this container
    },
    wheel: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'grey', // Initial grey color
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    wheelText: {
        fontSize: 24,
        color: '#fff',
    },
    button: {
        padding: 10,
        backgroundColor: '#3498db',
        borderRadius: 5,
        marginTop: 15,
    },
    buttonText: {
        color: '#fff',
    },
    tokenContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    tokenText: {
        fontSize: 16,
    },
    betText: {
        fontSize: 16,
        marginTop: 10,
    },
    resultText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 110,
    },
    winText: {
        fontSize: 18,
        color: '#4CAF50',
        fontWeight: 'bold',
        marginTop: 70,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
});

export default Roulette;

