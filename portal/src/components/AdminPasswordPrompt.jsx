import { useState } from 'react';

export default function AdminPasswordPrompt({ setIsAdminAuthenticated }) {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === 'IDAIC2025!') {
      setIsAdminAuthenticated(true);
      setPassword('');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Enter Admin Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter password"
            autoFocus
          />
          {passwordError && (
            <p className="text-red-400 text-sm mt-2">{passwordError}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
        >
          Access Admin Panel
        </button>
      </form>
    </div>
  );
} 