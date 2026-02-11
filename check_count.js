import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://haozwgdpvcwxucocjjck.supabase.co'
const supabaseKey = 'sb_publishable_7HljrHx0lgIFusVVbaozlg_ymgHTHDi'
const supabase = createClient(supabaseUrl, supabaseKey)

async function getCount() {
    console.log('Attempting to connect...')
    const { data, count, error } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

    if (error) {
        console.log('Full Error Object:', JSON.stringify(error, null, 2))
    } else {
        console.log('User Count:', count)
    }
}

getCount()
