// services/api.js
// All communication between the React frontend and FastAPI backend
// goes through this file. Components never make HTTP requests directly.



import axios from 'axios'

// Read the backend URL from environment variables.
// In development: http://localhost:8000 (from .env.development)
// In production:  your Render URL (from .env.production)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Create an axios instance with our base configuration.
// Every request made through this instance automatically gets these settings.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Give up after 15 seconds
})


/**
 * Fetches facility data from the CMS API via our FastAPI backend.
 *
 * @param {string} ccn - The CMS Certification Number to look up
 * @returns {Promise<Object>} - The facility data object
 * @throws {Error} - With a user-friendly message if something goes wrong
 */
export const fetchFacilityByCCN = async (ccn) => {
  try {
    const response = await apiClient.get(`/api/facility/${ccn}`)
    return response.data

  } catch (error) {
    // axios wraps errors — we unwrap them here into clean messages
    if (error.response) {
      // The server responded with an error status code (4xx, 5xx)
      const status = error.response.status
      const detail = error.response.data?.detail || 'Unknown error'

      if (status === 404) {
        throw new Error(`No facility found for CCN "${ccn}". Please check the number and try again.`)
      } else if (status === 503) {
        throw new Error(`Unable to reach the CMS database. Please try again in a moment.`)
      } else {
        throw new Error(`Server error (${status}): ${detail}`)
      }

    } else if (error.request) {
      // The request was made but no response came back (backend is down)
      throw new Error('Cannot connect to the server. Make sure the backend is running.')

    } else {
      // Something else went wrong
      throw new Error(`Request failed: ${error.message}`)
    }
  }
} 