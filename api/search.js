const fs = require('fs');
const path = require('path');
const getAccessToken = require('./getAcessToken');

module.exports = async (req, res) => {
  //CORS for multiple origins
  const allowedOrigins = [
    'https://itunes-react.vercel.app',
    'https://itunes-react-git-main-jimhuertas123s-projects.vercel.app',
    'http://localhost:5173',
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  //getters from request
  const { term = '', limit = 50 } = req.query;
  console.log(`🔍 Search request: term="${term}", limit="${limit}"`);

  try {
    const { query } = req.query;

    const access_token = await getAccessToken();
    const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    const searchData = await searchResponse.json();
    res.json(searchData);

  } catch (error) {
    console.error('Error fetching from real API:', error);
    return res.status(500).json({ error: 'Failed to fetch from iTunes API' });
  }
};

















const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

export default async function handler(req, res) {
  
  const { query } = req.query;
  
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
    },
    body: 'grant_type=client_credentials'
  });
  
  const { access_token } = await tokenResponse.json();
  
  // Step 2: Search Spotify with the token
  const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=20`, {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  });
  
  const searchData = await searchResponse.json();
  res.json(searchData);
}