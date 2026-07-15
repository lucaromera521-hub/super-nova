// ============ GLOBAL SUBJECTS DATASET ============
const allSubjects = [
  { id: "physics", name: "Physics", page: "physics.html", semester: 1 },
  { id: "math0", name: "Math 0", page: "math0.html", semester: 1 },
  { id: "math1", name: "Math 1", page: "math1.html", semester: 1 },
  { id: "ethics", name: "Ethics", page: "ethics.html", semester: 1 },
  { id: "intro_cs", name: "Intro CS", page: "intro_cs.html", semester: 1 },
  { id: "english", name: "English", page: "english.html", semester: 1 },
  { id: "ecommerce", name: "E-Commerce", page: "ecommerce.html", semester: 1 },
  
  { id: "programming", name: "Programming", page: "programming.html", semester: 2 },
  { id: "logic", name: "Logic", page: "logic.html", semester: 2 },
  { id: "discrete", name: "Discrete Math", page: "discrete.html", semester: 2 },
  { id: "cyber", name: "Cyber Security", page: "cyber.html", semester: 2 },
  { id: "ai", name: "AI", page: "ai.html", semester: 2 },
  { id: "electronics", name: "Electronics", page: "electronics.html", semester: 2 }
];

// ============ SMART SEARCH ============
function normalizeSearchText(text) {
  return text
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchDropdown = document.getElementById("searchDropdown");
  const cards = Array.from(document.querySelectorAll('#cards .card'));

  if (!searchInput) return;

  const updateDropdown = (query) => {
    if (!searchDropdown) return;

    if (!query) {
      searchDropdown.innerHTML = "";
      searchDropdown.style.display = "none";
      searchInput.setAttribute('aria-expanded', 'false');
      return;
    }

    const matches = allSubjects.filter(subject => {
      const normalized = normalizeSearchText(subject.name);
      return normalized.includes(query);
    });

    searchDropdown.innerHTML = '';
    if (matches.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'search-item';
      noResults.textContent = 'No results found';
      noResults.style.cursor = 'default';
      noResults.style.borderColor = 'transparent';
      noResults.style.background = 'rgba(255,255,255,.04)';
      searchDropdown.appendChild(noResults);
    } else {
      matches.slice(0, 10).forEach(subject => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'search-item';
        item.textContent = subject.name;
        item.addEventListener('click', () => {
          window.location.href = subject.page;
        });
        searchDropdown.appendChild(item);
      });
    }

    searchDropdown.style.display = 'block';
    searchInput.setAttribute('aria-expanded', 'true');
  };

  const updateCards = (query) => {
    if (!cards.length) return;

    let visibleCount = 0;
    cards.forEach(card => {
      const title = card.querySelector('.subject-title')?.textContent || '';
      const desc = card.querySelector('.subject-desc')?.textContent || '';
      const normalizedTitle = normalizeSearchText(title);
      const normalizedDesc = normalizeSearchText(desc);

      if (!query || normalizedTitle.includes(query) || normalizedDesc.includes(query)) {
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });

    if (visibleCount === 0 && query) {
      showNotification('🔍 No subjects found');
    }
  };

  const onSearchChange = (e) => {
    const query = normalizeSearchText(e.target.value);
    updateCards(query);
    updateDropdown(query);
  };

  searchInput.addEventListener('input', onSearchChange);

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchDropdown.style.display = 'none';
      searchInput.setAttribute('aria-expanded', 'false');
      searchInput.blur();
    }
  });

  if (searchDropdown) {
    document.addEventListener('click', (e) => {
      if (e.target !== searchInput && e.target.closest('#searchDropdown') === null) {
        searchDropdown.style.display = 'none';
        searchInput.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

// ============ LEARNING FEATURES ============

// Continue Learning System
function saveLastSubject(subject) {
  localStorage.setItem('lastSubject', subject);
  updateContinueSection();
}

function getLastSubject() {
  return localStorage.getItem('lastSubject');
}

function updateContinueSection() {
  const continueSection = document.getElementById('continueSection');
  const continueLink = document.getElementById('continueLink');
  const continueSubject = document.getElementById('continueSubject');
  
  if (!continueSection || !continueLink || !continueSubject) return;
  
  const lastSubject = getLastSubject();
  if (lastSubject) {
    continueSubject.textContent = lastSubject;
    continueLink.href = `${lastSubject}.html`;
    continueSection.style.display = 'block';
  } else {
    continueSection.style.display = 'none';
  }
}

// Progress System
function getProgress(subject) {
  return parseInt(localStorage.getItem(`progress_${subject}`) || '0');
}

function setProgress(subject, progress) {
  localStorage.setItem(`progress_${subject}`, Math.min(100, Math.max(0, progress)));
  updateProgressDisplay(subject);
}

function updateProgress(subject, increment = 10) {
  const current = getProgress(subject);
  setProgress(subject, current + increment);
}

function updateProgressDisplay(subject) {
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  if (progressFill && progressText) {
    const progress = getProgress(subject);
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `Progress: ${progress}%`;
  }
}

// Notes System
function saveNotes(subject, notes) {
  localStorage.setItem(`notes_${subject}`, notes);
}

function loadNotes(subject) {
  return localStorage.getItem(`notes_${subject}`) || '';
}

function initNotes(subject) {
  const textarea = document.getElementById('notesTextarea');
  if (textarea) {
    // Load existing notes
    textarea.value = loadNotes(subject);
    
    // Auto-save on input
    let saveTimeout;
    textarea.addEventListener('input', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveNotes(subject, textarea.value);
      }, 500); // Save after 500ms of no typing
    });
  }
}

// Initialize learning features for subject pages
function initSubjectPage() {
  const isSubjectPage = document.querySelector('.subject-page');
  if (!isSubjectPage) return;
  
  // Get subject name from URL or title
  const subject = window.location.pathname.split('/').pop().replace('.html', '') || 
                  document.title.split(' - ')[0].toLowerCase().replace(/\s+/g, '');
  
  // Initialize progress
  updateProgressDisplay(subject);
  
  // Initialize notes
  initNotes(subject);
  
  // Track interactions for progress
  const videoLinks = document.querySelectorAll('.page-btn.video');
  const pdfLinks = document.querySelectorAll('.page-btn.pdf');
  
  videoLinks.forEach(link => {
    link.addEventListener('click', () => {
      updateProgress(subject, 15); // Videos give more progress
    });
  });
  
  pdfLinks.forEach(link => {
    link.addEventListener('click', () => {
      updateProgress(subject, 10); // PDFs give some progress
    });
  });
}

// ============ SHARING SYSTEM ============
function shareWebsite() {
  showSharePopup();
}

function showSharePopup() {
  const overlay = document.querySelector('.share-popup-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  window.requestAnimationFrame(() => overlay.classList.add('visible'));
}

function closeSharePopup() {
  const overlay = document.querySelector('.share-popup-overlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  overlay.addEventListener('transitionend', function onEnd() {
    overlay.removeEventListener('transitionend', onEnd);
    if (!overlay.classList.contains('visible')) {
      overlay.style.display = 'none';
    }
  });
}

function copyShareLink() {
  const link = window.location.href;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(link).then(() => {
      showSharePopupMessage('Link copied ✅');
    }).catch(() => {
      showSharePopupMessage('Failed to copy link');
    });
  } else {
    showSharePopupMessage('Copy not supported');
  }
}

function showSharePopupMessage(message) {
  const messageEl = document.querySelector('.share-popup-message');
  if (!messageEl) return;
  messageEl.textContent = message;
}

function showShareQRCode() {
  const wrapper = document.querySelector('.share-qr-wrapper');
  const img = document.getElementById('shareQrImage');
  const downloadBtn = document.getElementById('downloadQrBtn');
  if (!wrapper || !img || !downloadBtn) return;
  if (!img.src) {
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(window.location.href)}`;
    img.onload = () => {
      downloadBtn.hidden = false;
      showSharePopupMessage('QR ready ✅');
    };
    img.onerror = () => {
      showSharePopupMessage('Failed to generate QR');
    };
  }
  wrapper.hidden = false;
}

function downloadShareQR() {
  const img = document.getElementById('shareQrImage');
  if (!img || !img.src) return;
  const link = document.createElement('a');
  link.href = img.src;
  link.download = 'supernova-qr.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function initSharePopup() {
  if (document.querySelector('.share-popup-overlay')) return;

  const style = document.createElement('style');
  style.textContent = `
    .share-popup-overlay {
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.72);
      z-index: 9999;
      padding: 1.5rem;
      backdrop-filter: blur(4px);
      opacity: 0;
      transition: opacity .24s ease;
    }
    .share-popup-overlay.visible {
      opacity: 1;
    }
    .share-popup-card {
      width: min(420px, 100%);
      max-width: 420px;
      border-radius: 24px;
      padding: 1.5rem;
      background: rgba(12, 18, 34, 0.98);
      border: 1px solid rgba(255,255,255,.14);
      box-shadow: 0 30px 60px rgba(0,0,0,.32);
      color: var(--text);
      animation: sharePopupFade .28s ease;
    }
    .share-popup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .share-popup-header h3 {
      margin: 0;
      font-size: 1.1rem;
      color: var(--text);
    }
    .share-popup-close {
      border: none;
      background: transparent;
      color: var(--text);
      font-size: 1.35rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }
    .share-popup-actions {
      display: grid;
      gap: .85rem;
      margin-top: .75rem;
    }
    .share-popup-actions button {
      width: 100%;
      padding: .95rem 1.1rem;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,.12);
      background: rgba(255,255,255,.08);
      color: var(--text);
      font-size: 0.95rem;
      cursor: pointer;
      transition: transform .2s ease, background .2s ease, box-shadow .2s ease;
    }
    .share-popup-actions button:hover {
      transform: translateY(-1px);
      background: rgba(255,255,255,.12);
    }
    .share-popup-message {
      margin-top: 1rem;
      min-height: 1.1rem;
      font-size: 0.95rem;
      color: rgba(255,255,255,.78);
    }
    .share-qr-wrapper {
      margin-top: 1rem;
      display: none;
      justify-content: center;
    }
    .share-qr-wrapper img {
      width: 220px;
      height: 220px;
      border-radius: 18px;
      background: #fff;
      object-fit: cover;
    }
    @keyframes sharePopupFade {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  const popup = document.createElement('div');
  popup.className = 'share-popup-overlay';
  popup.innerHTML = `
    <div class="share-popup-card">
      <div class="share-popup-header">
        <h3>Share Website</h3>
        <button type="button" class="share-popup-close" aria-label="Close share popup">×</button>
      </div>
      <div class="share-popup-actions">
        <button type="button" class="share-copy-btn">Copy Link</button>
        <button type="button" class="share-qr-btn">Show QR</button>
        <button type="button" class="share-download-btn" id="downloadQrBtn" hidden>Download QR</button>
      </div>
      <div class="share-popup-message"></div>
      <div class="share-qr-wrapper" id="shareQrWrapper">
        <img id="shareQrImage" alt="QR code" />
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  const closeBtn = popup.querySelector('.share-popup-close');
  const copyBtn = popup.querySelector('.share-copy-btn');
  const qrBtn = popup.querySelector('.share-qr-btn');
  const downloadBtn = popup.querySelector('.share-download-btn');

  closeBtn?.addEventListener('click', closeSharePopup);
  popup.addEventListener('click', (event) => {
    if (event.target === popup) {
      closeSharePopup();
    }
  });
  copyBtn?.addEventListener('click', copyShareLink);
  qrBtn?.addEventListener('click', () => {
    showShareQRCode();
  });
  downloadBtn?.addEventListener('click', downloadShareQR);
}

// ============ FAVORITES SYSTEM ============
function saveFavorites(subject, favorited) {
  localStorage.setItem(`fav_${subject}`, favorited);
}

function isFavorited(subject) {
  return localStorage.getItem(`fav_${subject}`) === 'true';
}

function updateStarUI(subject) {
  const star = document.querySelector(`.card-star[data-subject="${subject}"]`);
  if (!star) return;
  
  if (isFavorited(subject)) {
    star.classList.add('favorited');
    star.textContent = '★';
  } else {
    star.classList.remove('favorited');
    star.textContent = '☆';
  }
}

// ============ PROGRESS SYSTEM ============
function markVisited(subject) {
  localStorage.setItem(`visited_${subject}`, 'true');
  const badge = document.querySelector(`.progress-badge[data-subject="${subject}"]`);
  if (badge) badge.classList.add('visited');
}

function isVisited(subject) {
  return localStorage.getItem(`visited_${subject}`) === 'true';
}

// ============ NOTIFICATION SYSTEM ============
function showNotification(message) {
  const toast = document.querySelector('.sn-notif-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// Robust back navigation used by back buttons across pages.
// If browser history allows, go back. Otherwise fall back to the provided parent page.
function goBack(fallback) {
  try {
    const currentHref = location.href;

    // If there is a same-origin referrer we prefer history.back()
    if (document.referrer) {
      try {
        const ref = new URL(document.referrer);
        if (ref.origin === location.origin) {
          history.back();
          // If back didn't navigate within 350ms, navigate to fallback.
          setTimeout(() => { if (location.href === currentHref) window.location.href = fallback; }, 350);
          return;
        }
      } catch (err) {
        // ignore URL parsing errors and continue
      }
    }

    // If there is history length usable, attempt to go back once.
    if (window.history && window.history.length > 1) {
      history.back();
      setTimeout(() => { if (location.href === currentHref) window.location.href = fallback; }, 350);
      return;
    }

    // No history -> direct navigation to fallback.
    window.location.href = fallback;
  } catch (err) {
    // On any unexpected error, ensure the user still lands on the fallback page.
    window.location.href = fallback;
  }
}

document.addEventListener('DOMContentLoaded', ()=> {
  const hoverTone = (()=> {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return () => {};
    const audioCtx = new AudioContext();

    return () => {
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = 760;
      gain.gain.value = 0.011;
      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.05);
    };
  })();

  const buttonClickAnim = (btn) => {
    btn.classList.add('active');
    setTimeout(()=> btn.classList.remove('active'), 110);
  };

  const startBtn = document.querySelector('.start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', ()=> {
      const cards = document.getElementById('cards');
      if (cards) cards.scrollIntoView({ behavior:'smooth', block:'start' });
      buttonClickAnim(startBtn);
    });
    startBtn.addEventListener('mouseenter', ()=> hoverTone());
  }

  const buttons = document.querySelectorAll('.page-btn');
  buttons.forEach(b => {
    b.addEventListener('mouseenter', ()=> hoverTone());
    b.addEventListener('click', ()=> buttonClickAnim(b));
  });

  const cards = document.querySelectorAll('.card');
  cards.forEach((card, i)=> {
    card.style.animationDelay = `${i * 0.14 + 0.14}s`;
    
    // Initialize favorites and progress
    const subject = card.getAttribute('data-subject') || card.href.split('/').pop().replace('.html', '');
    updateStarUI(subject);
    if (isVisited(subject)) markVisited(subject);
    
    // Star click handler
    const star = card.querySelector('.card-star');
    if (star) {
      star.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const fav = !isFavorited(subject);
        saveFavorites(subject, fav);
        updateStarUI(subject);
        showNotification(fav ? `⭐ تم حفظ ${subject}` : `✖️ تم إزالة ${subject}`);
      });
    }
    
    // Mark as visited when clicking card
    card.addEventListener('click', () => {
      markVisited(subject);
      saveLastSubject(subject); // Save for continue learning
    });
  });

  const fadeElements = document.querySelectorAll('.container, .subject-card, .title-wrap, .card');
  fadeElements.forEach((el, i) => {
    el.classList.add('animate-fade');
    el.style.animationDelay = `${i * 0.05}s`;
  });

  createParticleCanvas();
  createAppExtras();
  initSharePopup();
  
  // Initialize new features
  updateContinueSection(); // Show continue learning section
  initSubjectPage(); // Initialize subject page features

  // Setup share button
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', shareWebsite);
  }

  // Setup search
  setupSearch();
});

function createParticleCanvas() {
  const canvas = document.createElement('canvas');
  canvas.className = 'particles-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const particles = Array.from({ length: 70 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2.2 + 0.8,
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2,
    alpha: Math.random() * 0.38 + 0.12
  }));

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  window.addEventListener('resize', resize);
  resize();

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(152, 210, 255, ${p.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  };

  draw();
}

function createAppExtras() {
  const markup = `
    <button class="sn-bell" type="button" aria-label="Notifications">
      🔔<span class="sn-notif-badge"></span>
    </button>
    <section class="sn-notif-panel" aria-live="polite">
      <div class="sn-notif-header">
        <span>Notifications</span>
        <button type="button" class="sn-notif-clear">Clear</button>
      </div>
      <div class="sn-notif-list"></div>
    </section>
    <div class="sn-notif-toast" aria-live="assertive"></div>
    <button class="main-fab" type="button" onclick="toggleMenu()" aria-label="Open menu" aria-expanded="false">🤖</button>
    <div class="fab-menu" id="fabMenu">
      <button class="fab-item" type="button" onclick="openChat()" title="Open chat" aria-label="Open chat">💬</button>
      <button class="fab-item" type="button" onclick="openWhatsApp()" title="Contact instructor" aria-label="Contact instructor">📞</button>
      <button class="fab-item" type="button" onclick="openGroup()" title="Join WhatsApp group" aria-label="Join WhatsApp group">🟢</button>
      <a class="fab-item" href="https://discord.gg/xC9jSNk92" target="_blank" rel="noopener noreferrer" title="Join Discord" aria-label="Join Discord">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M19.27 5.33A17.8 17.8 0 0 0 15.82 4a.1.1 0 0 0-.1.05c-.34.6-.72 1.38-.98 2.01a16.5 16.5 0 0 0-4.95 0A11.6 11.6 0 0 0 8.8 4.05a.1.1 0 0 0-.1-.05 17.8 17.8 0 0 0-3.45 1.33 12.6 12.6 0 0 0-2.2 8.88 16.4 16.4 0 0 0 5.04 2.54.11.11 0 0 0 .12-.04c.39-.53.73-1.09.97-1.67a.1.1 0 0 0-.05-.12 10.7 10.7 0 0 1-1.58-.75.1.1 0 0 1-.01-.16l.12-.1a.1.1 0 0 1 .1-.02c3.33.95 6.92.95 10.22 0a.1.1 0 0 1 .1.02l.12.1a.1.1 0 0 1-.01.16 10.3 10.3 0 0 1-1.58.75.1.1 0 0 0-.05.12c.25.58.59 1.14.98 1.67a.1.1 0 0 0 .12.04 16.4 16.4 0 0 0 5.04-2.54 12.6 12.6 0 0 0-2.2-8.88ZM9.3 14.52c-.98 0-1.78-.9-1.78-2.01s.79-2.01 1.78-2.01c1 0 1.8.9 1.8 2.01s-.8 2.01-1.8 2.01Zm5.4 0c-.98 0-1.78-.9-1.78-2.01s.79-2.01 1.78-2.01c1 0 1.8.9 1.8 2.01s-.8 2.01-1.8 2.01Z"/>
        </svg>
      </a>
      <a class="fab-item" href="https://kick.com/isaac-hany" target="_blank" rel="noopener noreferrer" title="Visit Kick" aria-label="Visit Kick">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M6.75 3h10.5A2.75 2.75 0 0 1 20 5.75v12.5A2.75 2.75 0 0 1 17.25 21H6.75A2.75 2.75 0 0 1 4 18.25V5.75A2.75 2.75 0 0 1 6.75 3Zm1.5 3.25a.75.75 0 0 0-.75.75v6.5c0 .41.34.75.75.75h1.5V18a.75.75 0 0 0 1.5 0v-4.5h1.5a.75.75 0 0 0 0-1.5H11V7.25h-2.75Zm5.25 0a.75.75 0 0 0 0 1.5h1.5v6.5h-1.5a.75.75 0 0 0 0 1.5h2.25a.75.75 0 0 0 .75-.75V7.25a.75.75 0 0 0-.75-.75h-2.25Z"/>
        </svg>
      </a>
    </div>

    <aside class="chat-box" hidden role="dialog" aria-label="SuperNova chat">
      <div class="sn-chat-header">
        <span>SuperNova Assistant</span>
        <button type="button" class="sn-chat-close">×</button>
      </div>
      <div class="sn-chat-messages"></div>
      <form class="sn-chat-form">
        <input type="text" placeholder="Ask about AI, PDF or Programming..." aria-label="Chat message" autocomplete="off" />
        <button type="submit">Send</button>
      </form>
    </aside>
  `;

  document.body.insertAdjacentHTML('beforeend', markup);

  const notifications = [
    { text: '📢 C++ Exam', subtitle: 'There is a C++ exam on Saturday at 8:00 PM.' },
    { text: 'تم إضافة محاضرة جديدة', time: 'اليوم' },
    { text: 'تم تحديث الموقع', time: 'قبل ساعة' },
    { title: '📚 LMS System', text: 'ادخل على منصة الكلية من هنا', href: 'https://lms.lum.edu.eg/' },
    { title: '🧾 SIS System', text: 'ادخل على نظام الطلاب من هنا', href: 'https://sis.lum.edu.eg/Default.aspx' }
  ];

  const bell = document.querySelector('.sn-bell');
  const panel = document.querySelector('.sn-notif-panel');
  const list = document.querySelector('.sn-notif-list');
  const badge = document.querySelector('.sn-notif-badge');
  const toast = document.querySelector('.sn-notif-toast');
  const clearBtn = document.querySelector('.sn-notif-clear');
  const fabMenu = document.getElementById('fabMenu');
  const mainFab = document.querySelector('.main-fab');
  const chatPanel = document.querySelector('.chat-box');
  const chatClose = document.querySelector('.sn-chat-close');
  const chatMessages = document.querySelector('.sn-chat-messages');
  const chatForm = document.querySelector('.sn-chat-form');
  const chatInput = chatForm.querySelector('input');

  let unread = notifications.length;

  const updateBadge = () => {
    badge.style.opacity = unread > 0 ? '1' : '0';
  };

  const buildNotifications = () => {
    list.innerHTML = notifications.map(item => {
      if (item.href) {
        return `
          <div class="sn-notif-item">
            <a href="${item.href}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none; display: block; width: 100%;">
              ${item.title ? `<strong>${item.title}</strong><br>` : ''}${item.text}
            </a>
          </div>
        `;
      }
      return `
        <div class="sn-notif-item">
          <div>${item.text}</div>
          ${item.subtitle ? `<div style="font-size: 0.9rem; color: rgba(255,255,255,0.6); margin-top: 0.3rem;">${item.subtitle}</div>` : ''}
        </div>
      `;
    }).join('');
  };

  const showToast = (text) => {
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4200);
  };

  const openPanel = () => {
    panel.classList.add('open');
    panel.removeAttribute('hidden');
  };

  const closePanel = () => {
    panel.classList.remove('open');
    setTimeout(() => panel.setAttribute('hidden', 'true'), 250);
  };

  const openChat = () => {
    chatPanel.classList.add('active');
    chatPanel.removeAttribute('hidden');
    if (!chatMessages.querySelector('.sn-chat-msg')) {
      appendBot('ازيك يا باشا! اسألني عن المواد او الكورسات.');
    }
  };

  const closeChat = () => {
    chatPanel.classList.remove('active');
    setTimeout(() => chatPanel.setAttribute('hidden', 'true'), 220);
  };

  const appendMessage = (text, type) => {
    const el = document.createElement('div');
    el.className = `sn-chat-msg ${type}`;
    el.textContent = text;
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const appendBot = (text) => appendMessage(text, 'bot');
  const appendUser = (text) => appendMessage(text, 'user');

  const badWords = [
    'غبي', 'حمار', 'اهبل', 'تافه'
  ];

  const containsBadLanguage = (text) => {
    const normalized = text.toLowerCase();
    return badWords.some((word) => normalized.includes(word));
  };

  function getBotReply(message) {
    const lower = message.toLowerCase().trim();

    if (containsBadLanguage(lower)) {
      return 'لو سمحت يا باشا نتكلم باحترام 🙏';
    }

    if (lower.includes('ازيك') || lower.includes('عامل ايه') || lower.includes('اخبارك') || lower.includes('السلام') || lower.includes('سلام')) {
      const greetings = [
        'تمام يا باشا 😄 عامل ايه؟',
        'كله تمام، اخبارك ايه؟'
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (lower.includes('فيديو') || lower.includes('فيديوهات') || lower.includes('شرح')) {
      return 'هتلاقي الفيديوهات في قسم الكورسات';
    }

    if (lower.includes('pdf') || lower.includes('بي دي اف') || lower.includes('ملازم')) {
      return 'الـ PDF موجودة تحت كل درس';
    }

    if (lower.includes('مواد') || lower.includes('كورسات') || lower.includes('مقررات')) {
      return 'المواد في الصفحة الرئيسية';
    }

    if (lower.includes('اشرح') || lower.includes('حل') || lower.includes('سؤال') || lower.includes('مسألة') || lower.includes('واجب')) {
      return 'بص يا باشا، متعتمدش على إجابتي 100%، أنا باشمهندس كيرو مبرمجني أساعد بس 😅';
    }

    return 'مش فاهمك اوي 😅 ممكن توضح؟';
  };

  const handleChatSubmit = (event) => {
    event.preventDefault();
    const value = chatInput.value.trim();
    if (!value) return;
    appendUser(value);
    chatInput.value = '';
    chatForm.querySelector('button').disabled = true;
    const reply = getBotReply(value);
    appendBot(reply);
    chatForm.querySelector('button').disabled = false;
  };

  bell.addEventListener('click', (event) => {
    event.stopPropagation();
    if (panel.classList.contains('open')) {
      closePanel();
    } else {
      openPanel();
      unread = 0;
      updateBadge();
    }
  });

  clearBtn.addEventListener('click', () => {
    const items = list.querySelectorAll('.sn-notif-item');
    items.forEach((item, index) => {
      setTimeout(() => {
        item.style.transition = 'opacity 0.22s ease';
        item.style.opacity = '0';
      }, index * 40);
    });
    setTimeout(() => {
      const allCleared = notifications.length === 0;
      list.innerHTML = allCleared ? `<div class="sn-notif-item" style="text-align: center; color: rgba(255,255,255,0.6);">No notifications.</div>` : `<div class="sn-notif-item" style="text-align: center; color: rgba(255,255,255,0.6);">🎉 You're all caught up!</div>`;
      list.firstChild.style.opacity = '0';
      list.firstChild.style.transition = 'opacity 0.24s ease';
      setTimeout(() => {
        list.firstChild.style.opacity = '1';
      }, 10);
    }, items.length * 40 + 100);
    unread = 0;
    updateBadge();
  });

  document.addEventListener('click', (event) => {
    if (!panel.contains(event.target) && !bell.contains(event.target)) {
      closePanel();
    }
    if (!fabMenu.contains(event.target) && !mainFab.contains(event.target)) {
      fabMenu.classList.remove('active');
      mainFab.classList.remove('active');
      mainFab.setAttribute('aria-expanded', 'false');
    }
  });

  chatClose.addEventListener('click', closeChat);
  chatForm.addEventListener('submit', handleChatSubmit);

  buildNotifications();
  updateBadge();
  setTimeout(() => showToast(notifications[0].text), 900);

  window.toggleMenu = () => {
    const isActive = fabMenu.classList.toggle('active');
    mainFab.classList.toggle('active', isActive);
    mainFab.setAttribute('aria-expanded', String(isActive));
  };

  window.openChat = () => {
    fabMenu.classList.remove('active');
    mainFab.classList.remove('active');
    mainFab.setAttribute('aria-expanded', 'false');
    openChat();
  };

  window.openWhatsApp = () => {
    fabMenu.classList.remove('active');
    mainFab.classList.remove('active');
    mainFab.setAttribute('aria-expanded', 'false');
    window.open('https://wa.me/201233376886', '_blank');
  };

  window.openGroup = () => {
    fabMenu.classList.remove('active');
    mainFab.classList.remove('active');
    mainFab.setAttribute('aria-expanded', 'false');
    window.open('https://chat.whatsapp.com/HYqnGTqnTzCGi42uerhz5U', '_blank');
  };
}


