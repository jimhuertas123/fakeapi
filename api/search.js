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
    const access_token = await getAccessToken();
    const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${term}&type=track&limit=${limit}`, {
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