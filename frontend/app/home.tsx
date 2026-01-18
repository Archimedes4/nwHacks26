// app/home.tsx
import React, { useEffect, useState } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet, Alert,
    TextInput, ScrollView, KeyboardAvoidingView, Platform, useWindowDimensions
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Colors, DEFAULT_FONT } from "../types";
import { supabase } from "@/functions/supabase";
import { getProfileDefaults, upsertProfileDefaults } from "@/functions/user";
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
        (async () => {
            try {
                const defaults = await getProfileDefaults();
                setForm(prev => ({
                    ...prev,
                    gender: defaults.gender ?? prev.gender,
                    age: defaults.age != null ? String(defaults.age) : prev.age,
                }));
            } catch {
                // ignore
            }
        })();
    }, []);

    const persistDefaults = async (next: Partial<FormState>) => {
        try {
            const payload: any = {};
            if (typeof next.gender === "string") payload.gender = next.gender as "Male" | "Female";
            if (typeof next.age === "string") payload.age = parseInt(next.age);
            if (Object.keys(payload).length > 0) await upsertProfileDefaults(payload);
        } catch {
            // ignore
        }
    };

    // Normalize and persist fields
    const updateField = (field: keyof FormState, value: string) => {
        const isGender = field === "gender";
        const cleanValue = isGender ? value : value.replace(/[^0-9.]/g, "");
        const normalized = !isGender && cleanValue === "." ? "0." : cleanValue;
        setForm(prev => {
            const next = { ...prev, [field]: normalized };
            if (field === "gender" || field === "age") {
                void persistDefaults({ [field]: normalized } as Partial<FormState>);
            }
            return next;
        });
    };

    const getError = (field: keyof FormState, value: string | null | undefined) => {
        const required: Array<keyof FormState> = ["gender", "age", "height", "weight", "sleepDuration", "physicalActivity"];
        if (required.includes(field) && (value === "" || value == null)) return "Required";
        if (value && field !== "gender") {
            const num = parseFloat(value);
            if (isNaN(num)) return "Numbers only";
            switch (field) {
                case "age": if (num < 1 || num > 110) return "1-110 only"; break;
                case "restingHeartrate": if (num < 30 || num > 220) return "30-220 BPM"; break;
                case "stressLevel": if (num < 1 || num > 10) return "1-10 only"; break;
                case "sleepDuration": if (num < 1 || num > 24) return "1-24 hrs"; break;
                case "height": if (num < 50 || num > 250) return "50-250 cm"; break;
                case "weight": if (num < 20 || num > 400) return "20-400 kg"; break;
                case "physicalActivity": if (num < 0 || num > 1440) return "0-1440 min"; break;
                default: return null;
            }
        }
        return null;
    };

    // Collect per-field errors
    const collectErrors = () => {
        const fields: Array<keyof FormState> = [
            "gender", "age", "height", "weight", "sleepDuration", "physicalActivity",
            "restingHeartrate", "dailySteps", "stressLevel",
        ];
        const result: Record<keyof FormState, string | null> = {
            gender: null, age: null, height: null, weight: null,
            sleepDuration: null, physicalActivity: null,
            restingHeartrate: null, dailySteps: null, stressLevel: null,
        };
        for (const f of fields) {
            result[f] = getError(f, form[f]);
        }
        return result;
    };

    // Decide whether submission should be blocked
    const hasErrors = () => {
        const errs = collectErrors();
        const required: Array<keyof FormState> = ["gender", "age", "height", "weight", "sleepDuration", "physicalActivity"];
        for (const f of required) {
            if (errs[f]) return true;
        }
        const optional: Array<keyof FormState> = ["restingHeartrate", "dailySteps", "stressLevel"];
        for (const f of optional) {
            if (form[f] && errs[f]) return true;
        }
        return false;
    };

    const handlePress = async () => {
        // Show inline errors
        setShowErrors(true);

        // Block submission if invalid
        if (hasErrors()) {
            Alert.alert("Error", "Please fix validation errors before continuing.");
            return;
        }

        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

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
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(submissionData),
            });

            if (!response.ok) throw new Error("Server rejected the data");
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
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={[styles.headerContainer, {marginTop: 50}]}>
                        <Text style={styles.title}>Health Profile</Text>
                        <Text style={styles.subtitle}>Let Somnia analyze your biological patterns.</Text>
                    </View>

                    <BlurView intensity={Platform.OS === 'ios' ? 25 : 100} tint="dark" style={[styles.glassCard, { width: cardWidth }]}>
                        <View style={styles.grid}>
                            <View style={styles.column}>
                                <Text style={styles.sectionHeader}>Required Metrics</Text>
                                <View style={styles.row}>
                                    {['Male', 'Female'].map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={[styles.selector, form.gender === option && styles.selectedBox, (showErrors && !form.gender) && styles.inputError]}
                                            onPress={() => updateField('gender', option)}
                                        >
                                            <Text style={[styles.selectorText, form.gender === option && styles.selectedText]}>{option}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <View style={styles.row}>
                                    <InputField label="Age" value={form.age} onChangeText={(v: string) => updateField('age', v)} placeholder="Years" showError={showErrors} error={getError('age', form.age)} containerStyle={{flex: 1, marginRight: 12}} />
                                    <InputField label="Sleep" value={form.sleepDuration} onChangeText={(v: string) => updateField('sleepDuration', v)} placeholder="Hrs" showError={showErrors} error={getError('sleepDuration', form.sleepDuration)} containerStyle={{flex: 1}} />
                                </View>
                                <View style={styles.row}>
                                    <InputField label="Height" value={form.height} onChangeText={(v: string) => updateField('height', v)} placeholder="cm" showError={showErrors} error={getError('height', form.height)} containerStyle={{flex: 1, marginRight: 12}} />
                                    <InputField label="Weight" value={form.weight} onChangeText={(v: string) => updateField('weight', v)} placeholder="kg" showError={showErrors} error={getError('weight', form.weight)} containerStyle={{flex: 1}} />
                                </View>
                            </View>

                            <View style={styles.column}>
                                <Text style={styles.sectionHeader}>Activity & Vitals</Text>
                                <InputField label="Active Minutes" value={form.physicalActivity} onChangeText={(v: string) => updateField('physicalActivity', v)} placeholder="Daily total" showError={showErrors} error={getError('physicalActivity', form.physicalActivity)} />
                                <View style={styles.row}>
                                    <InputField label="Resting HR" value={form.restingHeartrate} onChangeText={(v: string) => updateField('restingHeartrate', v)} placeholder="BPM" showError={showErrors} error={getError('restingHeartrate', form.restingHeartrate)} containerStyle={{flex: 1, marginRight: 12}} />
                                    <InputField label="Stress" value={form.stressLevel} onChangeText={(v: string) => updateField('stressLevel', v)} placeholder="1-10" showError={showErrors} error={getError('stressLevel', form.stressLevel)} containerStyle={{flex: 1}} />
                                </View>
                                <InputField label="Daily Steps" value={form.dailySteps} onChangeText={(v: string) => updateField('dailySteps', v)} placeholder="e.g. 10000" showError={showErrors} error={getError('dailySteps', form.dailySteps)} />
                            </View>
                        </View>

                        <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={handlePress} disabled={loading}>
                            <LinearGradient colors={['#3c3fff', '#1f2c7b']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.buttonGradient}>
                                <Text style={styles.buttonText}>{loading ? "Saving..." : "Generate Analysis"}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </BlurView>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

type InputProps = {
    label: string;
    showError?: boolean;
    error?: string | null;
    containerStyle?: any;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
};

const InputField = ({ label, showError, error, containerStyle, ...props }: InputProps) => (
    <View style={[styles.inputGroup, containerStyle]}>
        <View style={styles.labelRow}><Text style={styles.label}>{label}</Text>{showError && error && <Text style={styles.errorSmall}>{error}</Text>}</View>
        <TextInput style={[styles.input, (showError && error) && styles.inputError]} placeholderTextColor="rgba(255,255,255,0.25)" keyboardType="decimal-pad" {...props} />
    </View>
);

const styles = StyleSheet.create({
    scrollContent: { alignItems: 'center', paddingBottom: 60, paddingTop: 40 },
    headerContainer: { marginBottom: 80, alignItems: 'center' },
    glassCard: {
        padding: 40,
        borderRadius: 44,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        ...Platform.select({
            web: { boxShadow: '0 20px 40px rgba(0,0,0,0.4)' },
            default: { elevation: 10 }
        })
    },
    title: { color: Colors.light, fontFamily: DEFAULT_FONT, fontSize: 48, fontWeight: '900', letterSpacing: -2 },
    subtitle: { color: 'rgba(255, 255, 255, 0.4)', fontFamily: DEFAULT_FONT, fontSize: 20, marginTop: 10, marginHorizontal: 15 },
    grid: { flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 40, marginBottom: 30 },
    column: { flex: 1 },
    sectionHeader: { color: Colors.light, fontSize: 11, textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 24, opacity: 0.35 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    label: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 13, fontWeight: '700' },
    inputGroup: { marginBottom: 18 },
    input: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 18, padding: 16, fontSize: 16, color: Colors.light, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.06)' },
    inputError: { borderColor: '#ff5252', backgroundColor: 'rgba(255, 82, 82, 0.05)' },
    errorSmall: { color: '#ff5252', fontSize: 10, fontWeight: '900' },
    row: { flexDirection: 'row', marginBottom: 4 },
    selector: { flex: 1, padding: 16, borderRadius: 18, marginHorizontal: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', alignItems: 'center' },
    selectedBox: { backgroundColor: Colors.light },
    selectorText: { color: Colors.light, fontWeight: '700' },
    selectedText: { color: '#050816' },
    button: { marginTop: 15, borderRadius: 22, overflow: 'hidden' },
    buttonGradient: { padding: 24, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: '900', fontSize: 20 },
    disabled: { opacity: 0.5 },
});
