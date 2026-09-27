export const fallbackImage =
  'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1000&q=85';

export function formatDate(value) {
  if (!value) return 'Date unavailable';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}
 
export function safeUrl(value) {
  try {
    const url = new URL(value || fallbackImage, window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? escapeHtml(url.href) : fallbackImage;
  } catch {
    return fallbackImage;
  }
}

export function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>'"]/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      })[character]
  );
}