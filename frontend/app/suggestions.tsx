import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Platform,
    ScrollView,
    useWindowDimensions,
    TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { supabase } from '@/functions/supabase';
import { Colors, DEFAULT_FONT } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SleepRecord = {
    disorderLevel: number | null;
    id: string;
    uid: string;
    created_at: string;
    date: string;
    age: number | null;
    height: number | null;
    weight: number | null;
    sleepDuration: number | null;
    physicalActivity: number | null;
    restingHeartrate: number | null;
    dailySteps: number | null;
    stressLevel: number | null;
    sleepQuality: number;
    gender: string | null;
};

const GEMINI_API_KEY = 'AIzaSyCK14fbp6iiBUUWk_B9bU2C5eknFZHVJsM';
const OPENROUTER_API_KEY = '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';
const SITE_URL = "https://somnia-e46dc.firebaseapp.com/account"
const SITE_NAME = 'Somnia';

async function generateGeminiSuggestions(record: SleepRecord): Promise<string[]> {
    const prompt = `
You are a sleep health assistant.
Generate 3-5 short, actionable sleep improvement suggestions.
Use bullet points. Be concise. No disclaimers.
Don't use any markdown symbols that can not be rendered as simple text.
Sleep data:
- Sleep quality: ${record.sleepQuality ?? 'unknown'}
- Sleep duration (hours): ${record.sleepDuration ?? 'unknown'}
- Resting heart rate: ${record.restingHeartrate ?? 'unknown'}
- Daily steps: ${record.dailySteps ?? 'unknown'}
- Stress level: ${record.stressLevel ?? 'unknown'}
`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": SITE_URL, // Optional
            "X-Title": SITE_NAME,     // Optional
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "google/gemini-2.0-flash-001", // Or "google/gemini-flash-1.5"
            "messages": [
                { "role": "user", "content": prompt }
            ],
            "temperature": 0.4,
            "max_tokens": 1000
        })
    });

    const json = await res.json();
    
    // OpenRouter uses the OpenAI format: choices[0].message.content
    const text = json?.choices?.[0]?.message?.content ?? '';

    return text
        .replace(/\*\*(.*?)\*\*/g, '$1')     // remove bold
        .replace(/\*(.*?)\*/g, '$1')       // remove italic
        .replace(/`(.*?)`/g, '$1')         // remove code
        .replace(/^#+\s*/gm, '')           // remove headers
        .split(/\n+|\d+\.\s+/)             // split by newlines or numbered lists
        .map((s: string) => s.replace(/^[-•]\s*/, '').trim())
        .filter((s: string) => s.length > 10);
}

export default function Suggestions() {
    const { width } = useWindowDimensions();
    const cardWidth = Math.min(width * 0.95, 1000);
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [record, setRecord] = useState<SleepRecord | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const [aiLoading, setAiLoading] = useState(false);

    const processDisorder = (level: number | null) => {
        if (level == null) {
            return "";
        }

        if (level > 1.5) {
            level -= 1.3;
            const prob = Math.min(0.9, level / 0.5);
            return `Your sleep patterns suggest an elevated likelihood of sleep apnea (approximately ${Math.round(prob * 100)}% confidence).`;
        }

        if (level > 0.5) {
            level -= 0.3;
            const prob = Math.min(0.9, level / 0.5);
            return `Your sleep patterns are consistent with a potential risk of insomnia (approximately ${Math.round(prob * 100)}% confidence).`;
        }

        const prob = Math.max(0, 1 - level / 0.5);
        return `Your sleep patterns do not indicate a significant risk of sleep disorders (${Math.round(prob * 100)}% confidence).`;
    };


    useEffect(() => {
    const fetchLatest = async () => {
        setLoading(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const authUid = session?.user?.id;
            if (!authUid) throw new Error('Not authenticated');

            const userUid = session?.user?.user_metadata?.uid || authUid;

            const { data, error } = await supabase
                .from('insights')
                .select('*')
                .eq('uid', userUid)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) throw error;

            const latest = (data || [])[0] as SleepRecord | undefined;
            setRecord(latest ?? null);

        } catch (e: any) {
            setError(e.message || 'Failed to load data');
            setRecord(null);
            setAiSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    fetchLatest();
}, []);

    const handleGenerateAI = async () => {
        if (!record) return;
        setAiLoading(true);
        try {
            const suggestions = await generateGeminiSuggestions(record);
            setAiSuggestions(suggestions);
        } catch (e) {
            console.error(e);
        } finally {
            setAiLoading(false);
        }
    };


    return (
        <View style={{ flex: 1, backgroundColor: '#050816', paddingTop: insets.top }}>
            <LinearGradient
                colors={['#1f2c7b', '#0e1635', '#050816']}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.headerContainer, { marginTop: 50 }]}>
                    <Text style={styles.title}>Latest Insight by SomniQ</Text>
                    <Text style={styles.subtitle}>
                        Your most recent sleep entry and AI-powered suggestions.
                    </Text>
                </View>

                <BlurView intensity={Platform.OS === 'ios' ? 25 : 100} tint="dark" style={[styles.glassCard, { width: cardWidth }]}>
                    <Text style={styles.sectionHeader}>Introducing SomniQ</Text>
                    <Text style={styles.metricValue}>SomniQ leverages state-of-the-art neural intelligence trained on an Oxford-funded clinical research dataset to deliver next-generation sleep diagnostics. Through extensive fine-tuning and validation, the model learns deep patterns in sleep behavior that traditional approaches often miss, enabling scalable, high-confidence insights for both individuals and care providers.</Text>
                </BlurView>
                <BlurView intensity={Platform.OS === 'ios' ? 25 : 100} tint="dark" style={[styles.glassCard, { width: cardWidth }]}>
                    <Text style={styles.sectionHeader}>Most recent record</Text>

                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : !record ? (
                        <Text style={styles.emptyText}>No records found</Text>
                    ) : (
                        <>
                            <View style={styles.row}>
                                <View style={styles.metric}>
                                    <Text style={styles.metricLabel}>Date</Text>
                                    <Text style={styles.metricValue}>
                                        {record.date ? new Date(record.date).toLocaleString() : '-'}
                                    </Text>
                                </View>
                                <View style={styles.metric}>
                                    <Text style={styles.metricLabel}>Quality</Text>
                                    <Text style={styles.metricValue}>{Math.round(100 * record.sleepQuality)/100}</Text>
                                </View>
                                <View style={styles.metric}>
                                    <Text style={styles.metricLabel}>Sleep (h)</Text>
                                    <Text style={styles.metricValue}>{record.sleepDuration ?? '-'}</Text>
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={styles.metric}>
                                    <Text style={styles.metricLabel}>Rest HR</Text>
                                    <Text style={styles.metricValue}>{record.restingHeartrate ?? '-'}</Text>
                                </View>
                                <View style={styles.metric}>
                                    <Text style={styles.metricLabel}>Steps</Text>
                                    <Text style={styles.metricValue}>{record.dailySteps ?? '-'}</Text>
                                </View>
                                <View style={styles.metric}>
                                    <Text style={styles.metricLabel}>Stress</Text>
                                    <Text style={styles.metricValue}>{record.stressLevel ?? '-'}</Text>
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={styles.metric}>
                                    <Text style={styles.metricLabel}>Sleep Disorder Diagnosis by SomniQ</Text>
                                    <Text style={styles.metricValue}>{processDisorder(record?.disorderLevel) ?? '-'}</Text>
                                </View>
                            </View>
                        </>
                    )}
                </BlurView>
{/* AI Suggestions Card */}
                <BlurView intensity={Platform.OS === 'ios' ? 25 : 100} tint="dark" style={[styles.glassCard, { width: cardWidth }]}>
                    <Text style={styles.sectionHeader}>AI SUGGESTIONS</Text>

                    {aiLoading ? (
                        <ActivityIndicator color="#fff" style={{ marginVertical: 20 }} />
                    ) : aiSuggestions.length === 0 ? (
                        <View style={styles.emptyAiState}>
                            <Text style={styles.emptyText}>Get personalized tips based on your data.</Text>
                            <TouchableOpacity 
                                style={[styles.generateButton, !record && { opacity: 0.5 }]} 
                                onPress={handleGenerateAI}
                                disabled={!record}
                            >
                                <Text style={styles.generateButtonText}>Generate Tips</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            {aiSuggestions.map((s, i) => (
                                <View key={i} style={styles.suggestionRow}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.suggestionText}>{s}</Text>
                                </View>
                            ))}
                            <TouchableOpacity 
                                style={[styles.generateButton, { marginTop: 20, backgroundColor: 'transparent' }]} 
                                onPress={handleGenerateAI}
                            >
                                <Text style={[styles.generateButtonText, { fontSize: 14, opacity: 0.7 }]}>Regenerate Insights</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </BlurView>
            </ScrollView>
        </View>
    );
}
const styles = StyleSheet.create({
    scrollContent: { alignItems: 'center', paddingBottom: 60, paddingTop: 40 },
    headerContainer: { marginBottom: 40, alignItems: 'center', paddingHorizontal: 20 },
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
    title: { color: Colors.light, fontFamily: DEFAULT_FONT, fontSize: 40, fontWeight: '900', textAlign: 'center' },
    subtitle: { color: 'rgba(255,255,255,0.4)', fontFamily: DEFAULT_FONT, fontSize: 16, marginTop: 8, textAlign: 'center' },
    sectionHeader: { color: Colors.light, fontSize: 11, letterSpacing: 2.5, marginBottom: 16, opacity: 0.35 },
    errorText: { color: '#ff5252', textAlign: 'center' },
    emptyText: { color: 'rgba(255,255,255,0.6)', marginBottom: 20, textAlign: 'center' },
    row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    metric: {
        flex: 1,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    metricLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginBottom: 4, textTransform: 'uppercase' },
    metricValue: { color: Colors.light, fontSize: 16, fontWeight: '600' },
    suggestionRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 12 },
    bullet: { color: Colors.light, fontSize: 18, lineHeight: 22 },
    suggestionText: { flex: 1, color: Colors.light, fontSize: 15, lineHeight: 22, opacity: 0.9 },
    
    // Button Styles
    emptyAiState: { alignItems: 'center', justifyContent: 'center' },
    generateButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        width: '100%',
        alignItems: 'center',
    },
    generateButtonText: {
        color: Colors.light,
        fontSize: 16,
        fontWeight: '700',
        fontFamily: DEFAULT_FONT,
    },
});