// app.tsx
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './components/Home';
import Coin from './components/Coin';
import Case from './components/Case';
import Roulette from './components/Roulette';
import Crash from './components/Crash';
import Keno from './components/Keno';

const Stack = createStackNavigator();

const App: React.FC = () => {
  const [tokenCount, setTokenCount] = useState(100);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" options={{ title: 'DopaCoins' }}>
          {(props) => <Home {...props} tokenCount={tokenCount} />}
        </Stack.Screen>
        <Stack.Screen name="Coin" options={{ title: 'Coin Flip' }}>
          {(props) => <Coin {...props} tokenCount={tokenCount} setTokenCount={setTokenCount} />}
        </Stack.Screen>
        <Stack.Screen name="Case" options={{ title: 'Cases' }}>
          {(props) => <Case {...props} tokenCount={tokenCount} setTokenCount={setTokenCount} />}
        </Stack.Screen>
        <Stack.Screen name="Roulette" options={{ title: 'Roulette' }}>
          {(props) => <Roulette {...props} tokenCount={tokenCount} setTokenCount={setTokenCount} />}
        </Stack.Screen>
        <Stack.Screen name="Crash" options={{ title: 'Crash' }}>
          {(props) => <Crash {...props} tokenCount={tokenCount} setTokenCount={setTokenCount} />}
        </Stack.Screen>
        <Stack.Screen name="Keno" options={{ title: 'Keno' }}>
          {(props) => <Keno {...props} tokenCount={tokenCount} setTokenCount={setTokenCount} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
