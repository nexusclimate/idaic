/**
 * Generates an iCalendar (.ics) file for event invitations
 * Compatible with Google Calendar, Outlook, Apple Calendar, etc.
 */

function escapeICS(text) {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

function formatICSDate(date) {
  if (!date) return '';
  const d = new Date(date);
  // Format as YYYYMMDDTHHmmssZ (UTC)
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const seconds = String(d.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function formatICSDateLocal(date) {
  if (!date) return '';
  const d = new Date(date);
  // Format as YYYYMMDDTHHmmss (local time, no timezone)
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Generate iCalendar file content
 * @param {Object} options - Event details
 * @param {string} options.title - Event title
 * @param {string} options.description - Event description
 * @param {string} options.startDate - Event start date (ISO string)
 * @param {string} options.endDate - Event end date (ISO string) - optional, defaults to startDate + 1 hour
 * @param {string} options.location - Event location
 * @param {string} options.organizerEmail - Organizer email
 * @param {string} options.organizerName - Organizer name
 * @param {string} options.attendeeEmail - Attendee email
 * @param {string} options.attendeeName - Attendee name
 * @param {string} options.url - Event URL (optional)
 * @returns {string} iCalendar file content
 */
function generateICS({
  title,
  description,
  startDate,
  endDate,
  location,
  organizerEmail = 'info@idaic.org',
  organizerName = 'IDAIC',
  attendeeEmail,
  attendeeName,
  url
}) {
  if (!title || !startDate) {
    throw new Error('Title and startDate are required');
  }

  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 60 * 60 * 1000); // Default to 1 hour duration

  // Generate unique ID for this event
  const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@idaic.nexusclimate.co`;

  // Build ICS content
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//IDAIC//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:${escapeICS(title)}`,
    description ? `DESCRIPTION:${escapeICS(description)}` : '',
    location ? `LOCATION:${escapeICS(location)}` : '',
    `ORGANIZER;CN=${escapeICS(organizerName)}:MAILTO:${organizerEmail}`,
    attendeeEmail ? `ATTENDEE;CN=${escapeICS(attendeeName || attendeeEmail)};RSVP=TRUE:MAILTO:${attendeeEmail}` : '',
    url ? `URL:${url}` : '',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${escapeICS(title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(line => line !== '').join('\r\n');

  return ics;
}

/**
 * Convert ICS content to base64 for email attachment
 * @param {string} icsContent - ICS file content
 * @returns {string} Base64 encoded ICS content
 */
function icsToBase64(icsContent) {
  return Buffer.from(icsContent, 'utf8').toString('base64');
}

module.exports = {
  generateICS,
  icsToBase64
};

