import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabaseAdmin } from '@/lib/db';

export const authOptions: NextAuthOptions = {
    providers: [
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
            GoogleProvider({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            })
        ] : []),
        CredentialsProvider({
            name: 'Email',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                try {
                    if (!supabaseAdmin) return null;
                    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
                        email: credentials.email,
                        password: credentials.password
                    });
                    if (authError || !authData.user) return null;
                    const { data: user } = await supabaseAdmin
                        .from('users')
                        .select('*')
                        .eq('id', authData.user.id)
                        .single();
                    if (!user) return null;
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.avatar_url
                    };
                } catch (err) {
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google' && supabaseAdmin) {
                try {
                    const { data: existingUser } = await supabaseAdmin
                        .from('users')
                        .select('*')
                        .eq('email', user.email!)
                        .maybeSingle();

                    if (!existingUser) {
                        const { data: newUser } = await supabaseAdmin
                            .from('users')
                            .insert({
                                email: user.email,
                                name: user.name,
                                avatar_url: user.image,
                                role: 'client',
                                verified: true,
                                status: 'active'
                            })
                            .select()
                            .single();

                        if (newUser) {
                            await supabaseAdmin
                                .from('clients')
                                .insert({
                                    user_id: newUser.id,
                                    contact_person: newUser.name || 'Unknown'
                                });
                        }
                    }
                } catch (error) {
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            } else if (token.email && supabaseAdmin) {
                const { data: dbUser } = await supabaseAdmin
                    .from('users')
                    .select('*')
                    .eq('email', token.email)
                    .maybeSingle();

                if (dbUser) {
                    token.role = dbUser.role;
                    token.id = dbUser.id;
                    token.status = dbUser.status;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).status = token.status;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt'
    }
};
