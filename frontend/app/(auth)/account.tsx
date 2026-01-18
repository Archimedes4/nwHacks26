import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    Modal,
    Pressable,
    ActivityIndicator,
    useWindowDimensions,
    TouchableOpacity, // Added
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useAuth from "@/hooks/useAuth";
import { Colors, DEFAULT_FONT, loadingStateEnum, userType } from "@/types";
import { getUserInfo, updateUserInfo } from "@/functions/user";
import Onboarding from "@/components/Onboarding";
import HeaderSpacer from "@/components/HeaderSpacer";
import Header from "@/components/Header";
import { LinearGradient } from "expo-linear-gradient";

export default function Account() {
    const { session } = useAuth();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    const [state, setState] = useState(loadingStateEnum.loading);
    const [user, setUser] = useState<userType | undefined>();
    const [editOpen, setEditOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const cardWidth = Math.min(width * 0.95, 850);

    async function loadUser() {
        setState(loadingStateEnum.loading);
        const result = await getUserInfo();
        if (result.result === loadingStateEnum.success) setUser(result.data);
        setState(result.result);
    }

    async function onSaveEdit() {
        if (!user) return;
        try {
            setSaving(true);
            const res = await updateUserInfo(user);
            if (res.result === loadingStateEnum.success) {
                await loadUser();
                setEditOpen(false);
            } else {
                console.warn("Failed to save user details.");
            }
        } catch (e) {
            console.warn("Save error:", e);
        } finally {
            setSaving(false);
        }
    }

    useEffect(() => {
        loadUser();
    }, []);

    if (state === loadingStateEnum.loading) {
        return (
            <View style={[styles.loadingContainer, { paddingTop: insets.top + 24 }]}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (state === loadingStateEnum.failed) {
        return (
            <Onboarding
                done={(name, gender, age, height, weight) => {
                    setUser({
                        uid: "",
                        name,
                        gender: gender as "Male" | "Female",
                        age,
                        height,
                        weight,
                    });
                    setState(loadingStateEnum.success);
                }}
            />
        );
    }

    return (
        <>
            <Header />
            <View style={{ flex: 1, backgroundColor: "#050816" }}>
                <LinearGradient colors={['#1f2c7b', '#0e1635', '#050816']} style={StyleSheet.absoluteFill} />

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={[styles.headerContainer, { marginTop: 50 }]}>
                            <Text style={styles.pageTitle}>Account</Text>
                            <Text style={styles.pageSubtitle}>Manage your profile and settings.</Text>
                        </View>

                        <BlurView intensity={Platform.OS === "ios" ? 25 : 100} tint="dark" style={[styles.glassCard, styles.cardShadow, { width: cardWidth }]}>
                            <View style={styles.cardHeaderRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.title}>Profile</Text>
                                    <Text style={styles.subtitle}>Personal details</Text>
                                </View>
                                <Pressable accessibilityRole="button" onPress={() => setEditOpen(true)} style={styles.editBtn}>
                                    <Text style={styles.editBtnText}>Edit</Text>
                                </Pressable>
                            </View>

                            <View style={styles.profileRow}>
                                <View style={[styles.avatar, styles.avatarBorder]} />
                                <View style={{ flex: 1, marginLeft: 14 }}>
                                    <Text style={styles.profileName}>{user?.name ?? "Unknown"}</Text>
                                    <Text style={styles.profileMeta}>
                                        {user?.gender} • {user?.age}y
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.statsRow}>
                                <View style={styles.stat}>
                                    <Text style={styles.statLabel}>Height</Text>
                                    <Text style={styles.statValue}>{user?.height ?? "-"} cm</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.stat}>
                                    <Text style={styles.statLabel}>Weight</Text>
                                    <Text style={styles.statValue}>{user?.weight ?? "-"} kg</Text>
                                </View>
                            </View>
                        </BlurView>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Edit modal */}
                <Modal transparent animationType="fade" visible={editOpen} onRequestClose={() => setEditOpen(false)}>
                    <View style={styles.modalBackdrop}>
                        <View style={[styles.modalCard, styles.cardShadow]}>
                            <Text style={styles.title}>Edit details</Text>
                            <Text style={styles.subtitle}>Update your profile</Text>

                            <InputField
                                label="Name"
                                placeholder="Your name"
                                defaultValue={user?.name}
                                onChangeText={(v: string) => setUser((u) => (u ? { ...u, name: v } : u))}
                            />

                            {/* Updated Gender Selection */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Gender</Text>
                                <View style={styles.row}>
                                    {['Male', 'Female'].map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={[
                                                styles.selector, 
                                                user?.gender === option && styles.selectedBox
                                            ]}
                                            onPress={() => setUser((u) => (u ? { ...u, gender: option as any } : u))}
                                        >
                                            <Text style={[
                                                styles.selectorText, 
                                                user?.gender === option && styles.selectedText
                                            ]}>
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <InputField
                                label="Age"
                                placeholder="Age"
                                keyboardType="number-pad"
                                defaultValue={user?.age?.toString()}
                                onChangeText={(v: string) => setUser((u) => (u ? { ...u, age: Number(v) || 0 } : u))}
                            />
                            
                            <View style={styles.row}>
                                <InputField
                                    label="Height (cm)"
                                    placeholder="Height"
                                    keyboardType="number-pad"
                                    defaultValue={user?.height?.toString()}
                                    containerStyle={{ flex: 1, marginRight: 12 }}
                                    onChangeText={(v: string) => setUser((u) => (u ? { ...u, height: Number(v) || 0 } : u))}
                                />
                                <InputField
                                    label="Weight (kg)"
                                    placeholder="Weight"
                                    keyboardType="number-pad"
                                    defaultValue={user?.weight?.toString()}
                                    containerStyle={{ flex: 1 }}
                                    onChangeText={(v: string) => setUser((u) => (u ? { ...u, weight: Number(v) || 0 } : u))}
                                />
                            </View>

                            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
                                <Pressable style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setEditOpen(false)} disabled={saving}>
                                    <Text style={styles.modalBtnText}>Cancel</Text>
                                </Pressable>
                                <Pressable style={[styles.modalBtn, styles.modalBtnSave, saving && { opacity: 0.7 }]} onPress={onSaveEdit} disabled={saving}>
                                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Save</Text>}
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </>
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
    scrollContent: { alignItems: "center", paddingBottom: 60, paddingTop: 40 },
    headerContainer: { marginBottom: 80, alignItems: "center" },
    pageTitle: { color: Colors.light, fontFamily: DEFAULT_FONT, fontSize: 48, fontWeight: "900", letterSpacing: -2 },
    pageSubtitle: { color: "rgba(255, 255, 255, 0.4)", fontFamily: DEFAULT_FONT, fontSize: 20, marginTop: 10 },
    glassCard: {
        padding: 40,
        borderRadius: 44,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        overflow: "hidden",
        backgroundColor: "transparent",
    },
    cardShadow: {
        ...Platform.select({
            web: { boxShadow: "0 20px 40px rgba(0,0,0,0.4)" } as any,
            default: { elevation: 10 },
        }),
    },
    title: { color: Colors.light, fontFamily: DEFAULT_FONT, fontSize: 24, fontWeight: "900", letterSpacing: -0.8 },
    subtitle: { color: "rgba(255, 255, 255, 0.55)", fontFamily: DEFAULT_FONT, fontSize: 14, marginTop: 4, marginBottom: 14 },
    cardHeaderRow: { flexDirection: "row", alignItems: "center" },
    editBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.10)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
    },
    editBtnText: { color: Colors.light, fontFamily: DEFAULT_FONT, fontSize: 12, fontWeight: "800", letterSpacing: 0.3 },
    profileRow: { flexDirection: "row", alignItems: "center", marginTop: 8, marginBottom: 8 },
    avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.12)" },
    avatarBorder: { borderWidth: 2, borderColor: "rgba(255,255,255,0.20)" },
    profileName: { color: Colors.light, fontFamily: DEFAULT_FONT, fontSize: 18, fontWeight: "800" },
    profileMeta: { color: "rgba(255,255,255,0.65)", fontFamily: DEFAULT_FONT, fontSize: 12, marginTop: 2 },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    stat: { flex: 1, alignItems: "center" },
    statDivider: { width: 1, height: "100%", backgroundColor: "rgba(255,255,255,0.12)", marginHorizontal: 8, borderRadius: 1 },
    statLabel: { color: "rgba(255,255,255,0.65)", fontFamily: DEFAULT_FONT, fontSize: 12 },
    statValue: { color: Colors.light, fontFamily: DEFAULT_FONT, fontSize: 16, fontWeight: "900", marginTop: 2 },
    labelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    label: { color: "rgba(255, 255, 255, 0.8)", fontFamily: DEFAULT_FONT, fontSize: 13, fontWeight: "700", marginBottom: 8 },
    inputGroup: { marginBottom: 18 },
    input: { backgroundColor: "rgba(255, 255, 255, 0.03)", borderRadius: 18, padding: 16, fontSize: 16, color: Colors.light, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.06)" },
    inputError: { borderColor: "#ff5252", backgroundColor: "rgba(255, 82, 82, 0.05)" },
    errorSmall: { color: "#ff5252", fontSize: 10, fontWeight: "900" },
    
    // Selector Styles from home.tsx
    row: { flexDirection: 'row', marginBottom: 4 },
    selector: { flex: 1, padding: 16, borderRadius: 18, marginHorizontal: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', alignItems: 'center' },
    selectedBox: { backgroundColor: Colors.light },
    selectorText: { color: Colors.light, fontWeight: '700', fontFamily: DEFAULT_FONT },
    selectedText: { color: '#050816' },

    loadingContainer: { flex: 1, backgroundColor: "#050816", justifyContent: "center", alignItems: "center" },
    loadingText: { color: Colors.light, fontFamily: DEFAULT_FONT, fontSize: 16 },
    modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", padding: 24 },
    modalCard: {
        width: "100%",
        maxWidth: 520,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
        backgroundColor: "rgba(10,12,24,0.95)",
        padding: 20,
    },
    modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: "center", borderWidth: 1 },
    modalBtnCancel: { backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.18)" },
    modalBtnSave: { backgroundColor: Colors.blue, borderColor: Colors.blue },
    modalBtnText: { color: Colors.light, fontFamily: DEFAULT_FONT, fontSize: 14, fontWeight: "900" },
});