import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Custom plugin to provide real live web search and webpage fetching middleware
function webAccessPlugin() {
  return {
    name: 'web-access-api',
    configureServer(server) {
      // Endpoint 1: Real Live Web Search
      server.middlewares.use('/api/search', async (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const query = urlObj.searchParams.get('q');
          
          if (!query || !query.trim()) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Query parameter q is required' }));
            return;
          }

          const results = [];

          // 1. Query DuckDuckGo HTML
          try {
            const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
            const ddgRes = await fetch(ddgUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
              }
            });
            const html = await ddgRes.text();

            const blockRegex = /<h2 class="result__title">[\s\S]*?<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
            let match;
            while ((match = blockRegex.exec(html)) && results.length < 7) {
              let rawUrl = match[1];
              let actualUrl = rawUrl;
              if (rawUrl.includes('uddg=')) {
                try {
                  actualUrl = decodeURIComponent(rawUrl.split('uddg=')[1].split('&')[0]);
                } catch (e) {}
              }
              const title = match[2].replace(/<[^>]+>/g, '').trim();
              const snippet = match[3].replace(/<[^>]+>/g, '').trim();
              let domain = '';
              try { domain = new URL(actualUrl).hostname; } catch(e){}

              results.push({ title, url: actualUrl, snippet, domain });
            }
          } catch (ddgErr) {
            console.error('DuckDuckGo search error:', ddgErr.message);
          }

          // 2. Query Wikipedia API for deep factual summaries
          try {
            const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
            const wikiRes = await fetch(wikiUrl);
            const wikiJson = await wikiRes.json();
            if (wikiJson.query?.search?.length) {
              const top = wikiJson.query.search[0];
              const wikiPageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(top.title.replace(/ /g, '_'))}`;
              results.unshift({
                title: `Wikipedia: ${top.title}`,
                url: wikiPageUrl,
                snippet: top.snippet.replace(/<[^>]+>/g, ''),
                domain: 'en.wikipedia.org'
              });
            }
          } catch (wikiErr) {
            console.error('Wikipedia query error:', wikiErr.message);
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ query, count: results.length, results }));
        } catch (err) {
          console.error('Search API failure:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message, results: [] }));
        }
      });

      // Endpoint 2: Real Web Page Content Reader
      server.middlewares.use('/api/fetch-page', async (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const targetUrl = urlObj.searchParams.get('url');

          if (!targetUrl) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'url parameter required' }));
            return;
          }

          const pageRes = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            }
          });

          const html = await pageRes.text();
          // Extract title
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const title = titleMatch ? titleMatch[1].trim() : targetUrl;

          // Strip scripts, styles, and extract text
          const cleanText = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 4500);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ url: targetUrl, title, text: cleanText }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), webAccessPlugin()],
});
