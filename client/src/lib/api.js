// Uses a deployed backend URL if one is set (production), otherwise falls back
// to your local network for development.
const API_URL = import.meta.env.VITE_API_URL || ('http://' + window.location.hostname + ':5000');

export async function apiRequest(endpoint, options) {
  const opts = options || {};
  const response = await fetch(API_URL + endpoint, Object.assign({}, opts, {
    headers: Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {}),
  }));

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong.');
  }

  return data;
}

export { API_URL };