// ==========================================================================
// Басқару психологиясы — Электрондық оқулық
// Толық интеграцияланған классикалық және заманауи веб-платформа
// ==========================================================================

import bookContent from './data/book_content.json';
import tocData from './data/toc.json';
import authorData from './data/author.json';

const state = {
  currentRoute: 'cover',
  viewMode: localStorage.getItem('book2_view_mode') || 'text', // 'text' | 'pdf'
  theme: localStorage.getItem('book2_theme') || 'paper',
  fontSize: localStorage.getItem('book2_fontsize') || 'md',
  sidebarOpen: window.innerWidth > 860,
  soundEnabled: true
};

const elements = {
  readingProgress: document.getElementById('readingProgress'),
  readingContainer: document.getElementById('readingContainer'),
  sidebar: document.getElementById('sidebar'),
  tocNav: document.getElementById('tocNav'),
  sidebarFilterInput: document.getElementById('sidebarFilterInput'),
  toggleSidebarBtn: document.getElementById('toggleSidebarBtn'),
  brandHomeBtn: document.getElementById('brandHomeBtn'),
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  themeIcon: document.getElementById('themeIcon'),
  fontDecBtn: document.getElementById('fontDecBtn'),
  fontIncBtn: document.getElementById('fontIncBtn'),
  fullscreenBtn: document.getElementById('fullscreenBtn'),
  openSearchBtn: document.getElementById('openSearchBtn'),
  searchModal: document.getElementById('searchModal'),
  closeSearchModalBtn: document.getElementById('closeSearchModalBtn'),
  globalSearchInput: document.getElementById('globalSearchInput'),
  searchResults: document.getElementById('searchResults'),
  navTabs: document.querySelectorAll('.nav-tab-btn')
};

// --------------------------------------------------------------------------
// Дыбыстық эффект (AutoPlay түпнұсқа шерту дыбысы)
// --------------------------------------------------------------------------
function playClickSound() {
  if (!state.soundEnabled) return;
  try {
    const audio = new Audio('./assets/audio/Click1.ogg');
    audio.volume = 0.4;
    audio.play().catch(() => {});
  } catch (e) {}
}

// --------------------------------------------------------------------------
// Тақырып және қаріпті баптау
// --------------------------------------------------------------------------
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('book2_theme', theme);
  const icons = { paper: '☀️', sepia: '📜', dark: '🌙' };
  if (elements.themeIcon) elements.themeIcon.textContent = icons[theme] || '☀️';
}

function cycleTheme() {
  const themes = ['paper', 'sepia', 'dark'];
  const next = themes[(themes.indexOf(state.theme) + 1) % themes.length];
  applyTheme(next);
}

function applyFontSize(size) {
  state.fontSize = size;
  document.documentElement.setAttribute('data-size', size);
  localStorage.setItem('book2_fontsize', size);
}

function changeFontSize(delta) {
  const sizes = ['sm', 'md', 'lg', 'xl'];
  let idx = sizes.indexOf(state.fontSize) + delta;
  if (idx >= 0 && idx < sizes.length) {
    applyFontSize(sizes[idx]);
  }
}

// --------------------------------------------------------------------------
// Сайдбар (TOC)
// --------------------------------------------------------------------------
function renderTOC(filter = '') {
  elements.tocNav.innerHTML = '';
  const search = filter.toLowerCase().trim();

  // Негізгі навигация пункттері
  const navItems = [
    { id: 'cover', icon: '🏛', title: 'Басты бет (Университет)' },
    { id: 'menu', icon: '📋', title: 'Дәрістер мәзірі' },
    { id: 'intro', icon: '📖', title: 'Кіріспе' }
  ];

  navItems.forEach(item => {
    if (!search || item.title.toLowerCase().includes(search)) {
      const link = document.createElement('a');
      link.className = `toc-item-link ${state.currentRoute === item.id ? 'active' : ''}`;
      link.href = `#${item.id}`;
      link.innerHTML = `<span class="toc-item-badge">${item.icon}</span><span><strong>${item.title}</strong></span>`;
      elements.tocNav.appendChild(link);
    }
  });

  // 1-бөлім (1-5 дәрістер)
  const part1Items = tocData.filter(i => {
    const num = parseInt(i.shortTitle, 10);
    const inPart = num >= 1 && num <= 5;
    const match = !search || i.title.toLowerCase().includes(search) || i.shortTitle.toLowerCase().includes(search);
    return inPart && match;
  });

  if (part1Items.length > 0) {
    const g1 = document.createElement('div');
    g1.className = 'toc-group';
    g1.innerHTML = `<div class="toc-group-title">І Бөлім. Теориялық-әдіснамалық негіздер</div>`;
    part1Items.forEach(item => {
      const a = document.createElement('a');
      a.className = `toc-item-link ${state.currentRoute === item.id ? 'active' : ''}`;
      a.href = `#${item.id}`;
      a.innerHTML = `
        <span class="toc-item-badge">${item.shortTitle}</span>
        <span>${item.title.replace(/^[^§]+/, '').trim() || item.title}</span>
      `;
      g1.appendChild(a);
    });
    elements.tocNav.appendChild(g1);
  }

  // 2-бөлім (6-10 дәрістер)
  const part2Items = tocData.filter(i => {
    const num = parseInt(i.shortTitle, 10);
    const inPart = num >= 6 && num <= 10;
    const match = !search || i.title.toLowerCase().includes(search) || i.shortTitle.toLowerCase().includes(search);
    return inPart && match;
  });

  if (part2Items.length > 0) {
    const g2 = document.createElement('div');
    g2.className = 'toc-group';
    g2.innerHTML = `<div class="toc-group-title">ІІ Бөлім. Ұжымның ахуалын басқару</div>`;
    part2Items.forEach(item => {
      const a = document.createElement('a');
      a.className = `toc-item-link ${state.currentRoute === item.id ? 'active' : ''}`;
      a.href = `#${item.id}`;
      a.innerHTML = `
        <span class="toc-item-badge">${item.shortTitle}</span>
        <span>${item.title.replace(/^[^§]+/, '').trim() || item.title}</span>
      `;
      g2.appendChild(a);
    });
    elements.tocNav.appendChild(g2);
  }

  // Қосымша бөлімдер
  const footerItems = [
    { id: 'author', icon: '👤', title: 'Кітап авторы туралы' },
    { id: 'docs', icon: '📁', title: 'Барлық PDF файлдар (11)' }
  ];

  footerItems.forEach(item => {
    if (!search || item.title.toLowerCase().includes(search)) {
      const link = document.createElement('a');
      link.className = `toc-item-link ${state.currentRoute === item.id ? 'active' : ''}`;
      link.href = `#${item.id}`;
      link.style.marginTop = '0.4rem';
      link.innerHTML = `<span class="toc-item-badge">${item.icon}</span><span><strong>${item.title}</strong></span>`;
      elements.tocNav.appendChild(link);
    }
  });
}

// --------------------------------------------------------------------------
// 1. Классикалық Басты бет (Университет, Ми логотипі, БАСТАУ, КІТАП АВТОРЫ)
// --------------------------------------------------------------------------
function renderCoverPage() {
  elements.readingContainer.innerHTML = `
    <!-- Түпнұсқа Автоплей басты экраны -->
    <div class="classic-start-card">
      <div class="classic-university-title">
        Қ.Жұбанов атындағы Ақтөбе өңірлік мемлекеттік университеті
      </div>

      <div class="classic-start-body">
        <div class="classic-start-buttons">
          <a href="#menu" class="classic-btn-action primary" id="btnStartReading">
            ▶ БАСТАУ
          </a>
          <a href="#author" class="classic-btn-action" id="btnAuthorInfo">
            👤 КІТАП АВТОРЫ
          </a>
          <a href="#docs" class="classic-btn-action" id="btnPdfDocs">
            📚 БАРЛЫҚ PDF ҚҰЖАТТАР
          </a>
        </div>

        <div>
          <img src="./assets/images/logobook.png" alt="Басқару психологиясы" class="classic-brain-logo" />
        </div>
      </div>

      <div class="classic-book-title">
        Басқару психологиясы
      </div>
    </div>

    <!-- Заманауи шолу карточкалары -->
    <div class="cover-hero" style="margin-top: 1.5rem; padding: 2rem;">
      <span class="cover-badge">Электрондық оқу құралы</span>
      <p class="cover-subtitle" style="margin: 0;">
        Басқару қызметінің психологиялық заңдылықтары, жеке тұлға мен ұжымның өзара әрекеттесуі, 
        еңбек мотивациясы, көшбасшылық қағидалары мен басқарушылық шешімдер қабылдау жүйесі.
      </p>

      <div style="font-size: 0.95rem; color: var(--text-secondary);">
        Автор: <strong>${authorData.name}</strong> (${authorData.title})
      </div>

      <div class="cover-meta" style="margin-top: 0.5rem; padding-top: 1rem;">
        <div>📑 <strong>10</strong> Кешенді дәріс</div>
        <div>📄 <strong>11</strong> Түпнұсқа PDF құжат</div>
        <div>👥 <strong>2</strong> Негізгі бөлім</div>
        <div>🎓 Университет стандарты</div>
      </div>
    </div>

    <!-- Бөлімдер карточкалары -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
      <div class="nav-card" style="max-width: 100%; padding: 1.5rem;">
        <span class="nav-card-label">І БӨЛІМ</span>
        <h3 style="margin: 0.5rem 0; font-size: 1.15rem; color: var(--text-main);">Теориялық-әдіснамалық негіздер</h3>
        <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1rem;">
          Басқару психологиясының пәні, тарихы, басқару объектісі мен субъектісі, еңбек мотивациясы (1-5 дәрістер).
        </p>
        <a href="#lecture-1" class="btn-secondary" style="align-self: flex-start; font-size: 0.85rem; padding: 0.4rem 0.85rem;">
          1-дәріске өту →
        </a>
      </div>

      <div class="nav-card" style="max-width: 100%; padding: 1.5rem;">
        <span class="nav-card-label">ІІ БӨЛІМ</span>
        <h3 style="margin: 0.5rem 0; font-size: 1.15rem; color: var(--text-main);">Ұжымның ахуалын басқару</h3>
        <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1rem;">
          Ұжым дамуы, басқару стилі, көшбасшылық және жетекшілік, шешім қабылдау және перцептивтік процестер (6-10 дәрістер).
        </p>
        <a href="#lecture-6" class="btn-secondary" style="align-self: flex-start; font-size: 0.85rem; padding: 0.4rem 0.85rem;">
          6-дәріске өту →
        </a>
      </div>
    </div>
  `;

  document.querySelectorAll('.classic-btn-action').forEach(b => b.addEventListener('click', playClickSound));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --------------------------------------------------------------------------
// 2. Дәрістер мәзірі экраны (Түпнұсқа AutoPlay 10 Лекция + Кіріспе)
// --------------------------------------------------------------------------
function renderLecturesMenuPage() {
  elements.readingContainer.innerHTML = `
    <div class="classic-lectures-board">
      <div class="classic-board-backdrop"></div>
      <div class="classic-board-content">
        <!-- Кіріспе түймесі -->
        <div class="classic-intro-btn-wrap">
          <a href="#intro" class="classic-green-btn sound-click" style="min-width: 200px; font-size: 1.1rem; padding: 0.85rem 2rem;">
            КІРІСПЕ
          </a>
        </div>

        <!-- 10 Дәріс батырмалары екі бағанда -->
        <div class="classic-grid-columns">
          <div class="classic-grid-col">
            <a href="#lecture-1" class="classic-green-btn sound-click">1 ЛЕКЦИЯ</a>
            <a href="#lecture-2" class="classic-green-btn sound-click">2 ЛЕКЦИЯ</a>
            <a href="#lecture-3" class="classic-green-btn sound-click">3 ЛЕКЦИЯ</a>
            <a href="#lecture-4" class="classic-green-btn sound-click">4 ЛЕКЦИЯ</a>
            <a href="#lecture-5" class="classic-green-btn sound-click">5 ЛЕКЦИЯ</a>
          </div>

          <div class="classic-grid-col">
            <a href="#lecture-6" class="classic-green-btn sound-click">6 ЛЕКЦИЯ</a>
            <a href="#lecture-7" class="classic-green-btn sound-click">7 ЛЕКЦИЯ</a>
            <a href="#lecture-8" class="classic-green-btn sound-click">8 ЛЕКЦИЯ</a>
            <a href="#lecture-9" class="classic-green-btn sound-click">9 ЛЕКЦИЯ</a>
            <a href="#lecture-10" class="classic-green-btn sound-click">10 ЛЕКЦИЯ</a>
          </div>
        </div>

        <!-- Үйге оралу түймесі (HOME.png) -->
        <div class="classic-home-btn-wrap">
          <a href="#cover" class="classic-home-btn sound-click" title="Басты бетке оралу">
            <img src="./assets/images/HOME.png" alt="Басты бет" />
          </a>
          <span style="margin-left: 1rem; font-weight: 600; font-size: 0.95rem; color: #1e293b; background: rgba(255,255,255,0.85); padding: 0.3rem 0.8rem; border-radius: 6px;">
            Басты бетке оралу
          </span>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.sound-click').forEach(b => b.addEventListener('click', playClickSound));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --------------------------------------------------------------------------
// 3. Автор беті (Түпнұсқа фото, мәтін және марапат куәлігі)
// --------------------------------------------------------------------------
function renderAuthorPage() {
  elements.readingContainer.innerHTML = `
    <div class="author-card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="cover-badge">Ресми ақпарат</span>
        <a href="#cover" class="classic-home-btn sound-click" title="Басты бетке">
          <img src="./assets/images/HOME.png" alt="Басты бет" />
        </a>
      </div>

      <h1 style="font-family: var(--font-body); font-size: 2rem; font-weight: 700; color: var(--text-main); margin: 0;">
        Кітап авторы
      </h1>

      <div class="author-header" style="border: none; padding-bottom: 0;">
        <img src="${authorData.photo}" alt="${authorData.name}" class="author-photo-img" style="width: 220px; height: 260px; border-radius: 12px; object-fit: cover;" />
        <div class="author-info-wrap" style="flex: 1;">
          <h2 class="author-name" style="font-size: 1.5rem; margin-bottom: 0.5rem;">${authorData.name}</h2>
          <div class="author-title" style="margin-bottom: 1rem;">${authorData.title}</div>
          <div class="author-bio-text" style="font-size: 0.98rem; text-align: justify; line-height: 1.75;">
            ${authorData.bio.split('\n\n').map(p => `<p style="margin-bottom: 0.85rem;">${p}</p>`).join('')}
          </div>
        </div>
      </div>

      <div class="author-badge-card">
        <h3 style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
          Төс белгі куәлігі мен марапаттау құжаты:
        </h3>
        <img src="${authorData.badgeImage}" alt="Автор марапаты" class="author-badge-img" style="max-height: 280px; object-fit: contain;" />
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; border-top: 1px solid var(--border); padding-top: 1.25rem;">
        <a href="#menu" class="btn-secondary sound-click">
          ← Дәрістер мәзірі
        </a>
        <a href="#lecture-1" class="btn-primary sound-click">
          1-дәрісті оқуға көшу →
        </a>
      </div>
    </div>
  `;

  document.querySelectorAll('.sound-click').forEach(b => b.addEventListener('click', playClickSound));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --------------------------------------------------------------------------
// 4. Түпнұсқа файлдар тізімі (Барлық 11 PDF және құжаттар)
// --------------------------------------------------------------------------
function renderDocsPage() {
  elements.readingContainer.innerHTML = `
    <div class="author-card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span class="cover-badge">Түпнұсқа материалдар</span>
          <h1 style="font-family: var(--font-body); font-size: 1.85rem; font-weight: 700; color: var(--text-main); margin-top: 0.25rem;">
            Барлық 11 PDF оқулық құжаттары
          </h1>
        </div>
        <a href="#cover" class="classic-home-btn sound-click" title="Басты бетке">
          <img src="./assets/images/HOME.png" alt="Басты бет" />
        </a>
      </div>

      <p style="color: var(--text-secondary); line-height: 1.6;">
        Оқулықтың барлық дәрістері түпнұсқа PDF форматында сақталған. 
        Кез келген файлды онлайн қарауға немесе құрылғыңызға жүктеп алуға болады.
      </p>

      <div class="docs-list-grid">
        ${bookContent.map(item => `
          <div class="doc-file-card">
            <div class="doc-file-header">
              <span class="doc-file-icon">📄</span>
              <div class="doc-file-info">
                <span class="doc-file-name">${item.shortTitle}</span>
                <span class="doc-file-meta">${item.title}</span>
                <span class="doc-file-meta" style="color: var(--accent); font-weight: 600;">Бет саны: ${item.numPages}</span>
              </div>
            </div>
            <div class="doc-file-actions">
              <a href="#${item.id}" class="btn-primary" style="font-size: 0.85rem; padding: 0.45rem 0.9rem;">
                Оқулықта ашу
              </a>
              <a href="${item.pdfFile}" target="_blank" class="btn-secondary" style="font-size: 0.85rem; padding: 0.45rem 0.9rem;">
                ↗️ Жеке ашу
              </a>
              <a href="${item.pdfFile}" download class="btn-secondary" style="font-size: 0.85rem; padding: 0.45rem 0.9rem;">
                ⬇️ Жүктеу
              </a>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="border-top: 1px solid var(--border); padding-top: 1.25rem; display: flex; justify-content: space-between;">
        <a href="#menu" class="btn-secondary sound-click">← Дәрістер мәзіріне өту</a>
        <a href="#cover" class="btn-primary sound-click">Басты бетке өту</a>
      </div>
    </div>
  `;

  document.querySelectorAll('.sound-click').forEach(b => b.addEventListener('click', playClickSound));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --------------------------------------------------------------------------
// 5. Дәріс парағы (Веб-мәтін және Түпнұсқа PDF режимі)
// --------------------------------------------------------------------------
function renderLecturePage(sectionId) {
  const section = bookContent.find(s => s.id === sectionId);
  if (!section) {
    elements.readingContainer.innerHTML = `<div class="cover-hero"><h2>Дәріс табылмады</h2><a href="#cover" class="btn-primary">Басты бетке оралу</a></div>`;
    return;
  }

  const currentIndex = tocData.findIndex(item => item.id === sectionId);
  const prevSection = currentIndex > 0 ? tocData[currentIndex - 1] : null;
  const nextSection = currentIndex < tocData.length - 1 ? tocData[currentIndex + 1] : null;

  elements.readingContainer.innerHTML = `
    <article class="article-container">
      <!-- Жоғарғы басқару тақтасы -->
      <div class="view-mode-bar">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <a href="#menu" class="btn-secondary sound-click" style="padding: 0.35rem 0.75rem; font-size: 0.85rem;" title="Дәрістер мәзіріне қайту">
            ← Мәзір
          </a>
          <span style="font-size: 0.88rem; color: var(--text-main); font-weight: 600;">
            ${section.shortTitle} (${section.numPages} бет)
          </span>
        </div>

        <div class="mode-segmented-control">
          <button id="viewTextModeBtn" class="mode-btn ${state.viewMode === 'text' ? 'active' : ''}">
            📝 Веб-мәтін
          </button>
          <button id="viewPdfModeBtn" class="mode-btn ${state.viewMode === 'pdf' ? 'active' : ''}">
            📄 Түпнұсқа PDF
          </button>
        </div>

        <div style="display: flex; gap: 0.5rem;">
          <a href="${section.pdfFile}" target="_blank" class="control-btn" title="PDF-ті жеке терезеде ашу">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span style="margin-left: 4px;">Ашу</span>
          </a>
          <a href="${section.pdfFile}" download class="control-btn" title="PDF-ті жүктеп алу">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span style="margin-left: 4px;">Жүктеу</span>
          </a>
        </div>
      </div>

      <!-- Контент блогы -->
      ${state.viewMode === 'text' ? `
        <header class="article-header" style="margin-top: 1.5rem;">
          <span class="article-category-badge">Дәріс кешені</span>
          <h1 class="article-title">${section.title}</h1>
          <div class="article-meta">
            <span>📖 ${section.shortTitle}</span>
            <span>⏱ ~${Math.max(3, section.numPages * 2)} минуттық оқу</span>
            <span>📄 ${section.numPages} беттік түпнұсқа</span>
          </div>
        </header>

        <div class="article-body">
          ${section.textHtml}
        </div>
      ` : `
        <div style="margin-top: 1.5rem;">
          <div style="background: var(--bg-hover); padding: 0.75rem 1rem; border-radius: var(--radius-sm); margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
            <span>📄 Түпнұсқа құжат: <strong>${section.shortTitle} (${section.pdfFile.split('/').pop()})</strong></span>
            <a href="${section.pdfFile}" target="_blank" class="btn-primary" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;">
              ↗️ Жаңа қойындыда ашу
            </a>
          </div>
          <iframe src="${section.pdfFile}" class="pdf-viewer-frame" title="${section.title}">
            <p>Браузеріңіз PDF қарауды қолдамайды. 
              <a href="${section.pdfFile}" target="_blank">PDF құжатты мына жерден ашыңыз</a>.
            </p>
          </iframe>
        </div>
      `}

      <!-- Навигация -->
      <nav class="chapter-navigation" aria-label="Бөлімдер бойынша шарлау">
        ${prevSection ? `
          <a href="#${prevSection.id}" class="nav-card sound-click">
            <span class="nav-card-label">← Алдыңғы дәріс</span>
            <span class="nav-card-title">${prevSection.shortTitle}: ${prevSection.title}</span>
          </a>
        ` : `
          <a href="#menu" class="nav-card sound-click">
            <span class="nav-card-label">← Мәзір</span>
            <span class="nav-card-title">📋 Барлық дәрістер тізімі</span>
          </a>
        `}

        ${nextSection ? `
          <a href="#${nextSection.id}" class="nav-card sound-click" style="text-align: right; align-items: flex-end;">
            <span class="nav-card-label">Келесі дәріс →</span>
            <span class="nav-card-title">${nextSection.shortTitle}: ${nextSection.title}</span>
          </a>
        ` : `
          <a href="#author" class="nav-card sound-click" style="text-align: right; align-items: flex-end;">
            <span class="nav-card-label">Қорытынды →</span>
            <span class="nav-card-title">👤 Кітап авторы туралы</span>
          </a>
        `}
      </nav>
    </article>
  `;

  // Режим түймелері
  const textBtn = document.getElementById('viewTextModeBtn');
  const pdfBtn = document.getElementById('viewPdfModeBtn');
  if (textBtn && pdfBtn) {
    textBtn.addEventListener('click', () => {
      playClickSound();
      state.viewMode = 'text';
      localStorage.setItem('book2_view_mode', 'text');
      renderLecturePage(sectionId);
    });
    pdfBtn.addEventListener('click', () => {
      playClickSound();
      state.viewMode = 'pdf';
      localStorage.setItem('book2_view_mode', 'pdf');
      renderLecturePage(sectionId);
    });
  }

  document.querySelectorAll('.sound-click').forEach(b => b.addEventListener('click', playClickSound));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --------------------------------------------------------------------------
// Роутер
// --------------------------------------------------------------------------
function navigate(route) {
  state.currentRoute = route || 'cover';

  elements.navTabs.forEach(btn => {
    const r = btn.dataset.route;
    let isActive = false;
    if (r === 'cover' && state.currentRoute === 'cover') isActive = true;
    else if (r === 'menu' && state.currentRoute === 'menu') isActive = true;
    else if (r === 'intro' && state.currentRoute === 'intro') isActive = true;
    else if (r === 'lecture-1' && (state.currentRoute.startsWith('lecture-') && parseInt(state.currentRoute.replace('lecture-', ''), 10) <= 5)) isActive = true;
    else if (r === 'lecture-6' && (state.currentRoute.startsWith('lecture-') && parseInt(state.currentRoute.replace('lecture-', ''), 10) >= 6)) isActive = true;
    else if (r === 'author' && state.currentRoute === 'author') isActive = true;
    else if (r === 'docs' && state.currentRoute === 'docs') isActive = true;

    btn.classList.toggle('active', isActive);
  });

  renderTOC(elements.sidebarFilterInput ? elements.sidebarFilterInput.value : '');

  if (state.currentRoute === 'cover') {
    renderCoverPage();
  } else if (state.currentRoute === 'menu') {
    renderLecturesMenuPage();
  } else if (state.currentRoute === 'author') {
    renderAuthorPage();
  } else if (state.currentRoute === 'docs') {
    renderDocsPage();
  } else {
    renderLecturePage(state.currentRoute);
  }

  if (window.innerWidth <= 860) {
    if (elements.sidebar) elements.sidebar.classList.add('collapsed');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (backdrop) backdrop.classList.remove('active');
  }
}

function handleHashChange() {
  const hash = window.location.hash.replace('#', '').trim();
  navigate(hash || 'cover');
}

// --------------------------------------------------------------------------
// Іздеу
// --------------------------------------------------------------------------
function performSearch(query) {
  const q = query.toLowerCase().trim();
  if (q.length < 2) {
    elements.searchResults.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 2rem 0;">Іздеу үшін кемінде 2 әріп енгізіңіз</p>`;
    return;
  }

  const results = [];
  bookContent.forEach(sec => {
    if (sec.title.toLowerCase().includes(q)) {
      results.push({ id: sec.id, title: sec.title, snippet: sec.title });
      return;
    }
    const idx = sec.rawText.toLowerCase().indexOf(q);
    if (idx !== -1) {
      const start = Math.max(0, idx - 60);
      const end = Math.min(sec.rawText.length, idx + 100);
      const snip = sec.rawText.substring(start, end).replace(new RegExp(`(${q})`, 'gi'), '<mark>$1</mark>');
      results.push({ id: sec.id, title: sectionIdTitle(sec), snippet: `...${snip}...` });
    }
  });

  if (results.length === 0) {
    elements.searchResults.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 2rem 0;">«${query}» бойынша ештеңе табылмады</p>`;
    return;
  }

  elements.searchResults.innerHTML = `
    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">Табылды: ${results.length} дәріс</div>
    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      ${results.map(r => `
        <a href="#${r.id}" class="search-result-item" style="padding: 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 0.25rem;">
          <div style="font-weight: 600; color: var(--text-main);">${r.title}</div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${r.snippet}</div>
        </a>
      `).join('')}
    </div>
  `;

  elements.searchResults.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => elements.searchModal.classList.remove('open'));
  });
}

function sectionIdTitle(sec) {
  return `${sec.shortTitle}: ${sec.title}`;
}

// --------------------------------------------------------------------------
// Прогресс жолағы
// --------------------------------------------------------------------------
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const b = document.body;
  const st = 'scrollTop';
  const sh = 'scrollHeight';
  const percent = ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100;
  if (elements.readingProgress) {
    elements.readingProgress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  }
});

function init() {
  applyTheme(state.theme);
  applyFontSize(state.fontSize);

  // Сайдбар оверлейі мен түймелері
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');

  function openSidebar() {
    elements.sidebar.classList.remove('collapsed');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
  }

  function closeSidebar() {
    elements.sidebar.classList.add('collapsed');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
  }

  elements.toggleSidebarBtn.addEventListener('click', () => {
    if (elements.sidebar.classList.contains('collapsed')) {
      openSidebar();
    } else {
      closeSidebar();
    }
  });

  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);
  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);

  elements.brandHomeBtn.addEventListener('click', () => window.location.hash = '#cover');
  elements.navTabs.forEach(btn => btn.addEventListener('click', () => window.location.hash = `#${btn.dataset.route}`));
  elements.themeToggleBtn.addEventListener('click', cycleTheme);
  elements.fontDecBtn.addEventListener('click', () => changeFontSize(-1));
  elements.fontIncBtn.addEventListener('click', () => changeFontSize(1));
  elements.fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  });
  elements.sidebarFilterInput.addEventListener('input', e => renderTOC(e.target.value));

  elements.openSearchBtn.addEventListener('click', () => {
    elements.searchModal.classList.add('open');
    elements.globalSearchInput.focus();
  });
  elements.closeSearchModalBtn.addEventListener('click', () => elements.searchModal.classList.remove('open'));
  elements.searchModal.addEventListener('click', e => {
    if (e.target === elements.searchModal) elements.searchModal.classList.remove('open');
  });
  elements.globalSearchInput.addEventListener('input', e => performSearch(e.target.value));

  window.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      elements.searchModal.classList.add('open');
      elements.globalSearchInput.focus();
    }
    if (e.key === 'Escape') elements.searchModal.classList.remove('open');
  });

  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();
}

init();
