import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

interface BlackjackProps {
  navigation: StackNavigationProp<RootStackParamList, 'Blackjack'>;
  tokenCount: number;
  setTokenCount: React.Dispatch<React.SetStateAction<number>>;
}

// Korttien kuvat
const cardImages: { [key: string]: any } = {
  // Ristit (Clubs)
  "Clubs-A": require("../assets/Cards/Clubs/A.png"),
  "Clubs-2": require("../assets/Cards/Clubs/2.png"),
  "Clubs-3": require("../assets/Cards/Clubs/3.png"),
  "Clubs-4": require("../assets/Cards/Clubs/4.png"),
  "Clubs-5": require("../assets/Cards/Clubs/5.png"),
  "Clubs-6": require("../assets/Cards/Clubs/6.png"),
  "Clubs-7": require("../assets/Cards/Clubs/7.png"),
  "Clubs-8": require("../assets/Cards/Clubs/8.png"),
  "Clubs-9": require("../assets/Cards/Clubs/9.png"),
  "Clubs-10": require("../assets/Cards/Clubs/10.png"),
  "Clubs-J": require("../assets/Cards/Clubs/J.png"),
  "Clubs-Q": require("../assets/Cards/Clubs/Q.png"),
  "Clubs-K": require("../assets/Cards/Clubs/K.png"),

  // Ruudut (Diamonds)
  "Diamonds-A": require("../assets/Cards/Diamonds/A.png"),
  "Diamonds-2": require("../assets/Cards/Diamonds/2.png"),
  "Diamonds-3": require("../assets/Cards/Diamonds/3.png"),
  "Diamonds-4": require("../assets/Cards/Diamonds/4.png"),
  "Diamonds-5": require("../assets/Cards/Diamonds/5.png"),
  "Diamonds-6": require("../assets/Cards/Diamonds/6.png"),
  "Diamonds-7": require("../assets/Cards/Diamonds/7.png"),
  "Diamonds-8": require("../assets/Cards/Diamonds/8.png"),
  "Diamonds-9": require("../assets/Cards/Diamonds/9.png"),
  "Diamonds-10": require("../assets/Cards/Diamonds/10.png"),
  "Diamonds-J": require("../assets/Cards/Diamonds/J.png"),
  "Diamonds-Q": require("../assets/Cards/Diamonds/Q.png"),
  "Diamonds-K": require("../assets/Cards/Diamonds/K.png"),

  // Hertat (Hearts)
  "Hearts-A": require("../assets/Cards/Hearts/A.png"),
  "Hearts-2": require("../assets/Cards/Hearts/2.png"),
  "Hearts-3": require("../assets/Cards/Hearts/3.png"),
  "Hearts-4": require("../assets/Cards/Hearts/4.png"),
  "Hearts-5": require("../assets/Cards/Hearts/5.png"),
  "Hearts-6": require("../assets/Cards/Hearts/6.png"),
  "Hearts-7": require("../assets/Cards/Hearts/7.png"),
  "Hearts-8": require("../assets/Cards/Hearts/8.png"),
  "Hearts-9": require("../assets/Cards/Hearts/9.png"),
  "Hearts-10": require("../assets/Cards/Hearts/10.png"),
  "Hearts-J": require("../assets/Cards/Hearts/J.png"),
  "Hearts-Q": require("../assets/Cards/Hearts/Q.png"),
  "Hearts-K": require("../assets/Cards/Hearts/K.png"),

  // Padat (Spades)
  "Spades-A": require("../assets/Cards/Spades/A.png"),
  "Spades-2": require("../assets/Cards/Spades/2.png"),
  "Spades-3": require("../assets/Cards/Spades/3.png"),
  "Spades-4": require("../assets/Cards/Spades/4.png"),
  "Spades-5": require("../assets/Cards/Spades/5.png"),
  "Spades-6": require("../assets/Cards/Spades/6.png"),
  "Spades-7": require("../assets/Cards/Spades/7.png"),
  "Spades-8": require("../assets/Cards/Spades/8.png"),
  "Spades-9": require("../assets/Cards/Spades/9.png"),
  "Spades-10": require("../assets/Cards/Spades/10.png"),
  "Spades-J": require("../assets/Cards/Spades/J.png"),
  "Spades-Q": require("../assets/Cards/Spades/Q.png"),
  "Spades-K": require("../assets/Cards/Spades/K.png"),

  // Kortin selkäpuoli
  "Card-Back": require("../assets/Cards/Card around.png"),
  // Korttipakan selkäpuoli
  "Deck-Back": require("../assets/Cards/Deck of cards.png"),
};

// getCardImage-funktio
const getCardImage = (card: { suit: string, value: string }) => {
  return cardImages[`${card.suit}-${card.value}`] || cardImages["Card-Back"];
};

const Blackjack: React.FC<BlackjackProps> = ({ navigation, tokenCount, setTokenCount }) => {
  const [betAmount, setBetAmount] = useState(1);
  const [dealerCards, setDealerCards] = useState<{ suit: string; value: string }[]>([]);
  const [playerCards, setPlayerCards] = useState<{ suit: string; value: string }[]>([]);
  const [gameStatus, setGameStatus] = useState<string>('Start the Game');
  const [gameResult, setGameResult] = useState<string>(''); // Store result of the game
  const [winAmount, setWinAmount] = useState<number | null>(null); // Store win amount
  const [isDealerCardFaceDown, setIsDealerCardFaceDown] = useState(true); // Track if the second card is face down

  const deck = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  const getCardValue = (card: string) => {
    if (card === 'J' || card === 'Q' || card === 'K') return 10;
    if (card === 'A') return 11;
    return parseInt(card);
  };

    // Määritellään calculateHandValue komponentin sisälle
    const calculateHandValue = (hand: { suit: string; value: string }[], isFaceDown: boolean = false) => {
      let cardsToConsider = hand;
      
      // If the second card is face down, only consider the first card for the dealer.
      if (isFaceDown && hand.length > 1) {
        cardsToConsider = [hand[0]];
      }
    
      let value = cardsToConsider.reduce((total, card) => total + getCardValue(card.value), 0); 
      let aceCount = cardsToConsider.filter(card => card.value === 'A').length; 
    
      while (value > 21 && aceCount > 0) {
        value -= 10;
        aceCount--;
      }
      return value;
    };
    
   // Jakaminen
   const dealCards = () => {
    if (tokenCount < betAmount) return;
    setTokenCount(prev => prev - betAmount);
    const shuffledDeck = [...deck, ...deck, ...deck, ...deck];
    shuffledDeck.sort(() => Math.random() - 0.5);

    const dealerCard1 = shuffledDeck.pop()!;
    const dealerCard2 = shuffledDeck.pop()!;
    const playerCard1 = shuffledDeck.pop()!;
    const playerCard2 = shuffledDeck.pop()!;

    setDealerCards([
      { suit: "Clubs", value: dealerCard1 }, 
      { suit: "Diamonds", value: dealerCard2 }
    ]);
    setPlayerCards([
      { suit: "Hearts", value: playerCard1 }, 
      { suit: "Spades", value: playerCard2 }
    ]);
    setGameStatus('Game in Progress');
    setGameResult('');
  };

  const hit = () => {
    const shuffledDeck = [...deck, ...deck, ...deck, ...deck];
    shuffledDeck.sort(() => Math.random() - 0.5); // Shuffle again

    // Pop kortti pakasta ja luodaan korttien suit ja value objektit
    const newPlayerCard = shuffledDeck.pop()!;
    
    // Määritellään kortin suit ja value, esim. tämä voisi olla dynaaminen tai valmiit listat:
    const cardSuit = 'Hearts'; // Tämä voi olla mitä tahansa, esim. dynaamisesti
    const cardValue = newPlayerCard; // Tässä 'newPlayerCard' voi olla joku arvo kuten 'A', '2', jne.

    // Lisätään kortti pelaajan käteen
    setPlayerCards(prev => [...prev, { suit: cardSuit, value: cardValue }]);

    const playerValue = calculateHandValue([...playerCards, { suit: cardSuit, value: cardValue }]);
    if (playerValue > 21) {
      setGameStatus('You Bust! Dealer Wins');
      setGameResult('Dealer Wins');
      setWinAmount(0);
    }
  }
  

 const stand = () => {
  const shuffledDeck = [...deck, ...deck, ...deck, ...deck];
  shuffledDeck.sort(() => Math.random() - 0.5); // Shuffle again

  // Dealer's turn
  let dealerValue = calculateHandValue(dealerCards);
  while (dealerValue < 17) {
    // Pop kortti pakasta ja luodaan kortin suit ja value objekti
    const newDealerCardValue = shuffledDeck.pop()!;
    const newDealerCard = {
      suit: 'Hearts',  // Tämä voi olla dynaaminen, riippuen kortin "suitista"
      value: newDealerCardValue,  // Tämä on kortin arvo, esim. 'A', 'K', jne.
    };

    // Lisätään uusi kortti jakajan käteen
    setDealerCards(prev => [...prev, newDealerCard]);

    dealerValue = calculateHandValue([...dealerCards, newDealerCard]);
  }

  const playerValue = calculateHandValue(playerCards);
  if (dealerValue > 21 || playerValue > dealerValue) {
    setGameStatus('You Win!');
    setGameResult('You Win');
    setWinAmount(betAmount * 2); // Win double the bet amount
    setTokenCount(prev => prev + betAmount * 2); // Add winnings to token count
  } else if (dealerValue === playerValue) {
    setGameStatus('It\'s a Tie');
    setGameResult('Tie');
    setWinAmount(betAmount); // Tie, refund the bet amount
    setTokenCount(prev => prev + betAmount); // Refund bet
  } else {
    setGameStatus('Dealer Wins');
    setGameResult('Dealer Wins');
    setWinAmount(0); // No win, lose the bet
  }

  setIsDealerCardFaceDown(false);
};

const startNewGame = () => {
  // Palautetaan pelin alkuperäiseen tilaan
 // setGameStatus('Start the Game');
  setDealerCards([]);  // Tyhjennetään jakajan kortit
  setPlayerCards([]);  // Tyhjennetään pelaajan kortit
  setGameResult('');  // Nollataan pelin tulos
  setWinAmount(null);  // Nollataan voiton määrä
  setIsDealerCardFaceDown(true); // Reset the face down card
  dealCards(); // Immediately deal new cards instead of going to "Start the Game"
};
const isHitDisabled = calculateHandValue(playerCards) >= 21;

  return (
    <View style={styles.container}>
      <View style={styles.tokenContainer}>
        <Text style={styles.tokenText}>Coins: {tokenCount.toFixed(2)}</Text>
      </View>
  
      <Text style={styles.gameStatus}>{gameStatus}</Text>
  
      <View style={styles.cardsContainer}>
  {gameStatus === 'Start the Game' ? (
    <Image source={cardImages["Deck-Back"]} style={styles.deckImage} />
  ) : (
    <>
      <Text style={styles.cardText}>
        Dealer's Cards: {calculateHandValue(dealerCards, isDealerCardFaceDown)}
      </Text>
      <View style={styles.cardImages}>
        {dealerCards.map((card, index) => (
          <Image 
            key={index} 
            source={index === 1 && isDealerCardFaceDown ? cardImages["Card-Back"] : getCardImage(card)} 
            style={styles.cardImage} 
          />
        ))}
      </View>
      <Text style={styles.cardText}>Player's Cards: {calculateHandValue(playerCards)}</Text>
      <View style={styles.cardImages}>
        {playerCards.map((card, index) => (
          <Image key={index} source={getCardImage(card)} style={styles.cardImage} />
        ))}
      </View>
    </>
  )}
</View>
  
      <View style={styles.controls}>
        {gameStatus === 'Game in Progress' && (
          <>
            <TouchableOpacity 
              onPress={hit} 
              style={[styles.actionButton, isHitDisabled && styles.disabledButton]} 
              disabled={isHitDisabled}
            >
              <Text style={styles.actionText}>Hit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={stand} style={styles.actionButton}>
              <Text style={styles.actionText}>Stand</Text>
            </TouchableOpacity>
          </>
        )}
        {gameResult && (
          <TouchableOpacity onPress={startNewGame} style={styles.actionButton}>
            <Text style={styles.actionText}>Deal</Text>
          </TouchableOpacity>
        )}
        {gameStatus === 'Start the Game' && !gameResult && (
          <TouchableOpacity onPress={dealCards} style={styles.actionButton}>
            <Text style={styles.actionText}>Deal</Text>
          </TouchableOpacity>
        )}
      </View>
  
      <View style={styles.betControls}>
        <TouchableOpacity 
          onPress={() => setBetAmount(prev => Math.max(1, prev - 1))} 
          style={[styles.betButton, gameStatus === 'Game in Progress' && styles.disabledButton]} 
          disabled={gameStatus === 'Game in Progress'}
        >
          <Text style={styles.betText}>-</Text>
        </TouchableOpacity>

        <Text style={styles.betAmount}>Bet: {betAmount}</Text>

        <TouchableOpacity 
          onPress={() => setBetAmount(prev => prev + 1)} 
          style={[styles.betButton, gameStatus === 'Game in Progress' && styles.disabledButton]} 
          disabled={gameStatus === 'Game in Progress'}
        >
          <Text style={styles.betText}>+</Text>
        </TouchableOpacity>
      </View>
  
      {/* Voitto teksti */}
      {winAmount !== null && winAmount > 0 && (
        <Text style={[styles.winText, { position: 'absolute', bottom: 65 }]}>{`Win: ${winAmount}`}</Text>
      )}
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
gameStatus: {
  fontSize: 24,
  fontWeight: 'bold',
  marginTop: 20,
},
cardsContainer: {
  marginTop: 20,
  alignItems: 'center',
},
cardText: {
  fontSize: 18,
  fontWeight: 'bold',
},
cardImages: {
  flexDirection: 'row',
  marginVertical: 10,
},
cardImage: {
  width: 60,
  height: 84,
  marginHorizontal: 5,
},
controls: {
  marginTop: 10,
  flexDirection: 'row',
  justifyContent: 'space-around',
  width: '80%',
},
actionButton: {
  backgroundColor: '#3498db',
  padding: 15,
  borderRadius: 10,
  //marginTop: 20,
},
actionText: {
  fontSize: 18,
  color: '#fff',
},
betControls: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 20,
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
winText: {
  fontSize: 20,
  color: '#27ae60',
  fontWeight: 'bold',
  marginTop: 10,
},
disabledButton: {
  backgroundColor: '#bdc3c7',
},
deckImage: {
  width: 100,
  height: 140,
  marginVertical: 10,
},
});

export default Blackjack;
