require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// Token cache
let cachedToken = null;
let tokenExpiry = null;

//valid access token expiration
async function getAccessToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 5 * 60 * 1000) {
    console.log('🔄 Using cached token');
    return cachedToken;
  }

  console.log('🔑 Requesting new access token');
  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });
    
    const tokenData = await tokenResponse.json();
    cachedToken = tokenData.access_token;
    tokenExpiry = Date.now() + (tokenData.expires_in * 1000);
    
    console.log(`✅ New token obtained, expires in ${tokenData.expires_in} seconds`);
    return cachedToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

module.exports = getAccessToken;