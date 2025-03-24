// home.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

interface HomeProps {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
  tokenCount: number;
}

const Home: React.FC<HomeProps> = ({ navigation, tokenCount }) => {
  const handlePlayCoinFlip = () => {
    navigation.navigate('Coin');
  };
  const handleOpenCase = () => {
    navigation.navigate('Case');
  };
  const handlePlayRoulette = () => {
    navigation.navigate('Roulette');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DopaCoins</Text>
      <View style={styles.tokenContainer}>
      <Text style={styles.tokenText}>{`Coins: ${tokenCount}`}</Text>
      </View>
      <TouchableOpacity onPress={handlePlayCoinFlip} style={styles.button}>
        <Text style={styles.buttonText}>Coin Flip</Text>
      </TouchableOpacity>
      {/* Cases Button */}
      <TouchableOpacity onPress={handleOpenCase} style={styles.button}>
        <Text style={styles.buttonText}>Cases</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handlePlayRoulette} style={styles.button}>
        <Text style={styles.buttonText}>Roulette</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  button: {
    margin: 10,
    padding: 15,
    backgroundColor: '#3498db',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
  tokenText: {
    fontSize: 16,
  },
  tokenContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default Home;
