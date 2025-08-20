const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors({
  // origin: 'https://itunes-react-git-main-jimhuertas123s-projects.vercel.app'
  origin: 'http://localhost:5173'
}));

let musicData;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// Token cache
let cachedToken = null;
let tokenExpiry = null;

// Function to get valid access token
async function getAccessToken() {
  // Check if token is still valid (with 5 minute buffer)
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
    // Set expiry time (tokens usually last 3600 seconds = 1 hour)
    tokenExpiry = Date.now() + (tokenData.expires_in * 1000);
    
    console.log(`✅ New token obtained, expires in ${tokenData.expires_in} seconds`);
    return cachedToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}
      
try {
  const dataPath = path.join(__dirname, 'public', 'data.json');
  musicData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (error) {
  console.error('Error loading data.json:', error);
  process.exit(1);
}

app.get('/api/search', async (req, res) => {
  const { term = '', limit = 50, deploy='false'} = req.query;
  const USE_REAL_API = deploy === 'true';

  console.log(`🔍 Search request: term="${term}", limit="${limit}"`);

  if (USE_REAL_API) {
    try {
      console.log(`client init: ${CLIENT_ID}`);
      
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
      return res.status(500).json({ error: 'Failed to fetch from Spotify API' });
    }


  } else {
    //delay simulation
    setTimeout(() => {
      try {
        let filteredResults = musicData.results;
        
        if (term) {
          const searchTerm = String(term).toLowerCase();
          filteredResults = musicData.results.filter(item => 
            item.trackName?.toLowerCase().includes(searchTerm) ||
            item.artistName?.toLowerCase().includes(searchTerm) ||
            item.collectionName?.toLowerCase().includes(searchTerm) ||
            item.primaryGenreName?.toLowerCase().includes(searchTerm)
          );
        }
        
        const limitNum = parseInt(String(limit));
        if (limitNum > 0) {
          filteredResults = filteredResults.slice(0, limitNum);
        }
        
        const response = {
          resultCount: filteredResults.length,
          results: filteredResults
        };
        
        console.log(`✅ Returning ${filteredResults.length} results from local data`);
        res.json(response);
        
      } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }, Math.random() * 1000 + 500); 
  }
});


//api call for artist
app.get('/api/artist', async (req, res)  => {
  const { id } = req.query;
  if(id === '') { return res.status(500).json({ error: 'Failed param id need to be filled' });}

  console.log(`🔍 Search request: id="${id}"`);

    try {
      console.log(`client init: ${CLIENT_ID}`);
      
      const access_token = await getAccessToken();
      
      const getArtistResponse = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      const artistData = await getArtistResponse.json();
      res.json(artistData);
    } catch (error) {
      console.error('Error fetching from real API:', error);
      return res.status(500).json({ error: 'Failed to fetch from Spotify API' });
    }
});


// Health check endpoint
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', totalSongs: musicData.results.length });
});

app.listen(PORT, () => {
  console.log(`🎵 Fake Spotify API server running on http://localhost:${PORT}`);
  console.log(`📊 Loaded ${musicData.results.length} songs from data.json`);
  console.log(`🔍 Search endpoint: http://localhost:${PORT}/api/search?term=YOUR_QUERY&limit=YOUR_LIMIT&deploy=true`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});
