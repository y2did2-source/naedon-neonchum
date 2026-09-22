# 내돈넌춤 홈페이지

제18회 내돈넌춤(2026-10-04 일요일) 안내 + 익명 참석 설문 페이지.
순수 HTML / CSS / JavaScript로 만들어 GitHub Pages에서 서비스한다.
설계 문서는 상위 폴더 `요구사항/`에 있다 (`01_HTML설계.md`, `02_표준스타일시트.md`).

- 사이트: https://y2did2-source.github.io/naedon-neonchum/
- 저장소: https://github.com/y2did2-source/naedon-neonchum (GitHub 계정 `y2did2-source` = y2did2@gmail.com)
- 푸시 전 `gh auth status`에서 활성 계정이 `y2did2-source`인지 확인. 아니면 `gh auth switch -u y2did2-source`.

## 로컬에서 보기

```
cd public_html
python -m http.server 8000
```
브라우저에서 http://localhost:8000 열기.

## 회차가 바뀔 때

1. `js/config.js` — `eventId`, `eventTitle`, `startsAt`/`endsAt`, `openTalkUrl`
2. `index.html` — `<title>`, description/OG, 히어로 회차·날짜, 행사 안내, 공지·Q&A
3. 커밋 → 푸시 → 1~2분 뒤 GitHub Pages 확인 → 오픈톡에 링크 공유

## 설문 → 구글 시트 연결 (최초 1회, y2did2@gmail.com)

1. 새 스프레드시트 `내돈넌춤 설문응답` 생성
2. 확장 프로그램 → Apps Script → `apps-script/Code.gs` 내용 붙여넣기 → 저장
3. `setup` 함수 실행 → 권한 허용
4. 배포 → 새 배포 → 웹 앱 → 실행: 나 / 액세스: 모든 사용자
5. 웹 앱 URL을 `js/config.js`의 `surveyEndpoint`에 기입 → 푸시

자세한 절차와 주의 사항은 `요구사항/01_HTML설계.md` §7.

## 파일

```
index.html            단일 페이지
css/style.css         표준 스타일시트
js/config.js          회차별 설정
js/main.js            D-day, 지도, 복사, 내비
js/survey.js          설문 전송·집계
img/favicon.svg
apps-script/Code.gs   구글 시트 연동 코드(배포용 원본)
```
