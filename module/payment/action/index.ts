"use server"

import {auth} from "@/lib/auth";
import {getRemainingLimits, updateUserTier} from "@/module/payment/lib/subscription";
import {headers} from "next/headers";
import prisma from "@/lib/db";
import {polarClient} from "@/module/payment/config/polar";


export interface SubscriptionData {
    user : {
        id : string;
        name : string | null;
        email : string | null;
        subscriptionTier : string | null;
        polarCustomerId : string | null;
        subscriptionStatus : string | null;
        polarSubscriptionId : string | null;
    } | null;
    limits : {
        tier : "FREE" | "PRO";
        repositories : {
            current : number;
            limit : number | null;
            canAdd : boolean;
        };
        reviews : {
            [repositoryId: string]: {
                current : number;
                limit : null | number;
                canAdd : boolean;
            };
        };
    } | null;
}

export async function getSubscriptionData(): Promise<SubscriptionData> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { user: null, limits: null };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user) {
        return { user: null, limits: null };
    }

    const limits = await getRemainingLimits(user.id);

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            subscriptionTier: user.subscriptionTier || "FREE",
            subscriptionStatus: user.subscriptionStatus || null,
            polarCustomerId: user.polarCustomerId || null,
            polarSubscriptionId: user.polarSubscriptionId || null,
        },
        limits,
    };
}

export async function syncUserSubscription() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { success: false };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user || !user.polarCustomerId) {
        return { success: false };
    }

    console.log(user.polarCustomerId);

    // 1️⃣ Fetch latest subscription from Polar
    const subscriptions = await polarClient.subscriptions.list({
        customerId: user.polarCustomerId,
        limit: 1,
    });

    const subscription = subscriptions.result.items[0] ?? null;

    console.log(subscription);

    // 2️⃣ Resolve status
    const isActive =
        subscription?.status === "active" ||
        subscription?.status === "trialing";

    // 3️⃣ Update local DB
    await prisma.user.update({
        where: { id: user.id },
        data: {
            subscriptionTier: isActive ? "PRO" : "FREE",
            subscriptionStatus: subscription?.status?.toUpperCase() ?? null,
            polarSubscriptionId: subscription?.id ?? null,
        },
    });

    return { success: true };
}
