import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View, Easing } from 'react-native';

const { width } = Dimensions.get('window');

interface Props {
  isPlaying: boolean;
  style?: any;
}

const MovingRoad: React.FC<Props> = ({ isPlaying, style }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const duration = 1000;

  const startAnimation = () => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: -width,
        duration,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  };

  useEffect(() => {
    if (isPlaying) {
      translateX.setValue(0);
      startAnimation();
    } else {
      translateX.stopAnimation();
      translateX.setValue(0);
    }
  }, [isPlaying]);

  const renderLines = () =>
    [...Array(20)].map((_, i) => (
      <View key={i} style={[styles.line, { left: i * 40 }]} />
    ));

  return (
    <View style={[styles.roadContainer, style]}>
      <Animated.View
        style={[
          styles.lineRow,
          {
            width: width * 2,
            transform: [{ translateX }],
          },
        ]}
      >
        {renderLines()}
        {renderLines()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  roadContainer: {
    position: 'absolute',
    width: '100%',
    height: 30,
    bottom: 40,
    backgroundColor: '#333',
    overflow: 'hidden',
    zIndex: 0,
  },
  lineRow: {
    position: 'absolute',
    height: '100%',
    flexDirection: 'row',
  },
  line: {
    position: 'absolute',
    width: 20,
    height: 6,
    backgroundColor: 'white',
    top: 12,
    borderRadius: 3,
  },
});

export default MovingRoad;
