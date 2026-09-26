# Beyond the Feed

![HTML](https://img.shields.io/badge/frontend-HTML%2FCSS%2FJavaScript-blue) ![NewsAPI](https://img.shields.io/badge/API-NewsAPI.org-orange)

Beyond the Feed is a frontend-only digital magazine exploring social media, creativity, online communities, digital habits, and the changing ways we connect online.

## Features

- Browse articles by category
- Search loaded articles in the browser
- Read article details and open the original source
- Load current news from NewsAPI.org when a key is configured
- Show demo content when the API key is not configured
- Calculate daily, weekly, and monthly screen-time equivalents
- Reimagine scroll time with approximate activity comparisons
- Responsive navigation and magazine-style layout

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API
- JSON
- NewsAPI.org as the only external data API

## Project structure

```text
frontend/
├── index.html
├── about.html
├── article.html
├── category.html
├── css/style.css
├── js/app.js
├── js/api.js
├── js/articles.js
├── js/config.js
└── public/
```

## Configure and run

A modern browser and a local static server are required. For example:

```powershell
cd frontend
python -m http.server 5500
```

Open `http://localhost:5500/index.html` in a browser. A local server is recommended instead of opening the files with `file://`.

To load current news on Vercel, add your NewsAPI.org key as the `NEWS_API_KEY` environment variable in the Vercel project settings. The key is read only by `api/news.js` and is never sent to the browser.

```text
NEWS_API_KEY=your_newsapi_key_here
```

Do not commit a real API key to a public repository. Without the Vercel variable, the site displays the included demo articles and explains how to configure live news.

## API flow

```text
User
  ↓
HTML/CSS/JavaScript website
  ↓
Fetch API request to /api/news
  ↓
Vercel Serverless Function
  ↓
NewsAPI.org
  ↓
JSON response
  ↓
Extract title, description, source, date, image, and URL
  ↓
Render article cards and detail pages
```

The browser request is implemented in `frontend/js/api.js` and calls same-origin `/api/news`. The server-side NewsAPI request is implemented in `api/news.js`. The fallback content and frontend categories are in `frontend/js/articles.js`. Page rendering, navigation, search, loading, error handling, and image fallbacks are in `frontend/js/app.js`.

## Digital habit calculator

The Digital Habits category includes a frontend-only calculator in `frontend/js/calculator.js`. It converts entered hours and minutes into daily, weekly, and 30-day monthly totals, then shows approximate comparisons such as movies, reading, art sessions, rides, and mini projects. It stores nothing and uses no additional API.

## Future scope

Possible future improvements include a Node.js/Express backend, MySQL or MongoDB, authentication, profiles, bookmarks, reading history, personalized recommendations, admin content management, comments, user-generated content, AI/NLP features, analytics, and role-based access control.

## Presentation explanation

Beyond the Feed is a static digital magazine built with HTML, CSS, and vanilla JavaScript. The browser requests current technology and social-media news from the same-origin `/api/news` route. A Vercel Serverless Function securely calls NewsAPI.org and returns JSON. The application extracts the useful fields and renders them as article cards and detail pages. Users can search the loaded stories, browse categories, and open the original source. A local demo dataset keeps the interface working when the serverless route or environment variable is unavailable.

## License

This project is unlicensed.
