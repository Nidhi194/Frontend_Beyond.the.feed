window.BeyondFeedApi = {
  async fetchArticles(query = 'social media digital technology creativity online communities') {
    const params = new URLSearchParams({ q: query, language: 'en', sortBy: 'publishedAt', pageSize: '12' })
    const response = await fetch(`/api/news?${params}`)
    if (!response.ok) throw new Error(`NewsAPI request failed with status ${response.status}`)
    const data = await response.json()
    if (data.status !== 'ok' || !Array.isArray(data.articles)) throw new Error('NewsAPI returned an unexpected response')

    return data.articles.filter((article) => article.title && article.title !== '[Removed]').map((article, index) => ({
      id: `news-${index}-${article.publishedAt}`,
      slug: createSlug(article.title),
      title: article.title,
      description: article.description || 'Read the full story at the original source.',
      body: article.description || '',
      category: 'Trends',
      categorySlug: 'trends',
      author: article.author || article.source?.name || 'News source',
      readTime: 'News story',
      image: article.urlToImage || '',
      source: article.source?.name || 'News source',
      sourceUrl: article.url,
      publishedAt: article.publishedAt,
    }))
  },
}

function createSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}