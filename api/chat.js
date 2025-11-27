export default async function handler(req, res) {
  // Enable CORS for frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { query, mode, model, maxTokens, temperature } = req.body;

  if (!query) {
    res.status(400).json({ error: 'Query parameter is required' });
    return;
  }

  try {
    const API_KEY = process.env.PERPLEXITY_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Build search config based on mode
    let searchConfig = {};
    if (mode === 'academic') {
      searchConfig.search_domain_filter = ['edu'];
    } else if (mode === 'news') {
      searchConfig.search_recency_filter = 'day';
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'sonar-pro',  // ← Change here
        messages: [{ role: 'user', content: query }],
        max_tokens: maxTokens || 1000,
        temperature: temperature ?? 0.2,
        top_p: 0.9,
        return_citations: true,
        ...searchConfig
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Perplexity API Error:', errorData);
      res.status(response.status).json({ 
        error: 'Perplexity API request failed', 
        details: errorData 
      });
      return;
    }

    const data = await response.json();
    
    // Extract answer and citations
    const answer = data.choices?.[0]?.message?.content || 'No response available';
    
    // Handle citations - flexible format
    const citations = (data.citations || []).map((citation, index) => {
      if (typeof citation === 'string') {
        return {
          title: `Source ${index + 1}`,
          url: citation
        };
      }
      return {
        title: citation.title || `Source ${index + 1}`,
        url: citation.url || citation
      };
    }) || [];

    res.status(200).json({ answer, citations });
    
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
