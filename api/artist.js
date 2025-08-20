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
    
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    //getters from query
    const { id } = req.query;
    if(id === "") { return res.status(500).json({ error: 'Failed param id need to be filled' });}

    console.log(`🔍 Search request: id="${id}"`);

    try {
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
}