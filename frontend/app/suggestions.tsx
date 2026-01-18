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
    sleepQuality: number | null;
    gender: string | null;
};

const GEMINI_API_KEY = 'AIzaSyCK14fbp6iiBUUWk_B9bU2C5eknFZHVJsM';

async function generateGeminiSuggestions(record: SleepRecord): Promise<string[]> {
    const prompt = `
You are a sleep health assistant.
Generate 3–5 short, actionable sleep improvement suggestions.
Use bullet points. Be concise. No disclaimers.
Don't use any markdown symbols that can not be rendered as simple text
Sleep data:
- Sleep quality: ${record.sleepQuality ?? 'unknown'}
- Sleep duration (hours): ${record.sleepDuration ?? 'unknown'}
- Resting heart rate: ${record.restingHeartrate ?? 'unknown'}
- Daily steps: ${record.dailySteps ?? 'unknown'}
- Stress level: ${record.stressLevel ?? 'unknown'}
`;

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 1000,
                },
            }),
        }
    );

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    return text
    .replace(/\*\*(.*?)\*\*/g, '$1')     // **bold**
    .replace(/\*(.*?)\*/g, '$1')          // *italic*
    .replace(/`(.*?)`/g, '$1')            // inline code
    .replace(/^#+\s*/gm, '')              // headers
    .split(/\n+|\d+\.\s+/)                // bullets OR numbered lists
    .map(s => s.replace(/^[-•]\s*/, '').trim())
    .filter(s => s.length > 10);

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

    const processDisorder = (level: number) => {
        if (level > 1.5) {
            return "You may be at an increased risk of sleep apnea";
        }

        if (level > 0.5) {
            return "You may be at an increased risk of insomnia";
        }

        return "Our proprietary models predict you are at perfect health";
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

                if (latest) {
                    setAiLoading(true);
                    const ai = await generateGeminiSuggestions(latest);
                    setAiSuggestions(ai);
                }
            } catch (e: any) {
                setError(e.message || 'Failed to load data');
                setRecord(null);
                setAiSuggestions([]);
            } finally {
                setLoading(false);
                setAiLoading(false);
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
                    <Text style={styles.title}>Latest Insight</Text>
                    <Text style={styles.subtitle}>
                        Your most recent sleep entry and AI-powered suggestions.
                    </Text>
                </View>

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
                                    <Text style={styles.metricValue}>{record.sleepQuality ?? '-'}</Text>
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
                                    <Text style={styles.metricLabel}>Sleep Disorder Diagnosis</Text>
                                    <Text style={styles.metricValue}>{processDisorder(record.disorderLevel) ?? '-'}</Text>
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