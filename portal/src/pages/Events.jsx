import React, { useEffect, useState } from 'react';
import EventForm from './EventForm';
import { colors } from '../config/colors';

// Custom hook to fetch events
function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/events');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError('Failed to load events');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, error, refetch: fetchEvents };
}

export default function Events() {
  const { events, loading, error, refetch } = useEvents();
  const [formError, setFormError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (event) => {
    try {
      const eventData = {
        title: event.title,
        event_date: event.event_date,
        location: event.location,
        registration_link: event.registration_link
      };
      const response = await fetch('/.netlify/functions/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add event');
      }
      setDrawerOpen(false);
      setFormError('');
      await refetch();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const updateData = {
        title: updates.title,
        event_date: updates.event_date,
        location: updates.location,
        registration_link: updates.registration_link
      };
      const response = await fetch(`/.netlify/functions/events?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update event');
      }
      setDrawerOpen(false);
      setFormError('');
      await refetch();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/.netlify/functions/events?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }
      setDrawerOpen(false);
      setFormError('');
      await refetch();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const openDrawer = (event) => {
    setSelectedEvent(event);
    setIsAdding(false);
    setDrawerOpen(true);
  };

  const openAddDrawer = () => {
    setSelectedEvent({ title: '', event_date: '', location: '', registration_link: '' });
    setIsAdding(true);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedEvent(null);
    setIsAdding(false);
    setFormError('');
  };

  const handleFormSubmit = async (event) => {
    if (!event.title || !event.event_date || !event.location || !event.registration_link) {
      setFormError('All fields are required.');
      return false;
    }
    if (isAdding) {
      await handleAdd(event);
    } else {
      await handleUpdate(event.id, event);
    }
    setFormError('');
    return true;
  };

  const handleEventUpdate = (updatedEvent) => {
    setSelectedEvent(updatedEvent);
  };

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Events</h1>
          <nav className="mt-4 sm:mt-0">
            <ul className="flex space-x-4" role="tablist">
              <li>
                <button
                  type="button"
                  className="px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-150 focus:outline-none border-transparent text-orange-600 hover:text-orange-700 hover:border-orange-300 bg-transparent"
                  style={{ color: colors.primary.orange, borderColor: colors.primary.orange }}
                  onClick={openAddDrawer}
                  role="tab"
                  aria-selected="false"
                >
                  Add event
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div className="bg-white border rounded-lg p-4 sm:p-6">
        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading events...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {events.map((event, idx) => (
              <button
                key={event.id || idx}
                type="button"
                onClick={() => openDrawer(event)}
                className="relative bg-gray-100 p-0 flex flex-col rounded-lg transition border-2 focus:outline-none hover:border-orange-200 border-transparent"
                style={{ color: colors.text.primary, fontFamily: 'Inter, sans-serif' }}
              >
                <div className="flex flex-row items-stretch h-full w-full">
                  <div className="flex flex-col items-start px-6 pt-6 pb-2 min-w-[140px] max-w-[180px] flex-shrink-0 w-full">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-0 text-left w-full">{event.title}</h2>
                    <div className="text-xs sm:text-sm text-gray-500 text-left mt-1 w-full">{event.location}</div>
                    <div className="flex justify-start w-full">
                      <div className="h-1 bg-orange-500 rounded-full my-2" style={{ width: '90%' }} />
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-0 text-left w-full">
                  <div className="text-xs sm:text-sm text-gray-700 w-full mt-0">{event.registration_link ? <a href={event.registration_link} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Registration Link</a> : ''}</div>
                </div>
                <div className="absolute top-2 sm:top-3 right-2 sm:right-4 text-xs font-medium" style={{ color: colors.primary.orange }}>
                  {event.event_date ? new Date(event.event_date).toLocaleDateString() : ''}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <EventForm
        drawerOpen={drawerOpen}
        selectedEvent={selectedEvent}
        isAdding={isAdding}
        formError={formError}
        onClose={closeDrawer}
        onSubmit={handleFormSubmit}
        onDelete={handleDelete}
        onEventUpdate={handleEventUpdate}
      />
    </div>
  );
} 