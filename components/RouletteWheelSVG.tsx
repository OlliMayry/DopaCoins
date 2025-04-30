import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Svg, { G, Path, Text as SvgText, Circle } from 'react-native-svg';
import { Animated } from 'react-native';

const wheelImage = require("../assets/Roulette/Wheel.png");

const numbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30,
  8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7,
  28, 12, 35, 3, 26
];

const redNumbers = [32, 19, 21, 25, 34, 27, 36, 30, 23, 5, 16, 1, 14, 9, 18, 7, 12, 3];
const blackNumbers = [15, 4, 2, 17, 6, 13, 11, 8, 10, 24, 33, 20, 31, 22, 29, 28, 35, 26];

const getColor = (num: number) => {
  if (num === 0) return 'green';
  if (redNumbers.includes(num)) return 'red';
  return 'black';
};

const RouletteWheelSVG = ({ size = 300, rotation, highlightedSector }: { size?: number, rotation: Animated.Value, highlightedSector: number | null }) => {
  const radius = size / 2;
  const angle = (2 * Math.PI) / numbers.length;
  const innerCircleRadius = size * 0.35; // Radius for the inner circle
  const numInnerSectors = 37;  // Change this value to adjust how many sectors you want in the inner circle.

  return (
    <View>
      <Svg width={size} height={size}>
        <G origin={`${radius}, ${radius}`}>
          {/* Outer wheel sectors and numbers */}
          {numbers.map((num, index) => {
            const startAngle = index * angle;
            const endAngle = startAngle + angle;
            const x1 = radius + radius * Math.cos(startAngle);
            const y1 = radius + radius * Math.sin(startAngle);
            const x2 = radius + radius * Math.cos(endAngle);
            const y2 = radius + radius * Math.sin(endAngle);
            const largeArc = angle > Math.PI ? 1 : 0;

            const pathData = `
              M ${radius} ${radius}
              L ${x1} ${y1}
              A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
              Z
            `;

            const midAngle = startAngle + angle / 2;
            const labelX = radius + (radius * 0.85) * Math.cos(midAngle);
            const labelY = radius + (radius * 0.85) * Math.sin(midAngle);
           // const isHighlighted = highlightedSector === index;

            return (
              <G key={num}>
                <Path
                  d={pathData}
                  fill={getColor(num)}
                  stroke="none"
                  //stroke={isHighlighted ? 'yellow' : 'none'}
                  //strokeWidth={isHighlighted ? 3 : 0}
                />
             <SvgText
              x={labelX}
              y={labelY}
              fill="white"
              fontSize={size * 0.03}
              fontWeight="bold"
              textAnchor="middle"
              alignmentBaseline="middle"
              transform={`rotate(${(midAngle * 180) / Math.PI + 90}, ${labelX}, ${labelY})`}
            >
              {num}
            </SvgText>
              </G>
            );
          })}
        </G>
        
        <Circle
          cx={radius}
          cy={radius}
          r={radius - 1.5}
          fill="none"
          stroke="#999999"
          strokeWidth={3}
        />

        {/* Highlight-reuna uloimman kehän päälle */}
{highlightedSector !== null && (() => {
  const startAngle = highlightedSector * angle;
  const endAngle = startAngle + angle;

  const outerX1 = radius + radius * Math.cos(startAngle);
  const outerY1 = radius + radius * Math.sin(startAngle);
  const outerX2 = radius + radius * Math.cos(endAngle);
  const outerY2 = radius + radius * Math.sin(endAngle);
  const largeArc = angle > Math.PI ? 1 : 0;

  const pathData = `
    M ${radius} ${radius}
    L ${outerX1} ${outerY1}
    A ${radius} ${radius} 0 ${largeArc} 1 ${outerX2} ${outerY2}
    Z
  `;

  return (
    <Path
      d={pathData}
      fill="none"
      stroke="yellow"
      strokeWidth={3}
    />
  );
})()}

        
        {/* Inner circle */}
        <Circle
          cx={radius}
          cy={radius}
          r={innerCircleRadius}
          fill="#5F0403"
          stroke="#999999"
          strokeWidth={3}
        />

        {/* Draw radial lines to create sectors within the inner circle */}
        {Array.from({ length: numInnerSectors }).map((_, i) => {
          // Compute angle for each radial line
          const theta = (2 * Math.PI / numInnerSectors) * i;
          const x = radius + innerCircleRadius * Math.cos(theta);
          const y = radius + innerCircleRadius * Math.sin(theta);
          return (
            <Path
              key={i}
              d={`M ${radius} ${radius} L ${x} ${y}`}
              stroke="#999999"
              strokeWidth={2}
            />
          );
        })}
        
 {/* Pallo – siirretty oikein silmukan ulkopuolelle */}
 {highlightedSector !== null && (() => {
          const midAngle = (highlightedSector + 0.5) * angle;
          const ballRadius = size * 0.0175;
          const ballDistanceFromCenter = radius * 0.63;

          const ballX = radius + ballDistanceFromCenter * Math.cos(midAngle);
          const ballY = radius + ballDistanceFromCenter * Math.sin(midAngle);

          return (
            <Circle
              cx={ballX}
              cy={ballY}
              r={ballRadius}
              fill="#FFFFFF"
              stroke="#000"
              strokeWidth={1}
            />
          );
        })()}

      </Svg>
      
      {/* Overlay the wheel image in center */}
      <Image
        source={wheelImage}
        style={[
          StyleSheet.absoluteFillObject,
          {
            width: size * 0.8,
            height: size * 0.8,
            left: size * 0.1,
            top: size * 0.1,
            resizeMode: 'contain',
          },
        ]}
      />
    </View>
  );
};

export default RouletteWheelSVG;
