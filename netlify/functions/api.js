exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Create response data
  const responseData = {
    message: 'IB LTD API is working!',
    status: 'success',
    timestamp: new Date().toISOString(),
    method: event.httpMethod,
    url: event.path,
    version: '12.0.0',
    platform: 'Netlify'
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(responseData, null, 2)
  };
};