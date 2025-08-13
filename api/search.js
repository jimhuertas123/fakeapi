const fs = require('fs');
const path = require('path');

let musicData;
try {
  const dataPath = path.join(process.cwd(), 'public', 'data.json');
  musicData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (error) {
  console.error('Error loading data.json:', error);
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://itunes-react.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { term = '', limit = 50, media = 'music', deploy = 'false' } = req.query;
  const USE_REAL_API = deploy === 'true';

  console.log(`🔍 Search request: term="${term}", limit="${limit}", media=${media}`);

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
  }
};
