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
        // Get user's profile by email or id
        const { email, id } = event.queryStringParameters || {};
        
        if (!email && !id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Email or ID parameter is required' })
          };
        }

        let query = supabase
          .from('users')
          .select('*');
        
        if (id) {
          query = query.eq('id', id);
        } else {
          query = query.eq('email', email);
        }
        
        const { data, error } = await query.limit(1);

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
            profile_updated_at: profile.profile_updated_at,
            data_permission: profile.data_permission,
            newsletter_idaic_content: profile.newsletter_idaic_content,
            newsletter_idaic_uk: profile.newsletter_idaic_uk,
            newsletter_idaic_mena: profile.newsletter_idaic_mena,
            newsletter_csn_news: profile.newsletter_csn_news,
            newsletter_uae_climate: profile.newsletter_uae_climate,
            updated_at: profile.updated_at,
            updated_by: profile.updated_by
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
        if (!profileData.email || !profileData.name) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Name and email are required' })
          };
        }

        if (profileData.data_permission === undefined || profileData.data_permission === '') {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Please select an option for data permission' })
          };
        }

        // Validate role if provided (only for admin role management)
        // Users updating their own profiles don't need role validation
        if (profileData.role && profileData.role !== '') {
          const validRoles = ['guest', 'member', 'admin', 'moderator'];
          if (!validRoles.includes(profileData.role.toLowerCase())) {
            return {
              statusCode: 400,
              body: JSON.stringify({ 
                error: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
              })
            };
          }
        }

        // Check if user already exists by email
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', profileData.email)
          .maybeSingle(); // Use maybeSingle instead of single to handle no results gracefully

        // Map camelCase form fields to database fields - MINIMAL SET for new users
        const mappedData = {
          name: profileData.name,
          email: profileData.email,
          role: profileData.role ? profileData.role.toLowerCase() : 'member', // Default to member
          data_permission: profileData.data_permission,
          profile_updated_at: new Date().toISOString()
          // Only include essential fields to avoid any constraint issues
          // Don't include updated_by, company, title, etc. for new users
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
          // Create new user with explicit UUID and minimal fields
          const newUserId = crypto.randomUUID();
          
          console.log('🔄 Creating new user with UUID:', newUserId);
          console.log('📊 User data:', { 
            name: profileData.name, 
            email: profileData.email, 
            role: profileData.role || 'member',
            data_permission: profileData.data_permission || false
          });
          
          // Try direct insert with absolute minimal fields to avoid any constraints
          const { data: insertData, error: insertError } = await supabase
            .from('users')
            .insert([{
              id: newUserId,
              name: profileData.name,
              email: profileData.email,
              role: profileData.role || 'member',
              data_permission: profileData.data_permission || false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select();

          if (insertError) {
            console.error('❌ Error creating user:', insertError);
            console.error('❌ Error details:', {
              message: insertError.message,
              details: insertError.details,
              hint: insertError.hint,
              code: insertError.code
            });
            
            return {
              statusCode: 500,
              body: JSON.stringify({ 
                error: `Failed to create user: ${insertError.message}`,
                details: insertError.details,
                hint: insertError.hint
              })
            };
          }
          
          console.log('✅ User created successfully:', insertData[0]);
          result = insertData[0];
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

        // Validate role if provided (only for admin role management)
        // Users updating their own profiles don't need role validation
        if (updates.role && updates.role !== '') {
          const validRoles = ['guest', 'member', 'admin', 'moderator'];
          if (!validRoles.includes(updates.role.toLowerCase())) {
            return {
              statusCode: 400,
              body: JSON.stringify({ 
                error: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
              })
            };
          }
        }

        // Map camelCase updates to database fields
        const mappedUpdates = {};
        // Note: user_id is not a column in users table - it's just 'id'
        if (updates.name !== undefined) mappedUpdates.name = updates.name;
        if (updates.email !== undefined) mappedUpdates.email = updates.email;
        if (updates.role !== undefined) mappedUpdates.role = updates.role.toLowerCase();
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
        if (updates.data_permission !== undefined) mappedUpdates.data_permission = updates.data_permission;
        if (updates.newsletter_idaic_content !== undefined) mappedUpdates.newsletter_idaic_content = updates.newsletter_idaic_content;
        if (updates.newsletter_idaic_uk !== undefined) mappedUpdates.newsletter_idaic_uk = updates.newsletter_idaic_uk;
        if (updates.newsletter_idaic_mena !== undefined) mappedUpdates.newsletter_idaic_mena = updates.newsletter_idaic_mena;
        if (updates.newsletter_csn_news !== undefined) mappedUpdates.newsletter_csn_news = updates.newsletter_csn_news;
        if (updates.newsletter_uae_climate !== undefined) mappedUpdates.newsletter_uae_climate = updates.newsletter_uae_climate;
        
        // Track who updated this record and when (updated_at is handled by trigger)
        if (updates.updated_by !== undefined) {
          mappedUpdates.updated_by = updates.updated_by;
          console.log('📝 Profile updated by user:', updates.updated_by);
        }

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
          profile_updated_at: profile.profile_updated_at,
          data_permission: profile.data_permission,
          newsletter_idaic_content: profile.newsletter_idaic_content,
          newsletter_idaic_uk: profile.newsletter_idaic_uk,
          newsletter_idaic_mena: profile.newsletter_idaic_mena,
          newsletter_csn_news: profile.newsletter_csn_news,
          newsletter_uae_climate: profile.newsletter_uae_climate,
          updated_at: profile.updated_at,
          updated_by: profile.updated_by
        };

        return {
          statusCode: 200,
          body: JSON.stringify(mappedProfile)
        };
      }

      case 'DELETE': {
        // Delete user profile
        const { id } = event.queryStringParameters || {};

        if (!id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'User ID is required' })
          };
        }

        console.log('🗑️ Deleting user profile:', id);

        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', id);

        if (deleteError) {
          console.error('❌ Error deleting user:', deleteError);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to delete user' })
          };
        }

        console.log('✅ User deleted successfully:', id);

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'User deleted successfully'
          })
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
