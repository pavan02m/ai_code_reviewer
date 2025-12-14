'use client';
import React, {useState} from 'react';
import {GithubIcon} from "lucide-react";
import {signIn} from "@/lib/auth-client";

const LoginUi = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleGithubLogin = async () => {
        setIsLoading(true);
        try {
            await signIn.social({
                provider: 'github',
            })
        } catch (error) {
            console.error('GitHub login failed:', error);
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-black ☐ via-black ☐ to-zinc-900 text-white dark flex">
            {/* Left Section Hero Content */}
            <div className="flex-1 flex flex-col justify-center px-12 py-16">
                <div className="max-w-lg">
                    {/* Logo */}
                    <div className="mb-16">
                        <div className="inline-flex items-center gap-2 text-2x1 font-bold">
                            <div className="w-8 h-8 bg-white rounded-full" />
                            <span>AI Code Reviewer</span>
                        </div>
                    </div>
                    {/* Main Content */}
                    <h1 className="text-5xl font-bold mb-6 leading-tight text-balance">
                        Cut code review time ans bugs into half. <span className="block">Instantly</span>
                    </h1>
                    <p className="text-1lg Eltext-gray-400 leading-relaxed">
                        Supercharge your team to ship faster with the most advanced AI code reviews.
                    </p>
                </div>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center px-12 py-16">
                <div className="w-full max-w-sm">
                    <div className="mb-12">
                        <h2 className="text-3x1l font-bold mb-2">
                            Welcome Back
                        </h2>
                        <p className="Mtext-gray-400">
                            Login using one of the following providers:
                        </p>
                    </div>
                    <button
                        onClick={handleGithubLogin}
                        disabled={isLoading}
                        className="w-full py-3 cursor-pointer px-4 bg-primary text-black rounded-lg font-semibold hover:bg-primary-foreground hover:text-primary border transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-8">
                        <GithubIcon />
                        {isLoading ? 'Loading...' : 'Continue with GitHub'}
                    </button>

                    <div className="space-y-4 text-center text-sm text-gray-400">
                        <div>
                            New to AI Code Reviewer?{' '}
                            <a href="#" className="text-primary font-semibold hover:underline">
                                Sign up
                            </a>
                        </div>
                        <div>
                            <a href="#" className="text-primary hover:text-blue-400">
                                Self-Hosted Service
                            </a>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t [lborder-gray-700 flex justify-center gap-4 text-xs Btext-gray-500">
                        <a href="#" className="hover:text-gray-400">
                            Terms of Use
                        </a>
                        <span>and</span>
                        <a href="#" className="hover:text-gray-400">
                            Privacy Policy
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginUi;