import React, { useState, useEffect } from 'react';

export default function Favicon({ url, className = '', size = 16 }) {
  const [faviconUrl, setFaviconUrl] = useState(null);
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

        // Try multiple favicon sources
        const faviconSources = [
          // Direct favicon.ico
          `${url}/favicon.ico`,
          // Common favicon paths
          `${url}/favicon.png`,
          `${url}/apple-touch-icon.png`,
          // Google's favicon service as fallback
          `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=${size}`,
        ];

        // Try each source until one works
        for (const source of faviconSources) {
          try {
            const response = await fetch(source, { 
              method: 'HEAD',
              mode: 'cors'
            });
            
            if (response.ok) {
              setFaviconUrl(source);
              setLoading(false);
              return;
            }
          } catch (err) {
            // Continue to next source
            continue;
          }
        }

        // If all direct sources fail, use Google's service
        setFaviconUrl(`https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=${size}`);
        setLoading(false);
      } catch (err) {
        console.warn('Failed to fetch favicon for:', url, err);
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
      alt={`${new URL(url).hostname} favicon`}
      className={`rounded ${className}`}
      style={{ width: size, height: size }}
      onError={() => setError(true)}
      title={new URL(url).hostname}
    />
  );
}
