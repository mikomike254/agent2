// Sidebar Navigation Component
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    CreditCard,
    Briefcase,
    Shield,
    Settings,
    User,
    Users,
    Search,
    MessageSquare,
    Target,
    Megaphone,
    BookOpen,
    LogOut,
    Bell,
    FileText,
    LifeBuoy,
    X
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = {
    // ... items stay the same ...
    admin: [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/admin' },
        { name: 'Approvals', icon: Shield, href: '/dashboard/admin/approvals' },
        { name: 'Payments', icon: CreditCard, href: '/dashboard/admin/payments' },
        { name: 'Ledger', icon: FileText, href: '/dashboard/admin/ledger' },
        { name: 'Projects', icon: Briefcase, href: '/dashboard/admin/projects' },
        { name: 'Support', icon: LifeBuoy, href: '/dashboard/admin/support' },
        { name: 'Marketing', icon: Megaphone, href: '/dashboard/admin/marketing' },
        { name: 'Users', icon: Users, href: '/dashboard/admin/users' },
        { name: 'KB Editor', icon: BookOpen, href: '/dashboard/admin/kb' },
        { name: 'Knowledge Base', icon: BookOpen, href: '/dashboard/kb' },
        { name: 'Profile', icon: User, href: '/dashboard/profile' },
    ],
    client: [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/client' },
        { name: 'Payments', icon: CreditCard, href: '/dashboard/client/payments' },
        { name: 'My Projects', icon: Briefcase, href: '/dashboard/client/projects' },
        { name: 'Messages', icon: MessageSquare, href: '/dashboard/client/messages' },
        { name: 'Knowledge Base', icon: BookOpen, href: '/dashboard/kb' },
        { name: 'Profile', icon: User, href: '/dashboard/profile' },
    ],
    commissioner: [
        { name: 'Dashboard', href: '/dashboard/commissioner', icon: LayoutDashboard },
        { name: 'Onboard Client', icon: User, href: '/dashboard/commissioner/onboard' },
        { name: 'Leads', href: '/dashboard/commissioner/leads', icon: Target },
        { name: 'Invoices', href: '/dashboard/commissioner/invoices', icon: CreditCard },
        { name: 'Marketing', href: '/dashboard/commissioner/marketing', icon: Megaphone },
        { name: 'Team', href: '/dashboard/commissioner/team', icon: Users },
        { name: 'Messages', href: '/dashboard/commissioner/messages', icon: MessageSquare },
        { name: 'Profile', href: '/dashboard/profile', icon: User },
    ],
    developer: [
        { name: 'Work Queue', icon: LayoutDashboard, href: '/dashboard/developer' },
        { name: 'Messages', icon: MessageSquare, href: '/dashboard/developer/messages' },
        { name: 'Active Jobs', icon: Briefcase, href: '/dashboard/developer/jobs' },
        { name: 'Knowledge Base', icon: BookOpen, href: '/dashboard/kb' },
        { name: 'Earnings', icon: CreditCard, href: '/dashboard/developer/earnings' },
        { name: 'Profile', icon: User, href: '/dashboard/profile' },
    ]
};

export function Sidebar({
    role,
    isOpen,
    onClose
}: {
    role: 'admin' | 'client' | 'commissioner' | 'developer';
    isOpen: boolean;
    onClose: () => void;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const items = menuItems[role] || [];

    const sidebarVariants = {
        open: { x: 0, opacity: 1 },
        closed: { x: '-100%', opacity: 0 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    />

                    <motion.aside
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={sidebarVariants}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-72 bg-white border-r border-gray-100 h-[100dvh] fixed left-0 top-0 flex flex-col z-50 shadow-2xl lg:shadow-none"
                    >
                        {/* Brand */}
                        <div className="p-8 pb-4 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tighter">
                                    CREATIVE.KE
                                </h1>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">Agency Hub</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* User Profile Snippet */}
                        <div className="px-8 pb-6">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                                    {session?.user?.image ? (
                                        <img src={session.user.image} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        session?.user?.name?.[0] || 'U'
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="text-sm font-bold text-gray-900 truncate">
                                        {session?.user?.name || 'Guest User'}
                                    </h3>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold truncate">
                                        {role}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-5 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                            <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                                Main Navigation
                            </p>

                            {items.map((item, idx) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => {
                                            if (window.innerWidth < 1024) onClose();
                                        }}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                                            ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200'
                                            : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                        <span className="text-sm tracking-tight">{item.name}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-pill"
                                                className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Footer */}
                        <div className="mt-auto p-6 border-t border-gray-50 space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Appearance</span>
                                <ThemeToggle />
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: 'https://nighaa.netlify.app/' })}
                                className="flex items-center gap-4 px-4 py-4 w-full rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group font-bold text-sm"
                            >
                                <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                                <span>Logout System</span>
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
