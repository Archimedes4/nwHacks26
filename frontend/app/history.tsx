import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Polyline, Line, G, Text as SvgText, Circle } from 'react-native-svg';
import { Colors, DEFAULT_FONT } from '../types';
import { supabase } from '@/functions/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SleepRecord = {
    id: string; // UUID
    uid: string; // UUID of user
    created_at: string; // Timestamp with TZ
    date: string; // Timestamp with TZ
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

export default function Records() {
    const { width } = useWindowDimensions();
    const cardWidth = Math.min(width * 0.95, 1000);

    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState<SleepRecord[]>([]);
    const [error, setError] = useState<string | null>(null);

    const insets = useSafeAreaInsets();

    useEffect(() => {
        const fetchRecords = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const authUid = session?.user?.id; // Supabase auth user UUID
                if (!authUid) {
                    setError('Not authenticated');
                    setRecords([]);
                    return;
                }

                // Optional: if your table stores a different uid, try session.user.user_metadata.uid
                const userUid = session?.user?.user_metadata?.uid || authUid;
                const { data, error, count } = await supabase
                    .from('insights')
                    .select('*', { count: 'exact' })
                    .eq('uid', userUid)
                    .order('created_at', { ascending: true }); // Changed from 'date'
                console.log("Querying for UID:", userUid);
                if (error) throw error;

                const rows = (data || []) as SleepRecord[];
                // Basic sanity filter to exclude obviously bad rows
                const normalized = rows.filter(r => r.id && r.uid);

                // Diagnostics to help verify what’s returned
                console.log('[records] authUid=', authUid, 'userUid=', userUid, 'count=', count, 'rows=', normalized.length);

                setRecords(normalized);
            } catch (e: any) {
                setError(e.message || 'Failed to load records');
                setRecords([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, []);



    const chartData = useMemo(() => {
        const points = records.map((r, i) => ({
            x: i,
            y: r.sleepQuality ?? 0,
            label: r.date ? new Date(r.date).toLocaleDateString() : '',
        }));
        const yVals = points.map(p => p.y);
        const minY = yVals.length ? Math.min(...yVals) : 0;
        const maxY = yVals.length ? Math.max(...yVals) : 100;
        return { points, minY, maxY };
    }, [records]);

    const Chart = () => {
        const height = 240;
        const padding = 28;
        const width = Math.min(cardWidth - 80, 900);

        if (!chartData.points.length) {
            return <Text style={styles.emptyText}>No sleep quality data</Text>;
        }

        const xStep = (width - padding * 2) / Math.max(chartData.points.length - 1, 1);
        const yRange = chartData.maxY - chartData.minY || 1;
        const scaleY = (val: number) => {
            const norm = (val - chartData.minY) / yRange;
            return height - padding - norm * (height - padding * 2);
        };
        const scaleX = (idx: number) => padding + idx * xStep;
        const polyPoints = chartData.points.map((p, i) => `${scaleX(i)},${scaleY(p.y)}`).join(' ');

        const ticks = 4;
        const yTicks = Array.from({ length: ticks + 1 }, (_, i) => {
            const val = chartData.minY + (i * (chartData.maxY - chartData.minY)) / ticks;
            return { y: scaleY(val), val: Math.round(val) };
        });

        return (
            <Svg width={width} height={height}>
                <Line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
                <Line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
                <G>
                    {yTicks.map((t, idx) => (
                        <G key={idx}>
                            <Line x1={padding} y1={t.y} x2={width - padding} y2={t.y} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                            <SvgText x={padding - 8} y={t.y} fill="rgba(255,255,255,0.6)" fontSize={10} textAnchor="end">{t.val}</SvgText>
                        </G>
                    ))}
                </G>
                <Polyline points={polyPoints} fill="none" stroke="#3c3fff" strokeWidth={3} />
                {chartData.points.map((p, i) => (
                    <Circle key={i} cx={scaleX(i)} cy={scaleY(p.y)} r={3} fill="#3c3fff" />
                ))}
                {chartData.points.map((p, i) => {
                    if (i % 3 !== 0 && i !== chartData.points.length - 1) return null;
                    return (
                        <SvgText key={`x-${i}`} x={scaleX(i)} y={height - padding + 14} fill="rgba(255,255,255,0.6)" fontSize={9} textAnchor="middle">
                            {p.label}
                        </SvgText>
                    );
                })}
            </Svg>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#050816', paddingTop: insets.top }}>
            <LinearGradient colors={['#1f2c7b', '#0e1635', '#050816']} style={StyleSheet.absoluteFill} />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.headerContainer, { marginTop: 50 }]}>
                    <Text style={styles.title}>Your Sleep History</Text>
                    <Text style={styles.subtitle}>Visualize sleep quality over time and review metrics.</Text>
                </View>

                <BlurView intensity={Platform.OS === 'ios' ? 25 : 100} tint="dark" style={[styles.glassCard, { width: cardWidth }]}>
                    <Text style={styles.sectionHeader}>Sleep Quality Trend</Text>
                    {loading ? <ActivityIndicator color="#fff" /> : error ? <Text style={styles.errorText}>{error}</Text> : <Chart />}
                </BlurView>

                <BlurView intensity={Platform.OS === 'ios' ? 25 : 100} tint="dark" style={[styles.glassCard, { width: cardWidth }]}>
                    <Text style={styles.sectionHeader}>Metrics Table</Text>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : records.length === 0 ? (
                        <Text style={styles.emptyText}>No records</Text>
                    ) : (
                        <View style={styles.table}>
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={[styles.cell, styles.cellDate]}>Date</Text>
                                <Text style={styles.cell}>Quality</Text>
                                <Text style={styles.cell}>Sleep (h)</Text>
                                <Text style={styles.cell}>Rest HR</Text>
                                <Text style={styles.cell}>Steps</Text>
                                <Text style={styles.cell}>Stress</Text>
                            </View>
                            {records.map((r) => (
                                <View key={r.id} style={styles.tableRow}>
                                    <Text style={[styles.cell, styles.cellDate]}>{r.date ? new Date(r.date).toLocaleDateString() : '-'}</Text>
                                    <Text style={styles.cell}>{r.sleepQuality ?? '-'}</Text>
                                    <Text style={styles.cell}>{r.sleepDuration ?? '-'}</Text>
                                    <Text style={styles.cell}>{r.restingHeartrate ?? '-'}</Text>
                                    <Text style={styles.cell}>{r.dailySteps ?? '-'}</Text>
                                    <Text style={styles.cell}>{r.stressLevel ?? '-'}</Text>
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
    sectionHeader: { color: Colors.light, fontSize: 11, textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 16, opacity: 0.35, marginHorizontal: 15 },
    errorText: { color: '#ff5252' },
    emptyText: { color: 'rgba(255,255,255,0.6)' },
    table: { marginTop: 8 },
    tableRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
    tableHeader: { backgroundColor: 'rgba(255,255,255,0.04)' },
    cell: { flex: 1, color: Colors.light, fontSize: 13 },
    cellDate: { flex: 1.4 },
});
