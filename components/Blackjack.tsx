import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, Easing, ImageBackground } from 'react-native';
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
  "Card-Back": require("../assets/Cards/CardAround.png"),
  // Korttipakan selkäpuoli
  "Deck-Back": require("../assets/Cards/CardStack.png"),
  //Background image
  "Background": require("../assets/Blackjack/Blackjack background.png"),
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
  const deckPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const deckScale = useRef(new Animated.Value(1)).current;
  const [deckAnimated, setDeckAnimated] = useState(false); // että animaatio ajetaan vain kerran
  const [isAnimating, setIsAnimating] = useState(false);
  const cardFlyPosition = useRef(new Animated.ValueXY({ x: -120, y: -190 })).current;

 // const deck = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
 const generateDeck = () => {
  const suits = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck: { suit: string; value: string }[] = [];

  suits.forEach(suit => {
    values.forEach(value => {
      deck.push({ suit, value });
    });
  });

 // console.log(deck); // Debugging to check if the deck is generated correctly
  return deck;
};

const shuffledDeck = generateDeck().sort(() => Math.random() - 0.5);

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

    const resetDeckAnimation = () => {
      deckPosition.setValue({ x: 0, y: 0 });
      deckScale.setValue(1);
      setDeckAnimated(false);
    };

   const dealCards = async () => {

     if (tokenCount < betAmount || tokenCount <= 0 ) {
      alert("Not enough coins. Change your bet or earn more.");
      setGameStatus("Start the Game");
      resetDeckAnimation();
      return; 
    } 

    if (gameStatus === 'Start the Game') {
      // Animaation käynnistys
      await new Promise(resolve => {
        setIsAnimating(true);  // Aseta animaatio käynnissä olevaksi
        Animated.parallel([
          Animated.timing(deckPosition, {
            toValue: { x: -120, y: -210 },
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(deckScale, {
            toValue: 0.57,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]).start(resolve);  // callback "resolve" kutsutaan, kun animaatio on valmis
      });
  
      setDeckAnimated(true);
      setIsAnimating(false);  // Animaatio valmis, palautetaan tila
    }
    setIsAnimating(false);  // Animaatio valmis, palautetaan tila
    setTokenCount(prev => prev - betAmount);
  
    const dealerCard1 = shuffledDeck.pop()!;
    const dealerCard2 = shuffledDeck.pop()!;
    const playerCard1 = shuffledDeck.pop()!;
    const playerCard2 = shuffledDeck.pop()!;
  
    // Asetetaan kortit
    setDealerCards([dealerCard1, dealerCard2]);
    setPlayerCards([playerCard1, playerCard2]);

      setGameStatus('');
      setGameResult('');
      setIsDealerCardFaceDown(true); // Ensure dealer's second card is face down
    };

const animateCardFromDeck = async (toX: number, toY: number) => {
  cardFlyPosition.setValue({ x: -120, y: -190 }); // reset

  await new Promise(resolve => {
    Animated.timing(cardFlyPosition, {
      toValue: { x: toX, y: toY },
      duration: 500,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start(resolve);
  });
};

  const hit = () => {
    // Pop a card from the shuffled deck for the player
    const newPlayerCard = shuffledDeck.pop()!;

    // Add this new card to the player's hand
    setPlayerCards(prev => [...prev, newPlayerCard]);
    
    // Calculate the player's hand value with the new card
    const playerValue = calculateHandValue([...playerCards, newPlayerCard]);
    
    // Check if the player busts
    if (playerValue > 21) {
      setGameStatus('    Bust!|You Lost');
      setGameResult('Dealer Wins');
      setWinAmount(0);
      setIsDealerCardFaceDown(false); // Reveal the dealer's second card
    }
  };

  const stand = () => {
    let dealerValue = calculateHandValue(dealerCards);
    
    // Dealer draws cards until their hand value is 17 or higher
    while (dealerValue < 17) {
      const newDealerCard = shuffledDeck.pop()!;
       // Draw the new card and update the dealer's cards
  const newDealerCards = [...dealerCards, newDealerCard];
  setDealerCards(newDealerCards);

  // Recalculate dealer's hand value
  dealerValue = calculateHandValue(newDealerCards);
    }
  
    const playerValue = calculateHandValue(playerCards);
    
    // Determine the winner based on the dealer's and player's hand value
    if (dealerValue > 21 || playerValue > dealerValue) {
      setGameStatus('You Win!');
      setGameResult('You Win');
      setWinAmount(betAmount * 2);
      setTokenCount(prev => prev + betAmount * 2);
    } else if (dealerValue === playerValue) {
      setGameStatus('It\'s a Tie!');
      setGameResult('Tie');
      setWinAmount(betAmount);
      setTokenCount(prev => prev + betAmount);
    } else {
      setGameStatus('Dealer Wins!|   You Lost');
      setGameResult('Dealer Wins');
      setWinAmount(0);
    }
  
    setIsDealerCardFaceDown(false); // Reveal the dealer's second card
  };

const startNewGame = () => {
  // Palautetaan pelin alkuperäiseen tilaan
 // setGameStatus('Start the Game');
  setDealerCards([]);  // Tyhjennetään jakajan kortit
  setPlayerCards([]);  // Tyhjennetään pelaajan kortit
  setGameResult('');  // Nollataan pelin tulos
  setWinAmount(null);  // Nollataan voiton määrä
  setIsDealerCardFaceDown(true); // Reset the face down card
  dealCards();
};
const isHitDisabled = calculateHandValue(playerCards) >= 21;
// ennen returnia tai JSX:ää määrittele nämä:
const isBetActive =
  gameStatus === 'Start the Game' ||
  gameStatus === 'You Win!' ||
  gameStatus === "It\'s a Tie" ||
  gameResult === 'Dealer Wins';

const showMoveBetControls = gameStatus === 'Start the Game';

  return (
    <ImageBackground source={cardImages["Background"]} style={styles.background}>
    <View style={styles.container}>
      <View style={styles.tokenContainer}>
        <Text style={styles.tokenText}>Coins: {tokenCount.toFixed(2)}</Text>
      </View>
  
      <View style={styles.statusContainer}>
      {!isAnimating && (
    <>
        {gameStatus === 'Start the Game' ? (
          <Text style={styles.startGameText}>{gameStatus}</Text>
        ) : gameStatus.includes('|') ? (
          <Text style={styles.gameStatus}>
            <Text style={{ color: 'red' }}>{gameStatus.split('|')[0]}</Text>
            {'\n'}
            {gameStatus.split('|')[1]}
          </Text>
        ) : (
          <Text style={styles.gameStatus}>{gameStatus}</Text>
        )}
        {/* Voitto teksti */}
        {winAmount !== null && winAmount > 0 && (
          <Text style={[styles.winText, { position: 'absolute' }]}>{`Win: ${winAmount.toFixed(2)}`}</Text>
        )}
        </>
         )}
      </View>
      
        {gameStatus !== 'Start the Game' && (
          <Image source={cardImages["Deck-Back"]} style={styles.deckImageSmall} />
        )}

      <View style={styles.cardsContainer}>
      {gameStatus === 'Start the Game' && !deckAnimated ? (
          <Animated.Image
            source={cardImages["Deck-Back"]}
            style={[
              styles.deckImage,
              {
                transform: [
                  { translateX: deckPosition.x },
                  { translateY: deckPosition.y },
                  { scale: deckScale },
                ],
              },
            ]}
          />
        ) : (
          <>
          {/* <View style={{ marginTop: 20 }} /> */}
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
            {/* <View style={{ marginTop: 25, marginBottom: 5 }} /> */}
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
        {gameStatus === '' && (
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
          <TouchableOpacity onPress={dealCards} style={[styles.actionButton, styles.startGameButton, isAnimating && styles.disabledButton]}
          disabled={isAnimating}>
            <Text style={styles.actionText}>Deal</Text>
          </TouchableOpacity>
        )}
      </View>
  
      <View style={[styles.betControls, showMoveBetControls && styles.moveBetControls]}>
  {isBetActive ? (
    <>
      <TouchableOpacity 
        onPress={() => setBetAmount(prev => Math.max(1, prev - 1))} 
        style={[ styles.betButton, isAnimating && styles.disabledButton]}
        disabled={isAnimating}
      >
        <Text style={styles.betText}>-</Text>
      </TouchableOpacity>

      <Text style={styles.betAmount}>Bet: {betAmount}</Text>

      <TouchableOpacity 
        onPress={() => setBetAmount(prev => prev + 1)} 
        style={[ styles.betButton, isAnimating && styles.disabledButton]}
        disabled={isAnimating}
      >
        <Text style={styles.betText}>+</Text>
      </TouchableOpacity>
    </>
  ) : (
    <>
      <TouchableOpacity 
        style={[styles.betButton, styles.disabledButton]} 
        disabled={true}
      >
        <Text style={styles.betText}>-</Text>
      </TouchableOpacity>

      <Text style={styles.betAmount}>Bet: {betAmount}</Text>

      <TouchableOpacity 
        style={[styles.betButton, styles.disabledButton]} 
        disabled={true}
      >
        <Text style={styles.betText}>+</Text>
      </TouchableOpacity>
    </>
  )}
</View>
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover", // Tämä varmistaa, että kuva kattaa koko taustan
  },
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
  color: '#fff',
},
statusContainer: {
  alignItems: 'center', // Keskittää tekstit
 // marginTop: 20, // Säädä tarpeen mukaan
},
gameStatus: {
  fontSize: 24,
  fontWeight: 'bold',
  position: 'absolute',
  //bottom: 1, // pienempi arvo nostaa tekstiä ylemmäs
  color: '#fff',
},
cardsContainer: {
  marginTop: 75,
  alignItems: 'center',
},
cardText: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#fff',
  //position: 'absolute',
},
/* cardText1: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#fff',
  position: 'absolute',
  top: 140, // Säädä tätä arvoa tarpeen mukaan
}, */
cardImages: {
  flexDirection: 'row',
  marginVertical: 10,
},
cardImage: {
  width: 65,
  height: 91,
  marginHorizontal: 2.5,
},
controls: {
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 50, // lisää väli nappeihin
  width: '80%',
  marginTop: 30,
},
actionButton: {
  backgroundColor: '#007bff',
  padding: 15,
  borderRadius: 10,
  top: 5,
  //marginTop: 20,
},
actionText: {
  fontSize: 16,
  color: '#fff',
  fontWeight: 'bold',
},
betControls: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 25,
  borderWidth: 1,
  borderRadius: 10,
  borderColor: '#fff',
  padding: 10,
  backgroundColor: '#1f1e1e',
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
  color: '#fff',
},
winText: {
  fontSize: 20,
  color: '#0FFF50',
  fontWeight: 'bold',
  position: 'relative',
  marginTop: 30,
},
disabledButton: {
  backgroundColor: '#bdc3c7',
},
deckImage: {
  width: 105,
  height: 143.5,
  marginVertical: 10,
},
startGameText: {
  fontSize: 24,
  fontWeight: 'bold',
  position: 'absolute',
  top: -50, // Säädä tätä arvoa tarpeen mukaan
  color: '#fff',
},
startGameButton: {
  top: 50,
  marginTop: 20,
  // marginTop: 20,  // Voit säätää tätä arvoa tarpeen mukaan
  // position: 'absolute',
  //marginTop: 60,
},
moveBetControls:{
top: 45,
},
deckImageSmall: {
  width: 60,
  height: 82,
  top: 40,
  left: 30,
  position: 'absolute',
},
});

export default Blackjack;
