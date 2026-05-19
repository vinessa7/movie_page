// RangeSlider Class. Used for TMDB filters like User Score, Minimum Votes, and Runtime.
class RangeSlider {
  constructor(config) {
    // We start by defining the boundaries of the slider
    this.minLimit = config.minLimit;
    this.maxLimit = config.maxLimit;
    this.step = config.step;
    
    // Set the starting positions. If none are provided, we just use the limits.
    this.currentMin = config.startMin ?? config.minLimit;
    this.currentMax = config.startMax ?? config.maxLimit;
    
    // If we don't have a second handle (thumbMinId), it acts as a simple single slider
    this.isSingle = !config.thumbMinId;
    this.onChange = config.onChange ?? (() => {});

    // Grab all the HTML elements we need to move or change text on
    this.container = document.getElementById(config.containerId);
    this.thumbMin = config.thumbMinId
      ? document.getElementById(config.thumbMinId)
      : null;
    this.thumbMax = document.getElementById(config.thumbMaxId);
    this.fill = document.getElementById(config.fillId);
    this.labelMin = config.labelMinId
      ? document.getElementById(config.labelMinId)
      : null;
    this.labelMax = document.getElementById(config.labelMaxId);
    this.display = document.getElementById(config.displayId);
    
    // Tracking variables for dragging state
    this.activeThumb = null;
    this.timer = null;

    this.init();
  }

  init() {
    // If the main parts aren't in the HTML, we stop here to avoid errors
    if (!this.container || !this.thumbMax || !this.fill || !this.labelMax || !this.display) {
      return;
    }

    // Set up the listeners for the left handle (if it exists)
    if (this.thumbMin) {
      this.thumbMin.addEventListener("mousedown", (event) =>
        this.startDrag("min", event),
      );
      this.thumbMin.addEventListener(
        "touchstart",
        (event) => this.startDrag("min", event),
        { passive: false },
      );
    }

    // Set up listeners for the right handle
    this.thumbMax.addEventListener("mousedown", (event) =>
      this.startDrag("max", event),
    );
    this.thumbMax.addEventListener(
      "touchstart",
      (event) => this.startDrag("max", event),
      { passive: false },
    );

    // Allow jumping to a value just by clicking on the slider track
    this.container.addEventListener("click", (event) => this.handleClick(event));
    
    // Draw the slider
    this.render();
  }

  getValues() {
    return {
      min: this.currentMin,
      max: this.currentMax,
    };
  }

  // Math helper: Converts a value (like 5/10) into a percentage (50%) for CSS
  pct(value) {
    return ((value - this.minLimit) / (this.maxLimit - this.minLimit)) * 100;
  }

  // Updating the visual positions of the handles and the colored bar
  render() {
    requestAnimationFrame(() => {
      const leftPct = this.isSingle ? 0 : this.pct(this.currentMin);
      const rightPct = this.pct(this.currentMax);

      // Move the handles using percentages
      if (this.thumbMin) {
        this.thumbMin.style.left = `${leftPct}%`;
      }

      this.thumbMax.style.left = `${rightPct}%`;
      
      // Update the colored "fill" area between the handles
      this.fill.style.left = `${leftPct}%`;
      this.fill.style.right = `${100 - rightPct}%`;

      // Update the numbers displayed above the handles
      if (this.labelMin) {
        this.labelMin.textContent = this.currentMin;
      }

      this.labelMax.textContent = this.currentMax;
    });
  }

  // Calculates which "step" the mouse is closest to based on the bar's width
  valFromX(clientX) {
    const rect = this.container.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawValue = ratio * (this.maxLimit - this.minLimit) + this.minLimit;
    
    // Snaps the value to the nearest step (rounding 4.2 to 4)
    return Math.round(rawValue / this.step) * this.step;
  }

  // Let the main script know it's time to check for new movies
  notifyChange() {
    this.onChange();
    if (typeof window.updateSearchButtonState === "function") {
      window.updateSearchButtonState();
    }
  }

  // The logic for when a user grabs a handle and moves the mouse
  startDrag(type, event) {
    // Stop the page from selecting text while dragging
    event.preventDefault(); 
    this.activeThumb = type;
    
    // Add classes so we can style the dragging state in CSS
    this.container.classList.add("is-dragging");
    this.display.classList.add("is-active");

    const moveHandler = (moveEvent) => {
      // Support both mouse and touch movements
      const clientX = moveEvent.touches
        ? moveEvent.touches[0].clientX
        : moveEvent.clientX;
      const nextValue = this.valFromX(clientX);

      if (this.activeThumb === "min") {
        this.currentMin = nextValue;
        // Don't let the left handle push past the right one
        if (this.currentMin > this.currentMax) {
          this.currentMax = this.currentMin;
        }
      } else {
        this.currentMax = nextValue;
        // Don't let the right handle pull past the left one
        if (!this.isSingle && this.currentMax < this.currentMin) {
          this.currentMin = this.currentMax;
        }
      }

      this.render();
      this.notifyChange();
    };

    // Cleaning up all the event listeners when the user lets go of the mouse/screen
    const stopHandler = () => {
      this.activeThumb = null;
      this.container.classList.remove("is-dragging");
      this.display.classList.remove("is-active");
      document.removeEventListener("mousemove", moveHandler);
      document.removeEventListener("mouseup", stopHandler);
      document.removeEventListener("touchmove", moveHandler);
      document.removeEventListener("touchend", stopHandler);
    };

    //handlers are attached to 'document' so the drag doesn't break if the mouse leaves the bar
    document.addEventListener("mousemove", moveHandler);
    document.addEventListener("mouseup", stopHandler);
    document.addEventListener("touchmove", moveHandler, { passive: false });
    document.addEventListener("touchend", stopHandler);
  }

  // Handles logic for when a user just clicks the bar instead of dragging
  handleClick(event) {
    if (this.activeThumb) {
      return;
    }

    const nextValue = this.valFromX(event.clientX);

    if (this.isSingle) {
      this.currentMax = nextValue;
    } else if (
      // Figure out which handle is closer to the click and move that one
      Math.abs(nextValue - this.currentMin) <= Math.abs(nextValue - this.currentMax)
    ) {
      this.currentMin = nextValue;
    } else {
      this.currentMax = nextValue;
    }

    // Safety check to ensure min never ends up larger than max
    if (!this.isSingle && this.currentMin > this.currentMax) {
      [this.currentMin, this.currentMax] = [this.currentMax, this.currentMin];
    }

    this.render();
    this.notifyChange();

    // Show the value briefly, then hide it after 1 second
    this.display.classList.add("is-active");
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.display.classList.remove("is-active");
    }, 1000);
  }
}


//  Filter Configuration
//  Defining the actual sliders for the page.
window.movieFilters = {
  // User Score: 0 to 10
  userScore: new RangeSlider({
    minLimit: 0,
    maxLimit: 10,
    step: 1,
    startMin: 0,
    startMax: 10,
    containerId: "range-slider__container--score",
    thumbMinId: "range-slider__thumb-min--score",
    thumbMaxId: "range-slider__thumb-max--score",
    fillId: "range-slider__fill--score",
    labelMinId: "range-slider__label-min--score",
    labelMaxId: "range-slider__label-max--score",
    displayId: "range-slider__display--score",
  }),
  // Minimum Votes: 0 to 500
  minVotes: new RangeSlider({
    minLimit: 0,
    maxLimit: 500,
    step: 10,
    startMax: 0,
    containerId: "range-slider__container--votes",
    thumbMaxId: "range-slider__thumb-max--votes",
    fillId: "range-slider__fill--votes",
    labelMaxId: "range-slider__label-max--votes",
    displayId: "range-slider__display--votes",
  }),
  // Runtime: 0 to 400 minutes
  runtime: new RangeSlider({
    minLimit: 0,
    maxLimit: 400,
    step: 1,
    startMin: 0,
    startMax: 400,
    containerId: "range-slider__container--runtime",
    thumbMinId: "range-slider__thumb-min--runtime",
    thumbMaxId: "range-slider__thumb-max--runtime",
    fillId: "range-slider__fill--runtime",
    labelMinId: "range-slider__label-min--runtime",
    labelMaxId: "range-slider__label-max--runtime",
    displayId: "range-slider__display--runtime",
  }),
};