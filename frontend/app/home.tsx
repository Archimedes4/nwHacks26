import React, { useEffect, useState } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet, Alert,
    TextInput, ScrollView, KeyboardAvoidingView, Platform, useWindowDimensions
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Colors, DEFAULT_FONT } from "../types";
import { supabase } from "@/functions/supabase";
import { getProfileDefaults } from "@/functions/user";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FormState = {
    gender: string;
    age: string;
    height: string;
    weight: string;
    sleepDuration: string;
    physicalActivity: string;
    restingHeartrate: string;
    dailySteps: string;
    stressLevel: string;
};

export default function Home() {
    const { width } = useWindowDimensions();
    const [loading, setLoading] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const cardWidth = Math.min(width * 0.95, 850);
    const insets = useSafeAreaInsets();

    const [form, setForm] = useState<FormState>({
        gender: "", age: "", height: "", weight: "",
        sleepDuration: "", physicalActivity: "",
        restingHeartrate: "", dailySteps: "", stressLevel: "",
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const defaults = await getProfileDefaults();
                
                // DEBUG: Check your terminal to see if data is actually arriving
                console.log("Fetched Profile Data:", defaults);

                setForm(prev => ({
                    ...prev,
                    gender: defaults?.gender ?? "Male",
                    age: defaults?.age ? String(defaults.age) : "—",
                    height: defaults?.height ? String(defaults.height) : "—",
                    weight: defaults?.weight ? String(defaults.weight) : "—",
                }));
            } catch (err) {
                console.error("Critical Error: Could not load profile", err);
            }
        };

        loadProfile();
    }, []);

    const updateField = (field: keyof FormState, value: string) => {
        const cleanValue = value.replace(/[^0-9.]/g, "");
        const normalized = cleanValue === "." ? "0." : cleanValue;
        setForm(prev => ({ ...prev, [field]: normalized }));
    };

    const getError = (field: keyof FormState, value: string) => {
        const required = ["sleepDuration", "physicalActivity"];
        if (required.includes(field) && !value) return "Required";
        if (value) {
            const num = parseFloat(value);
            if (isNaN(num)) return "Numbers only";
            switch (field) {
                case "restingHeartrate": if (num < 30 || num > 220) return "30-220 BPM"; break;
                case "stressLevel": if (num < 1 || num > 10) return "1-10"; break;
                case "sleepDuration": if (num < 1 || num > 24) return "1-24 hrs"; break;
                case "physicalActivity": if (num < 0 || num > 1440) return "0-1440 min"; break;
                default: return null;
            }
        }
        return null;
    };

    const handlePress = async () => {
        // Prevent submission if profile data is missing
        if (form.age === "—" || form.height === "—" || form.weight === "—") {
            Alert.alert("Missing Profile Info", "We need your age, height, and weight to generate insights. Please update your profile settings.");
            return;
        }

        setShowErrors(true);
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            const submissionData = {
                gender: form.gender,
                age: parseInt(form.age),
                height: parseFloat(form.height),
                weight: parseFloat(form.weight),
                sleepDuration: parseFloat(form.sleepDuration),
                physicalActivity: parseInt(form.physicalActivity),
                restingHeartrate: form.restingHeartrate ? parseInt(form.restingHeartrate) : null,
                dailySteps: form.dailySteps ? parseInt(form.dailySteps) : null,
                stressLevel: form.stressLevel ? parseInt(form.stressLevel) : null,
            };

            const response = await fetch("http://localhost:8082/insights", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${session?.access_token}` 
                },
                body: JSON.stringify(submissionData),
            });

            if (!response.ok) throw new Error("Analysis failed");
            Alert.alert("Success", "Insights generated!");
        } catch (err: any) {
            Alert.alert("Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#050816', paddingTop: insets.top }}>
            <LinearGradient colors={['#1f2c7b', '#0e1635', '#050816']} style={StyleSheet.absoluteFill} />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    
                    <View style={[styles.headerContainer, {marginTop: 50}]}>
                        <Text style={styles.title}>Health Profile</Text>
                        <Text style={styles.subtitle}>Let Somnia analyze biological patterns.</Text>
                    </View>

                    <BlurView intensity={80} tint="dark" style={[styles.glassCard, { width: cardWidth }]}>
                        <View style={styles.grid}>
                            <View style={styles.column}>
                                <Text style={styles.sectionHeader}>Activity Log</Text>
                                <InputField label="Sleep Duration" value={form.sleepDuration} onChangeText={(v: string) => updateField('sleepDuration', v)} placeholder="Total hours" showError={showErrors} error={getError('sleepDuration', form.sleepDuration)} />
                                <InputField label="Exercise Minutes" value={form.physicalActivity} onChangeText={(v: string) => updateField('physicalActivity', v)} placeholder="Mins active" showError={showErrors} error={getError('physicalActivity', form.physicalActivity)} />
                                <InputField label="Daily Steps" value={form.dailySteps} onChangeText={(v: string) => updateField('dailySteps', v)} placeholder="e.g. 10000" showError={showErrors} error={getError('dailySteps', form.dailySteps)} />
                            </View>

                            <View style={styles.column}>
                                <Text style={styles.sectionHeader}>Biometrics</Text>
                                <View style={styles.row}>
                                    <InputField label="Resting HR" value={form.restingHeartrate} onChangeText={(v: string) => updateField('restingHeartrate', v)} placeholder="BPM" showError={showErrors} error={getError('restingHeartrate', form.restingHeartrate)} containerStyle={{flex: 1, marginRight: 12}} />
                                    <InputField label="Stress" value={form.stressLevel} onChangeText={(v: string) => updateField('stressLevel', v)} placeholder="1-10" showError={showErrors} error={getError('stressLevel', form.stressLevel)} containerStyle={{flex: 1}} />
                                </View>
                                
                                <View style={styles.infoBox}>
                                    <Text style={styles.infoText}>Using profile data:</Text>
                                    <Text style={styles.profileStats}>
                                        {form.age}yrs  •  {form.height}cm  •  {form.weight}kg
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={handlePress} disabled={loading}>
                            <LinearGradient colors={['#3c3fff', '#1f2c7b']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.buttonGradient}>
                                <Text style={styles.buttonText}>{loading ? "Analyzing..." : "Generate Analysis"}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </BlurView>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

// ... InputField component remains the same ...

const InputField = ({ label, showError, error, containerStyle, ...props }: any) => (
    <View style={[styles.inputGroup, containerStyle]}>
        <View style={styles.labelRow}>
            <Text style={styles.label}>{label}</Text>
            {showError && error && <Text style={styles.errorSmall}>{error}</Text>}
        </View>
        <TextInput style={[styles.input, (showError && error) && styles.inputError]} placeholderTextColor="rgba(255,255,255,0.2)" keyboardType="decimal-pad" {...props} />
    </View>
);

const styles = StyleSheet.create({
    scrollContent: { alignItems: 'center', paddingBottom: 60, paddingTop: 60 },
    headerContainer: { marginBottom: 60, alignItems: 'center' },
    glassCard: { padding: 32, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' },
    title: { color: '#fff', fontSize: 40, fontWeight: '900', letterSpacing: -1 },
    subtitle: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 18, marginTop: 4 },
    grid: { flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 32, marginBottom: 24 },
    column: { flex: 1 },
    sectionHeader: { color: '#fff', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20, opacity: 0.4 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    label: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 13, fontWeight: '600' },
    inputGroup: { marginBottom: 16 },
    input: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, padding: 14, fontSize: 16, color: '#fff', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
    inputError: { borderColor: '#ff5252' },
    errorSmall: { color: '#ff5252', fontSize: 10, fontWeight: 'bold' },
    row: { flexDirection: 'row' },
    infoBox: { marginTop: 12, padding: 16, borderRadius: 16, backgroundColor: 'rgba(60, 63, 255, 0.1)', borderWidth: 1, borderColor: 'rgba(60, 63, 255, 0.2)' },
    infoText: { color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
    profileStats: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 4 },
    button: { marginTop: 8, borderRadius: 20, overflow: 'hidden' },
    buttonGradient: { padding: 20, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    disabled: { opacity: 0.5 },
});