const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const DELETE_OLD_USERS = false;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
const listId = process.env.HUBSPOT_LIST_ID;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

exports.handler = async function (event, context) {
  try {
    let deletedCount = 0;

    // STEP 1: Optionally delete existing HubSpot users
    if (DELETE_OLD_USERS) {
      console.log("🧹 Fetching current users...");
      const { data: users, error: fetchError } = await supabase.auth.admin.listUsers({ perPage: 1000 });

      if (fetchError) throw new Error("Failed to fetch users: " + fetchError.message);

      const toDelete = users.users.filter(
        u => u.user_metadata?.source === 'hubspot-v1'
      );

      for (const user of toDelete) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (deleteError) {
          console.error(`❌ Failed to delete ${user.email}:`, deleteError.message);
        } else {
          console.log(`✅ Deleted ${user.email}`);
          deletedCount++;
        }
      }
    }

    // STEP 2: Fetch new users from HubSpot list
    console.log("🔗 Fetching contacts from HubSpot...");
    const hubspotRes = await fetch(
      `https://api.hubapi.com/contacts/v1/lists/${listId}/contacts/all`,
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const hubspotData = await hubspotRes.json();

    if (!hubspotData.contacts || hubspotData.contacts.length === 0) {
      throw new Error("No contacts returned from HubSpot");
    }

    let created = 0;
    for (const contact of hubspotData.contacts) {
      const identities = contact['identity-profiles']?.[0]?.identities || [];
      const emailObj = identities.find(id => id.type === 'EMAIL');
      const email = emailObj?.value;

      if (!email) continue;

      const { error } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { source: 'hubspot-v1' }
      });

      if (!error) {
        created++;
        console.log(`🆕 Created ${email}`);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Deleted ${deletedCount} old users, created ${created} new ones.` })
    };
  } catch (err) {
    console.error("❌ Error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};