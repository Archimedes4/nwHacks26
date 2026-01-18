import { View, Text, useWindowDimensions, ScrollView, StyleSheet, Pressable, Platform } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Colors, DEFAULT_FONT } from '../types';
import { Image } from 'expo-image';
import { AdviceIcon, SleepIcon, TVIcon } from './Icons';
import { LinearGradient } from 'expo-linear-gradient';

import TestimonialCard from './TestimonialCard';
import { BlurView } from 'expo-blur';
import CustomButton from './CustomButton';
import { Link, Redirect } from 'expo-router';

const TESTIMONIALS = [
    { quote: 'Somnia, made me have a good sleep during nwHacks 26. It helped me calm down and stay focused.', author: 'Andrew Mainella', stars: 5 },
    { quote: 'This app called Somnia really made my sleep better. Not only does it help me relax and go to sleep, it also helps me feel better the following day. 10/10 Recommended.', author: 'Jason Shin', stars: 5 },
    { quote: 'zzzzzZ', author: 'Binh Nguyen', stars: 5 },
    { quote: 'I love sleeping!', author: 'Charles Ran', stars: 5 },
    { quote: 'I find Somnia to be a great tool for sleeping.', author: 'Alec Johnson', stars: 5 },
    { quote: 'I love the name for the app! Somnia just flows right off the tongue.', author: 'Samantha Lee', stars: 5 },
    { quote: 'The sleep tracking feature is incredibly accurate and helpful.', author: 'Michael Chen', stars: 5 }
];

const styles = StyleSheet.create({
    sectionTitle: {
        alignSelf: 'center',
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
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6
    },
    quoteMark: {
        position: 'absolute',
        top: 10,
        left: 14,
        fontSize: 92,
        lineHeight: 92,
        color: 'rgba(255,255,255,0.18)',
        fontFamily: DEFAULT_FONT
    },
    quoteText: {
        marginTop: 58,
        color: '#fff',
        fontSize: 22,
        lineHeight: 32,
        fontFamily: DEFAULT_FONT
    },
    cardFooter: {
        marginTop: 18
    },
    author: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 16,
        fontFamily: DEFAULT_FONT
    },
    stars: {
        marginTop: 10,
        fontSize: 22,
        letterSpacing: 3,
        color: '#FFC107'
    }
});

export default function index() {
    const { width, height } = useWindowDimensions();
    const cardW = Math.min(320, Math.round(width * 0.78));
    const cardH = Math.max(260, Math.round(height * 0.35));

    // Auto-scroll state/refs
    const scrollRef = useRef<ScrollView>(null);
    const [contentW, setContentW] = useState(0);
    const [containerW, setContainerW] = useState(0);
    const offsetRef = useRef(0);
    const directionRef = useRef<1 | -1>(1); // 1 => right, -1 => left

    const maxScroll = Math.max(0, contentW - containerW);

    useEffect(() => {
        if (maxScroll <= 0) return; // nothing to scroll
        const step = 1; // px per tick
        const intervalMs = 16; // ~60fps

        const id = setInterval(() => {
            offsetRef.current += step * directionRef.current;

            if (offsetRef.current >= maxScroll) {
                offsetRef.current = maxScroll;
                directionRef.current = -1; // reverse to left
            } else if (offsetRef.current <= 0) {
                offsetRef.current = 0;
                directionRef.current = 1; // reverse to right
            }

            scrollRef.current?.scrollTo({ x: offsetRef.current, animated: false });
        }, intervalMs);

        return () => clearInterval(id);
    }, [maxScroll]);

    if (Platform.OS === "ios") {
      return <Redirect href={"/signup"}/>
    }

    return (
        <ScrollView style={{ width, height, backgroundColor: Colors.primary }}>
            <Image
                source={require('../assets/images/Background-1.png')}
                contentFit="cover"
                transition={1000}
                style={{
                    position: 'absolute',
                    width: width,
                    height: height * 0.7,
                    opacity: 0.8,
                    zIndex: -100
                }}
            />
            <View style={{ width: width, height: height * 0.7, backgroundColor: 'rgba(0, 0, 0, 0.2)'}}>
                <View style={{ margin: 'auto' }}>
                    <Text
                        style={{
                            fontFamily: 'Pacifico',
                            color: Colors.light,
                            fontSize: 60,
                            textAlign: 'center',
                            textShadowColor: 'rgba(0, 0, 0, 0.9)',
                            textShadowOffset: { width: 0, height: 0 },
                            textShadowRadius: 5
                        }}>
                        Smarter Sleep Starts Here
                    </Text>
                    <Text
                        style={{
                            fontFamily: DEFAULT_FONT,
                            color: Colors.light,
                            fontSize: 25,
                            marginHorizontal: 'auto',
                            textShadowColor: 'rgba(0,0,0,0.9)',
                            textShadowOffset: { width: 0, height: 0 },
                            textShadowRadius: 5
                        }}>
                        Personalized insights that learn from your nights and help you rest better.
                    </Text>
                    <Link href="/home" style={{marginHorizontal: 'auto'}}>
                        <Pressable style={{paddingHorizontal: 15, backgroundColor: Colors.secondary, height: 60, width: 100, borderRadius: 30, marginVertical: 10, marginHorizontal: 'auto'}}>
                            <Text style={{fontFamily: DEFAULT_FONT, color: Colors.light, fontSize: 20, margin: 'auto'}}>Go!</Text>
                        </Pressable>
                    </Link>
                </View>

                <LinearGradient
                    colors={["rgba(0,0,0,0)", "rgba(31,44,123,1)"]}
                    style={{
                        position: "absolute",
                        bottom: 0,
                        height: 80,
                        left: 0,
                        right: 0,
                    }}
                    pointerEvents="none"
                />
            </View>
            <LinearGradient
                colors={['#1f2c7b', '#0e1635', '#050816']}
                locations={[0, 0.55, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{ padding: 15 }}>
                <Text
                    style={{
                        color: Colors.light,
                        fontFamily: DEFAULT_FONT,
                        fontSize: 30,
                        marginHorizontal: 'auto',
                        marginBottom: 25,
                        marginTop: 15
                    }}>
                    We&apos;re here to help you fix your sleep!
                </Text>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ marginHorizontal: 'auto' }}>
                        <AdviceIcon width={height * 0.2} height={height * 0.2} color="#d6ce51" />
                        <Text
                            style={{
                                color: Colors.light,
                                fontFamily: DEFAULT_FONT,
                                fontSize: 20,
                                flexDirection: 'row',
                                marginHorizontal: 'auto'
                            }}>
                            Sleep Advice
                        </Text>
                    </View>
                    <View>
                        <SleepIcon width={height * 0.2} height={height * 0.2} color="rgb(60, 63, 255)" />
                        <Text
                            style={{
                                color: Colors.light,
                                fontFamily: DEFAULT_FONT,
                                fontSize: 20,
                                flexDirection: 'row',
                                marginHorizontal: 'auto'
                            }}>
                            Sleep Tracking
                        </Text>
                    </View>
                    <View style={{ marginHorizontal: 'auto' }}>
                        <TVIcon width={height * 0.2} height={height * 0.2} color="rgb(150, 150, 150)" />
                        <Text
                            style={{
                                color: Colors.light,
                                fontFamily: DEFAULT_FONT,
                                fontSize: 20,
                                flexDirection: 'row',
                                marginHorizontal: 'auto'
                            }}>
                            Sleep Content
                        </Text>
                    </View>
                </View>

                <Text
                    style={{
                        color: Colors.light,
                        fontFamily: DEFAULT_FONT,
                        fontSize: 30,
                        marginHorizontal: 'auto',
                        marginTop: height * 0.05,
                        marginBottom: height * 0.025
                    }}>
                    Why choose Somnia
                </Text>
                <Text
                    style={{
                        color: Colors.light,
                        fontFamily: DEFAULT_FONT,
                        fontSize: 20,
                        width: '70%',
                        marginHorizontal: 'auto',
                        textAlign: 'center'
                    }}>
                    Our machine learning model built from the ground up gives you advice that you can&apos;t find anywhere
                    else. Quickly enter small amounts of information and get pointed to the right resources to
                    help you fix your sleep. Best part, this is all free, no sign up needed.
                </Text>

                <Text
                    style={{
                        color: Colors.light,
                        fontFamily: DEFAULT_FONT,
                        fontSize: 30,
                        marginHorizontal: 'auto',
                        marginTop: height * 0.05,
                        marginBottom: height * 0.025
                    }}>
                    How it works
                </Text>

                <View style={{ marginTop: 18, gap: 10, marginHorizontal: 'auto' }}>
                    {[
                        { step: '1', text: 'Do a quick sleep check-in (2 minutes).' },
                        { step: '2', text: 'Get a clear plan: what to change tonight and why.' },
                        { step: '3', text: 'Track progress and adjust over time.' }
                    ].map((s) => (
                        <View
                            key={s.step}
                            style={{
                                flexDirection: 'row',
                                gap: 10,
                                borderWidth: 1,
                                borderColor: Colors.light,
                                borderRadius: 14,
                                padding: 12
                            }}>
                            <Text style={{ color: Colors.light, fontFamily: DEFAULT_FONT, fontSize: 24 }}>
                                {s.step}.
                            </Text>
                            <Text
                                style={{
                                    color: Colors.light,
                                    fontFamily: DEFAULT_FONT,
                                    flex: 1,
                                    opacity: 0.95,
                                    fontSize: 24
                                }}>
                                {s.text}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={{ marginTop: 28 }}>
                    <Text style={styles.sectionTitle}>Over 2 million 5-star reviews.</Text>

                    <ScrollView
                        ref={scrollRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.row}
                        onLayout={(e) => setContainerW(e.nativeEvent.layout.width)}
                        onContentSizeChange={(w) => setContentW(w)}
                    >
                        {TESTIMONIALS.map((t, i) => (
                            <TestimonialCard
                                key={`${t.author}-${i}`}
                                quote={t.quote}
                                author={t.author}
                                stars={t.stars}
                                width={cardW}
                                height={cardH}
                            />
                        ))}
                    </ScrollView>
                </View>
            </LinearGradient>
        </ScrollView>
    );
}
