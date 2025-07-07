import React, { useState } from 'react';
import { colors, font } from '../config/colors';

export default function FeedbackForm() {
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setSending(true);
    setStatus('Sending…');

    const form = e.target;
    const data = {
      name:    form.name.value,
      email:   form.email.value,
      subject: form.subject.value,
      type:    form.type.value,
      comment: form.comment.value,
    };

    try {
      const resp = await fetch('/.netlify/functions/createFeedbackTask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (resp.ok) {
        setStatus('Thanks for sharing your feedback!');
        form.reset();
      } else {
        let errorText = 'Oops, something went wrong.';
        try {
          const data = await resp.json();
          if (data && data.error) errorText = data.error;
        } catch {
          const text = await resp.text();
          if (text) errorText = text;
        }
        setStatus(errorText);
      }
    } catch (err) {
      setStatus('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="max-w-md mx-auto p-4 rounded-lg shadow"
      style={{
        background: colors.background.white,
        fontFamily: font.primary,
        color: colors.text.primary,
      }}
    >
      <h2 className="text-xl mb-4 font-bold" style={{ color: colors.text.primary }}>
        Share Your Feedback
      </h2>
      <form id="feedbackForm" onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium" style={{ color: colors.text.primary }}>
            Your name
          </label>
          <input
            id="name" name="name" required
            className="mt-1 block w-full rounded-md px-3 py-1.5 text-base outline-1 outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 sm:text-sm"
            style={{
              background: colors.background.white,
              color: colors.text.primary,
              borderColor: colors.border.light,
              fontFamily: font.primary,
            }}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium" style={{ color: colors.text.primary }}>
            Your email
          </label>
          <input
            id="email" name="email" type="email" placeholder="you@example.com" required
            className="mt-1 block w-full rounded-md px-3 py-1.5 text-base outline-1 outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 sm:text-sm"
            style={{
              background: colors.background.white,
              color: colors.text.primary,
              borderColor: colors.border.light,
              fontFamily: font.primary,
            }}
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium" style={{ color: colors.text.primary }}>
            Subject
          </label>
          <input
            id="subject" name="subject" required
            className="mt-1 block w-full rounded-md px-3 py-1.5 text-base outline-1 outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 sm:text-sm"
            style={{
              background: colors.background.white,
              color: colors.text.primary,
              borderColor: colors.border.light,
              fontFamily: font.primary,
            }}
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium" style={{ color: colors.text.primary }}>
            Type
          </label>
          <select
            id="type" name="type" required
            className="mt-1 block w-full rounded-md px-3 py-1.5 text-base outline-1 outline-offset-1 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 sm:text-sm"
            style={{
              background: colors.background.white,
              color: colors.text.primary,
              borderColor: colors.border.light,
              fontFamily: font.primary,
            }}
          >
            <option value="feedback">Feedback</option>
            <option value="bug">Bug</option>
          </select>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium" style={{ color: colors.text.primary }}>
            Add your comment
          </label>
          <textarea
            id="comment" name="comment" rows="4" required
            className="mt-1 block w-full rounded-md px-3 py-1.5 text-base outline-1 outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 sm:text-sm"
            style={{
              background: colors.background.white,
              color: colors.text.primary,
              borderColor: colors.border.light,
              fontFamily: font.primary,
            }}
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="mt-2 w-full rounded-md px-4 py-2 font-medium disabled:opacity-50"
          style={{
            background: colors.primary.orange,
            color: colors.text.white,
            fontFamily: font.primary,
          }}
        >
          {sending ? 'Sending…' : 'Submit'}
        </button>

        <p
          id="status"
          aria-live="polite"
          className="mt-2 text-center"
          style={{ color: colors.primary.orange, fontFamily: font.primary }}
        >
          {status}
        </p>
      </form>
    </div>
  );
}