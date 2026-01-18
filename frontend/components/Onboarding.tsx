// File: 'components/Onboarding.tsx'
import { View, Text, KeyboardAvoidingView, ScrollView, StyleSheet, useWindowDimensions, Platform, TextInput, Pressable, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, DEFAULT_FONT, loadingStateEnum } from '@/types';
import { createUser } from '@/functions/user';
import HeaderSpacer from "@/components/HeaderSpacer";
import SignOutButton from './SignOutButton';

export default function Onboarding({ done }: { done: (name: string, gender: string, age: number, height: number, weight: number) => void }) {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const [name, setName] = useState<string>('');
    const [gender, setGender] = useState('');
    const [userHeight, setUserHeight] = useState(0);
    const [weight, setWeight] = useState(0);
    const [age, setAge] = useState(0);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const cardWidth = Math.min(width * 0.95, 850);

    async function loadCreateUser() {
        setError(undefined);
        if (!name.trim()) {
            setError('Name is required');
            return;
        }
        if (gender !== 'Male' && gender !== 'Female') {
            setError('Gender must be Male or Female');
            return;
        }
        if (age <= 0 || userHeight <= 0 || weight <= 0) {
            setError('Enter valid Age, Height and Weight');
            return;
        }

        try {
            setSaving(true);
            const result = await createUser(name, gender, age, userHeight, weight);
            if (result.result === loadingStateEnum.success) {
                done(name, gender, age, userHeight, weight);
            } else {
                setError('Failed to create user');
            }
        } catch {
            setError('Unexpected error');
        } finally {
            setSaving(false);
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#050816', paddingTop: insets.top }}>
            <LinearGradient colors={['#1f2c7b', '#0e1635', '#050816']} style={StyleSheet.absoluteFill} />
            <HeaderSpacer></HeaderSpacer>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Profile details card */}
                    <BlurView intensity={Platform.OS === 'ios' ? 25 : 100} tint="dark" style={[styles.glassCard, styles.cardShadow, { width: cardWidth }]}>
                        <Text style={styles.title}>Profile</Text>
                        <Text style={styles.subtitle}>Personal details</Text>

                        <InputField label="Name" placeholder="Your name" value={name} onChangeText={setName} showError={!!error && !name} />
                        <InputField label="Gender" placeholder="Male/Female" value={gender} onChangeText={setGender} showError={!!error && (gender !== 'Male' && gender !== 'Female')} />
                        <View style={styles.statsRow}>
                            <View style={styles.stat}>
                                <Text style={styles.statLabel}>Height</Text>
                                <Text style={styles.statValue}>{userHeight > 0 ? `${userHeight} cm` : '-'}</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.stat}>
                                <Text style={styles.statLabel}>Weight</Text>
                                <Text style={styles.statValue}>{weight > 0 ? `${weight} kg` : '-'}</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.stat}>
                                <Text style={styles.statLabel}>Age</Text>
                                <Text style={styles.statValue}>{age > 0 ? `${age}y` : '-'}</Text>
                            </View>
                        </View>
                    </BlurView>

                    {/* Inputs card */}
                    <BlurView intensity={Platform.OS === 'ios' ? 25 : 100} tint="dark" style={[styles.glassCard, styles.cardShadow, { width: cardWidth }]}>
                        <Text style={styles.title}>Details</Text>
                        <Text style={styles.subtitle}>Enter your measurements</Text>

                        <InputField
                            label="Height (cm)"
                            placeholder="Height"
                            keyboardType="number-pad"
                            value={userHeight.toString()}
                            onChangeText={(e: string) => {
                                const v = parseInt(e);
                                setUserHeight(Number.isNaN(v) ? 0 : v);
                            }}
                        />
                        <InputField
                            label="Weight (kg)"
                            placeholder="Weight"
                            keyboardType="number-pad"
                            value={weight.toString()}
                            onChangeText={(e: string) => {
                                const v = parseInt(e);
                                setWeight(Number.isNaN(v) ? 0 : v);
                            }}
                        />
                        <InputField
                            label="Age"
                            placeholder="Age"
                            keyboardType="number-pad"
                            value={age.toString()}
                            onChangeText={(e: string) => {
                                const v = parseInt(e);
                                setAge(Number.isNaN(v) ? 0 : v);
                            }}
                        />

                        {error ? <Text style={styles.errorSmall} accessibilityLiveRegion="polite">{error}</Text> : null}

                        <View style={styles.button}>
                            <Pressable style={styles.buttonInner} onPress={loadCreateUser} disabled={saving}>
                                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save info</Text>}
                            </Pressable>
                        </View>
                        {Platform.OS === "ios" &&
                          <SignOutButton style={{marginTop: 15, marginHorizontal: 0}}/>
                        }
                    </BlurView>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

function InputField({ label, showError, error, containerStyle, ...props }: any) {
    return (
        <View style={[styles.inputGroup, containerStyle]}>
            <View style={styles.labelRow}>
                <Text style={styles.label}>{label}</Text>
                {showError && error ? <Text style={styles.errorSmall}>{error}</Text> : null}
            </View>
            <TextInput style={[styles.input, showError && error ? styles.inputError : null]} placeholderTextColor="rgba(255,255,255,0.25)" {...props} />
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent: { alignItems: 'center', paddingBottom: 60, paddingTop: 40 },

    // match 'account' card styles
    glassCard: {
        padding: 40,
        borderRadius: 44,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    cardShadow: {
        ...Platform.select({
            web: { boxShadow: '0 20px 40px rgba(0,0,0,0.4)' } as any,
            default: { elevation: 10 },
        }),
    },

    title: { color: Colors.light, fontFamily: DEFAULT_FONT, fontSize: 24, fontWeight: '900', letterSpacing: -0.8 },
    subtitle: { color: 'rgba(255, 255, 255, 0.55)', fontFamily: DEFAULT_FONT, fontSize: 14, marginTop: 4, marginBottom: 14 },

    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    stat: { flex: 1, alignItems: 'center' },
    statDivider: { width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 8, borderRadius: 1 },
    statLabel: { color: 'rgba(255,255,255,0.65)', fontFamily: DEFAULT_FONT, fontSize: 12 },
    statValue: { color: Colors.light, fontFamily: DEFAULT_FONT, fontSize: 16, fontWeight: '900', marginTop: 2 },

    labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    label: { color: 'rgba(255, 255, 255, 0.8)', fontFamily: DEFAULT_FONT, fontSize: 13, fontWeight: '700' },
    inputGroup: { marginBottom: 18 },
    input: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 18, padding: 16, fontSize: 16, color: Colors.light, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.06)' },
    inputError: { borderColor: '#ff5252', backgroundColor: 'rgba(255, 82, 82, 0.05)' },
    errorSmall: { color: '#ff5252', fontSize: 10, fontWeight: '900' },

    button: { marginTop: 15, borderRadius: 22, overflow: 'hidden' },
    buttonInner: {
        padding: 18,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    buttonText: { color: '#fff', fontFamily: DEFAULT_FONT, fontWeight: '900', fontSize: 18 },
});
