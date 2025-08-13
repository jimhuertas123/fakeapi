const fs = require('fs');
const path = require('path');

let musicData;
try {
  const dataPath = path.join(process.cwd(), 'public', 'data.json');
  musicData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (error) {
  console.error('Error loading data.json:', error);
}

module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://itunes-react.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.json({ 
    status: 'ok', 
    totalSongs: musicData?.results?.length || 0,
    timestamp: new Date().toISOString()
  });
};
