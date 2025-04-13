import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

/**
 * Format currency values
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Format number with commas for thousands
 */
export function formatNumber(num) {
  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename) {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

/**
 * Check if string is a valid URL
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Parse JWT token and get expiration time
 */
export function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token) {
  const decodedToken = parseJwt(token);
  if (!decodedToken) return true;

  const currentTime = Date.now() / 1000;
  return decodedToken.exp < currentTime;
}

/**
 * Create image URL for backend-stored images
 */
export function getImageUrl(imagePath) {
  // Backend format is filename!_unique_id.ext
  if (!imagePath) return "";

  // Check if already full URL
  if (isValidUrl(imagePath)) return imagePath;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  return `${baseUrl}/uploads/images/${imagePath}`;
}

/**
 * Sleep function for throttling or testing
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get role-based dashboard URL
 */
export function getDashboardUrl(role) {
  switch (role) {
    case "superadmin":
      return "/dashboard";
    case "admin":
      return "/dashboard";
    default:
      return "/";
  }
}

/**
 * Check if user has permission for an action
 */
export function hasPermission(userRole, requiredRole) {
  if (userRole === "superadmin") return true;
  return userRole === requiredRole;
}
