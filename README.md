# Beyond the Feed

![HTML](https://img.shields.io/badge/frontend-HTML%2FCSS%2FJavaScript-blue) ![NewsAPI](https://img.shields.io/badge/API-NewsAPI.org-orange)

Beyond the Feed is an editorial digital magazine exploring Instagram's influence on modern life. It covers creativity, online communities, business, digital habits, trends, and the changing ways people connect and express themselves online.

## Features

- Browse curated stories across six editorial categories
- Load relevant current articles from NewsAPI when configured
- Filter API articles for Instagram, social-media, and category relevance
- Prefer India-focused sources and coverage
- Fall back to curated local articles when the API is unavailable or returns no usable results
- Search loaded articles in the browser
- Open article details and original sources
- Use the Digital Habit Calculator to reimagine screen time
- Responsive navigation and magazine-style layout

## Categories

- Creativity
- Online Communities
- Instagram for Business
- Healthy Digital Habits
- Trends
- Connection & Expression

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API
- JSON
- NewsAPI.org
- Vercel Serverless Function

## Project Structure

```text
api/
└── news.js                 # Server-side NewsAPI route

frontend/
├── index.html              # Homepage
├── about.html              # About page
├── article.html            # Article detail page
├── category.html           # Shared category page
├── css/
│   └── style.css           # Shared styling and responsive layout
├── js/
│   ├── api.js              # Browser API client and relevance filtering
│   ├── app.js              # Page rendering and interactions
│   ├── articles.js         # Categories and fallback articles
│   ├── calculator.js       # Digital Habit Calculator
│   └── config.js           # NewsAPI configuration note
└── public/                 # Images, icons, and favicon
```

## Run Locally

Use a modern browser and a local static server. From the project root:

```powershell
python -m http.server 5500 --directory frontend
```

Open:

```text
http://localhost:5500/index.html
```

A local server is recommended instead of opening the HTML files directly with `file://`.

## NewsAPI Configuration

The browser requests the same-origin route `/api/news`. The server-side route in `api/news.js` calls NewsAPI and reads the private key from:

```text
NEWS_API_KEY
```

Do not place the real key in frontend JavaScript or commit it to GitHub. Configure it through the deployment environment when running the serverless route.

When the API is unavailable, missing its key, or returns no relevant articles, the frontend uses the curated fallback stories in `frontend/js/articles.js`.

## API Flow

```text
Browser
  ↓
frontend/js/api.js
  ↓
/api/news
  ↓
api/news.js
  ↓
NewsAPI.org
  ↓
JSON response
  ↓
Relevance scoring and category mapping
  ↓
Article cards and detail pages
```

API articles are checked for strong Instagram or social-media context and category relevance. Indian locations, Indian sources, and India-focused coverage receive priority. Generic politics, sports, finance, weather, crime, and unrelated technology articles are rejected.

## Digital Habit Calculator

The Digital Habits category includes a frontend-only calculator in `frontend/js/calculator.js`. It accepts approximate hours and minutes for several services, calculates daily, weekly, and thirty-day totals, and displays approximate activity comparisons.

The calculator does not use an API and does not store personal data in `localStorage`, `sessionStorage`, or a database.

## Security Notes

- The real NewsAPI key must remain outside frontend source files.
- `.env` is ignored by Git.
- `.env.example` contains only a placeholder.
- The server-side API route reads `process.env.NEWS_API_KEY`.
- The browser receives article data, not the private API key.

## Current Scope

Beyond the Feed is a lightweight editorial magazine built with static HTML, external CSS, and Vanilla JavaScript. It currently supports category browsing, API-backed articles, curated fallback content, search, article details, responsive navigation, and the Digital Habit Calculator.

There is no authentication, database, user profile system, comments system, bookmarks feature, or user-generated content workflow.

## License

This project is unlicensed.
