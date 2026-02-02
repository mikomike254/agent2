import dotenv from 'dotenv';
import { supabaseAdmin } from '../lib/db';

dotenv.config({ path: '.env.sync' });

async function inspectSchema() {
    if (!supabaseAdmin) {
        console.error('Supabase Admin not initialized');
        process.exit(1);
    }

    const tables = [
        { name: 'projects', columns: ['category'] },
        { name: 'commissioners', columns: ['bio', 'specialization', 'projects_completed', 'rating', 'tier'] },
        { name: 'developers', columns: ['bio', 'rating', 'projects_completed'] },
        { name: 'users', columns: ['avatar_url'] }
    ];

    console.log('--- DATABASE SCHEMA AUDIT ---');

    for (const table of tables) {
        console.log(`\nTable: ${table.name}`);
        for (const col of table.columns) {
            const { data, error } = await supabaseAdmin
                .rpc('check_column_exists', { t_name: table.name, c_name: col });

            // Fallback if RPC doesn't exist: use query
            if (error) {
                const { data: cols } = await supabaseAdmin
                    .from('information_schema.columns')
                    .select('column_name')
                    .eq('table_name', table.name)
                    .eq('column_name', col);

                const exists = cols && cols.length > 0;
                console.log(`  - ${col}: ${exists ? '✓ EXISTS' : '✗ MISSING'}`);
            } else {
                console.log(`  - ${col}: ${data ? '✓ EXISTS' : '✗ MISSING'}`);
            }
        }
    }
}

inspectSchema().catch(console.error);
