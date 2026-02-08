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
        console.log("Starting birthday check...");

        // 0. Manual Auth Verification (since verify_jwt is off or failing)
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            console.error("Missing Authorization header.");
            return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            });
        }

        // Create a client to verify the user
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
        const authClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        const { data: { user }, error: userError } = await authClient.auth.getUser();

        if (userError || !user) {
            console.error("Invalid user token:", userError);
            return new Response(JSON.stringify({
                error: `Auth failed: ${userError?.message || 'Unknown error'}`,
                details: userError
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200, // Return 200 to allow client to read the error message
            });
        }

        console.log(`User authenticated: ${user.email} (${user.id})`);

        // 1. Initialize Supabase Admin Client (for operations)
        const supabaseClient = createClient(
            supabaseUrl,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 2. Fetch all birthdays (filtering in memory for robustness over date types)
        const { data: birthdays, error: birthdaysError } = await supabaseClient
            .from('birthdays')
            .select('*');

        if (birthdaysError) {
            console.error("Error fetching birthdays:", birthdaysError);
            throw birthdaysError;
        }

        console.log(`Fetched ${birthdays.length} total birthdays.`);

        // 3. Filter for Today
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // 0-indexed
        const currentDay = today.getDate();
        console.log(`Checking for date: ${currentDay}/${currentMonth}`);

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

        console.log(`Found ${todaysBirthdays.length} birthdays today.`);

        const debugInfo = {
            totalBirthdays: birthdays.length,
            currentDate: `${currentDay}/${currentMonth}`,
            todaysBirthdaysCount: todaysBirthdays.length,
            // Sample of first few birthdays for debugging date parsing
            sampleBirthdays: birthdays.slice(0, 3).map((b: any) => b.date),
        };
        console.log("Debug Info:", debugInfo);

        if (todaysBirthdays.length === 0) {
            console.log("No birthdays today. Exiting.");
            return new Response(JSON.stringify({
                message: "No birthdays today.",
                debug: debugInfo
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // 4. Fetch Admins
        const { data: profiles, error: profilesError } = await supabaseClient
            .from('user_profiles')
            .select('email, role')
            .eq('role', 'admin');

        if (profilesError) {
            console.error("Error fetching admins:", profilesError);
            throw profilesError;
        }

        const adminEmails = profiles
            .map((p: any) => p.email)
            .filter((email: any) => email && email.includes('@')); // Basic validation

        console.log(`Found ${adminEmails.length} admin emails:`, adminEmails);

        if (adminEmails.length === 0) {
            console.log("No valid admin emails found. Exiting.");
            return new Response(JSON.stringify({ message: "No admins found to email." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // 5. Construct Email HTML
        const listHtml = todaysBirthdays.map((b: any) => {
            let phoneHtml = 'Telefone: N/A';

            if (b.phone) {
                // Remove non-digits
                // Remove non-digits
                let rawPhone = b.phone.replace(/\D/g, '');

                // Ensure DDI 55 (Brazil) if missing
                // Check if it's a mobile phone (11 digits: 11 99999-9999) or landline (10 digits: 11 3333-3333) without DDI
                if ((rawPhone.length === 10 || rawPhone.length === 11) && !rawPhone.startsWith('55')) {
                    rawPhone = '55' + rawPhone;
                }

                let formattedPhone = b.phone;
                let waLink = `https://wa.me/${rawPhone}`;

                // Format: 5511999999999 -> (11) 99999-9999
                if (rawPhone.startsWith('55') && rawPhone.length === 13) {
                    formattedPhone = `(${rawPhone.substring(2, 4)}) ${rawPhone.substring(4, 9)}-${rawPhone.substring(9)}`;
                } else if (rawPhone.startsWith('55') && rawPhone.length === 12) {
                    formattedPhone = `(${rawPhone.substring(2, 4)}) ${rawPhone.substring(4, 8)}-${rawPhone.substring(8)}`;
                }

                phoneHtml = `
                    <span style="color: #666; font-size: 14px;">
                        Telefone: <strong>${formattedPhone}</strong>
                    </span>
                    <br/>
                    <a href="${waLink}" style="display: inline-block; margin-top: 5px; color: #25D366; text-decoration: none; font-weight: bold; font-size: 14px;">
                        📲 Enviar WhatsApp
                    </a>
                `;
            }

            return `
            <li style="padding: 10px 0; border-bottom: 1px solid #eee;">
                <strong style="font-size: 16px; color: #333;">${b.name}</strong>
                <br/>
                ${phoneHtml}
            </li>
            `;
        }).join('');

        // 6. Send Email via Resend (Loop to personalize)
        console.log("Sending email via Resend to admins:", adminEmails);

        const emailPromises = adminEmails.map(async (email: string) => {
            const personalizedHtml = `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #ec1313;">🎂 Aniversariantes de Hoje! (` + today.toLocaleDateString('pt-BR') + `)</h1>
                <p>Olá ${email},</p>
                <p>Hoje é um dia especial! Aqui está a lista de aniversariantes:</p>
                <ul style="list-style: none; padding: 0;">
                    ${listHtml}
                </ul>
                <br/>
                <a href="https://aniversarios-app.vercel.app" style="background-color: #ec1313; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Abrir App</a>
              </div>
            `;

            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: 'ANIVERSARIOS <onboarding@resend.dev>', // Default testing domain
                    to: [email], // Send individually
                    subject: `🎉 ${todaysBirthdays.length} Aniversariante(s) Hoje!`,
                    html: personalizedHtml,
                }),
            });
            return res.json();
        });

        const results = await Promise.all(emailPromises);
        console.log("Resend responses:", results);

        return new Response(JSON.stringify({
            message: "Emails sent",
            results: results
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error("Unhandled error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
