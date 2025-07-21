import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { command } = await req.json() as { command: string };
  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'));
  let response = 'Unknown command';

  // Handle 'summary' command
  if (command === 'summary') {
    // 1. Top 5 emails by login count in last 30 days
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: logins, error: loginsError } = await supabase
      .from('user_logins')
      .select('email, login_time')
      .gte('login_time', since);
    if (loginsError) {
      return new Response(JSON.stringify({ error: loginsError.message }), { status: 500 });
    }
    // Count logins per email
    const loginMap: Record<string, { count: number; last: string }> = {};
    for (const l of logins ?? []) {
      const email = l.email;
      if (!loginMap[email]) loginMap[email] = { count: 0, last: l.login_time };
      loginMap[email].count++;
      if (l.login_time > loginMap[email].last) loginMap[email].last = l.login_time;
    }
    const topEmails = Object.entries(loginMap)
      .sort((a, b) => (b[1] as { count: number }).count - (a[1] as { count: number }).count)
      .slice(0, 5) as [string, { count: number; last: string }][];
    let summary = '*Top 5 users by logins (last 30 days):*\n';
    if (topEmails.length === 0) {
      summary += 'No logins in last 30 days.';
    } else {
      summary += topEmails.map(([email, info]) => {
        const date = new Date(info.last).toLocaleString('en-GB', {
          day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
        });
        return `${email} | ${info.count} logins | last: ${date}`;
      }).join('\n');
    }
    // 2. New domains added in last 30 days from users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email, created_at')
      .gte('created_at', since);
    if (usersError) {
      return new Response(JSON.stringify({ error: usersError.message }), { status: 500 });
    }
    const newDomains = Array.from(new Set((users ?? [])
      .map(u => u.email.split('@')[1]?.toLowerCase())
      .filter(Boolean)));
    let domainSummary = '\n\n*New email domains added in last 30 days:*\n';
    if (newDomains.length === 0) {
      domainSummary += 'No new domains.';
    } else {
      domainSummary += newDomains.join(', ');
    }
    response = summary + domainSummary;
  } else if (command.includes('.')) {
    const domain = command.trim().toLowerCase();
    // 1. Check if domain already exists
    const { data: existing, error: checkError } = await supabase.from('org_domains').select('id').eq('domain_email', domain).maybeSingle();
    if (checkError) {
      return new Response(JSON.stringify({ error: checkError.message }), { status: 500 });
    }
    if (existing) {
      response = `⚠️ Domain "${domain}" already exists.`;
    } else {
      // 2. Insert new org
      const { data: org, error: orgError } = await supabase.from('orgs').insert({ name: domain }).select('id').single();
      if (orgError) {
        return new Response(JSON.stringify({ error: orgError.message }), { status: 500 });
      }
      // 3. Insert new domain
      const { error: domainInsertError } = await supabase.from('org_domains').insert({ domain_email: domain, name: domain.split('.')[0], org_id: org.id });
      if (domainInsertError) {
        return new Response(JSON.stringify({ error: domainInsertError.message }), { status: 500 });
      }
      response = `✅ Domain "${domain}" has been added and linked to a new org.`;
    }
  }
  return new Response(JSON.stringify({ text: response }), {
    headers: { 'Content-Type': 'application/json' }
  });
}); 