const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors({
  // origin: 'https://itunes-react-git-main-jimhuertas123s-projects.vercel.app'
  origin: 'http://localhost:5173'
}));

let musicData;
try {
  const dataPath = path.join(__dirname, 'public', 'data.json');
  musicData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (error) {
  console.error('Error loading data.json:', error);
  process.exit(1);
}

function normalizeAppleResponse(appleSong) {
  return {
    trackId: appleSong.id || appleSong.trackId,
    trackName: appleSong.name || appleSong.trackName,
    artistName: appleSong.artistName,
    artistViewUrl: appleSong.artistUrl || appleSong.artistViewUrl,
    artworkUrl100: appleSong.artworkUrl100,
    collectionName: appleSong.collectionName || null,
    collectionViewUrl: appleSong.url || appleSong.collectionViewUrl,
    previewUrl: appleSong.previewUrl || null,
    primaryGenreName: appleSong.genres && appleSong.genres.length > 0 ? appleSong.genres[0].name : appleSong.primaryGenreName,
    releaseDate: appleSong.releaseDate,
    kind: appleSong.kind || appleSong.wrapperType,
    trackPrice: appleSong.trackPrice || null,
    trackExplicitness: appleSong.trackExplicitness || null,
    isStreamable: appleSong.isStreamable || null,
    // add other fields as needed
  };
}

app.get('/api/search', async (req, res) => {
  const { term = '', limit = 50, media = 'music', deploy='false'} = req.query;
  const USE_REAL_API = deploy === 'true';

  console.log(`🔍 Search request: term="${term}", limit="${limit}", media=${media}`);
  

  if(term === ""){
    console.log('🐟 Starting Empty Query');
    
    const apiUrl  = "https://rss.applemarketingtools.com/api/v2/us/music/most-played/50/songs.json";
    const response = await fetch(apiUrl);
    const result = await response.json();
    const responseNormalized = {
      resultCount: result.feed.results.length,
      results: []
    };

    result.feed.results.map( (songItem) => { responseNormalized.results.push( normalizeAppleResponse(songItem) ) } )

    console.log(`✅ Empty query so Apple API returned ${result.feed.results.length || 0} results (normalized)`);
    return res.json(responseNormalized);
  }

  if (USE_REAL_API) {
    try {
      const apiUrl = `https://itunes.apple.com/search?term=${term}&limit=${limit}&media=${media}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      console.log(`✅ Real API returned ${data.resultCount || 0} results`);
      return res.json(data);
      
    } catch (error) {
      console.error('Error fetching from real API:', error);
      return res.status(500).json({ error: 'Failed to fetch from iTunes API' });
    }
  } else {
    // Simulate network delay (like real API)
    setTimeout(() => {
      try {
        let filteredResults = musicData.results;
        
        // Filter by search term if provided
        if (term) {
          const searchTerm = String(term).toLowerCase();
          filteredResults = musicData.results.filter(item => 
            item.trackName?.toLowerCase().includes(searchTerm) ||
            item.artistName?.toLowerCase().includes(searchTerm) ||
            item.collectionName?.toLowerCase().includes(searchTerm) ||
            item.primaryGenreName?.toLowerCase().includes(searchTerm)
          );
        }
        
        // Limit results
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
    }, Math.random() * 1000 + 500); // Random delay 500-1500ms
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', totalSongs: musicData.results.length });
});

app.listen(PORT, () => {
  console.log(`🎵 Fake iTunes API server running on http://localhost:${PORT}`);
  console.log(`📊 Loaded ${musicData.results.length} songs from data.json`);
  console.log(`🔍 Search endpoint: http://localhost:${PORT}/api/search?term=YOUR_QUERY`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});
