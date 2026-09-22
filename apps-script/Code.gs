/**
 * 내돈넌춤 참석 설문 수집 — Google Apps Script (스프레드시트 종속 스크립트)
 * 설계: 요구사항/01_HTML설계.md §7
 *
 * 설치/배포 (최초 1회, y2did2@gmail.com 계정):
 *   1. 새 스프레드시트 "내돈넌춤 설문응답" → 확장 프로그램 → Apps Script
 *   2. 이 파일 내용을 Code.gs에 붙여넣고 저장
 *   3. 함수 setup 실행 → 권한 허용 → '응답' 시트와 헤더 생성 확인
 *   4. 배포 → 새 배포 → 웹 앱 → 실행: 나 / 액세스: 모든 사용자 → 배포
 *   5. 웹 앱 URL(…/exec)을 public_html/js/config.js 의 surveyEndpoint 에 기입
 *   ※ 코드 수정 후에는 배포 관리 → ✎ → 새 버전 → 배포 (URL 유지)
 */

var SHEET_NAME = '응답';
var HEADERS = ['timestamp', 'event', 'attend', 'companions', 'dances', 'role', 'music', 'message'];
var LIMITS = { event: 20, attend: 20, companions: 5, dances: 100, role: 20, music: 100, message: 500 };
var ATTEND_VALUES = ['참석', '아마도', '못 가요'];

/** 최초 1회 수동 실행: 시트 준비 + 권한 승인 */
function setup() {
  var sheet = getSheet_();
  Logger.log('준비 완료: ' + sheet.getParent().getName() + ' / ' + sheet.getName());
}

/** 설문 저장: POST (application/x-www-form-urlencoded) */
function doPost(e) {
  var p = (e && e.parameter) || {};
  try {
    // honeypot에 값이 있으면 봇 → 저장하지 않고 조용히 성공 응답
    if (p.website) return json_({ ok: true, skipped: true });

    var attend = clean_(p.attend, LIMITS.attend);
    if (ATTEND_VALUES.indexOf(attend) < 0) {
      return json_({ ok: false, error: 'attend required' });
    }

    var row = [
      new Date(),
      clean_(p.event, LIMITS.event),
      attend,
      clean_(p.companions, LIMITS.companions),
      clean_(p.dances, LIMITS.dances),
      clean_(p.role, LIMITS.role),
      clean_(p.music, LIMITS.music),
      clean_(p.message, LIMITS.message)
    ];

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      getSheet_().appendRow(row);
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

/** 집계 조회: GET ?event=18 → { ok, event, total, attend:{…}, companions } */
function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    var eventId = clean_(p.event, LIMITS.event);
    var values = getSheet_().getDataRange().getValues();
    var total = 0;
    var companions = 0;
    var attend = {};

    for (var i = 1; i < values.length; i++) {
      var r = values[i];
      if (eventId && String(r[1]) !== eventId) continue;
      total++;
      var a = String(r[2]);
      attend[a] = (attend[a] || 0) + 1;
      if (a === '참석') companions += Number(r[3]) || 0;
    }
    return json_({ ok: true, event: eventId, total: total, attend: attend, companions: companions });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

/* ---------- 내부 함수 ---------- */

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** 문자열 정리: 개행 제거, 길이 제한, 수식 주입 방지 */
function clean_(v, max) {
  v = (v === undefined || v === null) ? '' : String(v);
  v = v.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  if (max && v.length > max) v = v.slice(0, max);
  if (/^[=+\-@]/.test(v)) v = "'" + v;
  return v;
}
