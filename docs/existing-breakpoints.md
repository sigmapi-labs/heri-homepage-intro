# 기존 HERi2go 인트로 브레이크포인트

분석 대상: [https://www.heri2go.com/](https://www.heri2go.com/)  
소스: `/assets/index-Db7vLd3t.css`, `/assets/index-BeyF1FH1.js`  
작성일: 2026-08-28

이 문서는 **현재 라이브 온보딩 인트로**가 반응형을 어떻게 나눴는지 정리한 것이다. 새 HTML을 넘길 때 같은 3단을 쓸지, 시안 기준으로 새로 잡을지 결정하는 기준용이다.

---

## 한 줄 요약

- 화면은 **Desktop / Tablet / Mobile** 3단이다.
- **레이아웃용 `@media`** 와 **보여주기/숨기기 유틸 클래스**를 따로 쓴다.
- 콘텐츠 최대 폭은 **1286px**, 좌우 패딩은 데스크톱 24px / 모바일 16px이다.
- 유틸은 `1023 / 599`, 레이아웃은 `1024 / 600`이라 **1px가 어긋난다.**

---

## 구간 정의

| 구간 | 실제 폭 | 역할 |
|---|---|---|
| Desktop | 1025px 이상이 레이아웃상 안전 | 히어로 890px 고정, 4열 그리드, 영상·QR 노출 |
| Tablet | 601–1024px | 히어로를 `68vw`로 줄이고, 그리드 구조는 유지한 채 타이포만 `clamp` |
| Mobile | 600px 이하 | 1열, 햄버거, 모바일 전용 이미지 |

약관 페이지(`policy-*`)는 유틸과 맞춰 **1023px**을 쓴다. 인트로 레이아웃 쿼리는 **1024px**을 쓴다.

---

## 유틸 클래스 (show / hide)

Quasar 스타일이다. CSS로 레이아웃을 접는 게 아니라, **DOM을 `display: none !important`로 통째로 숨긴다.**

| 클래스 | 보임 | 숨김 | 인트로에서 쓰는 곳 |
|---|---|---|---|
| `gt-sm` | 1024px 이상 | 1023px 이하 | 헤더 Sign Up / Sign In, 히어로 영상·캐릭터·사운드 버튼, Cost CTA(데스크톱), 앱 QR, “Scan a QR…” 문구 |
| `lt-md` | 1023px 이하 | 1024px 이상 | 햄버거, 모바일 메뉴, Cost CTA(모바일) |
| `lt-sm` | 599px 이하 | 600px 이상 | 히어로 모바일 이미지 `img_m_hero.png`, 푸터 모바일 SNS |
| `gt-xs` | 600px 이상 | 599px 이하 | 푸터 데스크톱 SNS |

정의 (라이브 CSS 그대로):

```css
@media (max-width: 1023px) {
  .gt-sm { display: none !important; }
}
@media (min-width: 1024px) {
  .lt-md { display: none !important; }
}
@media (min-width: 600px) {
  .lt-sm { display: none !important; }
}
@media (max-width: 599px) {
  .gt-xs { display: none !important; }
}
```

---

## 레이아웃 미디어쿼리 (인트로)

유틸과 달리 인트로 레이아웃은 **1024 / 600**이다.

사용 쿼리 목록:

| 쿼리 | 용도 |
|---|---|
| `@media (max-width: 1024px)` | 태블릿 + 모바일 공통 접힘 |
| `@media (min-width: 601px) and (max-width: 1024px)` | 태블릿만 |
| `@media (max-width: 600px)` | 모바일 본문 |
| `@media (max-width: 599px)` | 공지 팝업만. 인트로 본문과 거의 무관 |

### 1) `max-width: 1024px` — 태블릿 + 모바일 공통

- `.intro-page` 상단 블루 그라데이션 배경 제거
- 히어로: `100vw` 풀블리드 해제, 높이 `auto`
- Features가 히어로 위로 `-96px` 겹침
- Delivery / Cost: 2열 → 1열, 가운데 정렬, 상단 라운드
- Workflow 패딩 `100px 40px`

### 2) `min-width: 601px and max-width: 1024px` — 태블릿만

- 히어로 높이 `68vw`, 배경 `cover`
- 타이틀 · CTA · 카드 카피를 전부 `clamp(...)` 로 vw 연동
- Features 겹침을 `-14vw`로 재조정

### 3) `max-width: 600px` — 모바일

- 헤더 높이 56 → 48, 로고 22 → 20, 하단 보더 제거
- 히어로 높이 `clamp(680px, 180vw, 920px)`, 배경을 오른쪽 65%로 크롭
- Features 4열 그리드 → 세로 flex
- 사진 카드(`.intro-features__image`) 숨김
- 텍스트 카드는 정사각 + vw 폰트
- Global 말풍선 2열 그리드, 모바일 점선 지도
- 앱 배지 2열. QR은 `gt-sm`이라 모바일에서 없음
- 푸터 1열

### 4) `max-width: 599px`

- `.intro-notice-popup` 패딩/폰트만 조정

---

## 1px 어긋남

유틸과 레이아웃 쿼리의 경계가 다르다.

| 폭 | 레이아웃 쿼리 | 유틸 클래스 |
|---|---|---|
| 정확히 **1024px** | `max-width: 1024px`에 **걸림** (태블릿 레이아웃) | `gt-sm` **보임**, `lt-md` **숨김** → 햄버거 없고 데스크톱 버튼이 남음 |
| 정확히 **600px** | `max-width: 600px`에 **걸림** (모바일 레이아웃) | `lt-sm` **숨김** → 모바일 히어로 이미지가 안 나옴 |

창을 1024 / 600에 정확히 붙이는 일은 드물다. 새 HTML을 맞출 때는 **한쪽으로 통일**하는 것이 낫다.

권장:

- 유틸에 맞추려면 레이아웃도 `max-width: 1023px`, `max-width: 599px`
- 또는 레이아웃 `1024 / 600`에 유틸 경계를 맞추기

---

## 데스크톱 기본값 (미디어쿼리 밖)

```text
.intro-inner     max-width: 1286px / padding: 0 24px
.intro-header    height: 56px, position: absolute, 하단 보더 반투명 화이트
.intro-page      상단 그라데이션 100% × 890px
.intro-hero      height: 890px, 배경 img_hero.png 1920px
.intro-features__grid   4열
.intro-appdl     padding: 80px 24px
.intro-footer    padding: 70px 24px 40px
```

---

## 섹션별 동작

### 헤더

- 데스크톱: Sign Up / Sign In (`gt-sm`)
- 1023px 이하: 햄버거 + 드롭다운 (`lt-md`)
- 600px 이하: 높이·패딩만 축소

### 히어로

- 데스크톱: 고정 890px + 영상/캐릭터 (`gt-sm`)
- 태블릿: 같은 히어로 이미지를 `cover` + `68vw`
- 모바일: 전용 이미지 `img_m_hero.png` (`lt-sm`), 영상 없음

### 자랑 (Features)

- 데스크톱 4열
- 태블릿은 4열 유지, 카드만 축소
- 모바일은 사진 빼고 텍스트 카드만 세로

### Delivery / Cost

- 1024px 이하에서 2열 → 1열, 가운데 정렬

### 앱 다운로드

- QR과 “On desktop? Scan a QR…” 문구는 `gt-sm`
- **1023px 이하에서 QR이 사라진다.** 스토어 배지만 남음
- 600px 이하에서 배지는 2열 그리드, 높이 44px

### 푸터 SNS

- 600px 이상: `gt-xs` (데스크톱 아이콘)
- 599px 이하: `lt-sm` (모바일 아이콘 세트)

---

## 새 인트로 작업본과의 차이

현재 리뉴얼 HTML(`css/intro.css`)은 기존과 다른 경계를 쓴다.

| | 기존 라이브 | 현재 작업본 |
|---|---|---|
| 태블릿 | 1024 / 1023 | 960 |
| 모바일 | 600 / 599 | 640 |
| 유틸 클래스 | `gt-sm`, `lt-md`, `lt-sm`, `gt-xs` | 없음. `@media`만 사용 |

개발사에 넘기기 전에 둘 중 하나를 고른다.

1. 기존 3단(1024 / 600)과 유틸 클래스에 맞춘다.
2. 새 시안 기준으로 960 / 640을 유지하고, 문서에 “기존과 다름”을 명시한다.

---

## 참고: 라이브에서 실제로 걸린 쿼리 횟수

`index-Db7vLd3t.css` 기준.

| 쿼리 | 규칙 수 (파일 전체) |
|---|---|
| `max-width: 1024px` | 16 |
| `min-width: 601px and max-width: 1024px` | 10 |
| `max-width: 600px` | 45 |
| `max-width: 1023px` | 8 (유틸 + policy) |
| `min-width: 1024px` | 1 (`lt-md`) |
| `min-width: 600px` | 1 (`lt-sm`) |
| `max-width: 599px` | 3 (유틸 + 팝업 + policy) |
