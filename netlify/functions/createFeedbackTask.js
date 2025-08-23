// netlify/functions/createFeedbackTask.js
export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  const data = JSON.parse(event.body || "{}");
  const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
  const LINEAR_TEAM_ID = process.env.LINEAR_TEAM_ID;
  const LINEAR_TRIAGE_STATE_ID = process.env.LINEAR_TRIAGE_STATE_ID;
  const LINEAR_PROJECT_ID = process.env.LINEAR_PROJECT_ID;

  if (!LINEAR_API_KEY || !LINEAR_TEAM_ID || !LINEAR_TRIAGE_STATE_ID || !LINEAR_PROJECT_ID) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Linear API key, Team ID, Triage State ID, or Project ID not configured" }) 
    };
  }

  try {
    const mutation = `
      mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            title
            description
          }
        }
      }
    `;

    const variables = {
      input: {
        teamId: LINEAR_TEAM_ID,
        title: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)}: ${data.subject}`,
        description: `${data.comment}\n\n— ${data.name} <${data.email}>`,
        priority: 2, // Medium priority (0=No priority, 1=Urgent, 2=High, 3=Medium, 4=Low)
        stateId: LINEAR_TRIAGE_STATE_ID,
        projectId: LINEAR_PROJECT_ID
      }
    };

    const response = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        "Authorization": LINEAR_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: mutation,
        variables: variables
      })
    });

    const result = await response.json();

    if (response.ok && result.data?.issueCreate?.success) {
      return { 
        statusCode: 201, 
        body: JSON.stringify({ 
          message: "Issue created successfully",
          issueId: result.data.issueCreate.issue.id 
        }) 
      };
    } else {
      const error = result.errors?.[0]?.message || "Failed to create issue";
      return { statusCode: 500, body: JSON.stringify({ error }) };
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};