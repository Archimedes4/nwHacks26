import { View, Text, useWindowDimensions, Pressable, StyleSheet, Platform } from 'react-native';
import React, { useState } from 'react';
import { Colors, DEFAULT_FONT } from '../types';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import LandingPage from '@/components/LandingPage';
import { HomeIcon, PersonIcon, SleepIcon, BulbIcon } from '@/components/Icons';
import useAuth from '@/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

export default function Index() {
    const { width, height } = useWindowDimensions();
    const { loading, session } = useAuth();
    const insets = useSafeAreaInsets();

    if ((loading || session === null) && Platform.OS !== "ios") {
        return <LandingPage />;
    }

    return (
        <View style={{ width, height, backgroundColor: Colors.primary }}>
            <Image
                source={require('../assets/images/Background-1.png')}
                contentFit="cover"
                transition={1000}
                style={{ position: 'absolute', top: 0, left: 0, width, height }}
            />
            <View style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', position: 'absolute', width, height }}></View>

            <BlurView intensity={Platform.OS === 'ios' ? 25 : 100} tint="dark" style={[styles.glassCard, { marginHorizontal: 'auto', width: width - 100, height: height * 0.9 - 50, padding: 50, marginTop: height * 0.1 + 30 }]}>
                <Text style={styles.title}>Home</Text>
                <Text style={styles.subtitle}>Quick navigation</Text>

                <View style={styles.grid}>
                    <Link href="/home" asChild>
                        <Pressable style={styles.card}>
                            <HomeIcon width={28} height={28} color={Colors.light} />
                            <Text style={styles.cardText}>Input New Record</Text>
                        </Pressable>
                    </Link>

                    <Link href="/suggestions" asChild>
                        <Pressable style={styles.card}>
                            <BulbIcon width={28} height={28} color={Colors.light} />
                            <Text style={styles.cardText}>Suggestions</Text>
                        </Pressable>
                    </Link>

                    <Link href="/history" asChild>
                        <Pressable style={styles.card}>
                            <SleepIcon width={28} height={28} color={Colors.light} />
                            <Text style={styles.cardText}>History</Text>
                        </Pressable>
                    </Link>

                    <Link href="/account" asChild>
                        <Pressable style={styles.card}>
                            <PersonIcon width={28} height={28} color={Colors.light} />
                            <Text style={styles.cardText}>Account</Text>
                        </Pressable>
                    </Link>
                </View>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        color: Colors.light,
        fontFamily: DEFAULT_FONT,
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 8,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4
    },
    glassCard: {
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 24,
        overflow: 'hidden',
        ...Platform.select({
            web: { boxShadow: '0 20px 40px rgba(0,0,0,0.4)' },
            default: { elevation: 10 },
        }),
    },
    subtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontFamily: DEFAULT_FONT,
        fontSize: 18,
        marginBottom: 16
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,255,0.50)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.50)'
    },
    cardText: {
        color: Colors.light,
        fontFamily: DEFAULT_FONT,
        fontSize: 16,
        fontWeight: '700'
    }
});