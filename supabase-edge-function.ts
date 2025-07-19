import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://login.nexusclimate.co',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
serve(async (req)=>{
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: corsHeaders
      });
    }
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const projectUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    let payload;
    try {
      payload = await req.json();
    } catch (err) {
      console.error('❌ Invalid JSON payload:', err);
      return jsonResponse({
        error: 'Invalid JSON payload'
      }, 400);
    }
    if (!payload || typeof payload !== 'object') {
      return jsonResponse({
        error: 'Missing payload'
      }, 400);
    }
    // 🎯 Case 1: Supabase webhook payload
    if (payload?.event === 'SIGNED_IN' && payload?.session?.user?.id) {
      const user = payload.session.user;
      const { error } = await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name ?? null
      });
      if (error) {
        console.error('❌ Error syncing user from webhook:', error);
        return jsonResponse({
          error: 'Error syncing user from hook'
        }, 500);
      }
      return jsonResponse({
        message: 'User processed from webhook'
      }, 200);
    }
    // 🎯 Case 2: Manual POST from client with { email }
    const { email } = payload;
    if (!email || typeof email !== 'string') {
      return jsonResponse({
        error: 'Missing or invalid email'
      }, 400);
    }
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) {
      return jsonResponse({
        error: 'Invalid email domain'
      }, 400);
    }
    // Domain check
    const { data: domainMatch, error: domainError } = await supabase.from('org_domains').select('*').eq('domain_email', domain).maybeSingle();
    if (domainError || !domainMatch) {
      return jsonResponse({
        error: domainError?.message || 'Domain not allowed'
      }, domainError ? 500 : 403);
    }
    // Try to create Auth user
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true
    });
    // Handle user already exists in Auth
    if (userError) {
      const alreadyExists = userError.message?.includes('User already registered') ||
                       userError.message?.includes('email_exists') ||
                       userError.code === 'email_exists';
      if (alreadyExists) {
        // Try /by-email first
        let authUser: { id: string; email: string } | null = null;
        let getUserError: string | null = null;
        const cleanEmail = email.trim().toLowerCase();
        let getUserRes = await fetch(`${projectUrl}/auth/v1/admin/users/by-email?email=${encodeURIComponent(cleanEmail)}`, {
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (getUserRes.ok) {
          authUser = await getUserRes.json();
        } else if (getUserRes.status === 404) {
          // Fallback: list all users and filter
          const listUsersRes = await fetch(`${projectUrl}/auth/v1/admin/users?per_page=1000`, {
            headers: {
              'apikey': serviceRoleKey,
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json'
            }
          });
          if (listUsersRes.ok) {
            const usersData = await listUsersRes.json();
            // usersData.users is an array
            authUser = usersData.users.find((u: { email: string }) => u.email.trim().toLowerCase() === cleanEmail);
            if (!authUser) {
              getUserError = 'User not found in Auth (fallback)';
            }
          } else {
            getUserError = await listUsersRes.text();
          }
        } else {
          getUserError = await getUserRes.text();
        }

        if (getUserError || !authUser || !authUser.id) {
          console.error('❌ User exists in Auth but could not fetch user ID:', getUserError);
          return jsonResponse({ error: 'User exists in Auth but could not fetch user ID', detail: getUserError }, 500);
        }

        // Upsert into users table
        const { error: upsertError } = await supabase.from('users').upsert({
          id: authUser.id,
          email: authUser.email
        });
        if (upsertError) {
          console.error('❌ User exists in Auth but upsert to users table failed:', upsertError);
          return jsonResponse({ error: 'User exists in Auth but upsert to users table failed' }, 500);
        }
        return jsonResponse({
          created: false,
          reason: 'already_exists',
          user_id: authUser.id
        }, 200);
      }
      // All other errors
      console.error('❌ Error creating user in Auth:', userError);
      return jsonResponse({ error: userError.message }, 500);
    }
    // Insert new user into users table
    if (user?.user?.id) {
      const { error: insertError } = await supabase.from('users').upsert({
        id: user.user.id,
        email,
        name: null
      });
      if (insertError) {
        console.error('❌ DB upsert error:', insertError);
        return jsonResponse({
          error: 'Failed to upsert user in users table'
        }, 500);
      }
    }
    return jsonResponse({
      created: true,
      user_id: user?.user?.id
    }, 200);
  } catch (err) {
    console.error('❌ Unhandled error:', err);
    return new Response(JSON.stringify({
      error: err.message || 'Unknown error'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
