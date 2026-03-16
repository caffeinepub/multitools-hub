import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    username: string;
    role: string;
}
export type SessionToken = string;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGreeting(): Promise<string>;
    getProfile(token: SessionToken): Promise<{
        username: string;
        role: string;
    } | null>;
    getTopTools(): Promise<Array<[string, bigint]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdmin(token: SessionToken): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    listUsers(token: SessionToken): Promise<Array<string>>;
    login(username: string, password: string): Promise<string>;
    logout(token: SessionToken): Promise<void>;
    recordUsage(toolId: string): Promise<void>;
    register(username: string, password: string): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
