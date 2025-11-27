// Configuration file for Chetak AI
// IMPORTANT: This is an example file. Create a copy named 'config.js' with your real API key

const CONFIG = {
    // Get your API key from: https://www.perplexity.ai/settings/api
    PERPLEXITY_API_KEY: 'pplx-YOUR_API_KEY_HERE',
    
    // API Configuration
    API_ENDPOINT: 'https://api.perplexity.ai/chat/completions',
    MODEL: 'sonar-pro', // or 'sonar-pro'
    
    // Optional settings
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.2,
    TOP_P: 0.9
};

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}