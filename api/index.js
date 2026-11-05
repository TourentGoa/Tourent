const app = require('../server.js');

module.exports = (req, res) => {
  const matched = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'] || '';

  if (matched && (matched.startsWith('/api') || matched.startsWith('/health'))) {
    const qIndex = req.url.indexOf('?');
    const queryString = qIndex !== -1 ? req.url.slice(qIndex) : '';
    req.url = matched + queryString;
  } else if (!req.url.startsWith('/api') && !req.url.startsWith('/health')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  return app(req, res);
};
