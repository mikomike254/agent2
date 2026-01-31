import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

interface TestUser {
    email: string;
    password: string;
    role: 'admin' | 'commissioner' | 'developer' | 'client';
    fullName: string;
}

const testUsers: TestUser[] = [
    {
        email: 'admin@techdevelopers.ke',
        password: 'Admin123!',
        role: 'admin',
        fullName: 'System Administrator'
    },
    {
        email: 'commissioner@techdevelopers.ke',
        password: 'Commissioner123!',
        role: 'commissioner',
        fullName: 'John Commissioner'
    },
    {
        email: 'developer@techdevelopers.ke',
        password: 'Developer123!',
        role: 'developer',
        fullName: 'Jane Developer'
    },
    {
        email: 'client@techdevelopers.ke',
        password: 'Client123!',
        role: 'client',
        fullName: 'Mike Client'
    }
];

async function setupTestUsers() {
    console.log('🚀 Starting test user setup...\n');

    for (const user of testUsers) {
        try {
            console.log(`📝 Creating ${user.role} user: ${user.email}...`);

            // Create auth user
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: user.email,
                password: user.password,
                email_confirm: true,
                user_metadata: {
                    full_name: user.fullName,
                    role: user.role
                }
            });

            if (authError) {
                if (authError.message.includes('already exists')) {
                    console.log(`   ⚠️  User already exists, updating role...`);

                    // Get existing user
                    const { data: users } = await supabase.auth.admin.listUsers();
                    const existingUser = users?.users.find(u => u.email === user.email);

                    if (existingUser) {
                        // Update user metadata
                        await supabase.auth.admin.updateUserById(existingUser.id, {
                            user_metadata: {
                                full_name: user.fullName,
                                role: user.role
                            }
                        });
                        console.log(`   ✅ Updated user metadata`);
                    }
                } else {
                    throw authError;
                }
            } else {
                console.log(`   ✅ Auth user created with ID: ${authData.user.id}`);
            }

            // Update or create profile in users table
            const { data: users } = await supabase.auth.admin.listUsers();
            const currentUser = users?.users.find(u => u.email === user.email);

            if (currentUser) {
                const { error: profileError } = await supabase
                    .from('users')
                    .upsert({
                        id: currentUser.id,
                        email: user.email,
                        role: user.role,
                        full_name: user.fullName,
                        status: 'active',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });

                if (profileError) {
                    console.log(`   ⚠️  Profile update: ${profileError.message}`);
                } else {
                    console.log(`   ✅ Profile updated in database`);
                }
            }

        } catch (error: any) {
            console.error(`   ❌ Error creating ${user.role}: ${error.message}`);
        }

        console.log('');
    }

    console.log('✨ Test user setup complete!\n');
    console.log('📋 Login Credentials:\n');
    console.log('━'.repeat(60));

    testUsers.forEach(user => {
        console.log(`\n🔑 ${user.role.toUpperCase()} Dashboard`);
        console.log(`   Email:    ${user.email}`);
        console.log(`   Password: ${user.password}`);
        console.log(`   URL:      http://localhost:3000/login`);
    });

    console.log('\n' + '━'.repeat(60));
    console.log('\n💡 After logging in, users will be redirected to their role-specific dashboard:');
    console.log('   - Admin:        /dashboard/admin');
    console.log('   - Commissioner: /dashboard/commissioner');
    console.log('   - Developer:    /dashboard/developer');
    console.log('   - Client:       /dashboard/client\n');
}

async function testConnection() {
    console.log('🔌 Testing Supabase connection...\n');

    try {
        // Test database connection
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }

        console.log('✅ Database connection successful!');

        // Test auth
        const { data: authData } = await supabase.auth.admin.listUsers();
        console.log(`✅ Auth working! Current users: ${authData?.users.length || 0}`);

        return true;
    } catch (error: any) {
        console.error('❌ Connection test failed:', error.message);
        return false;
    }
}

async function main() {
    console.log('🎯 Supabase Database Integration Setup\n');
    console.log('📍 URL:', supabaseUrl);
    console.log('');

    const isConnected = await testConnection();

    if (!isConnected) {
        console.error('\n❌ Cannot proceed without database connection. Please check your credentials.\n');
        process.exit(1);
    }

    console.log('\n' + '━'.repeat(60) + '\n');

    await setupTestUsers();

    console.log('\n🎉 Setup complete! You can now log in with any of the test accounts.\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
