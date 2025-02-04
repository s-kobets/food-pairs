import { supabase } from './supabase';
// Initial seed data
const initialCombinations = [
    // Category combinations
    {
        item1_type: 'category',
        item1_category_id: 1, // Fruits
        item2_type: 'category',
        item2_category_id: 5, // Dairy
        rating: 4
    },
    {
        item1_type: 'category',
        item1_category_id: 2, // Vegetables
        item2_type: 'category',
        item2_category_id: 3, // Herbs
        rating: 5
    },
    // Specific food combinations
    {
        item1_type: 'food',
        item1_id: 1, // Tomato
        item2_type: 'food',
        item2_id: 8, // Basil
        rating: 5
    },
    {
        item1_type: 'food',
        item1_id: 2, // Apple
        item2_type: 'food',
        item2_id: 9, // Cinnamon
        rating: 4
    }
];
export async function setupDatabase() {
    try {
        // First check if the table exists
        const { data: existingTable } = await supabase
            .from('combinations')
            .select('id')
            .limit(1)
            .maybeSingle();
        // If we can query the table, it exists
        if (existingTable !== null) {
            console.log('Table already exists');
            return true;
        }
        // Insert initial data
        const { error: insertError } = await supabase
            .from('combinations')
            .insert(initialCombinations);
        if (insertError) {
            throw new Error(`Error inserting initial data: ${insertError.message}`);
        }
        console.log('Successfully initialized database with seed data');
        return true;
    }
    catch (error) {
        console.error('Database setup failed:', error instanceof Error ? error.message : 'Unknown error');
        return false;
    }
}
// Helper function to check if database is properly set up
export async function checkDatabaseHealth() {
    try {
        const { data, error } = await supabase
            .from('combinations')
            .select('id')
            .limit(1);
        if (error)
            throw error;
        return true;
    }
    catch (error) {
        console.error('Database health check failed:', error);
        return false;
    }
}
