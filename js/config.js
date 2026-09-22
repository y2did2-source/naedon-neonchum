/* ------------------------------------------------------------------
   내돈넌춤 회차별 설정 — 회차가 바뀌면 이 파일과 index.html만 고친다.
   설계: 요구사항/01_HTML설계.md §8
   ------------------------------------------------------------------ */
window.NDNC_CONFIG = {
  // 시트의 event 컬럼에 기록되는 회차 식별자
  eventId: "18",
  eventTitle: "제18회 내돈넌춤",

  // D-day 계산용 (한국 시간)
  startsAt: "2026-10-04T20:00:00+09:00",
  endsAt: "2026-10-05T00:00:00+09:00",

  // 장소 (주소 복사, 지도 링크에 사용)
  placeName: "원네이션 A룸",
  address: "제주시 광양6길 10",

  // 카카오 오픈톡 링크. 비워 두면 오픈톡 버튼이 숨겨진다.
  openTalkUrl: "",

  // Google Apps Script 웹앱 URL (…/exec). 비워 두면 설문 전송이 비활성된다.
  // 배포 절차: 요구사항/01_HTML설계.md §7.4
  surveyEndpoint: "https://script.google.com/macros/s/AKfycbx_xkrINeJ9lfpQUnJ3jl0-m54EBdcH6ilM3k4X93Q4kqtoKGgKqh8pOx5h9M3yB6Bz/exec",

  // 참석 예정 인원 집계 표시 여부 (doGet 호출)
  showCount: true
};
