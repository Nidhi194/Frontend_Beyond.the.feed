(function () {
  const data = window.BeyondFeedData
  const api = window.BeyondFeedApi
  const fallbackImage = 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1000&q=85'

  document.addEventListener('DOMContentLoaded', () => {
    renderShell()
    const page = document.body.dataset.page || 'home'
    if (page === 'home') renderHomePage()
    if (page === 'category') renderCategoryPage()
    if (page === 'article') renderArticlePage()
    if (page === 'about') renderAboutPage()
  })

  function renderShell() {
    document.querySelector('#site-header').innerHTML = `<header class="site-header">
      <a href="index.html" class="wordmark">Beyond <span>the</span> Feed</a>
      <button class="menu-button" type="button" aria-label="Toggle navigation" aria-expanded="false">☰</button>
      <nav class="main-nav" aria-label="Main navigation">
        <a href="category.html?slug=mind">The Mind</a><a href="category.html?slug=creativity">Creativity</a><a href="category.html?slug=business">Business</a><a href="category.html?slug=habits">Digital Habits</a><a href="about.html">About</a>
      </nav>
      <label class="search-box"><span>⌕</span><input id="site-search" type="search" placeholder="Search stories" aria-label="Search stories"></label>
    </header>`
    document.querySelector('#site-footer').innerHTML = `<footer><div class="container footer-inner"><a href="index.html" class="wordmark">Beyond <span>the</span> Feed</a><p>Stories for a life beyond the scroll.</p><div><a href="about.html">About</a><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></div></div></footer>`

    const menuButton = document.querySelector('.menu-button')
    menuButton.addEventListener('click', () => {
      const navigation = document.querySelector('.main-nav')
      const isOpen = navigation.classList.toggle('is-open')
      menuButton.setAttribute('aria-expanded', String(isOpen))
    })
  }

  async function loadArticles(query) {
    try {
      const articles = await api.fetchArticles(query)
      return { articles: articles.length ? articles : data.fallbackArticles, usingFallback: !articles.length }
    } catch (error) {
      return { articles: data.fallbackArticles, usingFallback: true, error }
    }
  }

  async function renderHomePage() {
    const app = document.querySelector('#app')
    showLoading(app)
    const result = await loadArticles()
    renderHome(app, result.articles, result.usingFallback)
    setupSearch(result.articles)
  }

  async function renderCategoryPage() {
    const slug = new URLSearchParams(window.location.search).get('slug') || 'mind'
    const category = data.categories.find((item) => item.slug === slug) || data.categories[0]
    const app = document.querySelector('#app')
    showLoading(app)
    const result = await loadArticles(category.query)
    const matchingArticles = result.articles.filter((article) => article.categorySlug === slug)
    renderCategory(app, category, matchingArticles.length ? matchingArticles : result.articles, result.usingFallback)
    setupSearch(result.articles)
  }

  async function renderArticlePage() {
    const slug = new URLSearchParams(window.location.search).get('slug')
    const app = document.querySelector('#app')
    showLoading(app)
    const result = await loadArticles()
    const article = result.articles.find((item) => item.slug === slug) || result.articles[0]
    renderArticle(app, article, result.usingFallback)
    setupSearch(result.articles)
  }

  function renderAboutPage() {
    document.querySelector('#app').innerHTML = `<section class="container simple-page"><p class="eyebrow">Our point of view</p><h1>Life is bigger<br><em>than the grid.</em></h1><p class="large-copy">Beyond the Feed is an independent digital magazine about Instagram’s influence on modern life. We look past the likes and into the questions underneath: who gets seen, what gets made, and how do we want to be together?</p><a class="arrow-link" href="index.html">Back to stories <span>→</span></a></section>`
  }

  function renderHome(app, articles, usingFallback) {
    const featured = articles.find((article) => article.featured) || articles[0]
    app.innerHTML = `<section class="hero-section"><div class="hero-copy"><p class="eyebrow">A magazine about Instagram and modern life</p><h1>What the feed<br><em>gives</em> us.</h1><p class="hero-intro">Stories about Instagram’s pressure and possibility: the attention it captures, the creativity it unlocks, and the communities it helps us find.</p><a class="arrow-link" href="category.html?slug=mind">Explore the issue <span>→</span></a></div><div class="hero-art"><div class="art-circle"></div><div class="art-caption">Issue 04<br><strong>Attention</strong><br>and the self</div><img src="${fallbackImage}" alt="Green leaves in warm light"></div></section><section class="ticker"><span>Now reading</span><div>Comparison <b>✳</b> Creativity <b>✳</b> Community <b>✳</b> Commerce <b>✳</b> Attention <b>✳</b> Connection</div></section><section class="container editorial-section"><div class="section-heading"><div><p class="eyebrow">The latest thinking</p><h2 id="results-heading">Stories worth your attention</h2></div><a class="text-link" href="category.html?slug=mind">View all stories</a></div>${statusMessage(usingFallback)}${featured ? featuredMarkup(featured) : ''}<div class="article-grid">${articles.filter((article) => article.id !== featured?.id).slice(0, 3).map(articleCardMarkup).join('')}</div></section>${categoryStripMarkup()}`
  }

  function renderCategory(app, category, articles, usingFallback) {
    const calculator = category.slug === 'habits' && window.BeyondFeedCalculator ? window.BeyondFeedCalculator.markup() : ''
    app.innerHTML = `<section class="container category-page"><p class="eyebrow">The collection</p><h1>${escapeHtml(category.label)}</h1><p class="category-intro">${escapeHtml(category.description)}</p>${statusMessage(usingFallback)}<div class="article-grid category-grid">${articles.map(articleCardMarkup).join('')}</div>${calculator}</section>`
    if (calculator) window.BeyondFeedCalculator.init()
  }

  function renderArticle(app, article, usingFallback) {
    if (!article) { app.innerHTML = '<div class="container empty-state">No stories found.</div>'; return }
    const body = article.body || article.description
    app.innerHTML = `<article class="article-page container"><a class="back-link" href="index.html">Back to stories</a><p class="category-label">${escapeHtml(article.category)}</p><h1>${escapeHtml(article.title)}</h1><p class="article-dek">${escapeHtml(article.description)}</p><p class="byline">By ${escapeHtml(article.author)} &nbsp;·&nbsp; ${escapeHtml(article.readTime)}</p><p class="article-source">Published ${formatDate(article.publishedAt)} · Source: <a href="${safeUrl(article.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(article.source)}</a></p><img class="article-hero" src="${safeUrl(article.image || fallbackImage)}" alt="" onerror="this.onerror=null;this.src='${fallbackImage}'"><div class="article-body">${paragraphsMarkup(body)}<blockquote>“Attention is the beginning of devotion.”</blockquote><p class="source-note">This article is provided by ${escapeHtml(article.source)}. <a href="${safeUrl(article.sourceUrl)}" target="_blank" rel="noreferrer">Read the original story</a>.</p></div>${statusMessage(usingFallback)}</article>`
  }

  function featuredMarkup(article) { return `<a href="article.html?slug=${encodeURIComponent(article.slug)}" class="featured-story"><img src="${safeUrl(article.image || fallbackImage)}" alt="" onerror="this.onerror=null;this.src='${fallbackImage}'"><div class="featured-copy"><p class="category-label">${escapeHtml(article.category)}</p><h3>${escapeHtml(article.title)}</h3><p>${escapeHtml(article.description)}</p><span class="byline">${escapeHtml(article.author)} &nbsp;·&nbsp; ${escapeHtml(article.readTime)}</span></div></a>` }
  function articleCardMarkup(article) { return `<a href="article.html?slug=${encodeURIComponent(article.slug)}" class="article-card"><img src="${safeUrl(article.image || fallbackImage)}" alt="" onerror="this.onerror=null;this.src='${fallbackImage}'"><p class="category-label">${escapeHtml(article.category)}</p><h3>${escapeHtml(article.title)}</h3><p>${escapeHtml(article.description)}</p><span class="byline">${escapeHtml(article.author)} &nbsp;·&nbsp; ${escapeHtml(article.readTime)}</span></a>` }
  function categoryStripMarkup() { return `<section class="category-strip"><div class="container"><p class="eyebrow">Find your way around</p><div class="category-links">${data.categories.map((category) => `<a href="category.html?slug=${category.slug}" class="${category.color}"><span>${escapeHtml(category.short)}</span><b>→</b></a>`).join('')}</div></div></section>` }
  function paragraphsMarkup(text) { return String(text || '').split(/\n+/).filter(Boolean).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('') }
  function setupSearch(articles) { const search = document.querySelector('#site-search'); if (!search) return; search.addEventListener('input', () => { const query = search.value.trim().toLowerCase(); const matches = articles.filter((article) => `${article.title} ${article.description} ${article.category}`.toLowerCase().includes(query)); const grid = document.querySelector('.article-grid'); if (grid) grid.innerHTML = matches.map(articleCardMarkup).join(''); const heading = document.querySelector('#results-heading'); if (heading) heading.textContent = query ? `Search results for “${search.value.trim()}”` : 'Stories worth your attention'; }) }
  function showLoading(app) { app.innerHTML = '<div class="container loading-state" role="status">Loading stories...</div>' }
  function statusMessage(usingFallback) { return usingFallback ? '<p class="status-message">Showing demo stories. Configure the NEWS_API_KEY Vercel environment variable to load current news.</p>' : '' }
  function formatDate(value) { if (!value) return 'Date unavailable'; const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }
  function safeUrl(value) { try { const url = new URL(value || fallbackImage, window.location.href); return ['http:', 'https:'].includes(url.protocol) ? escapeHtml(url.href) : fallbackImage } catch { return fallbackImage } }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]) }
}())