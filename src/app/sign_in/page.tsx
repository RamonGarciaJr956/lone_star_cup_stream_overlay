"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Rocket, Lock, User, Shield, Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

// Create a separate component that uses useSearchParams
const SignInForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [callbackUrl, setCallbackUrl] = useState('/dashboard');
    const [info, setInfo] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const callback = searchParams.get('callbackUrl');
        if (callback) {
            setCallbackUrl(callback);
        }
    }, [searchParams]);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await signIn('credentials', {
                email: info.email,
                password: info.password,
                redirect: false,
            });

            if (response?.error === null) {
                setIsLoading(false);
                router.push(callbackUrl);
            } else {
                setIsLoading(false);
                console.log(response?.error);
                setError('Please check your email and password and try again.');
            }
        } catch (error) {
            setIsLoading(false);
            console.log(error);
            setError('An error occurred!');
        }
    };

    return (
        <form onSubmit={handleSignIn}>
            {error && (
                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4">
                    {error}
                </div>
            )}
            <div className="mb-5">
                <label htmlFor="email" className="text-xs text-blue-400 font-bold flex items-center mb-2">
                    <User size={12} className="mr-1" />
                    EMAIL
                </label>
                <div className="relative">
                    <input
                        id="email"
                        type="email"
                        value={info.email}
                        onChange={(e) => setInfo({ ...info, email: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="admin@lonestar.cup"
                        required
                    />
                </div>
            </div>

            <div className="mb-6">
                <label htmlFor="password" className="text-xs text-blue-400 font-bold flex items-center mb-2">
                    <Lock size={12} className="mr-1" />
                    PASSWORD
                </label>
                <div className="relative">
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={info.password}
                        onChange={(e) => setInfo({ ...info, password: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="••••••••"
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        AUTHENTICATING
                    </div>
                ) : (
                    "SIGN IN"
                )}
            </button>
        </form>
    );
};

// Loading fallback component
const FormSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-4 bg-slate-700 rounded mb-6"></div>
        <div className="space-y-5">
            <div>
                <div className="h-3 w-12 bg-slate-700 rounded mb-2"></div>
                <div className="h-10 bg-slate-700 rounded"></div>
            </div>
            <div>
                <div className="h-3 w-16 bg-slate-700 rounded mb-2"></div>
                <div className="h-10 bg-slate-700 rounded"></div>
            </div>
            <div className="h-10 bg-slate-700 rounded mt-6"></div>
        </div>
    </div>
);

// Main component
const AdminSignIn = () => {
    return (
        <div className="min-h-screen text-white font-sans flex flex-col" style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            fontFamily: 'Roboto, Arial, sans-serif',
            letterSpacing: '0.5px'
        }}>
            {/* Top bar with logo */}
            <div className="flex justify-between items-center px-6 py-4" style={{
                background: 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.85) 100%)',
                borderBottom: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
                <div className="flex items-center">
                    <Rocket className="mr-2 text-blue-400" size={20} />
                    <span className="text-lg font-bold tracking-wider">LONE STAR CUP</span>
                    <div className="ml-4 px-3 py-1 bg-blue-900 bg-opacity-40 rounded text-xs font-semibold">
                        ADMIN
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex items-center justify-center px-4 py-12 flex-1">
                <div className="w-full max-w-md">
                    {/* Sign in card */}
                    <div className="bg-slate-900 bg-opacity-90 rounded-lg overflow-hidden border border-slate-800" style={{
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div className="px-6 py-4 border-b border-slate-800 flex items-center">
                            <Shield size={18} className="mr-2 text-blue-400" />
                            <span className="font-bold text-base tracking-wider">ADMIN AUTHENTICATION</span>
                        </div>

                        <div className="p-6">
                            <Suspense fallback={<FormSkeleton />}>
                                <SignInForm />
                            </Suspense>
                        </div>
                    </div>

                    {/* Security note */}
                    <div className="mt-6 text-center">
                        <div className="bg-slate-800 bg-opacity-70 rounded-lg p-4 inline-block">
                            <div className="flex items-center justify-center text-xs text-slate-400">
                                <Lock size={12} className="mr-1 text-blue-400" />
                                <span>Secured admin access for Lone Star Cup mission control</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSignIn;