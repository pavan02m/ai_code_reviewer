import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/db";
import {polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import {polarClient} from "@/module/payment/config/polar";
import {updatePolarCustomerId, updateUserTier} from "@/module/payment/lib/subscription";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    socialProviders:{
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            scope:["repo"]
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }
    },
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: "462d9b04-f83b-4fb6-84e9-1010a71702df",
                            slug: "AI-CODE-REVIEWER" // Custom slug for easy reference in Checkout URL, e.g. /checkout/AI-Code-Reviewer
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL || "/dashboard/subscription?success=true",
                    authenticatedUsersOnly: true
                }),
                portal({
                    returnUrl : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000/dashboard/",
                }),
                usage(),
                webhooks({
                    secret: process.env.POLAR_WEBHOOK_SECRET!,
                    onCustomerStateChanged: async (payload) => {
                        console.log("Received onCustomerStateChanged webhook:", payload);
                    },
                    onSubscriptionActive : async (payload) => {
                        const customerId = payload.data.customerId;

                        // Find the user associated with this customerId
                        const user = await prisma.user.findUnique({
                            where: { polarCustomerId: customerId },
                        });

                        // Update the user's subscription tier to PRO and status to ACTIVE
                        if(user) {
                            await updateUserTier(
                                user.id,
                                "PRO",
                                "ACTIVE",
                                payload.data.id,
                            )
                        }
                    },
                    onSubscriptionCanceled : async (payload) => {
                        const customerId = payload.data.customerId;

                        // Find the user associated with this customerId
                        const user = await prisma.user.findUnique({
                            where: { polarCustomerId: customerId },
                        });

                        // Update the user's subscription tier to CANCELLED
                        if(user) {
                            await updateUserTier(
                                user.id,
                                user.subscriptionTier as any,
                                "CANCELLED",
                            )
                        }
                    },
                    onSubscriptionRevoked : async (payload) => {
                        const customerId = payload.data.customerId;

                        // Find the user associated with this customerId
                        const user = await prisma.user.findUnique({
                            where: { polarCustomerId: customerId },
                        });

                        if(user) {
                            await updateUserTier(
                                user.id,
                                "FREE",
                                "EXPIRED",
                            )
                        }
                    },
                    onOrderPaid: async (payload) => {

                        const customerId = payload.data.customerId;

                        // Find user by Polar customer ID
                        const user = await prisma.user.findUnique({
                            where: { polarCustomerId: customerId },
                        });

                        if (!user) {
                            console.warn("No user found for customerId:", customerId);
                            return;
                        }

                        // Update user subscription details
                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                subscriptionTier: "PRO",
                                subscriptionStatus: "ACTIVE",
                                polarSubscriptionId: payload.data.subscriptionId,
                            },
                        });

                        console.log("Subscription activated for user:", user.id);
                    },

                    onCustomerCreated: async (payload) => {
                        const user = await prisma.user.findUnique({
                            where : {
                                email : payload.data.email
                            }
                        });

                        if(user) {
                            await updatePolarCustomerId(user.id, payload.data.id);
                        }
                    }// Catch-all for all events
                })
            ],
        })
    ],
    trustedOrigins : [
        "http://localhost:3000",
        "https://unfastidious-bobby-unvicariously.ngrok-free.dev"
    ]
});