const path = require('path');
require('dotenv').config({ path: '../.env.local' });

const { createClient } = require('@supabase/supabase-js');



const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function deleteHubspotUsers() {
  console.log("Fetching all users...");

  const { data: users, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });

  if (error) {
    console.error("❌ Failed to list users:", error.message);
    return;
  }

  const targetUsers = users.users.filter(
    (u) => u.user_metadata?.source === 'hubspot-v3'
  );

  console.log(`Found ${targetUsers.length} HubSpot users to delete.`);

  let deleted = 0;
  for (const user of targetUsers) {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error(`❌ Failed to delete ${user.email}:`, deleteError.message);
    } else {
      console.log(`✅ Deleted ${user.email}`);
      deleted++;
    }
  }

  console.log(`🧹 Done. Deleted ${deleted} user(s) from HubSpot.`);
}

deleteHubspotUsers();