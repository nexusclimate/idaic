import Asana from "asana";

const client = Asana.Client.create().useAccessToken(process.env.ASANA_TOKEN);
const PROJECT_GID = process.env.ASANA_PROJECT_GID;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  const { name, email, subject, type, comment } = JSON.parse(event.body);
  try {
    await client.tasks.createTask({
      projects: [PROJECT_GID],
      name: `${type.charAt(0).toUpperCase() + type.slice(1)}: ${subject}`,
      notes: `From: ${name} <${email}>\n\nType: ${type}\n\n${comment}`,
    });
    return { statusCode: 201, body: "Created" };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
