const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async function (event, context) {
  try {
    switch (event.httpMethod) {
      case 'GET': {
        // Get user's profile by email
        const { email } = event.queryStringParameters || {};
        
        if (!email) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Email parameter is required' })
          };
        }

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .limit(1);

        if (error) {
          console.error('Error fetching user profile:', error);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
          };
        }

        // Map database fields to frontend format
        const profile = data && data.length > 0 ? data[0] : null;
        if (profile) {
          const mappedProfile = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            company: profile.company,
            title: profile.title,
            region: profile.region,
            linkedin_url: profile.linkedin_url,
            category: profile.category,
            otherCategory: profile.other_category,
            organizationDescription: profile.organization_description,
            aiDecarbonisation: profile.ai_decarbonisation,
            challenges: profile.challenges,
            contribution: profile.contribution,
            projects: profile.projects,
            shareProjects: profile.share_projects,
            aiTools: profile.ai_tools,
            content: profile.content,
            approval: profile.approval,
            profile_updated_at: profile.profile_updated_at
          };
          return {
            statusCode: 200,
            body: JSON.stringify(mappedProfile)
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify(null)
        };
      }

      case 'POST': {
        // Create or update user profile
        const profileData = JSON.parse(event.body);

        // Validate required fields
        if (!profileData.name || !profileData.email) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Name and email are required' })
          };
        }

        // Check if user already exists by email
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', profileData.email)
          .single();

        // Map camelCase form fields to database fields
        const mappedData = {
          name: profileData.name,
          email: profileData.email,
          role: profileData.role,
          company: profileData.company,
          title: profileData.title,
          region: profileData.region,
          linkedin_url: profileData.linkedinUrl,
          category: profileData.category,
          other_category: profileData.otherCategory,
          organization_description: profileData.organizationDescription,
          ai_decarbonisation: profileData.aiDecarbonisation,
          challenges: profileData.challenges,
          contribution: profileData.contribution,
          projects: profileData.projects,
          share_projects: profileData.shareProjects,
          ai_tools: profileData.aiTools,
          content: profileData.content,
          approval: profileData.approval,
          profile_updated_at: new Date().toISOString()
        };

        let result;
        if (existingUser) {
          // Update existing user
          const { data, error } = await supabase
            .from('users')
            .update(mappedData)
            .eq('id', existingUser.id)
            .select();

          if (error) {
            console.error('Error updating user profile:', error);
            return {
              statusCode: 500,
              body: JSON.stringify({ error: error.message })
            };
          }

          result = data[0];
        } else {
          // Create new user (this shouldn't happen in normal flow as users are created during login)
          // But we'll handle it gracefully
          const insertData = {
            ...mappedData,
            id: profileData.user_id || null // Use the user_id if provided
          };
          const { data, error } = await supabase
            .from('users')
            .insert([insertData])
            .select();

          if (error) {
            console.error('Error creating user profile:', error);
            return {
              statusCode: 500,
              body: JSON.stringify({ error: error.message })
            };
          }

          result = data[0];
        }

        console.log('✅ Profile saved successfully');
        console.log('📝 Profile ID:', result.id);
        console.log('👤 User:', profileData.name, '(' + profileData.email + ')');
        console.log('🏢 Category:', profileData.category);

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Profile submitted successfully. It will be reviewed for approval.',
            profile: result
          })
        };
      }

      case 'PUT': {
        // Update existing user profile
        const { id } = event.queryStringParameters || {};
        const updates = JSON.parse(event.body);

        if (!id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Profile ID is required' })
          };
        }

        // Map camelCase updates to database fields
        const mappedUpdates = {};
        if (updates.user_id !== undefined) mappedUpdates.user_id = updates.user_id;
        if (updates.name !== undefined) mappedUpdates.name = updates.name;
        if (updates.email !== undefined) mappedUpdates.email = updates.email;
        if (updates.role !== undefined) mappedUpdates.role = updates.role;
        if (updates.company !== undefined) mappedUpdates.company = updates.company;
        if (updates.title !== undefined) mappedUpdates.title = updates.title;
        if (updates.region !== undefined) mappedUpdates.region = updates.region;
        if (updates.linkedinUrl !== undefined) mappedUpdates.linkedin_url = updates.linkedinUrl;
        if (updates.category !== undefined) mappedUpdates.category = updates.category;
        if (updates.otherCategory !== undefined) mappedUpdates.other_category = updates.otherCategory;
        if (updates.organizationDescription !== undefined) mappedUpdates.organization_description = updates.organizationDescription;
        if (updates.aiDecarbonisation !== undefined) mappedUpdates.ai_decarbonisation = updates.aiDecarbonisation;
        if (updates.challenges !== undefined) mappedUpdates.challenges = updates.challenges;
        if (updates.contribution !== undefined) mappedUpdates.contribution = updates.contribution;
        if (updates.projects !== undefined) mappedUpdates.projects = updates.projects;
        if (updates.shareProjects !== undefined) mappedUpdates.share_projects = updates.shareProjects;
        if (updates.aiTools !== undefined) mappedUpdates.ai_tools = updates.aiTools;
        if (updates.content !== undefined) mappedUpdates.content = updates.content;
        if (updates.approval !== undefined) mappedUpdates.approval = updates.approval;
        
        mappedUpdates.updated_at = new Date().toISOString();

        const { data: updatedProfile, error: updateError } = await supabase
          .from('users')
          .update(mappedUpdates)
          .eq('id', id)
          .select();

        if (updateError) {
          console.error('Error updating user profile:', updateError);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: updateError.message })
          };
        }

        // Map the updated profile back to frontend format
        const profile = updatedProfile[0];
        const mappedProfile = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          company: profile.company,
          title: profile.title,
          region: profile.region,
          linkedin_url: profile.linkedin_url,
          category: profile.category,
          otherCategory: profile.other_category,
          organizationDescription: profile.organization_description,
          aiDecarbonisation: profile.ai_decarbonisation,
          challenges: profile.challenges,
          contribution: profile.contribution,
          projects: profile.projects,
          shareProjects: profile.share_projects,
          aiTools: profile.ai_tools,
          content: profile.content,
          approval: profile.approval,
          profile_updated_at: profile.profile_updated_at
        };

        return {
          statusCode: 200,
          body: JSON.stringify(mappedProfile)
        };
      }

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('User profile function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
