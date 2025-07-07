import { useState } from 'react';

export default function Feedback() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', type: 'feedback', comment: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('Sending…');
    setLoading(true);
    try {
      const res = await fetch('/.netlify/functions/createFeedbackTask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMsg('Thanks for sharing your feedback!');
        setForm({ name: '', email: '', subject: '', type: 'feedback', comment: '' });
      } else {
        setMsg('Oops, something went wrong.');
      }
    } catch {
      setMsg('Network error.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white border rounded-lg p-6 shadow">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Share your Feedback</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block mb-1 font-medium text-gray-700">Your name</label>
          <input
            id="name"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="email" className="block mb-1 font-medium text-gray-700">Your email</label>
          <input
            id="email"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="subject" className="block mb-1 font-medium text-gray-700">Subject</label>
          <input
            id="subject"
            name="subject"
            required
            value={form.subject}
            onChange={handleChange}
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="type" className="block mb-1 font-medium text-gray-700">Type</label>
          <select
            id="type"
            name="type"
            required
            value={form.type}
            onChange={handleChange}
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 sm:text-sm"
          >
            <option value="feedback">Improvement</option>
            <option value="Idea">Idea</option>
            <option value="bug">Bug</option>
          </select>
        </div>
        <div>
          <label htmlFor="comment" className="block mb-1 font-medium text-gray-700">Add your comment</label>
          <textarea
            id="comment"
            name="comment"
            rows={8}
            required
            value={form.comment}
            onChange={handleChange}
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 sm:text-sm"
            placeholder="Share your feedback?"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Sending…' : 'Submit'}
        </button>
        {msg && <p className="text-center text-sm mt-2" aria-live="polite">{msg}</p>}
      </form>
    </div>
  );
} 