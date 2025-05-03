'use client';

/**
 * Safe wrapper for localStorage operations with error handling
 */
export const storage = {
  /**
   * Get an item from localStorage
   * @param {string} key - The key to get
   * @param {any} defaultValue - Default value if key doesn't exist or error occurs
   * @returns {any} The stored value or defaultValue
   */
  get: (key, defaultValue = null) => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return defaultValue;
    }
  },
  
  /**
   * Get a raw string from localStorage without JSON parsing
   * @param {string} key - The key to get
   * @param {string} defaultValue - Default value if key doesn't exist or error occurs
   * @returns {string} The stored string or defaultValue
   */
  getString: (key, defaultValue = '') => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    
    try {
      const item = localStorage.getItem(key);
      return item !== null ? item : defaultValue;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return defaultValue;
    }
  },
  
  /**
   * Set an item in localStorage
   * @param {string} key - The key to set
   * @param {any} value - The value to store
   * @returns {boolean} True if successful, false otherwise
   */
  set: (key, value) => {
    if (typeof window === 'undefined') {
      return false;
    }
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
      return false;
    }
  },
  
  /**
   * Set a raw string in localStorage without JSON stringifying
   * @param {string} key - The key to set
   * @param {string} value - The string to store
   * @returns {boolean} True if successful, false otherwise
   */
  setString: (key, value) => {
    if (typeof window === 'undefined') {
      return false;
    }
    
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
      return false;
    }
  },
  
  /**
   * Remove an item from localStorage
   * @param {string} key - The key to remove
   * @returns {boolean} True if successful, false otherwise
   */
  remove: (key) => {
    if (typeof window === 'undefined') {
      return false;
    }
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  },
  
  /**
   * Clear all items from localStorage
   * @returns {boolean} True if successful, false otherwise
   */
  clear: () => {
    if (typeof window === 'undefined') {
      return false;
    }
    
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// Auth-specific storage functions
export const getAuthToken = () => storage.getString('auth_token', '');
export const setAuthToken = (token) => storage.setString('auth_token', token);
export const removeAuthToken = () => storage.remove('auth_token');
