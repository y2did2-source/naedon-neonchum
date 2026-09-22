/* ------------------------------------------------------------------
   공통 동작: D-day, 오픈톡 링크, 주소 복사, 지도 링크, 내비 강조, 연도
   설계: 요구사항/01_HTML설계.md §8
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  var cfg = window.NDNC_CONFIG || {};
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  /* 1. D-day ------------------------------------------------------- */
  var ddayEl = document.querySelector('[data-dday]');
  if (ddayEl && cfg.startsAt) {
    var start = new Date(cfg.startsAt);
    var end = cfg.endsAt ? new Date(cfg.endsAt) : new Date(start.getTime() + 4 * 3600 * 1000);
    var now = new Date();

    if (!isNaN(start.getTime())) {
      var KST = 9 * 3600 * 1000;
      var DAY = 24 * 3600 * 1000;
      var dayOf = function (d) { return Math.floor((d.getTime() + KST) / DAY); };
      var diff = dayOf(start) - dayOf(now);
      var text;

      if (now >= end) text = '이번 회차는 끝났어요. 다음에 또!';
      else if (now >= start) text = '지금 한창 진행 중!';
      else if (diff === 0) text = 'D-DAY · 오늘 밤 8시';
      else text = 'D-' + diff;

      ddayEl.textContent = text;
      ddayEl.hidden = false;
    }
  }

  /* 2. 오픈톡 링크 -------------------------------------------------- */
  each(document.querySelectorAll('[data-opentalk]'), function (a) {
    if (cfg.openTalkUrl) {
      a.href = cfg.openTalkUrl;
    } else {
      var target = a.parentNode && a.parentNode.tagName === 'LI' ? a.parentNode : a;
      target.hidden = true;
    }
  });

  /* 3. 주소 복사 ---------------------------------------------------- */
  var copyBtn = document.querySelector('[data-copy-address]');
  if (copyBtn && cfg.address) {
    var fallback = function () { window.prompt('주소를 길게 눌러 복사하세요', cfg.address); };
    copyBtn.addEventListener('click', function () {
      var original = copyBtn.textContent;
      var done = function () {
        copyBtn.textContent = '복사했어요!';
        setTimeout(function () { copyBtn.textContent = original; }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cfg.address).then(done, fallback);
      } else {
        fallback();
      }
    });
  }

  /* 4. 지도 링크 ---------------------------------------------------- */
  if (cfg.address) {
    var q = encodeURIComponent(cfg.address);
    each(document.querySelectorAll('[data-map]'), function (a) {
      var kind = a.getAttribute('data-map');
      if (kind === 'kakao') a.href = 'https://map.kakao.com/link/search/' + q;
      if (kind === 'naver') a.href = 'https://map.naver.com/p/search/' + q;
    });
  }

  /* 5. 내비 현재 섹션 강조 ------------------------------------------ */
  var navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    each(navLinks, function (a) { byId[a.getAttribute('href').slice(1)] = a; });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        each(navLinks, function (a) { a.classList.remove('is-active'); });
        var link = byId[entry.target.id];
        if (link) link.classList.add('is-active');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* 6. 연도 --------------------------------------------------------- */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
