// EVERYTHING we need stored in global elemeent
const dom = {
  header: document.querySelector(".site-header"),
  mobileNavToggle: document.querySelector(".site-header__mobile-toggle"),
  primaryNav: document.getElementById("site-header__nav"),
  sortToggle: document.getElementById("filters-panel__sort-toggle"),
  sortContent: document.getElementById("filters-panel__sort-content"),
  sortIconCollapsed: document.getElementById(
    "filters-panel__sort-icon-collapsed",
  ),
  sortIconExpanded: document.getElementById(
    "filters-panel__sort-icon-expanded",
  ),
  filterToggle: document.getElementById("filters-panel__filter-toggle"),
  filterContent: document.getElementById("filters-panel__filter-content"),
  filterIconCollapsed: document.getElementById(
    "filters-panel__filter-icon-collapsed",
  ),
  filterIconExpanded: document.getElementById(
    "filters-panel__filter-icon-expanded",
  ),
  releaseScopeToggle: document.getElementById(
    "filters-panel__release-scope-toggle",
  ),
  releaseOptions: document.getElementById("filters-panel__release-options"),
  countryScopeToggle: document.getElementById(
    "filters-panel__country-scope-toggle",
  ),
  countrySelectWrapper: document.getElementById(
    "filters-panel__country-select-wrapper",
  ),
  sortSelect: document.getElementById("filters-panel__sort-select"),
  languageSelect: document.getElementById("filters-panel__language-select"),
  languageTrigger: document.getElementById("filters-panel__language-trigger"),
  languageTriggerLabel: document.getElementById(
    "filters-panel__language-trigger-label",
  ),
  languageMenu: document.getElementById("filters-panel__language-menu"),
  languageSearch: document.getElementById("filters-panel__language-search"),
  languageOptions: document.getElementById("filters-panel__language-options"),
  countryTrigger: document.getElementById("filters-panel__country-trigger"),
  countryTriggerLabel: document.getElementById(
    "filters-panel__country-trigger-label",
  ),
  countryMenu: document.getElementById("filters-panel__country-menu"),
  countrySearch: document.getElementById("filters-panel__country-search"),
  countryOptions: document.getElementById("filters-panel__country-options"),
  countrySelect: document.getElementById("filters-panel__country-select"),
  genreList: document.querySelector(".filters-panel__genre-list"),
  dateFromText: document.getElementById("filters-panel__date-from-text"),
  dateFromHidden: document.getElementById("filters-panel__date-from"),
  dateToText: document.getElementById("filters-panel__date-to-text"),
  dateToHidden: document.getElementById("filters-panel__date-to"),
  keywordInput: document.getElementById("keyword-filter__input"),
  keywordSuggestions: document.getElementById("keyword-filter__suggestions"),
  keywordSelected: document.getElementById("keyword-filter__selected"),
  submitButton: document.getElementById("filters-panel__submit"),
  stickySubmitButton: document.getElementById("filters-panel__submit-sticky"),
  movieGrid: document.querySelector(".movie-grid"),
  movieCardTemplate: document.querySelector(".movie-grid__template .movie-card"),
  resultsStatus: document.getElementById("movies-page__status"),
  loadMoreButton: document.getElementById("movies-page__load-more"),
  footer: document.querySelector(".site-footer"),
};


// Links for various data categories
const endpoints = {
countries: "/api/movies?endpoint=configuration/countries",
languages: "/api/movies?endpoint=configuration/languages",
genres: "/api/movies?endpoint=genre/movie/list",
discover: "/api/movies?endpoint=discover/movie",
keywords: "/api/movies?endpoint=search/keyword",
};

// Gicing them integer value to make request to TMDB
const releaseTypeInputs = [
  { id: "filters-panel__release-type-limited", value: 1 },
  { id: "filters-panel__release-type-premiere", value: 2 },
  { id: "filters-panel__release-type-theatrical", value: 3 },
  { id: "filters-panel__release-type-digital", value: 4 },
  { id: "filters-panel__release-type-physical", value: 5 },
  { id: "filters-panel__release-type-tv", value: 6 },
];


// Default state
const state = {
  currentPage: 1,
  totalPages: 1,
  selectedGenres: [],
  selectedLanguage: null,
  selectedCountry: null,
  // Using Map for easy key-value pairing (ID, name)
  selectedKeywords: new Map(),
  keywordMode: "AND",
  languageOptions: [],
  countryOptions: [],
  lastSearchUrl: "",
  isMainSubmitVisible: true,
};

const imageBaseUrl = "https://image.tmdb.org/t/p/original";

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Converts YYYY-MM-DD to MM/DD/YYYY for display
function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  const [year, month, day] = dateString.split("-");
  return `${month}/${day}/${year}`;
}

// Force open the native browser date picker
function openCalendar(hiddenInput) {
  if (typeof hiddenInput.showPicker === "function") {
    hiddenInput.showPicker();
    return;
  }

  hiddenInput.focus();
}

// hidden date input value is keeped in the visual text input
function syncDateText(hiddenInput, textInput) {
  textInput.value = formatDate(hiddenInput.value);
}

// initial dates for the filter panel
function initializeDateField(textInput, hiddenInput, daysToAdd = null) {
  if (daysToAdd !== null) {
    const presetDate = addDays(new Date(), daysToAdd);
    hiddenInput.value = formatDateForInput(presetDate);
  }

  syncDateText(hiddenInput, textInput);
}

// Converting ISO country codes to Unicode flag emojis
function getFlagEmoji(code) {
  if (!code || code.length !== 2) {
    return "🏳️";
  }

  const offset = 127397;
  return code
    .toUpperCase()
    .split("")
    .map((character) =>
      String.fromCodePoint(character.charCodeAt(0) + offset),
    )
    .join("");
}

// Limits how often a function can run, so hitting API limit can be avoided
function debounce(callback, delay = 300) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => callback(...args), delay);
  };
}

function setAccordionState(
  trigger,
  content,
  collapsedIcon,
  expandedIcon,
  isCollapsed,
) {
  content.classList.toggle("is-collapsed", isCollapsed);
  trigger.setAttribute("aria-expanded", String(!isCollapsed));
  content.setAttribute("aria-hidden", String(isCollapsed));
  collapsedIcon.classList.toggle("is-hidden", !isCollapsed);
  expandedIcon.classList.toggle("is-hidden", isCollapsed);
}

function toggleAccordion(trigger, content, collapsedIcon, expandedIcon) {
  setAccordionState(
    trigger,
    content,
    collapsedIcon,
    expandedIcon,
    !content.classList.contains("is-collapsed"),
  );
}

// Places the keyword dropdown exactly under the input box
function positionKeywordSuggestions() {
  if (
    dom.filterContent.classList.contains("is-collapsed") ||
    !dom.keywordSuggestions.classList.contains("is-visible")
  ) {
    return;
  }

  const inputRect = dom.keywordInput.getBoundingClientRect();
  const viewportPadding = 12;
  const viewportBottom = window.innerHeight - viewportPadding;
  const footerTop = dom.footer
    ? dom.footer.getBoundingClientRect().top - viewportPadding
    : viewportBottom;
  const bottomLimit = Math.min(viewportBottom, footerTop);
  const availableHeight = bottomLimit - inputRect.bottom - 4;
  const fiveItemHeight = 190;

  dom.keywordSuggestions.style.left = `${inputRect.left}px`;
  dom.keywordSuggestions.style.top = `${inputRect.bottom + 4}px`;
  dom.keywordSuggestions.style.width = `${inputRect.width}px`;
  dom.keywordSuggestions.style.maxHeight = `${Math.max(
    0,
    Math.min(fiveItemHeight, availableHeight),
  )}px`;
}

function closeKeywordSuggestions() {
  dom.keywordSuggestions.classList.remove("is-visible");
  dom.keywordSuggestions.replaceChildren();
}

function updateReleaseSectionVisibility() {
  const shouldHideReleaseOptions = dom.releaseScopeToggle.checked;
  const shouldHideCountrySelect = dom.countryScopeToggle.checked;

  dom.releaseOptions.classList.toggle("is-hidden", shouldHideReleaseOptions);
  dom.countrySelectWrapper.classList.toggle("is-hidden", shouldHideCountrySelect);
}

// Grabs all checked release types and turns them into a list the API understands
function getSelectedReleaseTypes() {
  return releaseTypeInputs
    .filter(({ id }) => document.getElementById(id)?.checked)
    .map(({ value }) => value)
    .join("|");
}

function buildKeywordQuery() {
  if (state.selectedKeywords.size === 0) {
    return "";
  }

  const separator = state.keywordMode === "AND" ? "," : "|";
  return [...state.selectedKeywords.keys()].join(separator);
}

function getSliderValues() {
  return {
    score: window.movieFilters?.userScore?.getValues() ?? { min: 0, max: 10 },
    votes: window.movieFilters?.minVotes?.getValues() ?? { min: 0, max: 0 },
    runtime: window.movieFilters?.runtime?.getValues() ?? { min: 0, max: 400 },
  };
}

// The core logic that assembles the complex URL needed to filter movies
function generateQueryURL() {
  const url = new URL(endpoints.discover);
  const params = url.searchParams;
  const fromDate = dom.dateFromHidden.value || "";
  const toDate = dom.dateToHidden.value || "";
  const releaseTypes = getSelectedReleaseTypes();
  const keywordQuery = buildKeywordQuery();
  const genreQuery = state.selectedGenres.join(",");
  const { score, votes, runtime } = getSliderValues();

  params.set("sort_by", dom.sortSelect.value || "popularity.desc");
  params.set("page", state.currentPage);
  params.set("vote_average.gte", score.min);
  params.set("vote_average.lte", score.max);
  params.set("vote_count.gte", votes.max);
  params.set("with_runtime.gte", runtime.min);
  params.set("with_runtime.lte", runtime.max);

  if (keywordQuery) {
    params.set("with_keywords", keywordQuery);
  }

  if (genreQuery) {
    params.set("with_genres", genreQuery);
  }

  if (state.selectedLanguage && state.selectedLanguage !== "None Selected") {
    params.set("with_original_language", state.selectedLanguage);
  }

  if (releaseTypes && !dom.releaseScopeToggle.checked) {
    params.set("with_release_type", releaseTypes);

    if (!dom.countryScopeToggle.checked) {
      params.set("region", state.selectedCountry || dom.countrySelect.value || "US");
    }

    if (fromDate) {
      params.set("release_date.gte", fromDate);
    }

    if (toDate) {
      params.set("release_date.lte", toDate);
    }
  } else {
    if (fromDate) {
      params.set("primary_release_date.gte", fromDate);
    }

    if (toDate) {
      params.set("primary_release_date.lte", toDate);
    }
  }

  return url.toString();
}

// Logic to change the color of the movie score ring based on the percentage
function colorRatingRing(card, rating) {
  const ring = card.querySelector(".movie-card__rating-ring");
  const ratingText = card.querySelector(".movie-card__rating-text");
  const ratingValue = card.querySelector(".movie-card__rating-value");
  const ratingSign = card.querySelector(".movie-card__rating-sign");

  ratingText.style.setProperty("--movie-card-rating-percent", `${rating}%`);
  ring.classList.remove(
    "movie-card__rating-ring--low",
    "movie-card__rating-ring--medium",
    "movie-card__rating-ring--high",
    "movie-card__rating-ring--none",
  );

  if (rating >= 70) {
    ring.classList.add("movie-card__rating-ring--high");
    ratingValue.textContent = rating;
    ratingSign.classList.remove("is-hidden");
  } else if (rating >= 40) {
    ring.classList.add("movie-card__rating-ring--medium");
    ratingValue.textContent = rating;
    ratingSign.classList.remove("is-hidden");
  } else if (rating >= 15) {
    ring.classList.add("movie-card__rating-ring--low");
    ratingValue.textContent = rating;
    ratingSign.classList.remove("is-hidden");
  } else if (rating === 0) {
    ring.classList.add("movie-card__rating-ring--none");
    ratingValue.textContent = "NR";
    ratingSign.classList.add("is-hidden");
  } else {
    ring.classList.add("movie-card__rating-ring--none");
    ratingValue.textContent = rating;
    ratingSign.classList.remove("is-hidden");
  }
}

// Handles the text and disabled state for the load more button
function updateLoadMoreButton() {
  dom.loadMoreButton.classList.remove("is-hidden");

  if (state.currentPage >= state.totalPages) {
    dom.loadMoreButton.textContent = "No more movies";
    dom.loadMoreButton.disabled = true;
    return;
  }

  dom.loadMoreButton.textContent = "Load More";
  dom.loadMoreButton.disabled = false;
}

function setResultsStatus(message = "", type = "info") {
  dom.resultsStatus.textContent = message;
  dom.resultsStatus.className = "movies-page__status";
  dom.resultsStatus.classList.toggle("is-hidden", !message);
  dom.resultsStatus.classList.toggle("movies-page__status--error", type === "error");
}

function clearMovieResults() {
  dom.movieGrid
    .querySelectorAll(".movie-card")
    .forEach((card) => {
      if (!card.closest(".movie-grid__template")) {
        card.remove();
      }
    });
}

// Helper to fetch data and automatically handle the authorization header
async function fetchJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.json();
}

// Fetching and adding into dropdown lists for countries and languages
async function fetchData(url, selectElement) {
  try {
    const items = await fetchJSON(url);
    const collection = Array.isArray(items) ? items : items.results || items;

    if (selectElement === dom.languageSelect) {
      state.languageOptions = collection
        .filter((item) => item.iso_639_1 && item.english_name)
        .map((item) => ({
          value: item.iso_639_1,
          label: item.english_name,
        }))
        .sort((left, right) => left.label.localeCompare(right.label));

      renderLanguageOptions();
      return;
    }

    if (selectElement === dom.countrySelect) {
      state.countryOptions = collection
        .filter((item) => item.iso_3166_1 && item.english_name)
        .map((item) => ({
          value: item.iso_3166_1,
          label: `${getFlagEmoji(item.iso_3166_1)} ${item.english_name}`,
          plainLabel: item.english_name,
        }))
        .sort((left, right) => left.plainLabel.localeCompare(right.plainLabel));

      const armeniaOption = state.countryOptions.find((option) =>
        option.plainLabel.includes("Armenia"),
      );

      if (armeniaOption) {
        dom.countrySelect.value = armeniaOption.value;
        dom.countryTriggerLabel.textContent = armeniaOption.label;
        state.selectedCountry = armeniaOption.value;
      }

      renderCountryOptions();
      return;
    }

    collection.forEach((item) => {
      const option = document.createElement("option");

      if (selectElement === dom.countrySelect) {
        option.value = item.iso_3166_1;
        option.textContent = `${getFlagEmoji(item.iso_3166_1)} ${item.english_name}`;
      } else {
        option.value = item.iso_639_1;
        option.textContent = item.english_name;
      }

      selectElement.appendChild(option);
    });

    if (selectElement === dom.countrySelect) {
      const armeniaOption = [...selectElement.options].find((option) =>
        option.textContent.includes("Armenia"),
      );

      if (armeniaOption) {
        selectElement.value = armeniaOption.value;
        state.selectedCountry = armeniaOption.value;
      }
    }
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

function renderLanguageOptions(filterValue = "") {
  const normalizedFilter = filterValue.trim().toLowerCase();
  const options = [
    { value: "None Selected", label: "None Selected" },
    ...state.languageOptions,
  ].filter((option) => option.label.toLowerCase().includes(normalizedFilter));

  const optionNodes =
    options.length > 0
      ? options.map((option) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "filters-panel__menu-option";
          button.setAttribute("role", "option");
          button.setAttribute(
            "aria-selected",
            String(dom.languageSelect.value === option.value),
          );
          button.dataset.value = option.value;
          button.dataset.label = option.label;
          button.textContent = option.label;
          button.classList.toggle(
            "is-active",
            dom.languageSelect.value === option.value,
          );
          return button;
        })
      : [createEmptyLanguageOption()];

  dom.languageOptions.replaceChildren(...optionNodes);
}

function renderCountryOptions(filterValue = "") {
  const normalizedFilter = filterValue.trim().toLowerCase();
  const options = state.countryOptions.filter((option) =>
    option.plainLabel.toLowerCase().includes(normalizedFilter),
  );

  const optionNodes =
    options.length > 0
      ? options.map((option) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "filters-panel__menu-option";
          button.setAttribute("role", "option");
          button.setAttribute(
            "aria-selected",
            String(dom.countrySelect.value === option.value),
          );
          button.dataset.value = option.value;
          button.dataset.label = option.label;
          button.textContent = option.label;
          button.classList.toggle(
            "is-active",
            dom.countrySelect.value === option.value,
          );
          return button;
        })
      : [createEmptyLanguageOption()];

  dom.countryOptions.replaceChildren(...optionNodes);
}

function createEmptyLanguageOption() {
  const emptyState = document.createElement("div");
  emptyState.className =
    "filters-panel__menu-option filters-panel__menu-option--empty";
  emptyState.setAttribute("role", "presentation");
  emptyState.textContent = "No data found.";
  return emptyState;
}

function closeLanguageMenu() {
  dom.languageMenu.classList.add("is-hidden");
  dom.languageTrigger.setAttribute("aria-expanded", "false");
}

function openLanguageMenu() {
  dom.languageMenu.classList.remove("is-hidden");
  dom.languageTrigger.setAttribute("aria-expanded", "true");
  renderLanguageOptions(dom.languageSearch.value);
  dom.languageSearch.focus();
}

function setLanguageValue(value, label) {
  dom.languageSelect.value = value;
  dom.languageTriggerLabel.textContent = label;
  state.selectedLanguage = value !== "None Selected" ? value : null;
  renderLanguageOptions(dom.languageSearch.value);
  updateSearchButtonState();
}

function closeCountryMenu() {
  dom.countryMenu.classList.add("is-hidden");
  dom.countryTrigger.setAttribute("aria-expanded", "false");
}

function openCountryMenu() {
  dom.countryMenu.classList.remove("is-hidden");
  dom.countryTrigger.setAttribute("aria-expanded", "true");
  renderCountryOptions(dom.countrySearch.value);
  dom.countrySearch.focus();
}

function setCountryValue(value, label) {
  dom.countrySelect.value = value;
  dom.countryTriggerLabel.textContent = label;
  state.selectedCountry = value || null;
  renderCountryOptions(dom.countrySearch.value);
  updateSearchButtonState();
}

// Pulls movie genres and builds the button grid
async function fetchGenres() {
  try {
    const data = await fetchJSON(endpoints.genres);
    dom.genreList.textContent = "";

    data.genres.forEach((genre) => {
      const genreButton = document.createElement("button");
      genreButton.type = "button";
      genreButton.className = "filters-panel__genre-button";
      genreButton.textContent = genre.name;
      genreButton.dataset.genreId = String(genre.id);

      genreButton.addEventListener("click", () => {
        const genreId = String(genre.id);
        const alreadySelected = state.selectedGenres.includes(genreId);

        genreButton.classList.toggle("is-active", !alreadySelected);

        if (alreadySelected) {
          state.selectedGenres = state.selectedGenres.filter((id) => id !== genreId);
        } else {
          state.selectedGenres.push(genreId);
        }

        updateSearchButtonState();
      });

      dom.genreList.appendChild(genreButton);
    });
  } catch (error) {
    console.error("Failed to fetch genres:", error);
  }
}

// Builds the little chips for selected keywords
function renderSelectedKeywords() {
  const chips = [...state.selectedKeywords.entries()].map(([id, name]) => {
    const chip = document.createElement("span");
    chip.className = "keyword-filter__chip";

    const chipText = document.createElement("span");
    chipText.className = "keyword-filter__chip-text";
    chipText.textContent = name;

    const removeButton = document.createElement("button");
    removeButton.className = "keyword-filter__chip-remove";
    removeButton.type = "button";
    removeButton.dataset.id = id;
    removeButton.setAttribute("aria-label", `Remove ${name}`);
    removeButton.textContent = "×";

    chip.append(chipText, removeButton);
    return chip;
  });

  dom.keywordSelected.replaceChildren(...chips);
}

function addKeyword(id, name) {
  if (state.selectedKeywords.has(id)) {
    return;
  }
  state.selectedKeywords.set(id, name);
  renderSelectedKeywords();
  updateSearchButtonState();
}

function removeKeyword(id) {
  state.selectedKeywords.delete(id);
  renderSelectedKeywords();
  updateSearchButtonState();
}

function renderKeywordSuggestions(keywords) {
  if (dom.filterContent.classList.contains("is-collapsed")) {
    closeKeywordSuggestions();
    return;
  }

  const suggestionItems =
    keywords.length > 0
      ? keywords.map((keyword) => {
          const suggestion = document.createElement("div");
          suggestion.className = "keyword-filter__suggestion";
          suggestion.dataset.id = String(keyword.id);
          suggestion.dataset.name = keyword.name;
          suggestion.textContent = keyword.name;
          return suggestion;
        })
      : [createEmptyKeywordSuggestion()];

  dom.keywordSuggestions.replaceChildren(...suggestionItems);
  dom.keywordSuggestions.classList.add("is-visible");

  positionKeywordSuggestions();
}

function createEmptyKeywordSuggestion() {
  const emptyState = document.createElement("div");
  emptyState.className =
    "keyword-filter__suggestion keyword-filter__suggestion--empty";
  emptyState.textContent = "No data found.";
  return emptyState;
}

const searchKeywords = debounce(async (query) => {
  if (!query.trim()) {
    renderKeywordSuggestions([]);
    return;
  }

  try {
    const url = `${endpoints.keywords}?query=${encodeURIComponent(query)}`;
    const data = await fetchJSON(url);
    renderKeywordSuggestions(data.results || []);
  } catch (error) {
    console.error("Keyword fetch failed:", error);
  }
});

// Checks if any filters have changed to decide if the search button should be active
function updateSearchButtonState() {
  const currentUrl = generateQueryURL();
  const fromDate = dom.dateFromHidden.value;
  const toDate = dom.dateToHidden.value;
  const { score, votes, runtime } = getSliderValues();
  const slidersChanged =
    score.min > 0 ||
    score.max < 10 ||
    votes.max > 0 ||
    runtime.min > 0 ||
    runtime.max < 400;

  const hasActiveFilters =
    Boolean(fromDate) ||
    Boolean(toDate) ||
    (state.selectedLanguage && state.selectedLanguage !== "None Selected") ||
    (!dom.countryScopeToggle.checked && Boolean(dom.countrySelect.value)) ||
    state.selectedGenres.length > 0 ||
    state.selectedKeywords.size > 0 ||
    (!dom.releaseScopeToggle.checked && Boolean(getSelectedReleaseTypes())) ||
    slidersChanged;

  const shouldEnableSearch = currentUrl !== state.lastSearchUrl || hasActiveFilters;

  dom.submitButton.disabled = !shouldEnableSearch;
  dom.submitButton.classList.toggle("is-active", shouldEnableSearch);
  syncStickySubmitButton();
}

window.updateSearchButtonState = updateSearchButtonState;

async function fetchMovies(url = null) {
  const isFirstPage = state.currentPage === 1;

  if (isFirstPage) {
    clearMovieResults();
    setResultsStatus("Loading movies...");
  }

  dom.loadMoreButton.disabled = true;

  try {
    const data = await fetchJSON(url || generateQueryURL());

    state.totalPages = data.total_pages;

    if (!data.results || data.results.length === 0) {
      if (isFirstPage) {
        setResultsStatus("No movies match these filters.");
        dom.loadMoreButton.classList.add("is-hidden");
      } else {
        state.currentPage = Math.max(1, state.currentPage - 1);
        updateLoadMoreButton();
      }
      return;
    }

    data.results.forEach((movie) => {
      const card = dom.movieCardTemplate.cloneNode(true);
      const image = card.querySelector(".movie-card__image");
      const title = card.querySelector(".movie-card__title");
      const date = card.querySelector(".movie-card__date");
      const rating = Math.round(movie.vote_average * 10);

      image.src = movie.poster_path
        ? `${imageBaseUrl}${movie.poster_path}`
        : "images/alt.jpg";
      image.alt = movie.title;
      title.textContent = movie.title;
      date.textContent = movie.release_date
        ? new Date(movie.release_date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "";

      colorRatingRing(card, rating);
      dom.movieGrid.appendChild(card);
    });

    setResultsStatus("");
    updateLoadMoreButton();
  } catch (error) {
    console.error("Failed to fetch movies:", error);
    if (isFirstPage) {
      setResultsStatus("Could not load movies. Please try again.", "error");
      dom.loadMoreButton.classList.add("is-hidden");
    } else {
      state.currentPage = Math.max(1, state.currentPage - 1);
      setResultsStatus("Could not load more movies. Please try again.", "error");
      updateLoadMoreButton();
    }
  }
}

// Logic for the floating search button that appears when you scroll down
function syncStickySubmitButton() {
  const shouldShowStickyButton =
    !state.isMainSubmitVisible && !dom.submitButton.disabled;

  dom.stickySubmitButton.classList.toggle("is-visible", shouldShowStickyButton);
  dom.stickySubmitButton.classList.toggle("is-active", shouldShowStickyButton);
  dom.stickySubmitButton.disabled = !shouldShowStickyButton;
}

function runSearch() {
  state.currentPage = 1;
  const url = generateQueryURL();
  state.lastSearchUrl = url;
  fetchMovies(url);
  dom.submitButton.disabled = true;
  dom.submitButton.classList.remove("is-active");
  syncStickySubmitButton();
}

// Detects when the main search button leaves the screen
function setupIntersectionObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        state.isMainSubmitVisible = entry.isIntersecting;
        syncStickySubmitButton();
      });
    },
    { threshold: 0 },
  );

  observer.observe(dom.submitButton);
}

function syncCompactFilterState(mediaQuery) {
  if (!mediaQuery.matches) {
    return;
  }

  setAccordionState(
    dom.filterToggle,
    dom.filterContent,
    dom.filterIconCollapsed,
    dom.filterIconExpanded,
    true,
  );
  closeKeywordSuggestions();
}

// Wire up all the buttons and inputs
function bindEvents() {
  dom.mobileNavToggle.addEventListener("click", () => {
    const shouldOpen = !dom.header.classList.contains("is-nav-open");

    dom.header.classList.toggle("is-nav-open", shouldOpen);
    dom.mobileNavToggle.setAttribute("aria-expanded", String(shouldOpen));
    dom.mobileNavToggle.setAttribute(
      "aria-label",
      shouldOpen ? "Close navigation" : "Open navigation",
    );
  });

  dom.primaryNav.addEventListener("click", () => {
    dom.header.classList.remove("is-nav-open");
    dom.mobileNavToggle.setAttribute("aria-expanded", "false");
    dom.mobileNavToggle.setAttribute("aria-label", "Open navigation");
  });

  dom.sortToggle.addEventListener("click", () =>
    toggleAccordion(
      dom.sortToggle,
      dom.sortContent,
      dom.sortIconCollapsed,
      dom.sortIconExpanded,
    ),
  );

  dom.filterToggle.addEventListener("click", () => {
    toggleAccordion(
      dom.filterToggle,
      dom.filterContent,
      dom.filterIconCollapsed,
      dom.filterIconExpanded,
    );

    if (dom.filterContent.classList.contains("is-collapsed")) {
      closeKeywordSuggestions();
    }
  });

  dom.releaseScopeToggle.addEventListener("change", () => {
    updateReleaseSectionVisibility();
    updateSearchButtonState();
    state.currentPage = 1;
    fetchMovies();
  });

  dom.countryScopeToggle.addEventListener("change", () => {
    updateReleaseSectionVisibility();
    updateSearchButtonState();
  });

  dom.sortSelect.addEventListener("change", () => {
    state.currentPage = 1;
    updateSearchButtonState();
  });

  dom.languageTrigger.addEventListener("click", () => {
    const isHidden = dom.languageMenu.classList.contains("is-hidden");

    if (isHidden) {
      openLanguageMenu();
      return;
    }

    closeLanguageMenu();
  });

  dom.languageSearch.addEventListener("input", (event) => {
    renderLanguageOptions(event.target.value);
  });

  dom.languageOptions.addEventListener("click", (event) => {
    const option = event.target.closest(".filters-panel__menu-option");
    if (!option || option.classList.contains("filters-panel__menu-option--empty")) {
      return;
    }

    setLanguageValue(option.dataset.value, option.dataset.label);
    closeLanguageMenu();
  });

  dom.countryTrigger.addEventListener("click", () => {
    const isHidden = dom.countryMenu.classList.contains("is-hidden");

    if (isHidden) {
      openCountryMenu();
      return;
    }

    closeCountryMenu();
  });

  dom.countrySearch.addEventListener("input", (event) => {
    renderCountryOptions(event.target.value);
  });

  dom.countryOptions.addEventListener("click", (event) => {
    const option = event.target.closest(".filters-panel__menu-option");
    if (!option || option.classList.contains("filters-panel__menu-option--empty")) {
      return;
    }

    setCountryValue(option.dataset.value, option.dataset.label);
    closeCountryMenu();
  });

  [dom.dateFromHidden, dom.dateToHidden].forEach((input, index) => {
    const textInput = index === 0 ? dom.dateFromText : dom.dateToText;
    input.addEventListener("change", () => {
      syncDateText(input, textInput);
      updateSearchButtonState();
    });

    textInput.addEventListener("click", () => openCalendar(input));
  });

  dom.dateFromText
    .closest(".filters-panel__date-field")
    .querySelector(".filters-panel__date-button")
    .addEventListener("click", () => openCalendar(dom.dateFromHidden));

  dom.dateToText
    .closest(".filters-panel__date-field")
    .querySelector(".filters-panel__date-button")
    .addEventListener("click", () => openCalendar(dom.dateToHidden));

  releaseTypeInputs.forEach(({ id }) => {
    document.getElementById(id)?.addEventListener("change", updateSearchButtonState);
  });

  dom.keywordInput.addEventListener("input", (event) => {
    searchKeywords(event.target.value);
  });

  dom.keywordInput.addEventListener("focus", () => {
    if (dom.filterContent.classList.contains("is-collapsed")) {
      closeKeywordSuggestions();
      return;
    }

    positionKeywordSuggestions();
  });

  dom.keywordSuggestions.addEventListener("click", (event) => {
    const suggestion = event.target.closest(".keyword-filter__suggestion");
    if (!suggestion) {
      return;
    }

    addKeyword(suggestion.dataset.id, suggestion.dataset.name);
    dom.keywordInput.value = "";
    closeKeywordSuggestions();
  });

  dom.keywordSelected.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".keyword-filter__chip-remove");
    if (!removeButton) {
      return;
    }

    removeKeyword(removeButton.dataset.id);
  });

  document.addEventListener("click", (event) => {
    const clickedInsideHeader = event.target.closest(".site-header");
    const clickedInsideKeywordUi =
      event.target.closest(".keyword-filter") ||
      event.target.closest(".keyword-filter__suggestions");
    const clickedInsideLanguageUi =
      event.target.closest(".filters-panel__combobox");
    const clickedInsideCountryUi =
      event.target.closest("#filters-panel__country-select-wrapper .filters-panel__combobox");

    if (!clickedInsideKeywordUi) {
      closeKeywordSuggestions();
    }

    if (!clickedInsideHeader) {
      dom.header.classList.remove("is-nav-open");
      dom.mobileNavToggle.setAttribute("aria-expanded", "false");
      dom.mobileNavToggle.setAttribute("aria-label", "Open navigation");
    }

    if (!clickedInsideLanguageUi) {
      closeLanguageMenu();
    }

    if (!clickedInsideCountryUi) {
      closeCountryMenu();
    }
  });

  window.addEventListener("resize", positionKeywordSuggestions);
  window.addEventListener("scroll", positionKeywordSuggestions, true);

  dom.submitButton.addEventListener("click", runSearch);
  dom.stickySubmitButton.addEventListener("click", () => {
    runSearch();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  dom.loadMoreButton.addEventListener("click", () => {
    state.currentPage += 1;
    const url = new URL(generateQueryURL());
    url.searchParams.set("page", state.currentPage);
    fetchMovies(url.toString());
  });
}

// Initial setup on page load
document.addEventListener("DOMContentLoaded", async () => {
  const compactViewportQuery = window.matchMedia("(max-width: 1024px)");

  document.body.appendChild(dom.keywordSuggestions);
  initializeDateField(dom.dateFromText, dom.dateFromHidden);
  initializeDateField(dom.dateToText, dom.dateToHidden, 183);
  setAccordionState(
    dom.sortToggle,
    dom.sortContent,
    dom.sortIconCollapsed,
    dom.sortIconExpanded,
    true,
  );
  setAccordionState(
    dom.filterToggle,
    dom.filterContent,
    dom.filterIconCollapsed,
    dom.filterIconExpanded,
    compactViewportQuery.matches,
  );
  compactViewportQuery.addEventListener("change", syncCompactFilterState);
  updateReleaseSectionVisibility();
  bindEvents();
  setupIntersectionObserver();
  dom.submitButton.disabled = true;
  dom.stickySubmitButton.disabled = true;

  // Load configuration data in parallel
  await Promise.all([
    fetchData(endpoints.languages, dom.languageSelect),
    fetchData(endpoints.countries, dom.countrySelect),
    fetchGenres(),
  ]);

  const initialUrl = generateQueryURL();
  state.lastSearchUrl = initialUrl;
  await fetchMovies(initialUrl);
});
