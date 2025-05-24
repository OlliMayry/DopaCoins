// home.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

interface HomeProps {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
  tokenCount: number;
}

const games = [
  { key: 'Coin Flip', route: 'Coin' },
  { key: 'Cases', route: 'Case' },
  { key: 'Roulette', route: 'Roulette' },
  { key: 'Crash', route: 'Crash' },
  { key: 'Keno', route: 'Keno' },
  { key: 'Blackjack', route: 'Blackjack' },
  { key: 'Slot', route: 'Slot' },
  { key: 'Poker', route: 'Poker' },
];

const Home: React.FC<HomeProps> = ({ navigation, tokenCount }) => {
  const handleNavigate = (route: string) => {
    navigation.navigate(route as keyof RootStackParamList);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DopaCoins</Text>

      <View style={styles.tokenContainer}>
        <Text style={styles.tokenLabel}>Coins</Text>
        <Text style={styles.tokenText}>{tokenCount.toFixed(2)}</Text>
      </View>

      <FlatList
        data={games}
        keyExtractor={(item) => item.key}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleNavigate(item.route)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{item.key}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const { width } = Dimensions.get('window');
const buttonWidth = (width / 2) - 30;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
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
  list: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    margin: 10,
    width: buttonWidth,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',

    // Varjo (iOS)
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,

    // Varjo (Android)
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});

export default Home;