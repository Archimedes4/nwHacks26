import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, ScrollView, useWindowDimensions } from 'react-native';
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
    sleepDuration: number | null; // hours
    physicalActivity: number | null;
    restingHeartrate: number | null;
    dailySteps: number | null;
    stressLevel: number | null;   // 0-100?
    sleepQuality: number | null;  // 0-100
    gender: string | null;
};

export default function Suggestions() {
    const { width } = useWindowDimensions();
    const cardWidth = Math.min(width * 0.95, 1000);

    const [loading, setLoading] = useState(true);
    const [record, setRecord] = useState<SleepRecord | null>(null);
    const [error, setError] = useState<string | null>(null);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const fetchLatest = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const authUid = session?.user?.id;
                if (!authUid) {
                    setError('Not authenticated');
                    setRecord(null);
                    return;
                }
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
                setError(e.message || 'Failed to load latest record');
                setRecord(null);
            } finally {
                setLoading(false);
            }
        };

        fetchLatest();
    }, []);

    const suggestions = useMemo(() => {
        if (!record) return [];

        const out: string[] = [];
        const q = record.sleepQuality ?? null;
        const hr = record.restingHeartrate ?? null;
        const steps = record.dailySteps ?? null;
        const dur = record.sleepDuration ?? null;
        const stress = record.stressLevel ?? null;

        if (q !== null && q < 50) {
            out.push('Sleep quality is low. Reduce late-evening screen time and keep lights dim 60–90 min before bed.');
        } else if (q !== null && q < 70) {
            out.push('Quality could improve. Keep a consistent bedtime/wake window within ~30 minutes daily.');
        }

        if (dur !== null && dur < 7) {
            out.push('Aim for 7–9 hours. Try moving bedtime earlier by 15 minutes for the next few nights.');
        } else if (dur !== null && dur > 9) {
            out.push('Long sleep duration. If you feel groggy, consider tightening sleep window slightly.');
        }

        if (hr !== null && hr > 70) {
            out.push('Resting HR is elevated. Prioritize hydration and a light wind-down; avoid late caffeine.');
        }

        if (steps !== null && steps < 6000) {
            out.push('Low daytime activity. A 20–30 min walk can improve sleep pressure and quality.');
        }

        if (stress !== null && stress > 60) {
            out.push('High stress. Try 5–10 minutes of box breathing (4-4-4-4) before bed.');
        }

        if (out.length === 0) {
            out.push('Great job. Keep consistent routines and track a few more days for deeper insights.');
        }

        if ([q, hr, steps, dur, stress].some(v => v === null)) {
            out.push('Add more data (duration, HR, steps, stress) to refine recommendations.');
        }

        return out;
    }, [record]);

    return (
        <View style={{ flex: 1, backgroundColor: '#050816', paddingTop: insets.top }}>
            <LinearGradient colors={['#1f2c7b', '#0e1635', '#050816']} style={StyleSheet.absoluteFill} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.headerContainer, { marginTop: 50 }]}>
                    <Text style={styles.title}>Latest Insight</Text>
                    <Text style={styles.subtitle}>Your most recent sleep entry and quick suggestions.</Text>
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
                        <View>
                            <View style={styles.row}>
                                <View style={styles.metric}>
                                    <Text style={styles.metricLabel}>Date</Text>
                                    <Text style={styles.metricValue}>{record.date ? new Date(record.date).toLocaleString() : '-'}</Text>
                                </View>
                                <View style={styles.metric}>
                                    <Text style={styles.metricLabel}>Quality</Text>
                                    <Text style={styles.metricValue}>{record.sleepQuality ?? '-'}</Text>
                                </View>
                                <View style={styles.metric}>
                                    <Text style={styles.metricLabel}>Sleep \((h)\)</Text>
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
                        </View>
                    )}
                </BlurView>

                <BlurView intensity={Platform.OS === 'ios' ? 25 : 100} tint="dark" style={[styles.glassCard, { width: cardWidth }]}>
                    <Text style={styles.sectionHeader}>Personalized suggestions</Text>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : !record ? (
                        <Text style={styles.emptyText}>No suggestions available</Text>
                    ) : (
                        <View style={{ gap: 10 }}>
                            {suggestions.map((s, i) => (
                                <View key={i} style={styles.suggestionRow}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.suggestionText}>{s}</Text>
                                </View>
                            ))}
                        </View>
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
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        marginBottom: 24,
        ...Platform.select({
            web: { boxShadow: '0 20px 40px rgba(0,0,0,0.4)' },
            default: { elevation: 10 },
        }),
    },
    title: { color: Colors.light, fontFamily: DEFAULT_FONT, fontSize: 40, fontWeight: '900', letterSpacing: -1 },
    subtitle: { color: 'rgba(255, 255, 255, 0.4)', fontFamily: DEFAULT_FONT, fontSize: 16, marginTop: 8 },
    sectionHeader: { color: Colors.light, fontSize: 11, textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 16, opacity: 0.35 },
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
    metricLabel: { color: 'rgba(255,255,255,0.6)', fontFamily: DEFAULT_FONT, fontSize: 12, marginBottom: 6 },
    metricValue: { color: Colors.light, fontFamily: DEFAULT_FONT, fontSize: 18 },
    suggestionRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
    bullet: { color: Colors.light, fontSize: 18, lineHeight: 22 },
    suggestionText: { flex: 1, color: Colors.light, fontFamily: DEFAULT_FONT, fontSize: 16, opacity: 0.95 },
});
