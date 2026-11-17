import http from 'http';

const TARGET_PORT = 5173;

const server = http.createServer((req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('XTREME AI Dev Server starting... Please refresh in a moment.');
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(80, '0.0.0.0', () => {
  console.log('XTREME AI Standard HTTP (Port 80) Proxy is listening on http://127.0.0.1:80');
});
