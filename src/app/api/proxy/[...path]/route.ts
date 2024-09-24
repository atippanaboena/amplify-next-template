import { auth, signOut } from '@/auth'; // Assuming your auth function provides the session
import axios from 'axios';
import { getToken } from 'next-auth/jwt';

const getPrefix = (path: string[]) => {
  if (path[0] === 'ops') {
    return process.env.API_OPS_URL;
  }
  return process.env.API_PORTAL_URL;
}

// Function to make the external API request
const makeRequest = async (url: string, method: string, requestBody: any, authToken: string) => {
  console.log('Making request:', method, url, requestBody);
  return axios({
    method,
    url: url.toString(),
    data: requestBody, // Only for POST, PUT, PATCH
    headers: {
      Authorization: `${authToken}`, // Use the provided access token
      'Content-Type': 'application/json',
    },
  });
};

// Main handler for all request methods (GET, POST, PUT, PATCH, DELETE)
async function handleProxyRequest(method: string, request: Request, params: { path: string[] }) {
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET || '', secureCookie: false });
  const { path } = params;
  const prefix = getPrefix(path);
  const url = new URL(prefix + "/" + path.slice(1).join('/'));

  const incomingUrl = new URL(request.url);
  incomingUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value); // Append query parameters to the external API URL
  });

  // Prepare the request body for methods like POST, PUT, PATCH
  let requestBody = undefined;
  if (method !== 'GET' && method !== 'DELETE') {
    try {
      requestBody = await request.json();
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
    }
  }

  try {
    // Try the request with the current access token
    console.log(token?.idToken, 'Token ID')
    const response = await makeRequest(url.toString(), method, requestBody, token?.idToken || '');

    // Return the successful response
    return new Response(JSON.stringify(response.data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error making request:', error.response?.data || error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
}

// Route handlers for different HTTP methods
export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  return handleProxyRequest('GET', request, params);
}

export async function POST(request: Request, { params }: { params: { path: string[] } }) {
  return handleProxyRequest('POST', request, params);
}

export async function PUT(request: Request, { params }: { params: { path: string[] } }) {
  return handleProxyRequest('PUT', request, params);
}

export async function PATCH(request: Request, { params }: { params: { path: string[] } }) {
  return handleProxyRequest('PATCH', request, params);
}

export async function DELETE(request: Request, { params }: { params: { path: string[] } }) {
  return handleProxyRequest('DELETE', request, params);
}
