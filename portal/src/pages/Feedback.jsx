import React, { useState } from 'react';
import { colors, font, form as formConfig } from '../config/colors';

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
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Feedback</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 rounded-lg shadow"
        style={{
          background: colors.background.white,
          fontFamily: font.primary,
          color: colors.text.primary,
        }}
      >
        <h2 className="text-lg sm:text-xl mb-4 font-bold" style={{ color: colors.text.primary }}>
          Share Your Feedback
        </h2>
        <form id="feedbackForm" onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium" style={{ color: colors.text.primary }}>
              Your name
            </label>
            <input
              id="name" name="name" required
              className="mt-1 block w-full rounded-md px-3 py-2 sm:py-1.5 text-base outline-1 outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 sm:text-sm"
              style={{
                background: colors.background.white,
                color: colors.text.primary,
                borderColor: colors.border.light,
                fontFamily: font.primary,
                boxShadow: 'none',
              }}
              onFocus={e => e.target.style.outlineColor = formConfig.focus}
              onBlur={e => e.target.style.outlineColor = ''}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium" style={{ color: colors.text.primary }}>
              Your email
            </label>
            <input
              id="email" name="email" type="email" placeholder="you@example.com" required
              className="mt-1 block w-full rounded-md px-3 py-2 sm:py-1.5 text-base outline-1 outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 sm:text-sm"
              style={{
                background: colors.background.white,
                color: colors.text.primary,
                borderColor: colors.border.light,
                fontFamily: font.primary,
                boxShadow: 'none',
              }}
              onFocus={e => e.target.style.outlineColor = formConfig.focus}
              onBlur={e => e.target.style.outlineColor = ''}
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium" style={{ color: colors.text.primary }}>
              Subject
            </label>
            <input
              id="subject" name="subject" required
              className="mt-1 block w-full rounded-md px-3 py-2 sm:py-1.5 text-base outline-1 outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 sm:text-sm"
              style={{
                background: colors.background.white,
                color: colors.text.primary,
                borderColor: colors.border.light,
                fontFamily: font.primary,
                boxShadow: 'none',
              }}
              onFocus={e => e.target.style.outlineColor = formConfig.focus}
              onBlur={e => e.target.style.outlineColor = ''}
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium" style={{ color: colors.text.primary }}>
              Type
            </label>
            <select
              id="type" name="type" required
              className="mt-1 block w-full rounded-md px-3 py-2 sm:py-1.5 text-base outline-1 outline-offset-1 focus:outline-2 focus:outline-offset-2 sm:text-sm"
              style={{
                background: colors.background.white,
                color: colors.text.primary,
                borderColor: colors.border.light,
                fontFamily: font.primary,
                boxShadow: 'none',
              }}
              onFocus={e => e.target.style.outlineColor = formConfig.focus}
              onBlur={e => e.target.style.outlineColor = ''}
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
              className="mt-1 block w-full rounded-md px-3 py-2 sm:py-1.5 text-base outline-1 outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 sm:text-sm"
              style={{
                background: colors.background.white,
                color: colors.text.primary,
                borderColor: colors.border.light,
                fontFamily: font.primary,
                boxShadow: 'none',
              }}
              onFocus={e => e.target.style.outlineColor = formConfig.focus}
              onBlur={e => e.target.style.outlineColor = ''}
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="mt-2 w-full rounded-md px-4 py-3 sm:py-2 font-medium disabled:opacity-50"
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
            className="mt-2 text-center text-sm sm:text-base"
            style={{ color: colors.primary.orange, fontFamily: font.primary }}
          >
            {status}
          </p>
        </form>
      </div>
    </div>
  );
}