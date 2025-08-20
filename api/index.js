module.exports = (req, res) => {
  // Enable CORS for root route
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

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.json({
    message: 'Fake iTunes API Server',
    version: '1.2.0',
    endpoints: {
      health: '/api/health',
      search: '/api/search?term=YOUR_QUERY',
      artist: '/api/artist?id=YOUR_ID'
    },
    example: 'https://fakeapi-delta.vercel.app/api/search?term=love&limit=5'
  });
};
