# 하단 스크롤바 디버깅 가이드

## 1. 개발자 도구로 확인하기

### Electron 앱에서 개발자 도구 열기

- `Ctrl + Shift + I` (Windows/Linux)
- `Cmd + Option + I` (Mac)

### 확인할 사항들:

#### 1) 스크롤 컨테이너 찾기

개발자 도구에서 Elements 탭에서:

- `.horizontal-scrollbar` 클래스를 가진 요소 찾기
- 또는 `overflow-x: scroll` 스타일이 적용된 요소 찾기

#### 2) 스크롤 가능 여부 확인

Console 탭에서 다음 코드 실행:

```javascript
// 스크롤 컨테이너 찾기
const scrollContainer = document.querySelector('.horizontal-scrollbar');
if (scrollContainer) {
  console.log('컨테이너 너비:', scrollContainer.clientWidth);
  console.log('컨텐츠 너비:', scrollContainer.scrollWidth);
  console.log(
    '스크롤 가능:',
    scrollContainer.scrollWidth > scrollContainer.clientWidth
  );
  console.log('현재 스크롤 위치:', scrollContainer.scrollLeft);
  console.log(
    '최대 스크롤:',
    scrollContainer.scrollWidth - scrollContainer.clientWidth
  );
}
```

#### 3) CSS 적용 확인

Elements 탭에서 `.horizontal-scrollbar` 요소 선택 후:

- Computed 탭에서 `overflow-x` 값 확인 (should be `scroll`)
- `::-webkit-scrollbar` 스타일이 적용되었는지 확인

#### 4) 스크롤바 강제 표시 테스트

Console에서:

```javascript
const container = document.querySelector('.horizontal-scrollbar');
if (container) {
  // 스크롤 가능하도록 컨텐츠 너비 늘리기
  container.style.width = '200%';
  // 또는
  container.scrollLeft = 1;
  container.scrollLeft = 0;
}
```

## 2. 일반적인 문제들

### 문제 1: 컨텐츠가 부모보다 작음

- **증상**: 스크롤바가 나타나지 않음
- **해결**: 디바이스가 충분히 많아야 스크롤 가능 (3개 이상 권장)

### 문제 2: 부모 컨테이너가 overflow-hidden

- **증상**: 스크롤바가 잘림
- **해결**: 부모의 overflow 설정 확인

### 문제 3: flex-wrap이 활성화됨

- **증상**: FLEX 레이아웃에서는 스크롤바가 필요 없음
- **해결**: 다른 레이아웃 모드 사용 (예: Horizontal)

### 문제 4: CSS가 적용되지 않음

- **증상**: 스크롤바가 기본 스타일로 보임
- **해결**:
  - 개발 서버 재시작
  - 브라우저 캐시 지우기
  - `!important`가 제대로 적용되었는지 확인

## 3. 빠른 테스트 방법

Console에서 다음 코드로 즉시 테스트:

```javascript
// 스크롤바 강제 표시
const test = document.querySelector('.horizontal-scrollbar');
if (test) {
  test.style.overflowX = 'scroll';
  test.style.width = '50%'; // 부모보다 작게 만들어서 스크롤 가능하게
  console.log('스크롤바 테스트 완료');
}
```

## 4. 체크리스트

- [ ] `.horizontal-scrollbar` 클래스가 적용된 요소가 있는가?
- [ ] `overflow-x: scroll`이 적용되었는가?
- [ ] 컨텐츠 너비(`scrollWidth`)가 컨테이너 너비(`clientWidth`)보다 큰가?
- [ ] 부모 컨테이너가 스크롤바를 가리지 않는가?
- [ ] FLEX 레이아웃이 아닌가? (FLEX는 스크롤 불필요)
- [ ] 개발 서버가 재시작되었는가?
- [ ] CSS 파일이 제대로 로드되었는가?
