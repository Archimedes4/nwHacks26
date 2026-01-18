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
    const [gender, setGender] = useState<'Male' | 'Female' | ''>('');
    // Use strings for inputs to allow placeholders to work correctly
    const [userHeight, setUserHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [age, setAge] = useState('');
    
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const cardWidth = Math.min(width * 0.95, 850);

    async function loadCreateUser() {
        setError(undefined);
        const h = parseInt(userHeight);
        const w = parseInt(weight);
        const a = parseInt(age);

        if (!name.trim()) return setError('Name is required');
        if (!gender) return setError('Please select a gender');
        if (isNaN(a) || isNaN(h) || isNaN(w) || a <= 0 || h <= 0 || w <= 0) {
            return setError('Enter valid Age, Height and Weight');
        }

        try {
            setSaving(true);
            const result = await createUser(name, gender, a, h, w);
            if (result.result === loadingStateEnum.success) {
                done(name, gender, a, h, w);
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
            <HeaderSpacer />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* Profile Summary Card */}
                    <BlurView intensity={Platform.OS === 'ios' ? 25 : 100} tint="dark" style={[styles.glassCard, styles.cardShadow, { width: cardWidth }]}>
                        <Text style={styles.title}>Profile</Text>
                        <Text style={styles.subtitle}>Personal details</Text>

                        <InputField label="Name" placeholder="Your name" value={name} onChangeText={setName} />
                        
                        <Text style={styles.label}>Gender</Text>
                        <View style={styles.genderToggleRow}>
                            {['Male', 'Female'].map((option) => (
                                <Pressable 
                                    key={option}
                                    onPress={() => setGender(option as any)}
                                    style={[styles.genderOption, gender === option && styles.genderOptionActive]}
                                >
                                    <Text style={[styles.genderText, gender === option && styles.genderTextActive]}>{option}</Text>
                                </Pressable>
                            ))}
                        </View>

                        <View style={styles.statsRow}>
                            <StatBox label="Height" value={userHeight ? `${userHeight} cm` : '-'} />
                            <View style={styles.statDivider} />
                            <StatBox label="Weight" value={weight ? `${weight} kg` : '-'} />
                            <View style={styles.statDivider} />
                            <StatBox label="Age" value={age ? `${age}y` : '-'} />
                        </View>
                    </BlurView>

                    {/* Numerical Inputs Card */}
                    <BlurView intensity={Platform.OS === 'ios' ? 25 : 100} tint="dark" style={[styles.glassCard, styles.cardShadow, { width: cardWidth, marginTop: 20 }]}>
                        <Text style={styles.title}>Measurements</Text>
                        <Text style={styles.subtitle}>Help us calculate your metrics</Text>

                        <InputField label="Height (cm)" placeholder="e.g. 180" keyboardType="number-pad" value={userHeight} onChangeText={setUserHeight} />
                        <InputField label="Weight (kg)" placeholder="e.g. 75" keyboardType="number-pad" value={weight} onChangeText={setWeight} />
                        <InputField label="Age" placeholder="e.g. 25" keyboardType="number-pad" value={age} onChangeText={setAge} />

                        {error && <Text style={styles.errorMain}>{error}</Text>}

                        <Pressable style={({pressed}) => [styles.buttonInner, {opacity: pressed || saving ? 0.7 : 1}]} onPress={loadCreateUser} disabled={saving}>
                            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Complete Profile</Text>}
                        </Pressable>
                        
                        {Platform.OS === "ios" && <SignOutButton style={{marginTop: 15, marginHorizontal: 0}}/>}
                    </BlurView>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

// Sub-components for cleaner JSX
function StatBox({ label, value }: { label: string, value: string }) {
    return (
        <View style={styles.stat}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
        </View>
    );
}

function InputField({ label, containerStyle, ...props }: any) {
    return (
        <View style={[styles.inputGroup, containerStyle]}>
            <Text style={styles.label}>{label}</Text>
            <TextInput style={styles.input} placeholderTextColor="rgba(255,255,255,0.25)" {...props} />
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent: { alignItems: 'center', paddingBottom: 60, paddingTop: 20 },
    glassCard: {
        padding: 30,
        borderRadius: 35,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    cardShadow: {
        ...Platform.select({
            web: { boxShadow: '0 20px 40px rgba(0,0,0,0.4)' } as any,
            default: { elevation: 10 },
        }),
    },
    title: { color: Colors.light, fontFamily: DEFAULT_FONT, fontSize: 22, fontWeight: '900' },
    subtitle: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 13, marginBottom: 20 },
    
    label: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 13, fontWeight: '700', marginBottom: 8 },
    inputGroup: { marginBottom: 16 },
    input: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 15, padding: 14, fontSize: 16, color: Colors.light, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
    
    genderToggleRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    genderOption: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    genderOptionActive: { backgroundColor: '#fff', borderColor: '#fff' },
    genderText: { color: 'rgba(255,255,255,0.6)', fontWeight: '700' },
    genderTextActive: { color: '#000' },

    statsRow: { flexDirection: 'row', marginTop: 10, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    stat: { flex: 1, alignItems: 'center' },
    statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 5 },
    statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
    statValue: { color: Colors.light, fontSize: 15, fontWeight: '800', marginTop: 2 },

    errorMain: { color: '#ff5252', fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: 15 },
    buttonInner: { padding: 18, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', marginTop: 10 },
    buttonText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});