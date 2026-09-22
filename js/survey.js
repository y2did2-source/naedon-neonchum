/* ------------------------------------------------------------------
   참석 설문: 검증 → 전송(Google Apps Script) → 상태 표시 → 집계
   설계: 요구사항/01_HTML설계.md §6, §7
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  var cfg = window.NDNC_CONFIG || {};
  var form = document.getElementById('survey-form');
  var statusEl = document.getElementById('survey-status');
  if (!form || !statusEl) return;

  var submitBtn = form.querySelector('button[type="submit"]');
  var submitLabel = submitBtn ? submitBtn.textContent : '';
  var storageKey = 'ndnc-survey-' + (cfg.eventId || 'event');
  var renderedAt = Date.now();

  /* 이미 보냈는지 안내 (재전송은 허용) */
  try {
    if (window.localStorage && localStorage.getItem(storageKey)) {
      showStatus('이미 설문을 보내셨어요. 마음이 바뀌었다면 다시 보내도 괜찮아요.', 'info');
    }
  } catch (_) { /* 시크릿 모드 등에서 localStorage 접근 불가 */ }

  /* 제출 --------------------------------------------------------- */
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;

    // 봇 필터: honeypot에 값이 있거나 너무 빨리 제출하면 전송 없이 끝낸다.
    if (form.elements.website.value || Date.now() - renderedAt < 2000) {
      onSuccess();
      return;
    }

    if (!cfg.surveyEndpoint) {
      showStatus('아직 설문 접수 주소가 설정되지 않았어요. 오픈톡에 알려 주세요!', 'error');
      return;
    }

    var body = new URLSearchParams();
    body.set('event', cfg.eventId || '');
    body.set('attend', form.elements.attend.value);
    body.set('companions', form.elements.companions.value);
    body.set('dances', checkedValues('dances').join(', '));
    body.set('role', form.elements.role.value || '');
    body.set('music', form.elements.music.value.trim());
    body.set('message', form.elements.message.value.trim());

    setBusy(true);

    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 15000) : null;
    var options = { method: 'POST', body: body };   // Content-Type 헤더는 지정하지 않는다 (CORS preflight 방지)
    if (controller) options.signal = controller.signal;

    fetch(cfg.surveyEndpoint, options)
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (!json || !json.ok) throw new Error((json && json.error) || 'server');
        onSuccess();
      })
      .catch(function () {
        showStatus('전송에 실패했어요. 잠시 후 다시 시도하거나 오픈톡에 알려 주세요.', 'error');
      })
      .then(function () {
        if (timer) clearTimeout(timer);
        setBusy(false);
      });
  });

  /* 집계 --------------------------------------------------------- */
  loadCount();

  function loadCount() {
    var box = document.querySelector('[data-count]');
    if (!box || !cfg.showCount || !cfg.surveyEndpoint) return;

    var url = cfg.surveyEndpoint +
      (cfg.surveyEndpoint.indexOf('?') > -1 ? '&' : '?') +
      'event=' + encodeURIComponent(cfg.eventId || '');

    fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (!json || !json.ok) return;
        var going = (json.attend && json.attend['참석']) || 0;
        if (going <= 0) return;

        var valueEl = box.querySelector('[data-count-value]');
        var compEl = box.querySelector('[data-count-companions]');
        if (valueEl) valueEl.textContent = String(going);
        if (compEl) compEl.textContent = json.companions ? '(+ 동반 ' + json.companions + '명)' : '';
        box.hidden = false;
      })
      .catch(function () { /* 집계는 실패해도 조용히 넘어간다 */ });
  }

  /* 도우미 ------------------------------------------------------- */
  function onSuccess() {
    form.reset();
    renderedAt = Date.now();
    try { localStorage.setItem(storageKey, new Date().toISOString()); } catch (_) {}
    showStatus('고마워요! 설문이 접수됐어요. 10월 4일에 만나요.', 'success');
    loadCount();
  }

  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = 'status is-visible status--' + type;
  }

  function setBusy(busy) {
    form.classList.toggle('is-busy', busy);
    if (!submitBtn) return;
    submitBtn.disabled = busy;
    submitBtn.textContent = busy ? '보내는 중…' : submitLabel;
  }

  function checkedValues(name) {
    var nodes = form.querySelectorAll('input[name="' + name + '"]:checked');
    return Array.prototype.map.call(nodes, function (n) { return n.value; });
  }
})();
