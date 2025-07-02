import { Client } from 'asana';

export const handler = async (event) => {
  try {
    const { name, email, subject, type, comment } = JSON.parse(event.body);
    if (![name,email,subject,type,comment].every(Boolean)) {
      return { statusCode:400, body: 'All fields required' };
    }

    const client = Client.create().useAccessToken(
      process.env.ASANA_TOKEN
    );

    await client.tasks.createTask({
      projects: [ process.env.ASANA_PROJECT_GID ],
      name: `${type[0].toUpperCase()+type.slice(1)}: ${subject}`,
      notes: `From: ${name} <${email}>\n\nComment:\n${comment}`,
    });

    return { statusCode:201, body: 'Created' };
  } catch(err) {
    return {
      statusCode:500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
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
