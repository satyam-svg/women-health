import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Polygon, Circle, Text as SvgText, Line } from 'react-native-svg';

const Cancer = () => {
    const [sliders, setSliders] = useState(new Array(10).fill(2.5)); // Initial values for radar chart

    const labels = [
        "Mean Radius", "Mean Texture", "Mean Perimeter", "Mean Area", "Mean Smoothness",
        "Mean Compactness", "Mean Concavity", "Mean Concave Points", "Mean Symmetry", "Mean Fractal Dimension"
    ];

    const handleSliderChange = (index: number, value: number) => {
        const newSliders = [...sliders];
        newSliders[index] = value;
        setSliders(newSliders);
    };

    // Function to calculate radar chart points
    const calculatePoints = () => {
        console.log('Slider values:', sliders); // Log slider values
        const angleStep = (2 * Math.PI) / sliders.length;
        const radius = 100;
        return sliders.map((value, index) => {
            const angle = angleStep * index;
            const x = 150 + radius * (value / 5) * Math.cos(angle);
            const y = 150 - radius * (value / 5) * Math.sin(angle);
            console.log(`Point ${index}: (${x}, ${y})`); // Log calculated points
            return `${x},${y}`;
        }).join(" ");
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Breast Cancer Prediction - Feature Values</Text>

            {/* Radar Chart */}
            <Svg height="300" width="300" style={styles.radarChart}>
                {/* Draw axes */}
                {labels.map((_, i) => {
                    const angle = (2 * Math.PI * i) / labels.length;
                    const x = 150 + 100 * Math.cos(angle);
                    const y = 150 - 100 * Math.sin(angle);
                    return <Line key={i} x1="150" y1="150" x2={x} y2={y} stroke="lightgray" strokeWidth="1" />;
                })}

                {/* Draw circles for scale */}
                {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
                    <Circle key={i} cx="150" cy="150" r={100 * scale} stroke="lightgray" strokeWidth="1" fill="none" />
                ))}

                {/* Radar polygon */}
                <Polygon points={calculatePoints()} fill="rgba(0, 123, 255, 0.4)" stroke="blue" strokeWidth="2" />

                {/* Labels */}
                {labels.map((label, i) => {
                    const angle = (2 * Math.PI * i) / labels.length;
                    const x = 150 + 120 * Math.cos(angle);
                    const y = 150 - 120 * Math.sin(angle);
                    return (
                        <SvgText key={i} x={x} y={y} fontSize="10" fill="black" textAnchor="middle">
                            {label}
                        </SvgText>
                    );
                })}
            </Svg>

            {/* Sliders */}
            {labels.map((label, index) => (
                <View key={index} style={styles.sliderContainer}>
                    <Text style={styles.label}>{label}: {sliders[index].toFixed(2)}</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={5}
                        step={0.01}
                        value={sliders[index]}
                        onValueChange={(value) => handleSliderChange(index, value)}
                    />
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    radarChart: {
        alignSelf: 'center',
        marginVertical: 20,
    },
    sliderContainer: {
        marginBottom: 15,
    },
    label: {
        marginBottom: 5,
    },
    slider: {
        width: '100%',
    },
});

export default Cancer;
