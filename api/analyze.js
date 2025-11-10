module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { siteUrl, sourceFilter } = req.body;

    if (!siteUrl) {
      res.status(400).json({ error: 'siteUrl is required' });
      return;
    }

    // Dynamic import to avoid module loading issues
    const { analyzeWebsite } = require('./website-analyzer');
    
    // Analyze the website
    const result = await analyzeWebsite(siteUrl, sourceFilter);

    res.status(200).json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to analyze website',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

