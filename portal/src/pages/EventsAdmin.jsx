import { useState, useEffect } from 'react';
import { colors, font } from '../config/colors';
import { ErrorMessage, SuccessMessage } from '../components/ErrorMessage';

export default function EventsAdmin() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState({}); // event_id -> registrations array
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  // Auto-dismiss success messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-dismiss error messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
      setError(null);
      
      // Fetch registrations for each event
      for (const event of data) {
        await fetchRegistrations(event.id);
      }
    } catch (err) {
      setError('Failed to load events: ' + err.message);
    }
    setLoading(false);
  };

  const fetchRegistrations = async (eventId) => {
    try {
      const response = await fetch(`/.netlify/functions/eventRegistrations?event_id=${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setRegistrations(prev => ({ ...prev, [eventId]: data }));
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      // Generate UUID for the event (backend will also generate if not provided)
      const eventId = crypto.randomUUID();
      const newEvent = {
        ...eventData,
        id: eventId
      };

      const response = await fetch('/.netlify/functions/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }

      const createdEvent = await response.json();
      setSuccess(`Event created successfully! Event URL: idaic.nexusclimate.co/events-${createdEvent.id}`);
      setShowEventForm(false);
      await fetchEvents();
    } catch (err) {
      setError('Failed to create event: ' + err.message);
    }
  };

  const handleUpdateEvent = async (eventId, eventData) => {
    try {
      const response = await fetch(`/.netlify/functions/events?id=${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventData,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update event');
      }

      setSuccess('Event updated successfully!');
      setShowEventForm(false);
      setSelectedEvent(null);
      await fetchEvents();
    } catch (err) {
      setError('Failed to update event: ' + err.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event? This will also delete all registrations.')) {
      return;
    }

    try {
      const response = await fetch(`/.netlify/functions/events?id=${eventId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }

      setSuccess('Event deleted successfully!');
      await fetchEvents();
    } catch (err) {
      setError('Failed to delete event: ' + err.message);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(search.toLowerCase()) ||
    event.description?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-500">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto" style={{ fontFamily: font.primary }}>
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}
      {success && <SuccessMessage message={success} onClose={() => setSuccess('')} />}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
            Event Management
          </h2>
          <button
            onClick={() => {
              setSelectedEvent(null);
              setShowEventForm(true);
            }}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Create New Event
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            style={{ color: colors.text.primary }}
          />
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.map((event) => {
          const eventRegistrations = registrations[event.id] || [];
          return (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text.primary }}>
                    {event.title}
                  </h3>
                  <div className="space-y-1 text-sm" style={{ color: colors.text.secondary }}>
                    <div>
                      <strong>Date:</strong> {formatDate(event.event_date)}
                    </div>
                    {event.location && (
                      <div>
                        <strong>Location:</strong> {event.location}
                      </div>
                    )}
                    {event.description && (
                      <div className="mt-2">
                        <strong>Description:</strong>
                        <p className="mt-1">{event.description}</p>
                      </div>
                    )}
                    <div className="mt-2">
                      <strong>Event URL:</strong>{' '}
                      <a
                        href={`/events-${event.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:underline"
                      >
                        idaic.nexusclimate.co/events-{event.id}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowEventForm(true);
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Registrations Section */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold" style={{ color: colors.text.primary }}>
                    Registrations ({eventRegistrations.length})
                  </h4>
                  <button
                    onClick={() => fetchRegistrations(event.id)}
                    className="text-sm text-orange-500 hover:underline"
                  >
                    Refresh
                  </button>
                </div>
                {eventRegistrations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2" style={{ color: colors.text.primary }}>Name</th>
                          <th className="text-left py-2 px-2" style={{ color: colors.text.primary }}>Email</th>
                          <th className="text-left py-2 px-2" style={{ color: colors.text.primary }}>Company</th>
                          <th className="text-left py-2 px-2" style={{ color: colors.text.primary }}>Type</th>
                          <th className="text-left py-2 px-2" style={{ color: colors.text.primary }}>Registered</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventRegistrations.map((reg, idx) => (
                          <tr key={reg.id || idx} className="border-b">
                            <td className="py-2 px-2" style={{ color: colors.text.primary }}>
                              {reg.name || '—'}
                            </td>
                            <td className="py-2 px-2" style={{ color: colors.text.primary }}>
                              {reg.email || '—'}
                            </td>
                            <td className="py-2 px-2" style={{ color: colors.text.primary }}>
                              {reg.company || '—'}
                            </td>
                            <td className="py-2 px-2" style={{ color: colors.text.primary }}>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                reg.registration_type === 'internal' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {reg.registration_type === 'internal' ? 'Internal' : 'External'}
                              </span>
                            </td>
                            <td className="py-2 px-2" style={{ color: colors.text.secondary }}>
                              {formatDate(reg.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No registrations yet</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <EventFormModal
          event={selectedEvent}
          onSave={selectedEvent ? handleUpdateEvent : handleCreateEvent}
          onClose={() => {
            setShowEventForm(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
}

// Event Form Modal Component
function EventFormModal({ event, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    event_date: event?.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '',
    location: event?.location || '',
    description: event?.description || '',
    registration_link: event?.registration_link || '',
    is_idaic_event: event?.is_idaic_event || false
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.event_date) {
      return;
    }

    setSaving(true);
    try {
      await onSave(event?.id, formData);
    } catch (err) {
      console.error('Error saving event:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-4" style={{ color: colors.text.primary }}>
          {event ? 'Edit Event' : 'Create New Event'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
              Event Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Online, London, UK"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Event description and details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
              Registration Link (Optional)
            </label>
            <input
              type="url"
              value={formData.registration_link}
              onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_idaic_event"
              checked={formData.is_idaic_event}
              onChange={(e) => setFormData({ ...formData, is_idaic_event: e.target.checked })}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="is_idaic_event" className="ml-2 text-sm" style={{ color: colors.text.primary }}>
              IDAIC Event
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600 disabled:opacity-50"
            >
              {saving ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

