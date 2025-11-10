const { analyzeWebsite } = require('./website-analyzer');

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

    // Analyze the website
    const result = await analyzeWebsite(siteUrl, sourceFilter);

    res.status(200).json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze website',
      message: error.message 
    });
  }
};

