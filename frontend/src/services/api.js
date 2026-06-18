// services/api.js



import axios from 'axios'

// Read the backend URL from environment variables.
// In development: http://localhost:8000 (from .env.development)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Create an axios instance with our base configuration.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Give up after 15 seconds
})


/**
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

    if (error.response) {
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
      throw new Error('Cannot connect to the server. Make sure the backend is running.')

    } else {
      throw new Error(`Request failed: ${error.message}`)
    }
  }
} 