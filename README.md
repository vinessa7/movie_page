# Movie Web Page

A responsive movie discovery page inspired by TMDB. The project uses HTML, CSS, and vanilla JavaScript to fetch movie data from The Movie Database API and render a filterable movie grid.

## Features

- Responsive header with mobile navigation
- Popular movie grid with poster cards, release dates, and rating badges
- Sort controls for popularity, rating, release date, and title
- Filter controls for:
  - Release dates
  - Release type
  - Country
  - Genre
  - Original language
  - User score
  - Minimum vote count
  - Runtime
  - Keywords
- Custom range sliders
- Country and language searchable dropdowns
- Keyword search suggestions
- Loading, empty, and error states
- Responsive layout for desktop, tablet, and mobile screens

## Project Structure

.
├── index.html
├── index.js
├── sliders.js
├── images/
│   ├── alt.jpg
│   ├── footerLogo.svg
│   └── headerLogo.svg
└── styles/
    ├── base.css
    ├── cards.css
    ├── filters.css
    ├── footer.css
    ├── index.css
    ├── layout.css
    └── responsive.css
```

## Getting Started

Clone the repository and open the project folder:

```bash
git clone <repository-url>
cd Final-Task-The-Movie-Web-Page
```

Run a local server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000/index.html
```

You can also open `index.html` directly in a browser, but using a local server is recommended.

## Main Files

- `index.html` contains the page markup and filter controls.
- `index.js` handles TMDB API requests, filter state, dropdowns, keyword search, movie rendering, and responsive interactions.
- `sliders.js` contains the custom range slider logic.
- `styles/index.css` imports all CSS modules.
- `styles/filters.css` contains header and filter panel styling.
- `styles/cards.css` contains range slider, keyword, movie card, and results styling.
- `styles/responsive.css` contains tablet and mobile layout rules.


The project does not require a build step or package installation.

## Credits

- Movie data and images: [The Movie Database API](https://www.themoviedb.org/documentation/api)
- Icons: [Font Awesome](https://fontawesome.com/)
- Flag styles: [flag-icons](https://github.com/lipis/flag-icons)
