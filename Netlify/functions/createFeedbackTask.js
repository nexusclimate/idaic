import { Client } from "asana";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const { name, email, subject, type, comment } = data;
  if (!name || !email || !subject || !type || !comment) {
    return { statusCode: 400, body: "Missing fields" };
  }

  const token = process.env.ASANA_TOKEN;
  const projectGid = process.env.ASANA_PROJECT_GID;
  if (!token || !projectGid) {
    console.error("env vars not set");
    return { statusCode: 500, body: "Server mis-configured" };
  }

  const client = Client.create().useAccessToken(token);
  try {
    await client.tasks.createTask({
      name: `${type[0].toUpperCase()+type.slice(1)}: ${subject}`,
      notes: `From: ${name} <${email}>\n\n${comment}`,
      projects: [projectGid],
    });
    return { statusCode: 201, body: "Created" };
  } catch (err) {
    console.error("Asana error:", err);
    return { statusCode: 502, body: "Could not create Asana task" };
  }
}