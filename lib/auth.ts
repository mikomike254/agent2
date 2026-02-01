import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabaseAdmin } from '@/lib/db';
import crypto from 'crypto';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: 'Email',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                console.log('Login attempt for:', credentials?.email);
                if (!credentials?.email || !credentials?.password) {
                    console.log('Missing credentials');
                    return null;
                }

                try {
                    if (!supabaseAdmin) {
                        console.error('Supabase Admin client not initialized');
                        return null;
                    }

                    // Authenticate directly with Supabase Auth
                    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
                        email: credentials.email,
                        password: credentials.password
                    });

                    if (authError || !authData.user) {
                        console.error('Supabase Auth error:', authError?.message);
                        return null;
                    }

                    // Get user profile from public table
                    const { data: user, error: profileError } = await supabaseAdmin
                        .from('users')
                        .select('*')
                        .eq('id', authData.user.id)
                        .single();

                    if (profileError || !user) {
                        console.error('Profile not found for authenticated user');
                        return null;
                    }

                    console.log('Login successful for:', user.email);
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name || authData.user.user_metadata.full_name,
                        role: user.role,
                        image: user.avatar_url
                    };
                } catch (err: any) {
                    console.error('Unexpected error during authorize:', err.message);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google' && supabaseAdmin) {
                try {
                    // Check if user already exists
                    const { data: existingUser } = await supabaseAdmin
                        .from('users')
                        .select('*')
                        .eq('email', user.email!)
                        .single();

                    if (!existingUser) {
                        // Create new user with default role 'client'
                        const { data: newUser, error: userError } = await supabaseAdmin
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

                        if (userError) {
                            console.error('Error creating user:', userError);
                            return false;
                        }

                        // Create client profile for new Google users
                        const { error: clientError } = await supabaseAdmin
                            .from('clients')
                            .insert({
                                user_id: newUser.id,
                                contact_person: newUser.name || 'Unknown'
                            });

                        if (clientError) {
                            console.error('Error creating client profile:', clientError);
                        }
                    } else {
                        // Update existing user's avatar if needed
                        if (user.image && existingUser.avatar_url !== user.image) {
                            await supabaseAdmin
                                .from('users')
                                .update({ avatar_url: user.image })
                                .eq('id', existingUser.id);
                        }
                    }
                } catch (error) {
                    console.error('Error in Google signIn callback:', error);
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
                    .single();

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
