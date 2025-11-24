import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndSeedMembresia() {
    console.log('Checking MEMBRESIA table...');
    const { data, error } = await supabase.from('membresia').select('*');

    if (error) {
        console.error('Error fetching membresia:', error);
        return;
    }

    console.log('Current membresias:', data);

    if (data.length === 0) {
        console.log('Seeding default membresia...');
        const { error: insertError } = await supabase.from('membresia').insert([
            { id_membresia: 1, nombre_membresia: 'Gratuita' },
            { id_membresia: 2, nombre_membresia: 'Premium' }
        ]);

        if (insertError) {
            console.error('Error seeding membresia:', insertError);
        } else {
            console.log('Membresia seeded successfully.');
        }
    } else {
        console.log('Membresia table already has data.');
    }
}

async function checkAndSeedCategorias() {
    console.log('Checking CATEGORIA_SERVICIO table...');
    const { data, error } = await supabase.from('categoria_servicio').select('*');

    if (error) {
        console.error('Error fetching categorias:', error);
        return;
    }

    if (data.length === 0) {
        console.log('Seeding default categorias...');
        const { error: insertError } = await supabase.from('categoria_servicio').insert([
            { id_categ_serv: 1, nombre_categ_serv: 'General' },
            { id_categ_serv: 2, nombre_categ_serv: 'Tecnología' }
        ]);

        if (insertError) {
            console.error('Error seeding categorias:', insertError);
        } else {
            console.log('Categorias seeded successfully.');
        }
    } else {
        console.log('Categorias table already has data.');
    }
}

async function main() {
    await checkAndSeedMembresia();
    await checkAndSeedCategorias();
}

main();
