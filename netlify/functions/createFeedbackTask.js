// netlify/functions/createFeedbackTask.js
export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  const data = JSON.parse(event.body || "{}");
  const ASANA_TOKEN = process.env.ASANA_TOKEN;
  const ASANA_PROJECT_GID = process.env.ASANA_PROJECT_GID;

  try {
    const response = await fetch("https://app.asana.com/api/1.0/tasks", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ASANA_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)}: ${data.subject}`,
        notes: `${data.comment}\n— ${data.name} <${data.email}>`,
        projects: [ASANA_PROJECT_GID]
      })
    });

    if (response.ok) {
      return { statusCode: 201, body: "Created" };
    } else {
      const error = await response.text();
      return { statusCode: 500, body: JSON.stringify({ error }) };
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};