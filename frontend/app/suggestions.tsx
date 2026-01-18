import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Platform,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { supabase } from '@/functions/supabase';
import { Colors, DEFAULT_FONT } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SleepRecord = {
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

const GEMINI_API_KEY = 'AIzaSyBy8H1M6V7OCv2TFDjV3ejH61VDzRhDcGU';

async function generateGeminiSuggestions(record: SleepRecord): Promise<string[]> {
const prompt = `
You are a sleep health assistant.

Return ONLY valid JSON in the following format:
{
  "insights": [
    "string",
    "string",
    "string"
  ]
}

Rules:
- 3 to 5 insights
- Each insight must be a complete sentence
- Each insight must explain WHY and HOW to improve sleep
- No markdown
- No extra text

Sleep data:
Sleep quality: ${record.sleepQuality}
Sleep duration (hours): ${record.sleepDuration}
Resting heart rate: ${record.restingHeartrate}
Daily steps: ${record.dailySteps}
Stress level: ${record.stressLevel}
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
                    maxOutputTokens: 512,
                },
            }),
        }
    );

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    console.log('Gemini raw response:', JSON.stringify(json, null, 2));

    return text
        .split('\n')
        .map(s => s.replace(/^[-•]\s*/, '').trim())
        .filter(Boolean);
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
                        </>
                    )}
                </BlurView>

                <BlurView intensity={Platform.OS === 'ios' ? 25 : 100} tint="dark" style={[styles.glassCard, { width: cardWidth }]}>
                    <Text style={styles.sectionHeader}>AI suggestions</Text>

                    {aiLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : aiSuggestions.length === 0 ? (
                        <Text style={styles.emptyText}>No suggestions available</Text>
                    ) : (
                        aiSuggestions.map((s, i) => (
                            <View key={i} style={styles.suggestionRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.suggestionText}>{s}</Text>
                            </View>
                        ))
                    )}
                </BlurView>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent: { alignItems: 'center', paddingBottom: 60, paddingTop: 40 },
    headerContainer: { marginBottom: 40, alignItems: 'center' },
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
    title: { color: Colors.light, fontFamily: DEFAULT_FONT, fontSize: 40, fontWeight: '900' },
    subtitle: { color: 'rgba(255,255,255,0.4)', fontFamily: DEFAULT_FONT, fontSize: 16, marginTop: 8 },
    sectionHeader: { color: Colors.light, fontSize: 11, letterSpacing: 2.5, marginBottom: 16, opacity: 0.35 },
    errorText: { color: '#ff5252' },
    emptyText: { color: 'rgba(255,255,255,0.6)' },
    row: { flexDirection: 'row', gap: 14, marginBottom: 10 },
    metric: {
        flex: 1,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    metricLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 6 },
    metricValue: { color: Colors.light, fontSize: 18 },
    suggestionRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 10 },
    bullet: { color: Colors.light, fontSize: 18, lineHeight: 22 },
    suggestionText: { flex: 1, color: Colors.light, fontSize: 16 },
});
