'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
    const router = useRouter();

    useEffect(() => {
        // Log 404 for debugging
        console.warn('404 Page Not Found:', window.location.pathname);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
            <div className="max-w-md w-full text-center">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileQuestion className="w-12 h-12 text-indigo-600" />
                </div>

                <h1 className="text-6xl font-black text-gray-900 mb-4">404</h1>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition"
                    >
                        ← Go Back
                    </button>
                    <Link
                        href="/dashboard"
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                        Go to Dashboard
                    </Link>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-4">Quick Links:</p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <Link href="/" className="text-indigo-600 hover:underline font-semibold">
                            Home
                        </Link>
                        <Link href="/jobs" className="text-indigo-600 hover:underline font-semibold">
                            View Jobs
                        </Link>
                        <Link href="/login" className="text-indigo-600 hover:underline font-semibold">
                            Login
                        </Link>
                        <Link href="/signup" className="text-indigo-600 hover:underline font-semibold">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
