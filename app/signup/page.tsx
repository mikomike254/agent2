// Signup Page with Role Selection
'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'client', // Default to client
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [referralCode, setReferralCode] = useState<string | null>(null);

    useEffect(() => {
        // Read referral cookie
        const cookies = document.cookie.split('; ');
        const refCookie = cookies.find(row => row.startsWith('creative_ref='));
        if (refCookie) {
            setReferralCode(refCookie.split('=')[1]);
        }
    }, []);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, referralCode })
            });

            const result = await response.json();

            if (result.success) {
                // Determine redirect path
                const roleRedirects: Record<string, string> = {
                    client: '/dashboard/client',
                    commissioner: '/dashboard/commissioner',
                    developer: '/dashboard/developer',
                    admin: '/dashboard/admin'
                };
                const callbackUrl = roleRedirects[formData.role] || '/dashboard';

                // Automatically sign in the user
                const signInResult = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                    callbackUrl
                });

                if (signInResult?.error) {
                    setMessage('Account created, but could not sign in automatically. Please log in manually.');
                    setTimeout(() => router.push('/login'), 2000);
                } else if (formData.role !== 'client') {
                    // Show pending message but still allow login session 
                    // (Dashboard middleware will handle approval checks)
                    setMessage('Registration successful! Your account is pending admin approval.');
                    setTimeout(() => router.push(callbackUrl), 2000);
                } else {
                    router.push(callbackUrl);
                }
            } else {
                setMessage(result.message || 'Signup failed. Please try again.');
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = () => {
        signIn('google', { callbackUrl: '/dashboard' });
    };

    return (
        <div className="min-h-screen bg-[var(--bg-app)] relative overflow-hidden flex items-center justify-center px-4 py-20">
            {/* Techy Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accent)] opacity-10 blur-[120px] rounded-full animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#6366f1] opacity-10 blur-[150px] rounded-full animate-float-slow" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#1a1a1a 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="max-w-2xl w-full relative z-10">
                {/* Logo Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 bg-white dark:bg-black p-4 rounded-[2rem] shadow-soft mb-6 px-8">
                        <div className="w-10 h-10 bg-black dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-black font-black text-xl rotate-3">
                            K
                        </div>
                        <h1 className="text-3xl font-black text-black dark:text-white tracking-tighter leading-none">
                            CREATIVE<span className="text-gray-400">.KE</span>
                        </h1>
                    </div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] animate-pulse">
                        Identity Syncing Service
                    </p>
                </div>

                {/* Main Card */}
                <div className="card-soft bg-white/80 dark:bg-black/80 backdrop-blur-xl p-10 lg:p-14 border border-white/20">
                    <div className="mb-10 text-center">
                        <h2 className="text-4xl font-black text-black dark:text-white tracking-tight mb-2">
                            Initialize Account
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">Join the premium creative ecosystem in East Africa.</p>
                    </div>

                    {message && (
                        <div className={`mb-8 p-4 rounded-2xl font-bold text-sm tracking-tight text-center ${message.includes('pending')
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : message.includes('success')
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                            {message}
                        </div>
                    )}

                    {/* Signup Form */}
                    <form onSubmit={handleSignup} className="space-y-6">
                        {/* Interactive Role Selection */}
                        <div className="p-2 bg-[var(--bg-input)] rounded-[2.5rem] flex gap-1 border border-[var(--border-color)]">
                            {['client', 'commissioner', 'developer'].map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: role as any })}
                                    className={`flex-1 py-3 px-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${formData.role === role
                                        ? 'bg-black text-white shadow-xl scale-[1.02]'
                                        : 'text-gray-400 hover:text-black'
                                        }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>

                        {formData.role !== 'client' && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">
                                    Identity Verification Required for {formData.role}s
                                </span>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Identity</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-12 pr-6 py-4 bg-[var(--bg-input)] border-transparent rounded-full focus:ring-2 focus:ring-black dark:focus:ring-white outline-none font-bold text-sm transition-all"
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Contact Link</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-12 pr-6 py-4 bg-[var(--bg-input)] border-transparent rounded-full focus:ring-2 focus:ring-black dark:focus:ring-white outline-none font-bold text-sm transition-all"
                                        placeholder="Email address"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Device Verification</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-12 pr-6 py-4 bg-[var(--bg-input)] border-transparent rounded-full focus:ring-2 focus:ring-black dark:focus:ring-white outline-none font-bold text-sm transition-all"
                                        placeholder="+254"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Secure Key</label>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-12 pr-6 py-4 bg-[var(--bg-input)] border-transparent rounded-full focus:ring-2 focus:ring-black dark:focus:ring-white outline-none font-bold text-sm transition-all"
                                        placeholder="••••••••"
                                        required
                                        minLength={8}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 group"
                        >
                            {loading ? 'Processing Sync...' : 'Complete Registration'}
                        </button>

                        <div className="flex items-center gap-4 my-8">
                            <div className="h-[1px] flex-1 bg-gray-200 dark:bg-gray-800" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Universal Auth</span>
                            <div className="h-[1px] flex-1 bg-gray-200 dark:bg-gray-800" />
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleSignup}
                            className="w-full py-4 border-2 border-gray-100 dark:border-gray-800 rounded-full font-bold text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition flex items-center justify-center gap-3"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sync with Google Node
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                            Existing Identity?{' '}
                            <Link href="/login" className="text-black dark:text-white hover:underline transition-all">
                                Recall Session
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back Link */}
                <div className="mt-8 text-center">
                    <Link href="/" className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] hover:text-black dark:hover:text-white transition-colors">
                        ← Terminate & Return to Mainframe
                    </Link>
                </div>
            </div>
        </div>
    );
}
