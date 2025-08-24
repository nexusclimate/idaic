// netlify/functions/uploadFeedbackFiles.js
import { Buffer } from 'buffer';

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const LINEAR_API_KEY = process.env.LINEAR_API_KEY;

  if (!LINEAR_API_KEY) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Linear API key not configured" }) 
    };
  }

  try {
    // Parse the JSON body containing file data
    const { files } = JSON.parse(event.body || "{}");
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "No files provided" }) 
      };
    }

    const uploadResults = [];

    for (const fileData of files) {
      try {
        const result = await uploadFileToLinear(fileData, LINEAR_API_KEY);
        uploadResults.push(result);
      } catch (error) {
        console.error('Error uploading file:', error);
        uploadResults.push({
          success: false,
          filename: fileData.name,
          error: error.message
        });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "File upload process completed",
        results: uploadResults
      })
    };

  } catch (err) {
    console.error('Error in uploadFeedbackFiles:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

// Helper function to upload file to Linear
async function uploadFileToLinear(fileData, apiKey) {
  try {
    // Step 1: Request upload URL from Linear
    const uploadMutation = `
      mutation FileUpload($contentType: String!, $filename: String!, $size: Int!) {
        fileUpload(contentType: $contentType, filename: $filename, size: $size) {
          success
          uploadFile {
            uploadUrl
            assetUrl
            headers {
              key
              value
            }
          }
        }
      }
    `;

    const uploadVariables = {
      contentType: fileData.type || 'application/octet-stream',
      filename: fileData.name,
      size: fileData.size
    };

    const uploadResponse = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: uploadMutation,
        variables: uploadVariables
      })
    });

    const uploadResult = await uploadResponse.json();

    if (!uploadResult.data?.fileUpload?.success) {
      throw new Error('Failed to get upload URL from Linear');
    }

    const { uploadUrl, assetUrl, headers } = uploadResult.data.fileUpload.uploadFile;

    // Step 2: Upload file to the provided URL
    const fileBuffer = Buffer.from(fileData.content, 'base64');
    
    // Prepare headers for the upload
    const uploadHeaders = {
      'Content-Type': fileData.type || 'application/octet-stream',
    };
    
    // Add any additional headers provided by Linear
    if (headers) {
      headers.forEach(header => {
        uploadHeaders[header.key] = header.value;
      });
    }

    const fileUploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: uploadHeaders,
      body: fileBuffer
    });

    if (!fileUploadResponse.ok) {
      throw new Error(`File upload failed: ${fileUploadResponse.statusText}`);
    }

    return {
      success: true,
      filename: fileData.name,
      assetUrl: assetUrl
    };

  } catch (error) {
    console.error('Error uploading file to Linear:', error);
    throw error;
  }
}
