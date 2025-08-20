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
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

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
