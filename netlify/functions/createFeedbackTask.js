// netlify/functions/createFeedbackTask.js
import Asana from "asana";

export const handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const data = JSON.parse(event.body || "{}");
  const client = Asana.Client.create().useAccessToken(process.env.ASANA_TOKEN);
  try {
    await client.tasks.create({
      name: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)}: ${data.subject}`,
      notes: `${data.comment}\n— ${data.name} <${data.email}>`,
      projects: [ process.env.ASANA_PROJECT_GID ],
    });
    return { statusCode: 201, body: "Created" };
  } catch (err) {
    console.error("Asana error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};