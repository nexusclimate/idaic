// Utility functions for @ mention functionality

// Map of page display names to route identifiers
export const PAGE_MAP = {
  'Home': 'home',
  'Feedback': 'feedback',
  'Events': 'events',
  'Members': 'members',
  'UKChapter': 'uk',
  'MENAChapter': 'mena',
  'ClimateSolutions': 'climate-solutions',
  'UAEClimate': 'uae-climate',
  'Changelog': 'changelog',
  'Settings': 'settings',
  'Projects': 'projects',
  'Admin': 'portal-admin',
  'Content': 'content',
  'CaseStudies': 'case-studies',
};

// Reverse map for getting display name from route
export const ROUTE_TO_DISPLAY = Object.fromEntries(
  Object.entries(PAGE_MAP).map(([display, route]) => [route, display])
);

/**
 * Parse text and extract @ mentions
 * Returns array of { text, isMention, pageRoute, displayName }
 */
export function parseMentions(text) {
  if (!text) return [];
  
  const parts = [];
  const mentionRegex = /@(\w+)/g;
  let lastIndex = 0;
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, match.index),
        isMention: false
      });
    }
    
    // Add the mention
    const mentionName = match[1];
    const pageRoute = PAGE_MAP[mentionName] || null;
    
    parts.push({
      text: match[0], // @PageName
      isMention: true,
      pageRoute,
      displayName: mentionName
    });
    
    lastIndex = mentionRegex.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      isMention: false
    });
  }
  
  // If no mentions found, return the whole text as one part
  if (parts.length === 0) {
    parts.push({ text, isMention: false });
  }
  
  return parts;
}

/**
 * Get available page names for autocomplete
 */
export function getAvailablePages() {
  return Object.keys(PAGE_MAP).sort();
}

