/* ============================================
   전자책 인터랙션 스크립트
   페이지 넘기기, 목차, 다크모드, 진행률, 폰트 크기
   ============================================ */

(function () {
  'use strict';

  // ── DOM 요소 캐싱 ──
  const pages = document.querySelectorAll('.page');
  const totalPages = pages.length;
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const pageIndicator = document.getElementById('pageIndicator');
  const progressFill = document.getElementById('progressFill');
  const tocToggle = document.getElementById('tocToggle');
  const tocSidebar = document.getElementById('tocSidebar');
  const tocClose = document.getElementById('tocClose');
  const tocOverlay = document.getElementById('tocOverlay');
  const tocLinks = document.querySelectorAll('.toc-link');
  const tocPageLinks = document.querySelectorAll('.toc-page-link');
  const themeToggle = document.getElementById('themeToggle');
  const fontDecrease = document.getElementById('fontDecrease');
  const fontIncrease = document.getElementById('fontIncrease');

  // ── 상태 변수 ──
  let currentPage = 0;
  let isAnimating = false;
  const fontSizes = ['font-small', '', 'font-large', 'font-xlarge'];
  let fontIndex = 1;

  // ── 페이지 이동 함수 ──
  function goToPage(targetPage, direction) {
    if (targetPage < 0 || targetPage >= totalPages || targetPage === currentPage || isAnimating) return;
    isAnimating = true;

    const currentEl = pages[currentPage];
    const targetEl = pages[targetPage];
    const dir = direction || (targetPage > currentPage ? 'next' : 'prev');

    currentEl.classList.remove('active');
    currentEl.classList.add(dir === 'next' ? 'exit-left' : 'exit-right');

    targetEl.style.transition = 'none';
    targetEl.classList.remove('exit-left', 'exit-right');
    targetEl.style.transform = dir === 'next' ? 'translateX(60px)' : 'translateX(-60px)';
    targetEl.style.opacity = '0';

    targetEl.offsetHeight;
    targetEl.style.transition = '';
    targetEl.classList.add('active');
    targetEl.style.transform = '';
    targetEl.style.opacity = '';

    currentPage = targetPage;
    updateUI();
    targetEl.scrollTop = 0;

    setTimeout(() => {
      currentEl.classList.remove('exit-left', 'exit-right');
      isAnimating = false;
    }, 500);
  }

  // ── UI 업데이트 ──
  function updateUI() {
    pageIndicator.textContent = `${currentPage + 1} / ${totalPages}`;
    const progress = ((currentPage + 1) / totalPages) * 100;
    progressFill.style.width = progress + '%';
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage === totalPages - 1;
    tocLinks.forEach(link => {
      link.classList.toggle('active', parseInt(link.dataset.page) === currentPage);
    });
  }

  // ── 목차 사이드바 토글 ──
  function openToc() {
    tocSidebar.classList.add('open');
    tocOverlay.classList.add('show');
  }

  function closeToc() {
    tocSidebar.classList.remove('open');
    tocOverlay.classList.remove('show');
  }

  // ── 다크모드 토글 ──
  function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('ebook-theme', isDark ? 'light' : 'dark');
  }

  // ── 폰트 크기 조절 ──
  function changeFontSize(delta) {
    if (fontSizes[fontIndex]) {
      document.body.classList.remove(fontSizes[fontIndex]);
    }
    fontIndex = Math.max(0, Math.min(fontSizes.length - 1, fontIndex + delta));
    if (fontSizes[fontIndex]) {
      document.body.classList.add(fontSizes[fontIndex]);
    }
    localStorage.setItem('ebook-font-index', fontIndex);
  }

  // ── 저장된 설정 복원 ──
  function restoreSettings() {
    const savedTheme = localStorage.getItem('ebook-theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    const savedFont = localStorage.getItem('ebook-font-index');
    if (savedFont !== null) {
      fontIndex = parseInt(savedFont);
      if (fontSizes[fontIndex]) {
        document.body.classList.add(fontSizes[fontIndex]);
      }
    }
  }

  // ── 이벤트 바인딩 ──
  prevBtn.addEventListener('click', () => goToPage(currentPage - 1, 'prev'));
  nextBtn.addEventListener('click', () => goToPage(currentPage + 1, 'next'));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      goToPage(currentPage - 1, 'prev');
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      goToPage(currentPage + 1, 'next');
    } else if (e.key === 'Escape') {
      closeToc();
    }
  });

  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const diffX = e.changedTouches[0].screenX - touchStartX;
    const diffY = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 60) {
      if (diffX < 0) {
        goToPage(currentPage + 1, 'next');
      } else {
        goToPage(currentPage - 1, 'prev');
      }
    }
  }, { passive: true });

  tocToggle.addEventListener('click', openToc);
  tocClose.addEventListener('click', closeToc);
  tocOverlay.addEventListener('click', closeToc);

  tocLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = parseInt(link.dataset.page);
      goToPage(targetPage);
      closeToc();
    });
  });

  tocPageLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = parseInt(link.dataset.page);
      goToPage(targetPage);
    });
  });

  themeToggle.addEventListener('click', toggleTheme);
  fontDecrease.addEventListener('click', () => changeFontSize(-1));
  fontIncrease.addEventListener('click', () => changeFontSize(1));

  // ── 초기화 ──
  restoreSettings();
  updateUI();
})();
