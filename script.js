// Create the background grid immediately
const gridContainer = document.createElement("div");
gridContainer.id = "background-grid";
document.body.appendChild(gridContainer);

// Grid state management
let gridState = [];
let animationId;
let currentGrid = { columns: 10, rows: 10 };

// Cell class to manage individual cell behavior
class GridCell {
  constructor(
    startCol,
    startRow,
    initialColSpan,
    initialRowSpan,
    maxColSpan,
    maxRowSpan
  ) {
    this.startCol = startCol;
    this.startRow = startRow;
    this.currentColSpan = initialColSpan;
    this.currentRowSpan = initialRowSpan;
    this.targetColSpan = initialColSpan;
    this.targetRowSpan = initialRowSpan;
    this.maxColSpan = maxColSpan;
    this.maxRowSpan = maxRowSpan;
    this.animationPhase = Math.random() * Math.PI * 2;
    this.spanChangeTimer = Math.random() * 3000 + 2000; // 2-5 seconds
    this.lastSpanChange = Date.now();

    // Create DOM element
    this.element = document.createElement("div");
    this.element.style.transition =
      "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)";
    this.updatePosition();
    gridContainer.appendChild(this.element);
  }

  updatePosition() {
    this.element.style.gridColumn = `${
      this.startCol + 1
    } / span ${Math.round(this.currentColSpan)}`;
    this.element.style.gridRow = `${
      this.startRow + 1
    } / span ${Math.round(this.currentRowSpan)}`;
  }

  updateSpans(deltaTime) {
    // Smoothly interpolate toward target spans
    const lerpSpeed = 0.03;
    this.currentColSpan +=
      (this.targetColSpan - this.currentColSpan) * lerpSpeed;
    this.currentRowSpan +=
      (this.targetRowSpan - this.currentRowSpan) * lerpSpeed;

    // Check if it's time to change target spans
    const now = Date.now();
    if (now - this.lastSpanChange > this.spanChangeTimer) {
      this.chooseNewTargetSpans();
      this.lastSpanChange = now;
      this.spanChangeTimer = Math.random() * 4000 + 3000; // 3-7 seconds
    }

    this.updatePosition();
  }

  chooseNewTargetSpans() {
    // Randomly choose new target spans within limits
    this.targetColSpan = Math.floor(Math.random() * this.maxColSpan) + 1;
    this.targetRowSpan = Math.floor(Math.random() * this.maxRowSpan) + 1;
  }

  animate(time) {
    const cellTime = time + this.animationPhase;

    // Subtle pulsing effect
    const opacity = 0.4 + 0.2 * Math.sin(cellTime * 0.8);
    this.element.style.opacity = opacity;

    // Subtle color animation
    const hue =
      (time * 10 + this.startCol * 30 + this.startRow * 20) % 360;
    const saturation = 15 + 10 * Math.sin(cellTime * 0.5);
    const lightness = 88 + 8 * Math.cos(cellTime * 0.3);
    this.element.style.backgroundColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.15)`;
  }

  destroy() {
    this.element.remove();
  }
}

// Function to calculate non-overlapping cell layout
function calculateCellLayout(columns, rows) {
  const cells = [];
  const occupied = Array(rows)
    .fill()
    .map(() => Array(columns).fill(false));

  let attempts = 0;
  const maxAttempts = columns * rows;

  while (attempts < maxAttempts) {
    attempts++;

    // Find next available position
    let startRow = -1,
      startCol = -1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        if (!occupied[r][c]) {
          startRow = r;
          startCol = c;
          break;
        }
      }
      if (startRow !== -1) break;
    }

    if (startRow === -1) break;

    // Calculate maximum possible spans
    let maxColSpan = Math.min(columns - startCol, 3); // Limit spans to 3
    let maxRowSpan = Math.min(rows - startRow, 3); // Limit spans to 3

    // Choose initial span
    const initialColSpan = Math.floor(Math.random() * maxColSpan) + 1;
    const initialRowSpan = Math.floor(Math.random() * maxRowSpan) + 1;

    // Create cell
    const cell = new GridCell(
      startCol,
      startRow,
      initialColSpan,
      initialRowSpan,
      maxColSpan,
      maxRowSpan
    );
    cells.push(cell);

    // Mark area as occupied
    for (let r = startRow; r < startRow + initialRowSpan; r++) {
      for (let c = startCol; c < startCol + initialColSpan; c++) {
        occupied[r][c] = true;
      }
    }
  }

  return cells;
}

// Function to regenerate grid with smooth transitions
function regenerateGrid() {
  // Use DocumentFragment for batch DOM updates
  const fragment = document.createDocumentFragment();

  // Clear existing cells
  gridState.forEach((cell) => cell.destroy());

  // Generate new layout
  gridState = calculateCellLayout(currentGrid.columns, currentGrid.rows);

  // Create new cells and append them in a single operation
  gridState.forEach((cell) => fragment.appendChild(cell.element));

  // Update grid template and append cells
  gridContainer.style.gridTemplateColumns = `repeat(${currentGrid.columns}, 1fr)`;
  gridContainer.style.gridTemplateRows = `repeat(${currentGrid.rows}, 1fr)`;
  gridContainer.appendChild(fragment);
}

// Main animation loop
function animate() {
  const time = Date.now() * 0.0003; // Increase speed for color/opacity animation

  // Update all cells
  gridState.forEach((cell) => {
    cell.updateSpans(1); // Ensure updateSpans is called every frame
    cell.animate(time);
  });

  // Make grid state changes more frequent
  if (Math.random() < 0.01) { // 1% chance per frame (was 0.1%)
    const newColumns = Math.floor(Math.random() * 8) + 6; // 6-14
    const newRows = Math.floor(Math.random() * 8) + 6; // 6-14
    if (
      newColumns !== currentGrid.columns ||
      newRows !== currentGrid.rows
    ) {
      currentGrid.columns = newColumns;
      currentGrid.rows = newRows;
      regenerateGrid();
    }
  }

  animationId = requestAnimationFrame(animate);
}

// Initialize
regenerateGrid();
animate();

// Performance optimization
// Pause animation when tab is hidden
if (typeof document !== 'undefined') {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (animationId) cancelAnimationFrame(animationId);
    } else {
      animate();
    }
  });
}

// Animar y luego mostrar contenido
window.addEventListener("load", () => {
  // Hide loader after everything is loaded
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('hide');
    setTimeout(() => loader.style.display = 'none', 500);
  }

  const panels = document.querySelectorAll(".panel");
  const introAnimation = document.querySelector("#intro-animation");
  const mainContent = document.querySelector("main");

  // Ensure panels animate out one by one
  panels.forEach((panel, i) => {
    setTimeout(() => {
      panel.classList.add("out");
    }, i * 200); // Reduce delay to 200ms for faster animation
  });

  // Wait for all panels to finish animating before showing main content
  const totalAnimationTime = panels.length * 200 + 500; // Adjust total time
  setTimeout(() => {
    if (introAnimation) introAnimation.classList.add("hidden"); // Smooth fade-out effect
    setTimeout(() => {
      if (mainContent) mainContent.classList.remove("hidden"); // Show main content
    }, 500); // Wait for fade-out to complete
  }, totalAnimationTime);
});

// Lightbox functionality for images in .proyectos .card (not index.html)
document.addEventListener('DOMContentLoaded', function () {
  const proyectosGrid = document.querySelector('.proyectos .grid');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.querySelector('.lightbox-content');
  const lightboxClose = document.querySelector('.lightbox-close');

  if (proyectosGrid && lightboxModal && lightboxImg && lightboxClose) {
    proyectosGrid.addEventListener('click', function (e) {
      const target = e.target;
      if (target.tagName === 'IMG') {
        lightboxImg.src = target.src;
        lightboxModal.classList.remove('hidden');
      }
    });
    lightboxClose.addEventListener('click', function () {
      lightboxModal.classList.add('hidden');
      lightboxImg.src = '';
    });
    lightboxModal.addEventListener('click', function (e) {
      if (e.target === lightboxModal) {
        lightboxModal.classList.add('hidden');
        lightboxImg.src = '';
      }
    });
    document.addEventListener('keydown', function (e) {
      if (!lightboxModal.classList.contains('hidden') && (e.key === 'Escape' || e.key === 'Esc')) {
        lightboxModal.classList.add('hidden');
        lightboxImg.src = '';
      }
    });
  }
});

// Modular gallery for Proyecto5
if (window.location.pathname.includes('proyecto5.html')) {
  const images = [
    "0010.png","0013.png","0023.png","0030.png","0104.png","0104_1.png","0105.png","0110.png","0114.png","0120.png","0122.png","0122_1.png","0127.png","0131.png","0148.png","0158.png","0185.png","0212.png","0246.png","0308.png","0329.png","0359.png","0360.png","0360_1.png","aburro2.png","bandana.png","Brutalismus.png","CamScanner 14-11-2024 11.04_4.jpg","casaFondo.png","EstatuaFondo-01.png","EstoSeCompone.png","estrella4.png","HYPNOS02.png","inthebeat.png","Mago.png","mamut.png","margarita.png","MockupMerchPortals.png","montajeEsquema.png","mordiscoAlSol.png","oruga.png","portada.png","portafa.png","Poster01.png","predio.png","renderSimbolario.png","simbolos.png","still.png","Still01.png","Still12.png","Still17.png","Still20.png","Still21.png","Still26.png","Still31.png","Still32.png","StillBuha2030.png","TDMovieOut.0.1114.png","TDMovieOut.0.1382.png","TDMovieOut.0.170.png","TDMovieOut.0.464.png","TDMovieOut.0.493.png","TDMovieOut.0.868.png","TDMovieOut.0.942.png","TernuraRadicalArtboard-1_1.png","tigres01.png","unlugar.png"
  ];
  // Shuffle images array
  for (let i = images.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [images[i], images[j]] = [images[j], images[i]];
  }
  const grid = document.getElementById('modular-grid');
  if (grid) {
    images.forEach((img, i) => {
      // Randomize span for a modular look
      const colSpan = Math.random() > 0.7 ? 2 : 1;
      const rowSpan = Math.random() > 0.7 ? 2 : 1;
      const div = document.createElement('div');
      div.className = 'modular-item';
      div.style.gridColumn = `span ${colSpan}`;
      div.style.gridRow = `span ${rowSpan}`;
      const image = document.createElement('img');
      image.src = `Proyecto5/${img}`;
      image.alt = img;
      div.appendChild(image);
      grid.appendChild(div);
    });
  }
  // Lightbox for modular gallery
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.querySelector('.lightbox-content');
  const lightboxClose = document.querySelector('.lightbox-close');
  grid.addEventListener('click', function (e) {
    const target = e.target;
    if (target.tagName === 'IMG') {
      lightboxImg.src = target.src;
      lightboxModal.classList.remove('hidden');
    }
  });
  lightboxClose.addEventListener('click', function () {
    lightboxModal.classList.add('hidden');
    lightboxImg.src = '';
  });
  lightboxModal.addEventListener('click', function (e) {
    if (e.target === lightboxModal) {
      lightboxModal.classList.add('hidden');
      lightboxImg.src = '';
    }
  });
  document.addEventListener('keydown', function (e) {
    if (!lightboxModal.classList.contains('hidden') && (e.key === 'Escape' || e.key === 'Esc')) {
      lightboxModal.classList.add('hidden');
      lightboxImg.src = '';
    }
  });
}
