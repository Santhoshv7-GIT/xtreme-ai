export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query.q || '';
  if (!query.trim()) {
    return res.status(400).json({ error: 'Query parameter q is required', results: [] });
  }

  const results = [];

  // 1. DuckDuckGo Search
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
      try { domain = new URL(actualUrl).hostname; } catch (e) {}
      results.push({ title, url: actualUrl, snippet, domain });
    }
  } catch (ddgErr) {
    console.warn('DDG Search error:', ddgErr.message);
  }

  // 2. Wikipedia Search
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
    console.warn('Wikipedia Search error:', wikiErr.message);
  }

  return res.status(200).json({ query, count: results.length, results });
}
