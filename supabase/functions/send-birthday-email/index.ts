import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const RESEND_API_KEY = "re_ahHPA84J_Bh9zJ8YNJfxvAWogatzMTRDq"; // Provided by user

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Initialize Supabase Client
        const supabaseClient = createClient(
            // Access environment variables provided by Supabase Edge Runtime
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 2. Fetch all birthdays (filtering in memory for robustness over date types)
        const { data: birthdays, error: birthdaysError } = await supabaseClient
            .from('birthdays')
            .select('*');

        if (birthdaysError) throw birthdaysError;

        // 3. Filter for Today
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // 0-indexed
        const currentDay = today.getDate();

        const todaysBirthdays = birthdays.filter((b: any) => {
            // Handle YYYY-MM-DD or DD/MM/YYYY or similar
            // Simplest way: split by delimiter and identify parts
            let bMonth, bDay;

            if (b.date.includes('-')) {
                // YYYY-MM-DD
                const parts = b.date.split('-');
                bMonth = parseInt(parts[1]);
                bDay = parseInt(parts[2]);
            } else if (b.date.includes('/')) {
                // DD/MM/YYYY (common in BR) -> Assumed day first
                const parts = b.date.split('/');
                bDay = parseInt(parts[0]);
                bMonth = parseInt(parts[1]);
            } else {
                return false;
            }

            return bMonth === currentMonth && bDay === currentDay;
        });

        if (todaysBirthdays.length === 0) {
            return new Response(JSON.stringify({ message: "No birthdays today." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // 4. Fetch Admins
        const { data: profiles, error: profilesError } = await supabaseClient
            .from('user_profiles')
            .select('email')
            .eq('role', 'admin');

        if (profilesError) throw profilesError;

        const adminEmails = profiles
            .map((p: any) => p.email)
            .filter((email: any) => email && email.includes('@')); // Basic validation

        if (adminEmails.length === 0) {
            return new Response(JSON.stringify({ message: "No admins found to email." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // 5. Construct Email HTML
        const listHtml = todaysBirthdays.map((b: any) => `
        <li style="padding: 10px 0; border-bottom: 1px solid #eee;">
            <strong style="font-size: 16px; color: #333;">${b.name}</strong>
            <br/>
            <span style="color: #666; font-size: 14px;">Telefone: ${b.phone || 'N/A'}</span>
        </li>
    `).join('');

        const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ec1313;">🎂 Aniversariantes de Hoje! (` + today.toLocaleDateString('pt-BR') + `)</h1>
        <p>Olá Admin,</p>
        <p>Hoje é um dia especial! Aqui está a lista de aniversariantes:</p>
        <ul style="list-style: none; padding: 0;">
            ${listHtml}
        </ul>
        <br/>
        <a href="https://aniversarios-app.vercel.app" style="background-color: #ec1313; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Abrir App</a>
      </div>
    `;

        // 6. Send Email via Resend
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Aniversários <onboarding@resend.dev>', // Default testing domain
                to: adminEmails,
                subject: `🎉 ${todaysBirthdays.length} Aniversariante(s) Hoje!`,
                html: emailHtml,
            }),
        });

        const data = await res.json();

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
