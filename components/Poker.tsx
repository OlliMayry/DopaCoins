import React, { useState, useRef, useEffect } from "react";
import { View, Image, TouchableOpacity, Text, StyleSheet, ImageBackground, Animated } from "react-native";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

interface PokerProps {
  navigation: StackNavigationProp<RootStackParamList, 'Poker'>;
  tokenCount: number;
  setTokenCount: React.Dispatch<React.SetStateAction<number>>;
}

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
  "Deck-Back": require("../assets/Cards/CardStack.png"),
  // Kahden kortin selkäpuoli
  "Double-Back": require("../assets/Cards/Double around.png"),
  // Joker
  "Joker": require("../assets/Cards/Joker.png"),
  // Background image
  "Background": require("../assets/Poker background.png"),
};

const suits = ["Clubs", "Diamonds", "Hearts", "Spades"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const deck = suits.flatMap((suit) => ranks.map((rank) => `${suit}-${rank}`));

type Hand = string[];

const Poker: React.FC<PokerProps> = ({ navigation, tokenCount, setTokenCount }) => {
    const [betAmount, setBetAmount] = useState(1);
    const [cards, setCards] = useState<any[]>([]);  // Pelissä jaetut kortit
   // const [deck1, setDeck1] = useState(Object.keys(cardImages).filter(card => !card.includes('Deck-Back')));
    const [deck, setDeck] = useState(() => suits.flatMap(suit => ranks.map(rank => `${suit}-${rank}`)));
    const [openedStack, setOpenedStack] = useState<string[]>([]);
    const [dealDisabled, setDealDisabled] = useState(false);
  //  const [betlDisabled, setBetDisabled] = useState(false)
    const [winAmount, setWinAmount] = useState(0);
    const [handType, setHandType] = useState("");
    const [isDoubling, setIsDoubling] = useState(false);
    const [doubleCards, setDoubleCards] = useState<string[]>([]);
    const [selectedDoubleIndex, setSelectedDoubleIndex] = useState<number | null>(null);
    const [revealedAll, setRevealedAll] = useState(false);
 
    const handRanks: Record<string, number> = { "A": 14, "K": 13, "Q": 12, "J": 11 };
   
    const getRankValue = (card: string) => {
      if (!card || typeof card !== 'string' || !card.includes("-")) {
        console.error("Invalid card:", card);  // Log the invalid card for debugging
        return 0; // Default value when the card is not a valid string
      }
      const rank = card.split("-")[1];
      return handRanks[rank] ?? parseInt(rank, 10);
    };

  const openedStackAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.timing(openedStackAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [openedStack]);

  const calculateWin = (hand: string[]) => {
    const counts: { [key: string]: number } = {};
    const suits: { [key: string]: number } = {};
    let rankValues = hand.map(getRankValue).sort((a, b) => a - b);

    hand.forEach(card => {
        const [suit, rank] = card.split("-");
        counts[rank] = (counts[rank] || 0) + 1;
        suits[suit] = (suits[suit] || 0) + 1;
    });

    const hasFlush = Object.values(suits).some(count => count === 5);
    const hasStraight = rankValues.every((val, idx, arr) => idx === 0 || val === arr[idx - 1] + 1);

    // Tarkistetaan, onko jokin pari (10, J, Q, K, A)
    const pairs = ["10", "J", "Q", "K", "A"];
    const hasPair = pairs.some(rank => counts[rank] === 2);
    //const hasTenA = counts["10"] === 1 && counts["A"] === 1; // Tarkistetaan onko 10-A pari

    if (hasFlush && hasStraight && rankValues.includes(14)) return { winAmount: 100, handType: "Royal Flush" }; 
    if (hasFlush && hasStraight) return { winAmount: 75, handType: "Straight Flush" }; 
    if (Object.values(counts).includes(4)) return { winAmount: 50, handType: "Four of a Kind" }; 
    if (Object.values(counts).includes(3) && Object.values(counts).includes(2)) return { winAmount: 20, handType: "Full House" }; 
    if (hasFlush) return { winAmount: 15, handType: "Flush" }; 
    if (hasStraight) return { winAmount: 11, handType: "Straight" }; 
    if (Object.values(counts).includes(3)) return { winAmount: 5, handType: "Three of a Kind" }; 
    if (Object.values(counts).filter(x => x === 2).length === 2) return { winAmount: 3, handType: "Two Pair" }; 
    if (hasPair) return { winAmount: 2, handType: "10-A Pair" }; 

    return { winAmount: 0, handType: "No Win" }; // Ei voittanut mitään
};

    const dealCards = () => {
      if (tokenCount < betAmount) return;
     
      setTokenCount(prev => prev - betAmount);
      setDealDisabled(true);
      setWinAmount(0);

      // Resetoi animaatio alkuasentoon (piiloon)
      openedStackAnim.setValue(-50);
 
      // Luo uusi ja sekoitettu pakka aina ennen jakamista
      const shuffledDeck = suits.flatMap((suit) => ranks.map((rank) => `${suit}-${rank}`)).sort(() => Math.random() - 0.5);
     
      // Otetaan kortteja varmistaen, ettei `undefined` pääse mukaan
      const drawCard = () => shuffledDeck.pop() || "Invalid-Card";  // Default to a placeholder if the card is undefined
 
      const dealtCards = [
          drawCard(),  // Ensimmäinen kortti pelaajalle
          drawCard(),  // Toinen kortti pelaajalle
          ["Double-Back", drawCard(), drawCard(), drawCard()], // Pino 1
          ["Double-Back", drawCard(), drawCard(), drawCard()]  // Pino 2
      ];
 
      setDeck(shuffledDeck); // Päivitetään pakka jäljelle jääneillä korteilla
      setCards(dealtCards);
  };
 
   // Korttipakan valinta
   const selectStack = (index: number) => {
    setCards(prevCards => {
        const newHand = [...prevCards];
        const selectedStack = newHand[index];

        if (Array.isArray(selectedStack)) {
            newHand.splice(index, 1, ...selectedStack.slice(1));
            const otherIndex = newHand.findIndex(stack => Array.isArray(stack));
            if (otherIndex !== -1) newHand.splice(otherIndex, 1);
        }

        const { winAmount, handType } = calculateWin(newHand); // Lasketaan voitto ja käden tyyppi
        if (winAmount > 0) {
            setWinAmount(betAmount * winAmount);
      setHandType(handType);
        }
        setDealDisabled(false);
        return newHand;
    });
  };

// Starts doubling mode by dealing a new 5-card hand.
const handleDoublePress = () => {
  setIsDoubling(true);
  setSelectedDoubleIndex(null);
  setRevealedAll(false);
  // winAmount remains pending from the normal win.
  const newDeck = suits
    .flatMap((suit) => ranks.map((rank) => `${suit}-${rank}`))
    .sort(() => Math.random() - 0.5);
  const drawCard = () => newDeck.pop() || "Invalid-Card";
  const newDoubleCards = [drawCard(), drawCard(), drawCard(), drawCard(), drawCard()];
  setDoubleCards(newDoubleCards);
};

// When Cash Out is pressed, the pending win is added.
const handleCashOut = () => {
  // Only add win if there is a win pending (winAmount > 0)
  setTokenCount((prev) => prev + winAmount);
  // Reset doubling state.
  setIsDoubling(false);
  setDoubleCards([]);
  setSelectedDoubleIndex(null);
  setRevealedAll(false);
  setWinAmount(0);
  setHandType("");
  setDealDisabled(false);
};

const getDoubleRankValue = (card: string) => {
  const rank = card.split("-")[1];
  if (rank === "A") return 1;
  return handRanks[rank] ?? parseInt(rank, 10);
};
// When a card is selected during doubling.
const handleDoubleCardSelection = (selectedIndex: number) => {
  setSelectedDoubleIndex(selectedIndex);
  const currentWin = winAmount;
  // After 0.5 sec, reveal all cards and check the result.
  setTimeout(() => {
    setRevealedAll(true);
    const baseCard = doubleCards[0];
    const chosenCard = doubleCards[selectedIndex];
    const baseValue = getDoubleRankValue(baseCard);
    const chosenValue = getDoubleRankValue(chosenCard);

    if (chosenValue > baseValue) {
      // Onnistui
      const newWin = currentWin * 2;
      setWinAmount(newWin);
      setHandType("Double Success!");
    } else if (chosenValue === baseValue) {
      // Sama arvo -> puolet takaisin
      const refund = currentWin / 2;
      setWinAmount(0); // Voitto ei jää voimaan enää
      setTokenCount((prev) => prev + refund);
      setHandType("Same Rank! Half Returned.");
      setTimeout(() => {
        setIsDoubling(false);
        setDoubleCards([]);
        setSelectedDoubleIndex(null);
        setRevealedAll(false);
      }, 1000);
    } else {
      // Häviö
      setWinAmount(0);
      setHandType("Double Lost!");
      setTimeout(() => {
        setIsDoubling(false);
        setDoubleCards([]);
        setSelectedDoubleIndex(null);
        setRevealedAll(false);
      }, 1000);
    }
  }, 500);
};
    return (
      <ImageBackground source={cardImages["Background"]} style={styles.background}>
        <View style={styles.container}>
          <Image source={cardImages["Deck-Back"]} style={styles.deckBack} />
          <View style={styles.tokenContainer}>
            <Text style={styles.tokenText}>Coins: {tokenCount.toFixed(2)}</Text>
          </View>
    
          {/* Show either the doubling view or the normal game */}
          {isDoubling ? (
      <View style={styles.doubleContainer}>
          <Text style={styles.instructionText}>
        {revealedAll
          ? winAmount > 0
            ? `Current win: ${winAmount.toFixed(2)} coins` // If winAmount > 0, display current win
            : handType // If winAmount is 0 (failure), display the hand type (e.g., "Double Fail!")
          : `You win ${(winAmount * 2).toFixed(2)} coins if you find a card of higher value` // If still in selecting phase, show instruction
        }
          </Text>
          <View style={styles.rowContainer}>
            {/* Always show the base card face-up */}
            <Image source={cardImages[doubleCards[0]]} style={styles.cardImage} />
            {/* Render the 4 selectable cards */}
            {doubleCards.slice(1).map((card, idx) => {
              const cardIndex = idx + 1; // Adjust for base card.
              let cardSource = cardImages["Card-Back"];
              // Reveal the card if it was selected or if all cards are revealed.
              if (revealedAll || selectedDoubleIndex === cardIndex) {
                cardSource = cardImages[doubleCards[cardIndex]];
              }
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    if (selectedDoubleIndex === null) {
                      handleDoubleCardSelection(cardIndex);
                    }
                  }}
                  disabled={selectedDoubleIndex !== null}
                >
                  <Image source={cardSource} style={styles.cardImage} />
                </TouchableOpacity>
              );
            })}
          </View>
        {/* After result is revealed, if win > 0, show both Double and Cash Out buttons */}
        {revealedAll && (
        winAmount > 0 ? (
        <View style={styles.doubleOptions}>
          <TouchableOpacity
            onPress={handleDoublePress}
            style={[styles.button, styles.doubleButton]}
          >
            <Text style={styles.buttonText}>Double</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCashOut}
            style={[styles.button, styles.cashOutButton]}
          >
            <Text style={styles.buttonText}>Cash Out</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // In case of failure, the game exits doubling mode automatically.
        null
      )
    )}
  </View>
          ) : (
            <>
              {/* Normal game cards */}
              <View style={styles.cardContainer}>
                <View style={styles.rowContainer}>
                  {cards.map((card, index) =>
                    Array.isArray(card) ? (
                      <View key={index} style={styles.stackContainer}>
                        <TouchableOpacity onPress={() => selectStack(index)}>
                          <Image
                            source={cardImages[card[0]]}
                            style={styles.cardImage}
                          />
                          <Image
                            source={cardImages[card[1]]}
                            style={[styles.cardImage, styles.overlayCard]}
                          />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Image
                        key={index}
                        source={cardImages[card]}
                        style={styles.cardImage}
                      />
                    )
                  )}
                </View>
              </View>
    
              {winAmount > 0 && handType ? (
                <>
                  <Text style={styles.handText}>{handType}</Text>
                  <Text style={styles.winText}>Win: {winAmount}</Text>
                </>
              ) : null}
    
            {/* Doubling options if there's a pending win */}
            {winAmount > 0 && (
                <View style={styles.doubleOptions}>
                  <TouchableOpacity
                    onPress={handleDoublePress}
                    style={[styles.button, styles.doubleButton]}
                  >
                    <Text style={styles.buttonText}>Double</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCashOut}
                    style={[styles.button, styles.cashOutButton]}
                  >
                    <Text style={styles.buttonText}>Cash Out</Text>
                  </TouchableOpacity>
                </View>
              )}
    
              {/* Deal button */}
              <TouchableOpacity
                onPress={dealCards}
                style={[
                  styles.button,
                  dealDisabled && styles.buttonDisabled,
                  cards.length === 0 ? styles.dealButtonInitial : styles.dealButtonAfter,
                ]}
                disabled={dealDisabled}
              >
                <Text style={styles.buttonText}>Deal</Text>
              </TouchableOpacity>
    
              {/* Bet control */}
              <View
                style={[
                  styles.betControls,
                  cards.length === 0 ? styles.betControlsInitial : styles.betControlsAfter,
                ]}
              >
                <TouchableOpacity
                  onPress={() => setBetAmount((prev) => Math.max(1, prev - 1))}
                  style={[styles.betButton, dealDisabled && styles.buttonDisabled]}
                  disabled={dealDisabled}
                >
                  <Text style={styles.betText}>-</Text>
                </TouchableOpacity>
    
                <Text style={styles.betAmount}>Bet: {betAmount}</Text>
    
                <TouchableOpacity
                  onPress={() => setBetAmount((prev) => prev + 1)}
                  style={[styles.betButton, dealDisabled && styles.buttonDisabled]}
                  disabled={dealDisabled}
                >
                  <Text style={styles.betText}>+</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ImageBackground>
    );
  };    
 
  const styles = StyleSheet.create({
    background: {
      flex: 1,
      resizeMode: "cover", // Tämä varmistaa, että kuva kattaa koko taustan
    },
    deckBack: {
        width: 66.043161,
       // width: 60,
        height: 90,
        position: "absolute",
       // zIndex: 1,  Tämä varmistaa, että kuva tulee näkyviin ennen kortteja
        top: 40,
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
    button: {
      backgroundColor: '#007bff',
      padding: 15,
      borderRadius: 10,
      marginTop: 160,
    },
    buttonText: {
      color: "white",
      fontWeight: "bold",
    },
    cardContainer: {
      flexDirection: "row",
      marginVertical: 20,
      marginTop: 120,
      alignItems: 'center',
    //  marginTop: 120,
     // marginBottom: 200,
    },
    cardImage: {
      marginTop: 30,
      width: 60,
      height: 90,
      marginHorizontal: 2.5,
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
      color: '#fff',
    },
    container: {
      alignItems: "center",
      padding: 20,
    },
    stackContainer: {
      position: 'relative',
      width: 60,
      height: 90,
      marginHorizontal: 5,  // Lisää tilaa pinojen väliin
    },
    overlayCard: {
      position: 'absolute',
      top: 5.5,
      left: 4.5,
     //resizeMode: "cover"
    },
    buttonDisabled: {
      backgroundColor: "#888"
    },
    winText: {
      fontSize: 20,
      color: '#0FFF50',
      fontWeight: 'bold',
      position: 'absolute',
      top: 360,  // Sijoittaa voittotekstin yläreunaan
      justifyContent: 'center',
      //transform: [{ translateX: -50 }], // Keskittää tekstin täsmälleen
      zIndex: 10, // Varmistaa, että voittoteksti tulee muiden päälle, jos tarve
      //marginTop: 25,
    },
    handText: {
      fontSize: 20,
      color: '#0FFF50',
      fontWeight: 'bold',
      position: 'absolute',
      top: 330,  // Sijoittaa voittotekstin yläreunaan
     // left: '50%', // Asettaa sen keskelle vaakasuunnassa
     // zIndex: 10, // Varmistaa, että voittoteksti tulee muiden päälle, jos tarve
     justifyContent: 'center',
    },
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginVertical: 5, // Lisää tilaa rivien väliin
    },
    dealButtonInitial: {
      marginTop: 280,  // Sijoittaa "Deal"-napin alkuun
    },
    dealButtonAfter: {
      marginTop: 160,  // Sijoittaa "Deal"-napin normaalisti
    },
    betControlsInitial: {
      marginTop: 20,  // Sijoittaa "Bet"-osio alkuun
    },
    betControlsAfter: {
      marginTop: 20,  // Sijoittaa "Bet"-osio normaalisti
    },
    doubleOptions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '80%',
      marginTop: 20,
    },
    doubleButton: {
      backgroundColor: '#f39c12',
      flex: 1,
      marginRight: 10,
    },
    cashOutButton: {
      backgroundColor: '#27ae60',
      flex: 1,
      marginLeft: 10,
    },
    doubleContainer: {
      alignItems: 'center',
      marginTop: 120,
    },
    instructionText: {
      fontSize: 18,
      color: '#fff',
     // marginBottom: 10,
    },
  });
 
  export default Poker;
