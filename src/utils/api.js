'use client';

import { getAuthToken } from './storage';

/**
 * Enhanced fetch function that automatically adds the auth token to requests
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} - Fetch promise
 */
export const fetchWithAuth = async (url, options = {}) => {
  // Get the auth token
  const token = getAuthToken();
  
  // Create headers with auth token if available
  const headers = {
    ...(options.headers || {}),
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Add Content-Type header if not present and not FormData
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Return fetch with enhanced options
  return fetch(url, {
    ...options,
    headers,
  });
};

/**
 * Helper function for GET requests
 * @param {string} url - The URL to fetch
 * @param {Object} options - Additional fetch options
 * @returns {Promise} - Fetch promise
 */
export const get = (url, options = {}) => {
  return fetchWithAuth(url, {
    ...options,
    method: 'GET',
  });
};

/**
 * Helper function for POST requests
 * @param {string} url - The URL to fetch
 * @param {Object} data - The data to send
 * @param {Object} options - Additional fetch options
 * @returns {Promise} - Fetch promise
 */
export const post = (url, data, options = {}) => {
  return fetchWithAuth(url, {
    ...options,
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

/**
 * Helper function for PUT requests
 * @param {string} url - The URL to fetch
 * @param {Object} data - The data to send
 * @param {Object} options - Additional fetch options
 * @returns {Promise} - Fetch promise
 */
export const put = (url, data, options = {}) => {
  return fetchWithAuth(url, {
    ...options,
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
};

/**
 * Helper function for DELETE requests
 * @param {string} url - The URL to fetch
 * @param {Object} options - Additional fetch options
 * @returns {Promise} - Fetch promise
 */
export const del = (url, options = {}) => {
  return fetchWithAuth(url, {
    ...options,
    method: 'DELETE',
  });
};
