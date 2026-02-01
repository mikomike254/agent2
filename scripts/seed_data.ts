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

async function seedData() {
    console.log('🌱 Starting dummy data seeding...\n');

    // 1. Get User IDs
    console.log('🔍 Fetching test users...');
    const { data: users, error: userError } = await supabase.from('users').select('*');
    if (userError) throw userError;

    console.log(`🔍 Found ${users.length} users in public.users table.`);
    users.forEach(u => console.log(`   - ${u.email} (${u.role})`));

    const developer = users.find(u => u.email === 'developer@techdevelopers.ke');
    const commissioner = users.find(u => u.email === 'commissioner@techdevelopers.ke');
    const client = users.find(u => u.email === 'client@techdevelopers.ke');

    if (!developer || !commissioner || !client) {
        console.error('❌ Test users not found. Run setup_test_users.ts first!');
        return;
    }
    console.log('✅ Found users: Developer, Commissioner, Client');

    // 2. Create Profiles
    console.log('\n👤 Ensuring Role Profiles...');

    // Developer Profile
    let developerProfileId: string;
    const { data: existingDev } = await supabase.from('developers').select('*').eq('user_id', developer.id).single();
    if (!existingDev) {
        const { data: newDev, error: devError } = await supabase.from('developers').insert({
            user_id: developer.id,
            tech_stack: ['React', 'Next.js', 'Typescript', 'Node.js', 'Supabase'],
            hourly_rate: 45,
            github_url: 'https://github.com/developer',
            portfolio_url: 'https://developer.com'
        }).select().single();
        if (devError) throw devError;
        developerProfileId = newDev.id;
        console.log('   ✅ Developer profile created');
    } else {
        developerProfileId = existingDev.id;
        console.log('   ✅ Developer profile already exists');
    }

    // Commissioner Profile
    let commissionerProfileId: string;
    const { data: existingComm } = await supabase.from('commissioners').select('*').eq('user_id', commissioner.id).single();
    if (!existingComm) {
        const { data: newComm, error: commError } = await supabase.from('commissioners').insert({
            user_id: commissioner.id,
            rate_percent: 15.0,
            total_revenue: 12500,
            kyc_status: 'approved',
            referral_code: 'COMM' + Math.floor(Math.random() * 1000)
        }).select().single();
        if (commError) throw commError;
        commissionerProfileId = newComm.id;
        console.log('   ✅ Commissioner profile created');
    } else {
        commissionerProfileId = existingComm.id;
        console.log('   ✅ Commissioner profile already exists');
    }

    // Client Profile
    let clientProfileId: string;
    const { data: existingClient } = await supabase.from('clients').select('*').eq('user_id', client.id).single();
    if (!existingClient) {
        const { data: newClient, error: clientError } = await supabase.from('clients').insert({
            user_id: client.id,
            company_name: 'Tech Corp Ltd'
        }).select().single();
        if (clientError) throw clientError;
        clientProfileId = newClient.id;
        console.log('   ✅ Client profile created');
    } else {
        clientProfileId = existingClient.id;
        console.log('   ✅ Client profile already exists');
    }


    // 3. Seed Jobs (Leads)
    console.log('\n💼 Seeding Jobs (Leads)...');
    const jobs = [
        {
            client_name: 'Tech Corp Ltd',
            project_summary: 'E-commerce Platform Migration: We need to migrate our existing WooCommerce store to a custom Next.js solution with Supabase.',
            budget: 2500,
            priority: 3, // High (Assuming larger is higher)
            tags: ['Next.js', 'Supabase', 'PostgreSQL', 'Stripe'],
            status: 'open',
            client_email: client.email,
            commissioner_id: commissionerProfileId
        },
        {
            client_name: 'Real Estate Listings',
            project_summary: 'Real Estate Listing App: Mobile-first web application for listing properties.',
            budget: 4500,
            priority: 2, // Medium
            tags: ['React', 'Tailwind', 'Google Maps API'],
            status: 'open',
            client_email: client.email,
            commissioner_id: commissionerProfileId
        }
    ];

    for (const job of jobs) {
        const { error } = await supabase.from('leads').insert(job);
        if (error) console.log(`   ⚠️ Error inserting job "${job.client_name}":`, error.message);
        else console.log(`   ✅ Job/Lead created: ${job.client_name}`);
    }


    // 4. Seed Active Projects
    console.log('\n🚀 Seeding Active Projects...');
    const project = {
        title: 'Fintech Dashboard Redesign',
        description: 'Complete overhaul of the client portal with modern UI/UX.',
        status: 'active',
        total_value: 4500,
        client_id: clientProfileId,
        developer_id: developerProfileId,
        commissioner_id: commissionerProfileId,
        created_at: new Date().toISOString()
    };

    const { data: projData, error: projError } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();

    if (projError) console.log('   ⚠️ Project error:', projError.message);
    else {
        console.log(`   ✅ Active Project created: ${project.title}`);

        // Seed Milestones for this project
        const milestones = [
            {
                project_id: projData.id,
                title: 'Phase 1: UI Implementation',
                description: 'Implement the dashboard layout from Figma.',
                percent_amount: 30, // 30%
                status: 'approved', // Fix: 'completed' -> 'approved'
                due_date: new Date(Date.now() - 86400000 * 2).toISOString()
            },
            {
                project_id: projData.id,
                title: 'Phase 2: API Integration',
                description: 'Connect frontend charts to backend endpoints.',
                percent_amount: 40, // 40%
                status: 'in_progress', // Fix: 'active' -> 'in_progress'
                due_date: new Date(Date.now() + 86400000 * 7).toISOString()
            }
        ];

        const { error: milError } = await supabase.from('project_milestones').insert(milestones);
        if (milError) console.log('   ⚠️ Milestone error:', milError.message);
        else console.log('   ✅ Project Milestones added');
    }

    console.log('\n✨ Dummy data seeding complete!');
}

seedData();
