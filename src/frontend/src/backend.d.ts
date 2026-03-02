import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UrgeLog {
    id: bigint;
    note: string;
    timestamp: bigint;
    intensity: bigint;
    triggers: Array<string>;
}
export interface CheckIn {
    id: bigint;
    wasClean: boolean;
    date: string;
    note: string;
}
export interface JournalEntry {
    id: bigint;
    content: string;
    date: string;
    timestamp: bigint;
}
export interface Stats {
    journalCount: bigint;
    totalDaysClean: bigint;
    longestStreak: bigint;
    urgeCount: bigint;
    currentStreak: bigint;
}
export interface Milestone {
    id: string;
    milestoneLabel: string;
    earned: boolean;
    daysRequired: bigint;
}
export interface UserProfile {
    lastCheckInDate?: string;
    longestStreak: bigint;
    recoveryStartDate?: bigint;
    currentStreak: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addJournalEntry(content: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCheckIns(): Promise<Array<CheckIn>>;
    getJournalEntries(): Promise<Array<JournalEntry>>;
    getMilestones(): Promise<Array<Milestone>>;
    getProfile(): Promise<{
        lastCheckInDate?: string;
        longestStreak: bigint;
        recoveryStartDate?: bigint;
        currentStreak: bigint;
    }>;
    getStats(): Promise<Stats>;
    getUrgeLogs(): Promise<Array<UrgeLog>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    logUrge(intensity: bigint, triggers: Array<string>, note: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setRecoveryStartDate(startDateStr: string): Promise<void>;
    submitCheckIn(date: string, wasClean: boolean, note: string): Promise<void>;
}
