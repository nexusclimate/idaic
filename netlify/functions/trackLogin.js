const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // Use service role for write permissions
);

// Server-side function to fetch geolocation data for an IP address using multiple sources
async function fetchGeolocationData(ip) {
  if (!ip || ip === 'Unknown') {
    return null;
  }

  // Define multiple geolocation services with their parsers
  const geoServices = [
    {
      name: 'ipapi.co',
      url: `https://ipapi.co/${ip}/json/`,
      parser: (data) => {
        if (!data.error) {
          return {
            country: data.country_name || data.country || 'Unknown',
            countryCode: data.country_code || 'Unknown',
            city: data.city || 'Unknown',
            region: data.region || 'Unknown',
            regionCode: data.region_code || 'Unknown',
            timezone: data.timezone || 'Unknown',
            isp: data.org || data.isp || 'Unknown',
            org: data.org || 'Unknown',
            asn: data.asn || 'Unknown',
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            postalCode: data.postal || 'Unknown'
          };
        }
        return null;
      }
    },
    {
      name: 'ipwho.is',
      url: `https://ipwho.is/${ip}`,
      parser: (data) => {
        if (data.success) {
          return {
            country: data.country || 'Unknown',
            countryCode: data.country_code || 'Unknown',
            city: data.city || 'Unknown',
            region: data.region || 'Unknown',
            regionCode: data.region_code || 'Unknown',
            timezone: data.timezone?.name || data.timezone?.id || 'Unknown',
            isp: data.connection?.isp || 'Unknown',
            org: data.connection?.org || 'Unknown',
            asn: data.connection?.asn ? String(data.connection.asn) : 'Unknown',
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            postalCode: data.postal || 'Unknown'
          };
        }
        return null;
      }
    },
    {
      name: 'ip-api.com (HTTP)',
      url: `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,as,zip`,
      parser: (data) => {
        if (data.status === 'success') {
          return {
            country: data.country || 'Unknown',
            countryCode: data.countryCode || 'Unknown',
            city: data.city || 'Unknown',
            region: data.regionName || data.region || 'Unknown',
            regionCode: data.region || 'Unknown',
            timezone: data.timezone || 'Unknown',
            isp: data.isp || 'Unknown',
            org: data.org || 'Unknown',
            asn: data.as ? data.as.split(' ')[0] : 'Unknown',
            latitude: data.lat || null,
            longitude: data.lon || null,
            postalCode: data.zip || 'Unknown'
          };
        }
        return null;
      }
    },
    {
      name: 'ip-api.com (HTTPS)',
      url: `https://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,as,zip`,
      parser: (data) => {
        if (data.status === 'success') {
          return {
            country: data.country || 'Unknown',
            countryCode: data.countryCode || 'Unknown',
            city: data.city || 'Unknown',
            region: data.regionName || data.region || 'Unknown',
            regionCode: data.region || 'Unknown',
            timezone: data.timezone || 'Unknown',
            isp: data.isp || 'Unknown',
            org: data.org || 'Unknown',
            asn: data.as ? data.as.split(' ')[0] : 'Unknown',
            latitude: data.lat || null,
            longitude: data.lon || null,
            postalCode: data.zip || 'Unknown'
          };
        }
        return null;
      }
    }
  ];

  // Try each service until one succeeds
  for (const service of geoServices) {
    try {
      const geoResponse = await Promise.race([
        fetch(service.url),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Geo fetch timeout')), 5000))
      ]);

      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        const parsedGeo = service.parser(geoData);
        
        if (parsedGeo) {
          console.log(`✅ Server-side geolocation data fetched from ${service.name}`);
          return parsedGeo;
        } else {
          console.warn(`⚠️ ${service.name} returned invalid data`);
        }
      } else {
        console.warn(`⚠️ ${service.name} returned HTTP ${geoResponse.status}`);
      }
    } catch (serviceErr) {
      console.warn(`⚠️ Server-side ${service.name} failed:`, serviceErr.message);
      // Continue to next service
    }
  }

  console.warn('⚠️ All server-side geolocation services failed');
  return null; // All attempts failed
}

exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const loginData = JSON.parse(event.body);

    // Extract IP from server-side headers as fallback (more reliable than client-side)
    // Netlify provides client IP in these headers (in order of preference)
    const serverIP = event.headers['x-nf-client-connection-ip'] || 
                     event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                     event.headers['x-real-ip'] ||
                     event.headers['client-ip'] ||
                     null;

    // Use server-side IP if client-side IP is missing or 'Unknown'
    const finalIP = (loginData.ip_address && loginData.ip_address !== 'Unknown') 
      ? loginData.ip_address 
      : (serverIP || 'Unknown');

    if (serverIP && (!loginData.ip_address || loginData.ip_address === 'Unknown')) {
      console.log('✅ Using server-side IP as fallback:', serverIP);
    }

    console.log('📝 Received login tracking request:', {
      user_id: loginData.user_id,
      email: loginData.email,
      login_method: loginData.login_method,
      ip_address: loginData.ip_address,
      server_ip: serverIP,
      final_ip: finalIP,
      country: loginData.country,
      country_code: loginData.country_code,
      city: loginData.city,
      region: loginData.region,
      region_code: loginData.region_code,
      timezone: loginData.timezone,
      isp: loginData.isp,
      organization: loginData.organization,
      asn: loginData.asn,
      latitude: loginData.latitude,
      longitude: loginData.longitude,
      postal_code: loginData.postal_code,
      browser: loginData.browser,
      browser_version: loginData.browser_version,
      device: loginData.device,
      screen_resolution: `${loginData.screen_width}x${loginData.screen_height}`,
      language: loginData.language
    });

    // Validate required fields
    if (!loginData.user_id || !loginData.email) {
      console.error('❌ Missing required fields:', {
        has_user_id: !!loginData.user_id,
        has_email: !!loginData.email,
        full_data: loginData
      });
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'user_id and email are required',
          received: {
            has_user_id: !!loginData.user_id,
            has_email: !!loginData.email
          }
        })
      };
    }

    const loginTime = loginData.login_time || new Date().toISOString();

    // If client-side geolocation failed but we have a server-side IP, fetch geolocation on server
    let geoData = {
      country: loginData.country || 'Unknown',
      country_code: loginData.country_code || 'Unknown',
      city: loginData.city || 'Unknown',
      region: loginData.region || 'Unknown',
      region_code: loginData.region_code || 'Unknown',
      timezone: loginData.timezone || 'Unknown',
      isp: loginData.isp || 'Unknown',
      organization: loginData.organization || 'Unknown',
      asn: loginData.asn || 'Unknown',
      latitude: loginData.latitude !== null && loginData.latitude !== undefined ? loginData.latitude : null,
      longitude: loginData.longitude !== null && loginData.longitude !== undefined ? loginData.longitude : null,
      postal_code: loginData.postal_code || 'Unknown'
    };

    // Check if we need to fetch geolocation on server side
    const needsServerGeo = finalIP !== 'Unknown' && 
      (loginData.ip_address === 'Unknown' || 
       (geoData.country === 'Unknown' && geoData.city === 'Unknown' && geoData.region === 'Unknown'));

    if (needsServerGeo) {
      console.log('🔄 Fetching geolocation data on server side for IP:', finalIP);
      const serverGeo = await fetchGeolocationData(finalIP);
      if (serverGeo) {
        geoData = {
          country: serverGeo.country,
          country_code: serverGeo.countryCode,
          city: serverGeo.city,
          region: serverGeo.region,
          region_code: serverGeo.regionCode,
          timezone: serverGeo.timezone,
          isp: serverGeo.isp,
          organization: serverGeo.org,
          asn: serverGeo.asn,
          latitude: serverGeo.latitude,
          longitude: serverGeo.longitude,
          postal_code: serverGeo.postalCode
        };
        console.log('✅ Server-side geolocation data fetched:', geoData);
      }
    }

    // Prepare the insert data with proper defaults and enhanced metadata
    const insertData = {
      user_id: loginData.user_id,
      email: loginData.email,
      ip_address: finalIP, // Use server-side IP as fallback if client-side failed
      country: geoData.country,
      country_code: geoData.country_code,
      city: geoData.city,
      region: geoData.region,
      region_code: geoData.region_code,
      timezone: geoData.timezone,
      isp: geoData.isp,
      organization: geoData.organization,
      asn: geoData.asn,
      latitude: geoData.latitude,
      longitude: geoData.longitude,
      postal_code: geoData.postal_code,
      device: loginData.device || 'Unknown',
      browser: loginData.browser || 'Unknown',
      browser_version: loginData.browser_version || 'Unknown',
      os: loginData.os || 'Unknown',
      user_agent: loginData.user_agent || 'Unknown',
      language: loginData.language || 'Unknown',
      languages: loginData.languages || 'Unknown',
      platform: loginData.platform || 'Unknown',
      cookie_enabled: loginData.cookie_enabled || 'Unknown',
      do_not_track: loginData.do_not_track || 'Unknown',
      screen_width: loginData.screen_width !== null && loginData.screen_width !== undefined ? loginData.screen_width : null,
      screen_height: loginData.screen_height !== null && loginData.screen_height !== undefined ? loginData.screen_height : null,
      screen_color_depth: loginData.screen_color_depth !== null && loginData.screen_color_depth !== undefined ? loginData.screen_color_depth : null,
      viewport_width: loginData.viewport_width !== null && loginData.viewport_width !== undefined ? loginData.viewport_width : null,
      viewport_height: loginData.viewport_height !== null && loginData.viewport_height !== undefined ? loginData.viewport_height : null,
      timezone_offset: loginData.timezone_offset !== null && loginData.timezone_offset !== undefined ? loginData.timezone_offset : null,
      online_status: loginData.online_status || 'Unknown',
      hardware_concurrency: loginData.hardware_concurrency !== null && loginData.hardware_concurrency !== undefined ? loginData.hardware_concurrency : null,
      device_memory: loginData.device_memory !== null && loginData.device_memory !== undefined ? loginData.device_memory : null,
      login_time: loginTime,
      login_method: loginData.login_method || 'unknown'
    };

    console.log('📤 Inserting login record with data:', insertData);

    // Insert login record
    const { data, error } = await supabase
      .from('user_logins')
      .insert([insertData])
      .select();

    if (error) {
      console.error('❌ Error inserting login record:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        full_error: error
      });
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to insert login record',
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
      };
    }

    if (!data || data.length === 0) {
      console.error('❌ No data returned from insert, but no error reported');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Insert succeeded but no data returned'
        })
      };
    }

    console.log('✅ Login tracked successfully:', data[0]);

    // Also update the last_login and last_activity columns in users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        last_login: loginTime,
        last_activity: loginTime  // Also set last_activity on login
      })
      .eq('id', loginData.user_id);

    if (updateError) {
      console.error('❌ Error updating users.last_login:', updateError);
      // Don't fail the entire request, just log the error
    } else {
      console.log('✅ Updated users.last_login for user:', loginData.user_id);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Login tracked successfully',
        data: data[0]
      })
    };

  } catch (error) {
    console.error('❌ Track login function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

