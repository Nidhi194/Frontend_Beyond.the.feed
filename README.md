# Beyond the Feed: Viva and Code Understanding Guide

This is a viva guide for the current implementation of Beyond the Feed. It explains what the existing files and technologies do. It does not describe planned features, and it does not claim that alternatives are already implemented.

## Project Architecture

The project has a static browser frontend and one server-side API route:

```text
HTML pages
  -> CSS styling and browser JavaScript
  -> api/news.js server-side route
  -> NewsAPI.org
  -> JSON article response
  -> mapped, scored, filtered article objects
  -> article cards and article detail page
```

The browser uses the curated data in `frontend/js/articles.js` when the API is unavailable or returns no usable article. The API key is read by `api/news.js`, not by browser code.

## File Responsibilities

### `frontend/index.html`

This is the homepage document. It contains the `data-page="home"` marker and empty containers named `site-header`, `app`, and `site-footer`. It loads the stylesheet and browser scripts with `defer`, so `app.js` can build the page after the document is parsed.

### `frontend/category.html`

This is the shared category-page document. Its body uses `data-page="category"`. The URL supplies a category through a query value such as `?slug=business`. It also loads `calculator.js`; `app.js` displays that calculator only for the Digital Habits category.

### `frontend/article.html`

This is the shared article-detail document. Its body uses `data-page="article"`. The article slug is read from the URL, and `app.js` finds the matching article and renders its detail view.

### `frontend/about.html`

This document uses `data-page="about"`. It supplies the same header, main-content, and footer containers, while `app.js` inserts the About text.

### `frontend/css/style.css`

This external CSS file controls the colors, typography, layout, article cards, navigation, calculator, responsive rules, and generated class names. The HTML files connect it with a `<link rel="stylesheet">` element.

### `frontend/js/config.js`

This file currently contains only a comment explaining that NewsAPI is configured through the `NEWS_API_KEY` environment variable. It does not read or expose the real key.

### `frontend/js/articles.js`

This file creates `window.BeyondFeedData`. It contains the six categories, each category's NewsAPI query and relevance terms, plus curated fallback article objects. `app.js` reads this object.

### `frontend/js/api.js`

This file creates `window.BeyondFeedApi`. Its `fetchArticles()` function calls the browser-visible same-origin `/api/news` route. It validates the JSON response, scores articles for social-media and category relevance, sorts them, removes weak results, and maps accepted NewsAPI fields to the article structure used by the UI.

### `frontend/js/app.js`

This is the main browser controller. It detects the page type, builds the shared shell, loads articles, renders pages, handles navigation and search, integrates the calculator, and provides fallback and safety helpers.

### `frontend/js/calculator.js`

This file creates `window.BeyondFeedCalculator`. It returns calculator markup, attaches form events, converts entered hours and minutes into totals, and displays approximate activity comparisons. It does not use an API or browser storage.

### `api/news.js`

This is the server-side route. It accepts only `GET`, reads `process.env.NEWS_API_KEY`, builds a NewsAPI `/v2/everything` request, sends the key only in that server-side request, and returns NewsAPI JSON to the browser.

### `frontend/public/`

This folder contains static public assets such as the favicon, hero image, and icon SVG file. These are requested by the browser as ordinary files.

## Vanilla JavaScript

### What we used

The project uses Vanilla JavaScript. This means JavaScript is written directly with browser APIs instead of using React, Vue, Angular, or another framework.

### Why we used it

The project is a small magazine-style site. Direct browser APIs are enough for routing by query string, rendering HTML, handling events, searching articles, and running the calculator. No framework or dependency installation is required for the frontend.

### How it works here

The code uses `document.querySelector()`, `innerHTML`, `addEventListener()`, `classList`, `URLSearchParams`, arrays, objects, and `fetch()`-related API functions. `app.js` coordinates these operations.

### Alternatives

- React components
- Vue components
- Angular components
- A server-rendered template system

### Drawbacks of current approach

- DOM updates are written manually.
- State management becomes harder as the application grows.
- Large template strings can become difficult to maintain.
- There is no framework-level component or routing system.

## HTML5 and Page Markers

### What we used

The project uses separate HTML5 documents for Home, Category, Article, and About pages. Each page uses `data-page` to tell `app.js` which renderer to call.

### Why we used it

Separate documents keep the page structure simple while allowing one shared JavaScript controller to reuse the header, footer, and rendering logic.

### How it works here

`app.js` reads:

```javascript
document.body.dataset.page
```

For example, `data-page="category"` selects `renderCategoryPage()`.

### Alternatives

- A single-page application router
- Server-side templates
- Static-site generation
- Inline page-specific JavaScript

### Drawbacks of current approach

- Navigating between pages reloads the document.
- Shared containers must exist in every HTML file.
- The browser downloads common scripts again on a new page.

## External CSS

### What we used

The project uses `frontend/css/style.css` as an external stylesheet.

### Why we used it

Keeping styling outside HTML separates presentation from structure and lets all pages share the same design.

### How it works here

Each HTML file includes:

```html
<link rel="stylesheet" href="css/style.css">
```

The JavaScript creates classes such as `article-card`, `main-nav`, and `category-page`; the stylesheet defines how those classes look.

### Alternatives

- Internal `<style>` blocks
- Inline `style` attributes
- CSS Modules
- Tailwind CSS

### Drawbacks of current approach

- The stylesheet must load before the intended design appears.
- A large shared CSS file can affect loading performance.
- Class-name coordination between JavaScript and CSS is manual.

## External JavaScript Files

### What we used

JavaScript is split into `config.js`, `articles.js`, `api.js`, `calculator.js`, and `app.js`.

### Why we used it

Separate files give each part a clear responsibility: data, API mapping, calculator behavior, and page control.

### How it works here

HTML loads scripts with `<script src="..." defer>`. The scripts create shared values on `window`, such as `BeyondFeedData`, `BeyondFeedApi`, and `BeyondFeedCalculator`, which later files can read.

### Alternatives

- One large JavaScript file
- ES modules with `import` and `export`
- Bundled files using Vite or Webpack
- Inline scripts inside HTML

### Drawbacks of current approach

- The shared `window` objects are global and can be overwritten.
- Script order matters because later code expects earlier globals.
- There is no module-level dependency checking.

## IIFE

### What we used

`app.js` and `calculator.js` use an Immediately Invoked Function Expression, or IIFE:

```javascript
(function () { ... }())
```

### Why we used it

It creates a private scope for internal variables and functions. The calculator exposes only its returned public object, while `app.js` keeps its helpers private.

### How it works here

The function is created and executed immediately when the script loads.

### Alternatives

- ES modules
- A class
- A normal global function
- A namespace object

### Drawbacks of current approach

- Beginners may find the syntax less obvious.
- Private functions cannot be called directly from the browser console.
- The project still uses `window` for communication between files.

## DOM and `DOMContentLoaded`

### What we used

The DOM is the browser's object representation of the HTML document. `app.js` waits for the `DOMContentLoaded` event before selecting containers and rendering content.

### Why we used it

The required HTML elements must exist before JavaScript writes into them.

### How it works here

The event handler calls `renderShell()` and then chooses the renderer based on `data-page`.

### Alternatives

- Place scripts at the end of the body
- Use module scripts
- Use framework lifecycle hooks

### Drawbacks of current approach

- Content waits for the document parsing event before rendering.
- A missing container can cause runtime errors in some direct `querySelector()` uses.

## `querySelector()` and `innerHTML`

### What we used

`querySelector()` finds DOM elements using CSS selectors, and `innerHTML` inserts generated HTML into them.

### Why we used it

The site uses repeated card and page structures, so HTML can be generated from article objects.

### How it works here

Examples include `#app`, `#site-header`, `#site-footer`, `.article-grid`, and `#site-search`. Rendering functions replace the contents of these elements.

### Alternatives

- `createElement()` and `appendChild()`
- DOM templates
- Web Components
- React or Vue rendering

### Drawbacks of current approach

- Replacing `innerHTML` can remove event listeners inside the replaced content.
- Large template strings can be hard to debug.
- Unescaped external values could create HTML injection, which is why this project uses `escapeHtml()`.

## Event Listeners

### What we used

The project uses `addEventListener()` for `DOMContentLoaded`, menu clicks, search input, calculator submission, and calculator reset clicks.

### Why we used it

Event listeners run code in response to user actions or browser lifecycle events without inline event attributes.

### How it works here

- `DOMContentLoaded` starts the application.
- `click` toggles the mobile navigation.
- `input` filters visible article cards while the user types.
- `submit` calculates screen-time values.
- `click` on Reset clears calculator output.

### Alternatives

- Inline HTML event attributes
- Event delegation
- Framework event handlers
- Polling for changes

### Drawbacks of current approach

- Listeners must be attached again if their target HTML is replaced.
- Multiple initialization calls could create duplicate listeners.
- Event flow is manually coordinated.

## Fetch API and JSON

### What we used

The browser-side API layer calls the same-origin `/api/news` route. The server route calls NewsAPI and returns JSON.

### Why we used it

Fetch is built into modern browsers and supports asynchronous HTTP requests without an extra library.

### How it works here

`api.js` builds query parameters for a category and calls:

```text
/api/news?q=...&language=en&sortBy=publishedAt&pageSize=12
```

The response is checked with `response.ok`, parsed using `response.json()`, and validated for an `articles` array. Accepted fields are mapped into the article structure used by `app.js`.

### Alternatives

- `XMLHttpRequest`
- Axios
- A server-rendered request
- A local JSON dataset

### Drawbacks of current approach

- Fetch does not automatically retry failed requests.
- Error handling must be written manually.
- Network latency affects loading time.
- The browser cannot directly use the private environment file.

## `async`, `await`, and Promises

### What we used

API-loading functions use `async` and `await`. An asynchronous function returns a Promise.

### Why we used it

NewsAPI requests finish later than normal JavaScript statements. `await` makes the asynchronous sequence easier to read.

### How it works here

`loadCategoryArticles()` waits for `api.fetchArticles()`. During that time the loading message remains visible. When the Promise resolves, articles are rendered. If it rejects, `catch` supplies fallback data.

### Alternatives

- Promise `.then()` and `.catch()` chains
- Callbacks
- Synchronous local data only

### Drawbacks of current approach

- Many concurrent requests can still be expensive.
- Forgotten `await` statements can produce unresolved Promises.
- Errors must still be handled explicitly.

## `Promise.all()`

### What we used

`loadAllArticles()` maps the six categories to requests and passes them to `Promise.all()`.

### Why we used it

The six category requests are independent, so they can start together instead of waiting one after another.

### How it works here

`Promise.all()` resolves when every category request resolves. The results are flattened and duplicate articles are removed.

### Alternatives

- Sequential `for...of` requests
- Separate requests triggered only when a category is opened
- One broad API request

### Drawbacks of current approach

- The homepage waits for all category requests.
- More simultaneous requests can use more API quota.
- The code collects more data than a single category page needs.

## NewsAPI and the Serverless Function

### What we used

NewsAPI is the external dynamic article source. `api/news.js` is a Vercel-style serverless function.

### Why we used it

NewsAPI supplies current article metadata. The serverless route keeps the private `NEWS_API_KEY` away from browser source code.

### How it works here

The browser calls `/api/news` with `GET`. The route checks the method, reads `process.env.NEWS_API_KEY`, adds the key to a request for `https://newsapi.org/v2/everything`, parses the JSON response, and sends a JSON result back to the browser.

`api.js` then applies relevance scoring and maps title, description, source, URL, date, author, and image into the application's article structure.

### Alternatives

- A traditional Node.js/Express backend
- Another serverless platform
- A managed backend service
- A local static JSON dataset

### Drawbacks of current approach

- It depends on internet access and NewsAPI availability.
- NewsAPI rate limits can affect usage.
- API response fields can be missing or change.
- Serverless platforms can have cold starts and platform limits.
- A local static server alone cannot execute the serverless route.

## API Key Protection

### What we used

The key is read only in `api/news.js` using:

```javascript
process.env.NEWS_API_KEY
```

### Why we used it

A browser file is visible to every user. Putting the real key in frontend JavaScript would expose it in source code and network tools.

### How it works here

The browser knows only the same-origin `/api/news` endpoint. The server-side function adds the key when contacting NewsAPI.

### Alternatives

- A backend application server
- A secret manager connected to a backend
- A serverless function on another provider

### Drawbacks of current approach

- The API route must be deployed and configured correctly.
- Without the environment variable, the route returns an error and the frontend uses fallback content.
- Secret management depends on the deployment platform.

## Relevance Scoring and Filtering

### What we used

`api.js` scores each returned article using title, description, content, source name, and URL. It checks social-media terms, category terms, Indian terms, Indian source names/domains, and blocked generic-news phrases.

### Why we used it

The magazine should show relevant Instagram and social-media articles instead of accepting every general news result returned by a search query.

### How it works here

Articles must pass strong social context, category context, and core category context. Scores receive extra points for Instagram, Indian relevance, Indian sources, and category terms in the title or description. Articles below the threshold are rejected, accepted articles are sorted, and at most twelve are mapped.

### Alternatives

- Display every API result
- Use only the NewsAPI search query
- Manual editorial approval
- A machine-learning classifier

### Drawbacks of current approach

- Keyword scoring can miss relevant articles that use different wording.
- A keyword can create a false positive in unusual article text.
- The scoring rules require manual maintenance.
- Fewer articles may be displayed when the filter is strict.

## Curated Fallback Data

### What we used

`articles.js` contains curated article objects for the six categories.

### Why we used it

The site should still display meaningful editorial content when NewsAPI fails, returns no results, or returns only irrelevant results.

### How it works here

`loadCategoryArticles()` merges accepted API stories with fallback stories for the same category. If the request throws an error, it returns the category's fallback array directly.

### Alternatives

- Show an empty state only
- Load a local JSON file
- Cache previous API results
- Use a database-backed content system

### Drawbacks of current approach

- Fallback stories are static and can become old.
- The dataset must be edited manually.
- The browser may display less current content during an API failure.

## Arrays, Objects, and Array Methods

### What we used

Categories and articles are JavaScript objects stored in arrays. The project uses `map()`, `filter()`, `find()`, `slice()`, `join()`, `flatMap()`, `some()`, `Set`, and `Map`.

### Why we used it

Article data is naturally a list. Array methods express common operations without manual index loops.

### How it works here

- `map()` converts categories or articles into requests or HTML.
- `filter()` keeps matching categories, fallback stories, or search results.
- `find()` gets one matching category or article.
- `slice()` limits homepage cards.
- `join('')` combines HTML strings.
- `flatMap()` combines results from all categories.
- `some()` checks whether any category used fallback.
- `Set` and `Map` help remove duplicates.

### Alternatives

- `for` loops
- `forEach()` with manually built arrays
- Database queries
- Utility libraries

### Drawbacks of current approach

- Long chained expressions can be harder for beginners to debug.
- Array operations create new arrays and can use extra memory for large datasets.
- Correct callback behavior must be understood.

## Template Literals and Ternary Expressions

### What we used

The render functions use backtick template literals and `${...}` interpolation. The code also uses ternary expressions and logical operators such as `||` and `&&`.

### Why we used it

Template literals make it possible to insert article values and generated card markup into HTML strings. Logical expressions keep small display decisions close to the markup.

### How it works here

Examples include inserting `article.title`, choosing `article.body || article.description`, and displaying the calculator only when `category.slug === 'habits' && window.BeyondFeedCalculator` is true.

### Alternatives

- String concatenation
- DOM element creation
- `if/else` blocks before rendering
- Framework templates

### Drawbacks of current approach

- Large template literals are difficult to format and inspect.
- Missing escaping can be dangerous, so the project uses `escapeHtml()`.
- Nested ternaries would become difficult to read; the current code keeps conditions relatively small.

## URLSearchParams and Routing

### What we used

`URLSearchParams` reads `slug` values from category and article URLs.

### Why we used it

It gives the static pages a simple way to identify which category or article should be shown without a frontend framework router.

### How it works here

`category.html?slug=habits` selects the habits category, while `article.html?slug=from-photos-to-stories` selects an article.

### Alternatives

- Path-based routing
- Hash routing
- A framework router
- Separate HTML file for every article

### Drawbacks of current approach

- Query values are strings and must be validated against known data.
- Invalid values need fallback behavior.
- Browser navigation still reloads the HTML document.

## `escapeHtml()` and `safeUrl()`

### What we used

`escapeHtml()` protects text inserted into HTML strings. `safeUrl()` permits only `http:` and `https:` URLs and otherwise returns the fallback image.

### Why we used it

NewsAPI data is external input. These helpers reduce the chance that malformed or unsafe values break rendering or become HTML markup.

### How it works here

Article titles, descriptions, labels, authors, and source names use `escapeHtml()`. Images and source links use `safeUrl()`.

### Alternatives

- Create DOM nodes and use `textContent`
- Use a sanitization library
- Trust only a manually controlled dataset

### Drawbacks of current approach

- Escaping is manual and must be remembered for every inserted value.
- URL validation checks protocol but does not verify that the remote page is trustworthy.
- The fallback image can hide the exact reason an image failed.

## Digital Habit Calculator

### What we used

The calculator is a frontend-only feature in `calculator.js`. It accepts hours and minutes for Instagram, YouTube, WhatsApp, and Other.

### Why we used it

It supports the Digital Habits theme without requiring a database, account, or external API.

### How it works here

The calculator converts each value into minutes, calculates daily, weekly, and thirty-day totals, and creates comparison cards for activities. It uses form submit and reset event listeners. It stores nothing in `localStorage` or `sessionStorage`.

### Alternatives

- A server-side calculator
- A chart library
- Browser storage for saved calculations
- A database-backed user history

### Drawbacks of current approach

- Values disappear after refresh.
- The comparisons are approximate and use fixed activity data.
- It does not track actual device usage.

# Why We Used This Instead of Alternatives

## Current choice: Vanilla JavaScript

### Why chosen

The site needs straightforward DOM rendering, search, navigation, and calculator behavior. Vanilla JavaScript avoids framework setup and dependencies.

### Alternative

React or Vue.

### Why the alternative was not used here

The current project is small and already works with direct browser APIs. Converting it would change the architecture.

### When the alternative would be better

A framework would be useful for many reusable components, complex application state, or a much larger team project.

## Current choice: External CSS

### Why chosen

All pages share one visual system, so one stylesheet avoids repeating styles.

### Alternative

Inline styles or CSS Modules.

### Why the alternative was not used here

Inline styles would mix structure and presentation. CSS Modules would require a build setup that the current static project does not use.

### When the alternative would be better

CSS Modules are useful when many components have naming conflicts in a bundled application.

## Current choice: Fetch API with async/await

### Why chosen

Fetch is built into the browser, and async/await makes the request sequence readable.

### Alternative

Axios or Promise `.then()` chains.

### Why the alternative was not used here

The project needs no additional HTTP library for its small number of requests.

### When the alternative would be better

Axios may help when a project needs shared interceptors, automatic request configuration, or more HTTP helpers.

## Current choice: Promise.all()

### Why chosen

The six category requests are independent and can run together.

### Alternative

Sequential requests.

### Why the alternative was not used here

Sequential requests would make the homepage wait for each category one at a time.

### When the alternative would be better

Sequential loading would be better when one request depends on the result of another or when API rate limits require less concurrency.

## Current choice: Serverless API route

### Why chosen

The route keeps `NEWS_API_KEY` on the server side while giving the browser a same-origin endpoint.

### Alternative

An Express backend.

### Why the alternative was not used here

The current application needs only one small API route, so a serverless function is simpler to deploy.

### When the alternative would be better

An Express backend would be better for many endpoints, long-running processes, custom middleware, or database connections.

## Current choice: NewsAPI plus fallback articles

### Why chosen

NewsAPI provides current dynamic articles, while curated local objects keep the magazine usable during API failures.

### Alternative

A completely static article dataset.

### Why the alternative was not used here

A static-only dataset would not provide current external content.

### When the alternative would be better

Static data would be better for a fully offline demo, predictable testing, or a site that does not need current articles.

# Viva Questions

### Question
Why did you use Vanilla JavaScript?

Answer: The project is small enough for direct browser APIs. Vanilla JavaScript avoids framework dependencies while still supporting rendering, search, routing by query string, events, and the calculator.

### Question
Why did you use external CSS?

Answer: One external stylesheet lets all HTML pages share the same colors, typography, layout, responsive behavior, and generated component classes.

### Question
Why are JavaScript files separated?

Answer: Each file has a focused responsibility. Articles contain data, api.js maps NewsAPI data, calculator.js handles the calculator, and app.js controls pages and UI.

### Question
Why use the Fetch API?

Answer: Fetch is built into modern browsers and can make asynchronous HTTP requests without adding Axios or another dependency.

### Question
Why use async/await?

Answer: The API request finishes later, so async/await lets the code wait for the result in a readable way while the loading state remains visible.

### Question
Why use Promise.all()?

Answer: The six category requests are independent, so Promise.all() starts them together and waits for all of them before combining the results.

### Question
Why use an external API?

Answer: NewsAPI supplies current article data instead of requiring every current article to be written into the project manually.

### Question
Why use fallback data?

Answer: Fallback data keeps the magazine usable if the API fails, is unavailable, or returns no usable articles.

### Question
Why use a serverless function?

Answer: The serverless function calls NewsAPI on the server side, so the private API key is not placed in browser JavaScript.

### Question
Why not expose the API key in the frontend?

Answer: Frontend files are visible to users. A key in frontend code could be copied and abused, so the key is read from `process.env.NEWS_API_KEY` on the server.

### Question
What happens when the API fails?

Answer: The request is caught, the matching curated fallback articles are returned, and the page continues rendering instead of stopping with an error.

### Question
What is the DOM?

Answer: The DOM is the browser's object representation of the HTML document. JavaScript uses it to find elements, change content, add classes, and respond to events.

### Question
Why use addEventListener()?

Answer: It attaches code to browser or user events, such as page loading, menu clicks, typing in search, submitting the calculator, and resetting it.

### Question
Why use querySelector()?

Answer: It finds an HTML element using a CSS selector, such as `#app` or `.main-nav`, so JavaScript can read or modify it.

### Question
Why use map()?

Answer: `map()` transforms every item in an array. Here it turns categories into requests and articles into HTML cards.

### Question
Why use filter()?

Answer: `filter()` returns only items that meet a condition, such as fallback articles for one category or articles matching a search query.

### Question
Why use find()?

Answer: `find()` returns the first matching item, such as the category for a URL slug or the article for an article slug.

### Question
Why use URLSearchParams?

Answer: It reads query-string values such as `slug=business` from category and article URLs.

### Question
Why use template literals?

Answer: Backtick strings allow HTML and JavaScript values to be combined using `${...}`, which is useful for generated article cards and page sections.

### Question
What is JSON in this project?

Answer: JSON is the data format returned by the NewsAPI route. The project parses it and reads its `articles` array and article fields.

### Question
What is an IIFE?

Answer: An IIFE is a function that runs immediately after it is defined. It gives app.js and calculator.js private scope for their internal variables and functions.

### Question
Why use escapeHtml()?

Answer: External article values are inserted into generated HTML, so escapeHtml() converts special characters into safe HTML entities.

### Question
Why use safeUrl()?

Answer: It accepts only HTTP and HTTPS URLs and uses a fallback image for invalid or unsafe values.

### Question
What is the purpose of the `data-page` attribute?

Answer: It tells app.js which page is open, so the correct renderer can run for Home, Category, Article, or About.

# 1-Minute Revision

- The project is a static HTML, CSS, and Vanilla JavaScript digital magazine.
- HTML files provide page containers and `data-page` markers.
- `style.css` controls the shared visual design and responsive layout.
- `articles.js` provides six categories and curated fallback articles.
- `api.js` calls `/api/news`, validates JSON, scores relevance, and maps accepted articles.
- `api/news.js` reads the server-side API key and calls NewsAPI `/v2/everything`.
- `app.js` is the main controller: it builds the shell, chooses the page renderer, loads data, renders cards, handles search, and integrates the calculator.
- `calculator.js` calculates screen-time totals in the browser and stores nothing.
- `async`, `await`, and `Promise.all()` handle asynchronous category requests.
- `map`, `filter`, `find`, `flatMap`, `Set`, and `Map` process article data.
- `querySelector`, `innerHTML`, and event listeners connect JavaScript to the DOM.
- `escapeHtml()` protects inserted text, and `safeUrl()` validates external URLs.
- The major limitation is dependence on NewsAPI, internet access, API limits, serverless deployment, and manually maintained keyword filtering and fallback content.
