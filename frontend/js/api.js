window.BeyondFeedApi = {
  async fetchArticles(query, category) {
    if (!query || !category) throw new Error('A NewsAPI category query is required')
    const params = new URLSearchParams({ q: query, language: 'en', sortBy: 'publishedAt', pageSize: '12' })
    const response = await fetch(`/api/news?${params}`)
    if (!response.ok) throw new Error(`NewsAPI request failed with status ${response.status}`)
    const data = await response.json()
    if (data.status !== 'ok' || !Array.isArray(data.articles)) throw new Error('NewsAPI returned an unexpected response')

    return data.articles.filter((article) => isRelevant(article, category.relevance)).map((article, index) => ({
      id: `news-${index}-${article.publishedAt}`,
      slug: createSlug(article.title),
      title: article.title,
      description: article.description || 'Read the full story at the original source.',
      body: article.description || '',
      category: category.label,
      categorySlug: category.slug,
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

function isRelevant(article, relevanceTerms) {
  const text = [article.title, article.description, article.content, article.source?.name].filter(Boolean).join(' ').toLowerCase()
  const socialContext = ['instagram', 'social media', 'social-media', 'reels', 'creator', 'online community', 'fandom']
  const hasSocialContext = socialContext.some((term) => text.includes(term))
  const hasCategoryContext = relevanceTerms.some((term) => text.includes(term.toLowerCase()))
  return article.title && article.title !== '[Removed]' && hasSocialContext && hasCategoryContext
}