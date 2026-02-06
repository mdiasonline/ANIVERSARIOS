-- ==============================================================================
-- 1. ENABLE EXTENSIONS
-- ==============================================================================
-- 'pg_cron' allows scheduling jobs inside the database
-- 'pg_net' allows making HTTP requests (to call our Edge Function)
-- Note: These must be enabled in the Supabase Dashboard > Database > Extensions if this fails.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ==============================================================================
-- 2. SCHEDULE THE JOB
-- ==============================================================================
-- This schedules the job to run every day at 08:00 AM (UTC).
-- REPLACE 'YOUR_PROJECT_REF' with your actual Supabase Project Reference ID.
-- Example URL: https://abcdefghijklm.supabase.co/functions/v1/send-birthday-email

SELECT cron.schedule(
    'send-birthday-emails-daily', -- Job Name
    '0 8 * * *',                  -- Cron Schedule (08:00 AM daily)
    $$
    select
        net.http_post(
            -- URL CONFIGURADA AUTOMATICAMENTE COM SEU ID
            url:='https://haozwgdpvcwxucocjjck.supabase.co/functions/v1/send-birthday-email',
            headers:='{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb,
            body:='{}'::jsonb
        ) as request_id;
    $$
);

-- Note: To find your PROJECT_REF, look at your Supabase URL: https://[PROJECT_REF].supabase.co
-- Note: For the Authorization header, you need the SERVICE_ROLE_KEY to bypass RLS if strict, 
-- or Anon Key if the function is public. The Edge Function uses `Deno.env.get` which usually works 
-- internally, but explicit Auth header is safer for invocation.
