import 'server-only'; // 👈 This line protects your app
import { createClient } from '@supabase/supabase-js';

// This client uses the SERVICE_ROLE_KEY which bypasses all security rules.
// We use this only on the server (API routes) to manage subscriptions.
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
