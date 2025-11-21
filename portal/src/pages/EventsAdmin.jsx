import { useState, useEffect, useRef } from 'react';
import { colors, font } from '../config/colors';
import { ErrorMessage, SuccessMessage } from '../components/ErrorMessage';

export default function EventsAdmin() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
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
      
      // Create poll if poll data is provided
      if (eventData.create_poll && eventData.poll_time_slot_1 && eventData.poll_time_slot_2 && eventData.poll_time_slot_3 && eventData.poll_deadline) {
        try {
          const pollResponse = await fetch('/.netlify/functions/polls', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_id: createdEvent.id,
              time_slots: [
                eventData.poll_time_slot_1,
                eventData.poll_time_slot_2,
                eventData.poll_time_slot_3
              ],
              deadline: eventData.poll_deadline
            })
          });
          
          if (pollResponse.ok) {
            setSuccess(`Event and poll created successfully! Event URL: idaic.nexusclimate.co/events-${createdEvent.id} | Poll URL: idaic.nexusclimate.co/poll-${createdEvent.id}`);
          } else {
            setSuccess(`Event created successfully! Event URL: idaic.nexusclimate.co/events-${createdEvent.id}`);
          }
        } catch (pollErr) {
          console.error('Error creating poll:', pollErr);
          setSuccess(`Event created successfully! Event URL: idaic.nexusclimate.co/events-${createdEvent.id}`);
        }
      } else {
        setSuccess(`Event created successfully! Event URL: idaic.nexusclimate.co/events-${createdEvent.id}`);
      }
      
      await fetchEvents();
      // Note: Modal will close itself via onClose in handleSubmit
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
      await fetchEvents();
      // Note: Modal will close itself via onClose in handleSubmit
    } catch (err) {
      setError('Failed to update event: ' + err.message);
    }
  };

  const handleCreatePoll = async (pollData) => {
    try {
      const response = await fetch('/.netlify/functions/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pollData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create poll');
      }

      const createdPoll = await response.json();
      setSuccess(`Poll created successfully! Poll URL: idaic.nexusclimate.co/poll-${createdPoll.id}`);
      await fetchEvents();
    } catch (err) {
      setError('Failed to create poll: ' + err.message);
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
                      <strong>Registration URL:</strong>{' '}
                      <a
                        href={`/events-${event.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:underline"
                      >
                        idaic.nexusclimate.co/events-{event.id}
                      </a>
                    </div>
                    {event.poll_id && (
                      <div className="mt-2">
                        <strong>Poll URL:</strong>{' '}
                        <a
                          href={`/poll-${event.poll_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          idaic.nexusclimate.co/poll-{event.poll_id}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {!event.poll_id && (
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowPollForm(true);
                      }}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Create Poll
                    </button>
                  )}
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
                              {reg.registration_type === 'new' ? (
                                <span className="px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-800">
                                  New
                                </span>
                              ) : reg.user_role ? (
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  reg.user_role === 'admin' 
                                    ? 'bg-red-100 text-red-800'
                                    : reg.user_role === 'moderator'
                                    ? 'bg-purple-100 text-purple-800'
                                    : reg.user_role === 'member'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {reg.user_role.charAt(0).toUpperCase() + reg.user_role.slice(1)}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                                  External
                                </span>
                              )}
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
          onSave={async (eventId, eventData) => {
            if (eventId) {
              await handleUpdateEvent(eventId, eventData);
            } else {
              await handleCreateEvent(eventData);
            }
            // Note: Modal will close itself after successful save
          }}
          onClose={() => {
            setShowEventForm(false);
            setSelectedEvent(null);
          }}
        />
      )}

      {/* Poll Form Modal */}
      {showPollForm && (
        <PollFormModal
          event={selectedEvent}
          onSave={async (pollData) => {
            await handleCreatePoll(pollData);
          }}
          onClose={() => {
            setShowPollForm(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
}

// Poll Form Modal Component
function PollFormModal({ event, onSave, onClose }) {
  const [formData, setFormData] = useState({
    time_slot_1: '',
    time_slot_2: '',
    time_slot_3: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.time_slot_1 || !formData.time_slot_2 || !formData.time_slot_3) {
      setError('All three time slots are required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const pollData = {
        event_id: event.id,
        time_slots: [
          formData.time_slot_1,
          formData.time_slot_2,
          formData.time_slot_3
        ]
      };
      await onSave(pollData);
      onClose();
      // Refresh events to show poll URL
      window.location.reload();
    } catch (err) {
      setError('Failed to create poll: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
            Create Poll for {event?.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
              Time Slot 1 *
            </label>
            <input
              type="datetime-local"
              value={formData.time_slot_1}
              onChange={(e) => setFormData({ ...formData, time_slot_1: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
              Time Slot 2 *
            </label>
            <input
              type="datetime-local"
              value={formData.time_slot_2}
              onChange={(e) => setFormData({ ...formData, time_slot_2: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
              Time Slot 3 *
            </label>
            <input
              type="datetime-local"
              value={formData.time_slot_3}
              onChange={(e) => setFormData({ ...formData, time_slot_3: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
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
              {saving ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
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
    agenda: event?.agenda || '',
    registration_link: event?.registration_link || '',
    is_idaic_event: event?.is_idaic_event || false,
    // Poll fields
    create_poll: event?.poll_id ? true : false,
    poll_time_slot_1: '',
    poll_time_slot_2: '',
    poll_time_slot_3: '',
    poll_deadline: ''
  });
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [createdEventId, setCreatedEventId] = useState(event?.id || null);
  const [lastSaved, setLastSaved] = useState(null);
  const autoSaveTimeoutRef = useRef(null);

  // Auto-save effect - debounced
  useEffect(() => {
    // Only auto-save if we have title and date (minimum required fields)
    if (!formData.title || !formData.event_date) {
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save (2 seconds after user stops typing)
    autoSaveTimeoutRef.current = setTimeout(async () => {
      if (saving || autoSaving) return;
      
      setAutoSaving(true);
      try {
        if (createdEventId) {
          // Update existing event
          const response = await fetch(`/.netlify/functions/events?id=${createdEventId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              updated_at: new Date().toISOString()
            })
          });

          if (response.ok) {
            setLastSaved(new Date());
          }
        } else {
          // Create new event if we have title and date
          if (formData.title && formData.event_date) {
            const eventId = crypto.randomUUID();
            const newEvent = {
              ...formData,
              id: eventId
            };

            const response = await fetch('/.netlify/functions/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newEvent)
            });

            if (response.ok) {
              const createdEvent = await response.json();
              setCreatedEventId(createdEvent.id);
              setLastSaved(new Date());
              
              // Create poll if poll fields are filled
              if (formData.create_poll && formData.poll_time_slot_1 && formData.poll_time_slot_2 && formData.poll_time_slot_3 && formData.poll_deadline) {
                try {
                  const pollResponse = await fetch('/.netlify/functions/polls', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      event_id: createdEvent.id,
                      time_slots: [
                        formData.poll_time_slot_1,
                        formData.poll_time_slot_2,
                        formData.poll_time_slot_3
                      ],
                      deadline: formData.poll_deadline
                    })
                  });
                  if (pollResponse.ok) {
                    console.log('Poll created successfully');
                  }
                } catch (pollErr) {
                  console.error('Error creating poll:', pollErr);
                }
              }
              
              // Update parent component
              await onSave(createdEvent.id, formData);
            }
          }
        }
      } catch (err) {
        console.error('Error auto-saving event:', err);
      } finally {
        setAutoSaving(false);
      }
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData.title, formData.event_date, formData.location, formData.description, formData.agenda, formData.registration_link, formData.is_idaic_event, createdEventId, saving, autoSaving, onSave]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.event_date) {
      return;
    }

    // Validate poll fields if poll is being created
    if (formData.create_poll) {
      if (!formData.poll_time_slot_1 || !formData.poll_time_slot_2 || !formData.poll_time_slot_3 || !formData.poll_deadline) {
        return;
      }
    }

    setSaving(true);
    try {
      if (createdEventId) {
        // Final save of existing event
        await onSave(createdEventId, formData);
        
        // Create/update poll if needed
        if (formData.create_poll && formData.poll_time_slot_1 && formData.poll_time_slot_2 && formData.poll_time_slot_3 && formData.poll_deadline) {
          try {
            // Check if poll already exists
            const pollCheckResponse = await fetch(`/.netlify/functions/polls?event_id=${createdEventId}`);
            const existingPoll = pollCheckResponse.ok ? await pollCheckResponse.json() : null;
            
            if (existingPoll && existingPoll.id) {
              // Update existing poll
              await fetch(`/.netlify/functions/polls?id=${existingPoll.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  time_slots: [
                    formData.poll_time_slot_1,
                    formData.poll_time_slot_2,
                    formData.poll_time_slot_3
                  ],
                  deadline: formData.poll_deadline
                })
              });
            } else {
              // Create new poll
              await fetch('/.netlify/functions/polls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  event_id: createdEventId,
                  time_slots: [
                    formData.poll_time_slot_1,
                    formData.poll_time_slot_2,
                    formData.poll_time_slot_3
                  ],
                  deadline: formData.poll_deadline
                })
              });
            }
          } catch (pollErr) {
            console.error('Error creating/updating poll:', pollErr);
          }
        }
      } else {
        // Create new event (shouldn't happen if auto-save worked, but fallback)
        await onSave(undefined, formData);
      }
      // Close modal after successful save
      onClose();
    } catch (err) {
      console.error('Error saving event:', err);
      // Don't close on error - let user see the error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
            {createdEventId ? 'Edit Event' : 'Create New Event'}
          </h3>
          <div className="flex items-center gap-3">
            {autoSaving && (
              <span className="text-xs text-gray-500">Auto-saving...</span>
            )}
            {lastSaved && !autoSaving && (
              <span className="text-xs text-gray-500">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
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
              Agenda / Outline
            </label>
            <textarea
              value={formData.agenda}
              onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Event agenda, schedule, or outline..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
              Online Event Link (Optional)
            </label>
            <input
              type="url"
              value={formData.registration_link}
              onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Teams, Google Meet, or other online event link"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add a link to join the event online (e.g., Microsoft Teams, Google Meet)
            </p>
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

          {/* Poll Section */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="create_poll"
                checked={formData.create_poll}
                onChange={(e) => setFormData({ ...formData, create_poll: e.target.checked })}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="create_poll" className="ml-2 text-sm font-medium" style={{ color: colors.text.primary }}>
                Create Poll for Time Selection
              </label>
            </div>

            {formData.create_poll && (
              <div className="space-y-4 pl-6 border-l-2 border-orange-200">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    Poll Time Slot 1 *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.poll_time_slot_1}
                    onChange={(e) => setFormData({ ...formData, poll_time_slot_1: e.target.value })}
                    required={formData.create_poll}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    Poll Time Slot 2 *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.poll_time_slot_2}
                    onChange={(e) => setFormData({ ...formData, poll_time_slot_2: e.target.value })}
                    required={formData.create_poll}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    Poll Time Slot 3 *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.poll_time_slot_3}
                    onChange={(e) => setFormData({ ...formData, poll_time_slot_3: e.target.value })}
                    required={formData.create_poll}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    Poll Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.poll_deadline}
                    onChange={(e) => setFormData({ ...formData, poll_deadline: e.target.value })}
                    required={formData.create_poll}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Voting will close at this date and time</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={saving || !formData.title || !formData.event_date}
              className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : createdEventId ? 'Save & Close' : 'Create & Close'}
            </button>
          </div>
          {createdEventId && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <strong>Event created!</strong> Registration URL: 
                <a 
                  href={`/events-${createdEventId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  idaic.nexusclimate.co/events-{createdEventId}
                </a>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

