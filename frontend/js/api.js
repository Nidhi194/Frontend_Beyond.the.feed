const data = window.BeyondFeedData; //container for api functions

window.BeyondFeedApi = {
  async fetchArticles(query, category) {
    if (!query || !category) throw new Error('A NewsAPI category query is required')
    const params = new URLSearchParams({ q: query, language: 'en', sortBy: 'publishedAt', pageSize: '12' })
    const response = await fetch(`/api/news?${params}`)
    if (!response.ok) throw new Error(`NewsAPI request failed with status ${response.status}`)
    const data = await response.json()
    if (data.status !== 'ok' || !Array.isArray(data.articles)) throw new Error('NewsAPI returned an unexpected response')

    return data.articles
      .map((article) => ({ article, score: relevanceScore(article, category.relevance, category.coreRelevance) }))
      .filter((result) => result.score >= 14)
      .sort((left, right) => right.score - left.score)
      .slice(0, 12)
      .map(({ article }) => ({
      id: `news-${newsArticleKey(article)}`,
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

const api = window.BeyondFeedApi;

function createSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function relevanceScore(article, categoryTerms, coreTerms) {
  if (!article?.title || article.title === '[Removed]') return 0
  const title = String(article.title).toLowerCase()
  const description = String(article.description || '').toLowerCase()
  const content = String(article.content || '').toLowerCase()
  const source = String(article.source?.name || '').toLowerCase()
  const url = String(article.url || '').toLowerCase()
  const text = `${title} ${description} ${content} ${source} ${url}`
  const socialTerms = ['instagram', 'instagram reels', 'instagram stories', 'social media', 'social-media', 'meta', 'influencer', 'creator economy', 'content creator', 'social platform', 'online community']
  const indiaTerms = ['india', 'indian', 'indians', 'mumbai', 'delhi', 'bengaluru', 'bangalore', 'hyderabad', 'pune', 'chennai', 'kolkata', 'maharashtra', 'indian creators', 'indian influencers', 'indian businesses', 'indian brands', 'indian consumers', 'indian users']
  const indianSources = ['indianexpress.com', 'hindustantimes.com', 'timesofindia.indiatimes.com', 'thehindu.com', 'moneycontrol.com', 'economictimes.indiatimes.com', 'business-standard.com', 'entrepreneur.com', 'exchange4media.com', 'afaqs.com', 'medianama.com', 'yourstory.com', 'inc42.com']
  const indianSourceNames = ['indian express', 'hindustan times', 'times of india', 'the hindu', 'moneycontrol', 'economic times', 'business standard', 'exchange4media', 'afaqs', 'medianama', 'yourstory', 'inc42']
  const blockedTerms = ['election results', 'stock market', 'football', 'cricket', 'weather forecast', 'war in', 'earthquake', 'crime report', 'iphone launch']
  const socialMatches = socialTerms.filter((term) => text.includes(term))
  const categoryMatches = categoryTerms.filter((term) => text.includes(term.toLowerCase()))
  const coreMatches = coreTerms.filter((term) => text.includes(term.toLowerCase()))
  const hasStrongSocialContext = socialMatches.some((term) => title.includes(term)) || socialMatches.length >= 2
  if (!hasStrongSocialContext || !categoryMatches.length || !coreMatches.length || blockedTerms.some((term) => title.includes(term) && !title.includes('instagram'))) return 0

  let score = 0
  if (title.includes('instagram')) score += 10
  if (title.includes('instagram reels')) score += 8
  if (title.includes('social media')) score += 6
  if (description.includes('instagram') || description.includes('social media') || description.includes('social-media')) score += 5
  if (indiaTerms.some((term) => text.includes(term))) score += 5
  if (indianSources.some((domain) => url.includes(domain)) || indianSourceNames.some((name) => source.includes(name))) score += 4
  if (categoryMatches.some((term) => title.includes(term.toLowerCase()))) score += 4
  if (categoryMatches.some((term) => description.includes(term.toLowerCase()))) score += 2
  if (categoryMatches.some((term) => content.includes(term.toLowerCase()))) score += 1
  return score
}

function newsArticleKey(article) {
  return article.url || `${String(article.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${String(article.source?.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

export function articleKey(article) {
  return article.id?.startsWith('news-') && article.sourceUrl
    ? article.sourceUrl
    : `${article.title.toLowerCase()}|${article.source.toLowerCase()}`;
}

export async function loadCategoryArticles(category) {  //function has waiting time for api call to complete and return the articles for a specific category
  try {
    const articles = await api.fetchArticles(category.query, category); //API CALL

    return {
      articles: mergeWithFallback(articles, category.slug),
      usingFallback: !articles.length
    };
  } catch (error) {
    return {
      articles: fallbackForCategory(category.slug),
      usingFallback: true,
      error
    };
  }
}

export async function loadAllArticles() {
  const results = await Promise.all(data.categories.map(loadCategoryArticles));

  return {
    articles: uniqueArticles(results.flatMap((result) => result.articles)),
    usingFallback: results.some((result) => result.usingFallback)
  };
}

export function fallbackForCategory(slug) {
  return data.fallbackArticles.filter((article) => article.categorySlug === slug);
}

export function mergeWithFallback(articles, categorySlug) {
  const fallback = fallbackForCategory(categorySlug);
  const seen = new Set(articles.map(articleKey));

  return [
    ...articles,
    ...fallback.filter((article) => !seen.has(articleKey(article)))
  ];
}

export function uniqueArticles(articles) {
  return [...new Map(articles.map((article) => [articleKey(article), article])).values()];
}