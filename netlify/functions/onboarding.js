const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  try {
    const { email, name } = JSON.parse(event.body);
    const domain = email.split('@')[1];

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Check if domain is allowed
    const { data: domainMatch, error: domainError } = await supabase
      .from('org_domains')
      .select('*')
      .eq('domain', domain)
      .maybeSingle();

    if (domainError) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: domainError.message }),
      };
    }

    if (!domainMatch) {
      return {
        statusCode: 200,
        body: JSON.stringify({ allowed: false }),
      };
    }

    // 2. Add user to Supabase 'users' table
    await supabase.from('users').upsert([
      {
        email,
        name,
        domain,
        org_id: domainMatch.org_id, // if applicable
      },
    ]);

    // 3. Generate OTP login link
    const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (authError || !authData) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: authError?.message || 'Failed to generate OTP' }),
      };
    }

    const loginLink = authData.properties.action_link;

    // 4. Send Welcome Email (replace this with your email logic)
    await sendWelcomeEmail(email, name, loginLink);

    return {
      statusCode: 200,
      body: JSON.stringify({ onboarded: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

async function sendWelcomeEmail(email, name, loginLink) {
  // Example: Call your transactional email service
  await fetch(process.env.EMAIL_SERVICE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email,
      subject: 'Welcome to the Platform!',
      html: `<p>Hi ${name || 'there'},</p>
             <p>You're approved. Click below to log in:</p>
             <a href="${loginLink}">Login Now</a>`,
    }),
  });
}