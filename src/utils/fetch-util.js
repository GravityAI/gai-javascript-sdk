const BASE_URL = 'https://api.yourplatform.com';  // replace with your API base URL

/**
 * Handles the response from fetch requests, checking for errors and parsing JSON.
 * @param {Response} response - The response object from a fetch call.
 * @returns {Promise} - Resolves with parsed JSON, or rejects with error message.
 */
async function handleResponse(response) {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred.');
    }
    return response.json();
}

/**
 * Sends a GET request.
 * @param {string} endpoint - The API endpoint to hit.
 * @param {Object} headers - Additional headers for the request.
 * @returns {Promise} - Resolves with the data from the response, or rejects with an error.
 */
export async function fetchData(endpoint, headers = {}) {
    return fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    }).then(handleResponse);
}

/**
 * Sends a POST request with JSON data.
 * @param {string} endpoint - The API endpoint to hit.
 * @param {Object} data - The data to send in the request body.
 * @param {Object} headers - Additional headers for the request.
 * @returns {Promise} - Resolves with the data from the response, or rejects with an error.
 */
export async function postData(endpoint, data, headers = {}) {
    const formData = new FormData();
  
    for (const key in data) {
      if (Array.isArray(data[key])) {
        data[key].forEach((item, index) => {
          for (const subKey in item) {
            formData.append(`${key}[${index}][${subKey}]`, item[subKey]);
          }
        });
      } else {
        formData.append(key, data[key]);
      }
    }
  
    return fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...headers
      },
      body: formData
    }).then(handleResponse);
  }
  

/**
 * Sends a PUT request with JSON data.
 * @param {string} endpoint - The API endpoint to hit.
 * @param {Object} data - The data to send in the request body.
 * @param {Object} headers - Additional headers for the request.
 * @returns {Promise} - Resolves with the data from the response, or rejects with an error.
 */
export async function putData(endpoint, data, headers = {}) {
    return fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        body: JSON.stringify(data)
    }).then(handleResponse);
}
