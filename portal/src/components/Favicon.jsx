import React, { useState, useEffect } from 'react';

export default function Favicon({ url, className = '', size = 16 }) {
  const [faviconUrl, setFaviconUrl] = useState(null);
  const [hostname, setHostname] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    const fetchFavicon = async () => {
      try {
        setLoading(true);
        setError(false);

        // Clean and normalize the URL - remove trailing spaces and whitespace
        let cleanUrl = url.trim();
        
        // Ensure URL has a protocol
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
          cleanUrl = `https://${cleanUrl}`;
        }

        // Parse URL to get hostname
        let extractedHostname;
        try {
          const urlObj = new URL(cleanUrl);
          extractedHostname = urlObj.hostname;
        } catch (err) {
          // If URL parsing fails, try to extract hostname manually
          const match = cleanUrl.match(/https?:\/\/([^\/]+)/);
          extractedHostname = match ? match[1] : cleanUrl.replace(/^https?:\/\//, '').split('/')[0];
        }
        
        setHostname(extractedHostname);

        // Use Google's favicon service as primary (no CORS issues when used as img src)
        const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${extractedHostname}&sz=${size}`;
        
        // Set Google's service as the primary source (works reliably without CORS)
        setFaviconUrl(googleFaviconUrl);
        setLoading(false);
      } catch (err) {
        // Silently handle errors - don't log to console
        setError(true);
        setLoading(false);
      }
    };

    fetchFavicon();
  }, [url, size]);

  if (loading) {
    return (
      <div 
        className={`bg-gray-200 rounded animate-pulse ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (error || !faviconUrl) {
    return (
      <div 
        className={`bg-gray-300 rounded flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        title="No favicon available"
      >
        <svg 
          width={size * 0.6} 
          height={size * 0.6} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className="text-gray-500"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={faviconUrl}
      alt="Website favicon"
      className={`rounded ${className}`}
      style={{ width: size, height: size }}
      onError={() => {
        setError(true);
        setFaviconUrl(null);
      }}
      title={hostname || url}
    />
  );
}
