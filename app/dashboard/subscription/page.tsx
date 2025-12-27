"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Check, X, Loader2, ExternalLink, RefreshCw} from "lucide-react";
import {customer, checkout} from "@/lib/auth-client";
import {useSearchParams} from "next/navigation";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {useQuery} from "@tanstack/react-query";
import {useState, useEffect} from "react";
import {toast} from "sonner";
import {getSubscriptionData, syncUserSubscription} from "@/module/payment/action";
import {Spinner} from "@/components/ui/spinner";

const PLAN_FEATURES = {
    FREE: [
        {
            name: "Up to 5 repositories",
            available: true,
        },
        {
            name: "Up to 5 AI code reviews per repository",
            available: true,
        },
        {
            name: "Basic code review",
            available: true,
        },
        {
            name: "Community support",
            available: true,
        },
        {
            name: "Advanced analytics",
            available: false,
        },
        {
            name: "Priority support",
            available: false,
        }

    ],
    PRO: [
        {
            name: "Up to 5 repositories",
            available: true,
        },
        {
            name: "Up to 5 AI code reviews per repository",
            available: true,
        },
        {
            name: "Basic code review",
            available: true,
        },
        {
            name: "Community support",
            available: true,
        },
        {
            name: "Advanced analytics",
            available: true,
        },
        {
            name: "Priority support",
            available: true,
        }
    ],
}


const SubscriptionPage = () => {

    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [portalLoading, setPortalLoading] = useState(false);
    const [syncLoading, setSyncLoading] = useState(false);
    const searchParams = useSearchParams();
    const success = searchParams.get("success");

    const {data, isLoading, error, refetch} = useQuery({
        queryKey: ['subscription-data'],
        queryFn: getSubscriptionData,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if(success === "true") {
            const sync = async () => {
                try {
                    await syncUserSubscription();
                    refetch();
                } catch (error) {
                    console.error("Failed to sync subscription after success", error);
                }
            }

            sync();
        }
    },[success, refetch]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner className="size-6"/>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Subscription Plans
                    </h1>
                    <p className="text-muted-foreground">
                        Failed to load subscription data. please try again later.
                    </p>
                </div>
                <Alert variant="destructive">
                    <AlertTitle>
                        Error
                    </AlertTitle>
                    <AlertDescription>
                        Failed to load subscription data. please try again later.
                        <Button variant="outline" size="sm" className="ml-4" onClick={() => refetch()}></Button>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    if (!data?.user) {
        return (
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Subscription Plans
                </h1>
                <p className="text-muted-foreground">
                    You need to be logged in to view your subscription.
                </p>
            </div>
        )
    }


    console.log(data);
    const currentTier = data.user.subscriptionTier as "FREE" | "PRO";
    const isPro = currentTier === "PRO";
    const isActive = data.user.subscriptionStatus === "ACTIVE";

    const handleSync = async () => {
        try {
            setSyncLoading(true);
            const result = await syncUserSubscription();

            if(result.success){
                toast.success("Subscription synced successfully");
                refetch();
            } else {
                toast.error("Failed to sync subscription");
            }
        } catch (error) {
            console.error("Failed to sync subscription", error);
            toast.error("Failed to sync subscription");
            setSyncLoading(false);
        }
    }

    const handleUpgrade = async () => {
        try {
            console.log("calling checkout");
            setCheckoutLoading(true);
            await checkout({
                slug: "AI-CODE-REVIEWER",
            })
        } catch (error) {
            console.error("Failed to initiate checkout", error);
            setCheckoutLoading(false);
        } finally {
            setCheckoutLoading(false);
        }
    }

    const handleManageSubscription = async () => {
        try {
            setPortalLoading(true);
            await customer.portal();
        } catch (error) {
            console.error("Failed to launch portal", error);
            setPortalLoading(false);
        } finally {
            setPortalLoading(false);
        }
    }


    const current = Number(data.limits?.repositories.current) || 0;
    const limit = Number(data.limits?.repositories.limit);

    console.log(current, " ", limit);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Title Section */}
                <div className="space-y-1">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Subscription Plans
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-md">
                        Pick a plan that fits your workflow and scale as you grow.
                    </p>
                </div>

                {/* Action */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSync}
                        disabled={syncLoading}
                        className="gap-2"
                    >
                        {syncLoading ? (
                            <Spinner className="size-4 animate-spin"/>
                        ) : (
                            <RefreshCw className="size-4"/>
                        )}
                        <span className="hidden sm:inline">
                Sync Subscription
            </span>
                    </Button>
                </div>
            </div>

            {
                success === "true" && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                        <Check className="h-4 w-4 text-green-500"/>
                        <AlertTitle>
                            Subscription Successful
                        </AlertTitle>
                        <AlertDescription>
                            Thank you for subscribing to the Pro plan! Changes may take a few moment to reflect.
                        </AlertDescription>
                    </Alert>
                )
            }

            {
                data.limits && (
                    <Card className="relative overflow-hidden">
                        {/* Header gradient accent */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-white"/>

                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold">
                                        Current Plan
                                    </CardTitle>
                                    <CardDescription>
                                        Manage your limits and usage
                                    </CardDescription>
                                </div>

                                <Badge
                                    variant={isPro ? "default" : "secondary"}
                                    className="px-3 py-1 text-sm"
                                >
                                    {isPro ? "🚀 Pro Plan" : "Free Plan"}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Repositories usage */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Repositories</p>
                                        <p className="text-xs text-muted-foreground">
                                            Connected repositories usage
                                        </p>
                                    </div>

                                    <Badge
                                        variant={data.limits.repositories.canAdd ? "outline" : "destructive"}
                                    >
                                        {data.limits.repositories.current} /{" "}
                                        {data.limits.repositories.limit ?? "∞"}
                                    </Badge>
                                </div>

                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${
                                            data.limits.repositories.canAdd
                                                ? "bg-primary"
                                                : "bg-destructive"
                                        }`}
                                        style={{
                                            width:
                                                limit && limit > 0
                                                    ? `${Math.min((current / limit) * 100, 100)}%`
                                                    : "100%",
                                        }}
                                    />
                                </div>
                            </div>

                            {/* AI Reviews */}
                            <div className="rounded-lg border bg-muted/40 p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">
                                        AI Code Reviews
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {isPro
                                            ? "Unlimited AI reviews across all repositories"
                                            : "Limited AI reviews per repository"}
                                    </p>
                                </div>

                                <Badge variant={isPro ? "default" : "outline"}>
                                    {isPro ? "Unlimited" : "5 / Repo"}
                                </Badge>
                            </div>


                        </CardContent>
                    </Card>
                )
            }

            <div className="mx-auto">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
                    {/* ================= FREE PLAN ================= */}
                    <Card
                        className={`relative w-full transition-all border ${
                            !isPro ? "border-primary" : "border-border"
                        }`}
                    >
                        {/* Active badge */}
                        {!isPro && (
                            <Badge
                                variant="secondary"
                                className="absolute right-4 top-4"
                            >
                                Active
                            </Badge>
                        )}

                        <CardHeader className="space-y-2">
                            <CardTitle className="text-lg font-medium">
                                Free
                            </CardTitle>
                            <CardDescription>
                                Best for individuals getting started
                            </CardDescription>

                            <div className="pt-2">
                                <span className="text-4xl font-semibold">$0</span>
                                <span className="text-sm text-muted-foreground">
                        {" "}
                                    / month
                    </span>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Features */}
                            <div className="space-y-3 text-sm">
                                {PLAN_FEATURES.FREE.map((feature) => (
                                    <div
                                        key={feature.name}
                                        className="flex items-start gap-3"
                                    >
                                        {feature.available ? (
                                            <Check className="mt-0.5 size-4 text-emerald-500" />
                                        ) : (
                                            <X className="mt-0.5 size-4 text-muted-foreground" />
                                        )}
                                        <span
                                            className={
                                                feature.available
                                                    ? ""
                                                    : "text-muted-foreground"
                                            }
                                        >
                                {feature.name}
                            </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                className="w-full"
                                variant="outline"
                                disabled
                            >
                                Current Plan
                            </Button>
                        </CardContent>
                    </Card>

                    {/* ================= PRO PLAN ================= */}
                    <Card
                        className={`relative w-full transition-all border ${
                            isPro ? "border-primary" : "border-border"
                        }`}
                    >
                        {/* Badge */}
                        {isPro ? (
                            <Badge
                                variant="secondary"
                                className="absolute right-4 top-4"
                            >
                                Active
                            </Badge>
                        ) : (
                            <Badge
                                variant="outline"
                                className="absolute right-4 top-4"
                            >
                                🚀 Popular
                            </Badge>
                        )}

                        <CardHeader className="space-y-2">
                            <CardTitle className="text-lg font-medium">
                                Pro
                            </CardTitle>
                            <CardDescription>
                                For teams & power users with no limits
                            </CardDescription>

                            <div className="pt-2">
                                <span className="text-4xl font-semibold">$29.99</span>
                                <span className="text-sm text-muted-foreground">
                        {" "}
                                    / month
                    </span>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Features */}
                            <div className="space-y-3 text-sm">
                                {PLAN_FEATURES.PRO.map((feature) => (
                                    <div
                                        key={feature.name}
                                        className="flex items-start gap-3"
                                    >
                                        <Check className="mt-0.5 size-4 text-emerald-500" />
                                        <span>{feature.name}</span>
                                    </div>
                                ))}
                            </div>

                            {
                                isPro && isActive ? (
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={handleManageSubscription}
                                        disabled={portalLoading}
                                    >
                                        {portalLoading ? (
                                            <Spinner className="size-4 animate-spin"/>
                                        ) : (
                                            <>
                                                Manage Subscription
                                                <ExternalLink className="ml-2 w-4 h-5"/>
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full"
                                        onClick={handleUpgrade}
                                        disabled={checkoutLoading}
                                    >
                                        {checkoutLoading ? (
                                            <Spinner className="size-4 animate-spin"/>
                                        ) : (
                                            "Upgrade to Pro"
                                        )}
                                    </Button>
                                )
                            }
                        </CardContent>
                    </Card>
                </div>
            </div>

        </div>
    )
}

export default SubscriptionPage;