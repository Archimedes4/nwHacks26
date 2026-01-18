import { View, Text, useWindowDimensions, Pressable, ScrollView, StyleSheet } from 'react-native';
import React from 'react';
import { Colors, DEFAULT_FONT } from '../types';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { AdviceIcon, SleepIcon, TVIcon } from './Icons';
import { LinearGradient } from 'expo-linear-gradient';
import Header from './Header';


const styles = StyleSheet.create({
  sectionTitle: {
    alignSelf: "center",
    marginBottom: 18,
    fontSize: 30,
    color: Colors.light,
    fontFamily: DEFAULT_FONT
  },
  row: {
    paddingHorizontal: 18
  },
  card: {
    borderRadius: 32,
    padding: 24,
    marginRight: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  quoteMark: {
    position: "absolute",
    top: 10,
    left: 14,
    fontSize: 92,
    lineHeight: 92,
    color: "rgba(255,255,255,0.18)",
    fontFamily: DEFAULT_FONT
  },
  quoteText: {
    marginTop: 58,
    color: "#fff",
    fontSize: 22,
    lineHeight: 32,
    fontFamily: DEFAULT_FONT
  },
  cardFooter: {
    marginTop: 18
  },
  author: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    fontFamily: DEFAULT_FONT
  },
  stars: {
    marginTop: 10,
    fontSize: 22,
    letterSpacing: 3,
    color: "#FFC107"
  }
});

function Stars({ count = 5 }: { count?: number }) {
  return <Text style={styles.stars}>{"★".repeat(count)}</Text>;
}

export default function TestimonialCard({
  quote,
  author,
  location,
  stars,
  width,
  height,
  style
}: {
  quote: string;
  author: string;
  location?: string;
  stars?: number;
  width: number;
  height: number;
  style?: any;
}) {
  return (
    <LinearGradient
      colors={['#2F78D8', '#5C5EE8']} // top -> bottom
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.card, { width, minHeight: height }, style]}
    >
      {/* big quote mark */}
      <Text style={styles.quoteMark}>“</Text>

      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <Text style={styles.quoteText}>{quote}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.author}>
            {author}
            {location ? ` from ${location}` : ''}
          </Text>
          <Stars count={stars ?? 5} />
        </View>
      </View>
    </LinearGradient>
  );
}
