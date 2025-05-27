import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    commission: number;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    role?: string; // Added role to User interface
    [key: string]: unknown; // This allows for additional properties...
}

export interface CardType {
    id: number;
    title: string;
    active: boolean;
    createdAt: string; // Match case from CardTypes page
    updatedAt: string;
}

// Added PageProps interface
export interface PageProps<T = Record<string, unknown>> {
    auth: Auth;
    ziggy: Config & { location: string };
    flash?: {
        message?: string;
        success?: string;
        error?: string;
        [key: string]: string | undefined;
    };
    errors: Record<string, string>; // For shared errors from session
    // Allow other page-specific props via T or by extending this interface
    [key: string]: any; // Or use T for better type safety for page-specific props
}

// Added Card interface
export interface Card {
    id: number;
    card_number: string;
    balance: string | number; // Balance might be a string from DB
    active: boolean;
    user_id?: number;
    card_type_id?: number;
    expiry_date?: string;
    created_at?: string;
    updated_at?: string;
}


