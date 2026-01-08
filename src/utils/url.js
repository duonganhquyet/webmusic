export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

// Generic resolver for assets like song covers and playlist images
export function resolveAssetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${BACKEND_URL}${path}`;
  // Fallback: many APIs return just a filename for images under /images
  return `${BACKEND_URL}/images/${path}`;
}

// Specialized resolver for user avatars which are stored under /images/avatar
export function resolveAvatarUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${BACKEND_URL}${path}`;
  // Normalize common avatar storage variants
  if (path.startsWith("images/")) return `${BACKEND_URL}/${path}`;
  if (path.startsWith("avatar/")) return `${BACKEND_URL}/images/${path}`;
  // Default: plain filename stored under /images/avatar
  return `${BACKEND_URL}/images/avatar/${path}`;
}
