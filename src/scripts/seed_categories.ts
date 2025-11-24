import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
    { id_categ_serv: 1, nombre_categ_serv: 'General' },
    { id_categ_serv: 2, nombre_categ_serv: 'Tecnología' },
    { id_categ_serv: 3, nombre_categ_serv: 'Pintura' },
    { id_categ_serv: 4, nombre_categ_serv: 'Electricista' },
    { id_categ_serv: 5, nombre_categ_serv: 'Albañil' },
    { id_categ_serv: 6, nombre_categ_serv: 'Gasfitería' },
    { id_categ_serv: 7, nombre_categ_serv: 'Carpintería' },
    { id_categ_serv: 8, nombre_categ_serv: 'Aseo' },
    { id_categ_serv: 9, nombre_categ_serv: 'Jardinería' },
    { id_categ_serv: 10, nombre_categ_serv: 'Mecánica' }
];

async function seedCategories() {
    console.log('Seeding categories...');

    for (const cat of categories) {
        const { error } = await supabase
            .from('categoria_servicio')
            .upsert(cat, { onConflict: 'id_categ_serv' });

        if (error) {
            console.error(`Error seeding category ${cat.nombre_categ_serv}:`, error);
        } else {
            console.log(`Category ${cat.nombre_categ_serv} seeded/updated.`);
        }
    }
}

seedCategories();
