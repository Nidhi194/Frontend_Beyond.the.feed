
//Project Manager of the whole project
(function () {
  // Read the data and API objects created by articles.js and api.js; keeping these modules separate lets this file focus on page behavior.
  const data = window.BeyondFeedData
  const api = window.BeyondFeedApi
  // Shared image used when an API article has no usable image or an image request fails.
  const fallbackImage = 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1000&q=85'

  document.addEventListener('DOMContentLoaded', () => { //makes sure the DOM is fully loaded before executing the code because HTML elements are not available until the DOM is fully loaded. This ensures that the code runs after the page has been fully parsed and rendered.
    renderShell() //renders the header and footer of the page
    // Each HTML body identifies its page with data-page, so one app.js can serve all four page types.
    const page = document.body.dataset.page || 'home'
    if (page === 'home') renderHomePage()
    if (page === 'category') renderCategoryPage()
    if (page === 'article') renderArticlePage()
    if (page === 'about') renderAboutPage()
  })

  function renderShell() {
    // The HTML files provide empty #site-header and #site-footer containers; this inserts their shared markup at runtime.
    document.querySelector('#site-header').innerHTML = `<header class="site-header">
      <a href="index.html" class="wordmark">Beyond <span>the</span> Feed</a>
      <button class="menu-button" type="button" aria-label="Toggle navigation" aria-expanded="false">☰</button>
      <nav class="main-nav" aria-label="Main navigation">
        <a href="index.html">Home</a><a href="category.html?slug=creativity">Creativity</a><a href="category.html?slug=communities">Communities</a><a href="category.html?slug=business">Business</a><a href="category.html?slug=habits">Digital Habits</a><a href="category.html?slug=trends">Trends</a><a href="about.html">About</a>
      </nav>
      <label class="search-box"><span>⌕</span><input id="site-search" type="search" placeholder="Search stories" aria-label="Search stories"></label>
    </header>`
    document.querySelector('#site-footer').innerHTML = `<footer><div class="container footer-inner"><a href="index.html" class="wordmark">Beyond <span>the</span> Feed</a><p>Stories for a life beyond the scroll.</p><div><a href="about.html">About</a><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></div></div></footer>`

    const menuButton = document.querySelector('.menu-button')
    menuButton.addEventListener('click', () => {
      // A click toggles the CSS class used by the responsive navigation and keeps aria-expanded synchronized for accessibility.
      const navigation = document.querySelector('.main-nav')
      const isOpen = navigation.classList.toggle('is-open')
      menuButton.setAttribute('aria-expanded', String(isOpen))
    })
  }

  async function loadCategoryArticles(category) {
    try {
      // Request only the selected category. api.js calls the server-side /api/news route and returns mapped, filtered article objects.
      const articles = await api.fetchArticles(category.query, category)
      // API stories are shown first; curated stories for the same category keep the page useful when the API is sparse.
      return { articles: mergeWithFallback(articles, category.slug), usingFallback: !articles.length }
    } catch (error) {
      // A failed request must not break the page, so only the matching local fallback articles are returned.
      return { articles: fallbackForCategory(category.slug), usingFallback: true, error }
    }
  }

  async function loadAllArticles() {
    // Promise.all starts the six category requests together and waits until every category has returned a result.
    const results = await Promise.all(data.categories.map(loadCategoryArticles))
    // flatMap combines category arrays, while uniqueArticles prevents one article from appearing more than once.
    return { articles: uniqueArticles(results.flatMap((result) => result.articles)), usingFallback: results.some((result) => result.usingFallback) }
  }

  async function renderHomePage() {
    // #app is the main content area. Loading text is visible while asynchronous API requests are running.
    const app = document.querySelector('#app')
    showLoading(app)
    const result = await loadAllArticles()
    renderHome(app, result.articles, result.usingFallback)
    setupSearch(result.articles)
  }

  async function renderCategoryPage() {
    // URLSearchParams reads links such as category.html?slug=business; creativity is the safe default when slug is missing.
    const slug = new URLSearchParams(window.location.search).get('slug') || 'creativity'
    // find() returns the category object whose slug matches the URL, or the first category if the URL is invalid.
    const category = data.categories.find((item) => item.slug === slug) || data.categories[0]
    const app = document.querySelector('#app')
    showLoading(app)
    const result = await loadCategoryArticles(category)
    renderCategory(app, category, result.articles, result.usingFallback)
    setupSearch(result.articles)
  }

  async function renderArticlePage() {
    // Article links store the article slug in the URL, so a detail page can be opened directly or refreshed.
    const slug = new URLSearchParams(window.location.search).get('slug')
    const app = document.querySelector('#app')
    showLoading(app)
    const result = await loadAllArticles()
    const availableArticles = result.articles
    const article = availableArticles.find((item) => item.slug === slug) || availableArticles[0]
    renderArticle(app, article, result.usingFallback)
    setupSearch(availableArticles)
  }

  function renderAboutPage() {
    // The About page is static content, so it does not need an API request or article lookup.
    document.querySelector('#app').innerHTML = `<section class="container simple-page"><p class="eyebrow">Our point of view</p><h1>Life is bigger<br><em>than the grid.</em></h1><p class="large-copy">Beyond the Feed is an independent digital magazine exploring Instagram’s influence on modern life: from creativity and online communities to business, digital habits, trends, and the changing way we connect and express ourselves online.</p><a class="arrow-link" href="index.html">Back to stories <span>→</span></a></section>`
  }

  function renderHome(app, articles, usingFallback) {
    // The article marked featured becomes the large story; the remaining first three articles become normal cards.
    const featured = articles.find((article) => article.featured) || articles[0]
    const featuredArticle = articles.find((article) => article.featured) || articles[0]
    app.innerHTML = `<section class="hero-section"><div class="hero-copy"><p class="eyebrow">A magazine about Instagram and modern life</p><h1>What the feed<br><em>gives</em> us.</h1><p class="hero-intro">Stories about Instagram’s pressure and possibility: the attention it captures, the creativity it unlocks, and the communities it helps us find.</p><a class="arrow-link" href="category.html?slug=creativity">Explore the issue <span>→</span></a></div><div class="hero-art"><div class="art-circle"></div><div class="art-caption">Issue 04<br><strong>Attention</strong><br>and the self</div><img src="${fallbackImage}" alt="Green leaves in warm light"></div></section><section class="ticker"><span>Now reading</span><div>Creativity <b>✳</b> Community <b>✳</b> Commerce <b>✳</b> Habits <b>✳</b> Trends <b>✳</b> Connection</div></section><section class="container editorial-section"><div class="section-heading"><div><p class="eyebrow">The latest thinking</p><h2 id="results-heading">Stories worth your attention</h2></div><a class="text-link" href="category.html?slug=creativity">View all stories</a></div>${statusMessage(usingFallback)}${featuredArticle ? featuredMarkup(featuredArticle) : ''}<div class="article-grid">${articles.filter((article) => article.id !== featuredArticle?.id).slice(0, 3).map(articleCardMarkup).join('')}</div></section>${categoryStripMarkup()}`
  }

  function renderCategory(app, category, articles, usingFallback) {
    // The calculator is inserted only for the habits category; its markup is supplied by calculator.js.
    const calculator = category.slug === 'habits' && window.BeyondFeedCalculator ? window.BeyondFeedCalculator.markup() : ''
    app.innerHTML = `<section class="container category-page"><p class="eyebrow">The collection</p><h1>${escapeHtml(category.label)}</h1><p class="category-intro">${escapeHtml(category.description)}</p>${statusMessage(usingFallback)}<div class="article-grid category-grid">${articles.map(articleCardMarkup).join('')}</div>${calculator}</section>`
    if (calculator) window.BeyondFeedCalculator.init()
  }

  function renderArticle(app, article, usingFallback) {
    // Missing article data is handled visibly instead of causing an exception while the page is being rendered.
    if (!article) { app.innerHTML = '<div class="container empty-state">No stories found.</div>'; return }
    // API articles may only have a description, so it becomes the body when a longer body is unavailable.
    const body = article.body || article.description
    app.innerHTML = `<article class="article-page container"><a class="back-link" href="index.html">Back to stories</a><p class="category-label">${escapeHtml(article.category)}</p><h1>${escapeHtml(article.title)}</h1><p class="article-dek">${escapeHtml(article.description)}</p><p class="byline">By ${escapeHtml(article.author)} &nbsp;·&nbsp; ${escapeHtml(article.readTime)}</p><p class="article-source">Published ${formatDate(article.publishedAt)} · Source: <a href="${safeUrl(article.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(article.source)}</a></p><img class="article-hero" src="${safeUrl(article.image || fallbackImage)}" alt="" onerror="this.onerror=null;this.src='${fallbackImage}'"><div class="article-body">${paragraphsMarkup(body)}<blockquote>“Attention is the beginning of devotion.”</blockquote><p class="source-note">This article is provided by ${escapeHtml(article.source)}. <a href="${safeUrl(article.sourceUrl)}" target="_blank" rel="noreferrer">Read the original story</a>.</p></div>${statusMessage(usingFallback)}</article>`
  }

  // These helpers return HTML strings so the same card and link format is reused on home, category, and search views.
  function featuredMarkup(article) { return `<a href="article.html?slug=${encodeURIComponent(article.slug)}" class="featured-story"><img src="${safeUrl(article.image || fallbackImage)}" alt="" onerror="this.onerror=null;this.src='${fallbackImage}'"><div class="featured-copy"><p class="category-label">${escapeHtml(article.category)}</p><h3>${escapeHtml(article.title)}</h3><p>${escapeHtml(article.description)}</p><span class="byline">${escapeHtml(article.author)} &nbsp;·&nbsp; ${escapeHtml(article.readTime)}</span></div></a>` }
  function articleCardMarkup(article) { return `<a href="article.html?slug=${encodeURIComponent(article.slug)}" class="article-card"><img src="${safeUrl(article.image || fallbackImage)}" alt="" onerror="this.onerror=null;this.src='${fallbackImage}'"><p class="category-label">${escapeHtml(article.category)}</p><h3>${escapeHtml(article.title)}</h3><p>${escapeHtml(article.description)}</p><span class="byline">${escapeHtml(article.author)} &nbsp;·&nbsp; ${escapeHtml(article.readTime)}</span></a>` }
  function categoryStripMarkup() { return `<section class="category-strip"><div class="container"><p class="eyebrow">Find your way around</p><div class="category-links">${data.categories.map((category) => `<a href="category.html?slug=${category.slug}" class="${category.color}"><span>${escapeHtml(category.short)}</span><b>→</b></a>`).join('')}</div></div></section>` }
  // filter() keeps only curated articles belonging to the requested category.
  function fallbackForCategory(slug) { return data.fallbackArticles.filter((article) => article.categorySlug === slug) }
  // Set and articleKey prevent API duplicates while retaining distinct curated articles that share a source URL.
  function mergeWithFallback(articles, categorySlug) { const fallback = fallbackForCategory(categorySlug); const seen = new Set(articles.map(articleKey)); return [...articles, ...fallback.filter((article) => !seen.has(articleKey(article)))] }
  function articleKey(article) { return article.id?.startsWith('news-') && article.sourceUrl ? article.sourceUrl : `${article.title.toLowerCase()}|${article.source.toLowerCase()}` }
  function uniqueArticles(articles) { return [...new Map(articles.map((article) => [articleKey(article), article])).values()] }
  // Split article text into paragraphs and escape it before inserting it into the DOM.
  function paragraphsMarkup(text) { return String(text || '').split(/\n+/).filter(Boolean).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('') }
  function setupSearch(articles) { const search = document.querySelector('#site-search'); if (!search) return; search.addEventListener('input', () => { const query = search.value.trim().toLowerCase(); const matches = articles.filter((article) => `${article.title} ${article.description} ${article.category}`.toLowerCase().includes(query)); const grid = document.querySelector('.article-grid'); if (grid) grid.innerHTML = matches.map(articleCardMarkup).join(''); const heading = document.querySelector('#results-heading'); if (heading) heading.textContent = query ? `Search results for “${search.value.trim()}”` : 'Stories worth your attention'; }) }
  // Display temporary feedback while an async API request is pending.
  function showLoading(app) { app.innerHTML = '<div class="container loading-state" role="status">Loading stories...</div>' }
  // Explain to the user when curated local data is being shown instead of current API data.
  function statusMessage(usingFallback) { return usingFallback ? '<p class="status-message">Showing demo stories. Configure the NEWS_API_KEY Vercel environment variable to load current news.</p>' : '' }
  // Convert API date strings into readable text and handle missing or invalid dates safely.
  function formatDate(value) { if (!value) return 'Date unavailable'; const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }
  // Allow only HTTP(S) URLs for external images and source links; invalid values use the shared image fallback.
  function safeUrl(value) { try { const url = new URL(value || fallbackImage, window.location.href); return ['http:', 'https:'].includes(url.protocol) ? escapeHtml(url.href) : fallbackImage } catch { return fallbackImage } }
  // Escape special HTML characters because article values are inserted into template literal markup.
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]) }
}())