export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.NEWS_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'News API is not configured' })

  const query = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  if (!query) return res.status(400).json({ error: 'A news query is required' })

  const params = new URLSearchParams({
    q: query,
    language: typeof req.query.language === 'string' ? req.query.language : 'en',
    sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'publishedAt',
    pageSize: typeof req.query.pageSize === 'string' ? req.query.pageSize : '12',
    apiKey,
  })

  try {
    const response = await fetch(`https://newsapi.org/v2/everything?${params}`)
    const data = await response.json()
    if (!response.ok || data.status !== 'ok') {
      return res.status(response.status || 502).json({ error: data.message || 'News API request failed' })
    }
    return res.status(200).json(data)
  } catch {
    return res.status(502).json({ error: 'Unable to reach News API' })
  }
}