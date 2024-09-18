import { auth, signOut } from '@/auth'; // Assuming your auth function provides the session
import axios from 'axios';
import {
  CognitoUserPool,
  CognitoUser,
  CognitoRefreshToken,
} from 'amazon-cognito-identity-js';

const getPrefix = (path: string[]) => {
  if (path[0] === 'ops') {
    return process.env.API_OPS_URL;
  }
  return process.env.API_PORTAL_URL;
}

// Function to get a new access token using the refresh token
const refreshAccessToken = async (refreshToken: string, username: string): Promise<string> => {
  try {
    const poolData = {
      UserPoolId: process.env.COGNITO_USER_POOL_ID || '',
      ClientId: process.env.COGNITO_CLIENT_ID || '',
    };
    const userPool = new CognitoUserPool(poolData);
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });
    const congnitoRefreshToken = new CognitoRefreshToken({ RefreshToken: refreshToken });
    return new Promise((resolve, reject) => {
      cognitoUser.refreshSession(congnitoRefreshToken, (err, session) => {
        if (err) {
          console.error('Error refreshing access token:', err);
          reject('Unable to refresh access token');
        }
        resolve(session.getAccessToken().getJwtToken());
      });
    });
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw new Error('Unable to refresh access token');
  }
}

// Main handler for all request methods (GET, POST, PUT, PATCH, DELETE)
async function handleProxyRequest(method: string, request: Request, params: { path: string[] }) {
  const session = await auth(); // Get current session (assume it has refresh token and access token)
  const { path } = params;
  const prefix = getPrefix(path);
  const url = new URL(prefix + "/" + path.slice(1).join('/'));

  const incomingUrl = new URL(request.url);
  incomingUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value); // Append query parameters to the external API URL
  });

  console.log('Request URL:', url.toString());

  // Prepare the request body for methods like POST, PUT, PATCH
  let requestBody = undefined;
  if (method !== 'GET' && method !== 'DELETE') {
    try {
      requestBody = await request.json();
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
    }
  }

  // Function to make the external API request
  const makeRequest = async (accessToken: string) => {
    return axios({
      method,
      url: url.toString(),
      data: requestBody, // Only for POST, PUT, PATCH
      headers: {
        Authorization: `${accessToken}`, // Use the provided access token
        'Content-Type': 'application/json',
      },
    });
  };


  try {
    // Try the request with the current access token
    const response = await makeRequest(session?.user?.name || '');

    // Return the successful response
    return new Response(JSON.stringify(response.data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    if (error.response?.status === 401 && session?.user?.image && session?.user?.email) {
      // Handle token refresh if we get a 401 Unauthorized
      try {
        // Get a new access token using the refresh token
        const newAccessToken = await refreshAccessToken(session.user.image, session.user.email);

        // Update the session with the new access token (this may vary depending on how you store the session)
        session.user.name = newAccessToken;

        // Retry the request with the new access token
        const retryResponse = await makeRequest(newAccessToken);

        // Return the successful response from the retried request
        return new Response(JSON.stringify(retryResponse.data), {
          status: retryResponse.status,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (refreshError) {
        // If refreshing the token fails, return an error
        signOut(); // Sign out the user if the refresh token is invalid
        return new Response(JSON.stringify({ error: 'Unable to refresh token' }), { status: 401 });
      }
    }
    // console.error('Error making request:', error);
    // If the error is not 401 or there's no refresh token, return the error
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
