# sndUtils.js

벨루가 프로그래밍을 위한 JavaScript 유틸리티 라이브러리입니다.
설문 문항의 선택지 관리, 조건부 표시, 유효성 검사 등의 기능을 제공합니다.

## ✨ 주요 기능

- 🔀 **선택지 랜덤화**: 그룹별 선택지 순서 무작위 배치
- 👁️ **조건부 표시**: 조건에 따른 선택지 숨김/표시
- 🚫 **선택지 비활성화**: 동적 선택지 활성화/비활성화
- 📍 **위치 조정**: 선택지 위치 동적 변경
- 🔗 **순서 동기화**: 문항 간 선택지 순서 동기화
- 📊 **평가형 문항**: 리커트 척도 커스터마이징
- 🔤 **텍스트 치환**: 동적 텍스트 교체
- ✅ **유효성 검사**: 커스텀 검증 로직
- ⚡ **상호 배타**: 선택지 간 배타적 선택

### 기본 유틸리티

#### `between(start, end)`

연속된 숫자 배열을 생성합니다.

```javascript
const numbers = between(1, 5); // [1, 2, 3, 4, 5]
```

**매개변수:**

- `start` (number): 시작값
- `end` (number): 끝값

**반환값:** `Array<number>` - 연속된 숫자 배열

---

### 선택지 관리

#### `groupRotation(optionGroups, config, qnum)`

선택지를 그룹별로 랜덤화합니다.

```javascript
// 기본 사용법
groupRotation([
  [1, 2, 3],
  [4, 5, 6],
]);

// Config
groupRotation(
  [
    [1, 2],
    [3, 4],
  ],
  {
    group: true, // 그룹 간 순서 랜덤화
    option: true, // 그룹 내 선택지 랜덤화
    top: [7], // 최상단 고정 선택지
    topShuffle: false, // 최상단 선택지 순서 고정
    bot: [8, 9], // 최하단 고정 선택지
    botShuffle: true, // 최하단 선택지 순서 랜덤화
  }
);
```

**매개변수:**

- `optionGroups` (Array<Array<number>>): 회전할 선택지 그룹들
- `config` (Object): 회전 설정 옵션
- `qnum` (number|null): 대상 문항 번호 (null일 경우 현재 문항)

#### `hide(options, cond, qnum)` / `show(options, cond, qnum)`

조건에 따라 선택지를 숨기거나 표시합니다.

```javascript
// 선택지 1, 2를 숨김
hide([1, 2], true);

// 조건부 표시
const shouldShow = checkCondition();
show([3, 4], shouldShow);
```

#### `disabled(options, cond, qnum)`

선택지를 비활성화하거나 활성화합니다.

```javascript
// 선택지 비활성화
disabled([1, 2, 3], true);

// CSS 선택자로도 가능
disabled('.special-option', true);
```

---

### 위치 조정

#### `nextTo(baseCode, appendCodes, qnum)`

선택지를 기준 선택지 바로 뒤로 이동시킵니다.

```javascript
// 선택지 3, 4를 선택지 1 뒤로 이동
nextTo(1, [3, 4]);
```

#### `beforeTo(baseCode, appendCodes, qnum)`

선택지를 기준 선택지 바로 앞으로 이동시킵니다.

```javascript
// 선택지 5, 6을 선택지 2 앞으로 이동
beforeTo(2, [5, 6]);
```

#### `topPosition(appendCodes, qnum)`

선택지를 문항의 최상단으로 이동시킵니다.

```javascript
// 선택지 7, 8을 최상단으로 이동
topPosition([7, 8]);
```

---

### 고급 기능

#### `sameRotationOrder(setRotationBase, excludeNumbers)`

기준 문항의 선택지 순서와 동일하게 파이핑 문항들의 순서를 맞춥니다.

```javascript
// Q1의 순서를 기준으로 파이핑 문항들 순서 동기화
// Q3, Q5는 제외
sameRotationOrder(1, [3, 5]);
```

#### `shuffleBy(baseQid, qnum)`

기준 문항의 선택지 순서에 따라 대상 문항의 순서를 맞춥니다.

```javascript
// Q2의 선택지 순서를 Q1과 동일하게 설정
shuffleBy(1, 2);
```

#### `ratingHandler(options)` / `rating(options)`

평가형 문항(리커트 척도)의 표시 방식을 설정합니다.

```javascript
// 척도 순서 역순 + 점수 표시
rating({
  reverse: true,
  showValue: true,
  format: '%d점',
});

// 특정 문항들에 적용
ratingHandler({
  reverse: true,
  qNum: [1, 2, 3],
});
```

#### `replaceText(replacements, qnum)`

문항 내 텍스트를 동적으로 치환합니다.

```javascript
// 단순 치환
replaceText({
  name: '홍길동',
  age: '25',
});

// 조건부 치환
replaceText({
  gender: {
    남성: isMan,
    여성: !isMan,
  },
});
```

#### `thisOrThat(groups, qnum)`

선택지 간 상호 배타적 선택을 설정합니다.

```javascript
// 배타적 그룹 (하나만 선택 가능)
thisOrThat({
  exclusive1: [1, 2, 3],
  exclusive2: [4, 5, 6],
});

// 쌍별 배타 (A그룹과 B그룹 중 하나씩만)
thisOrThat({
  pairGroup: [
    [1, 2],
    [3, 4],
  ],
});
```

---

### 유효성 검사

#### `validate(fn, target)`

문항에 대한 커스텀 유효성 검사를 설정합니다.

```javascript
validate(() => {
  const checkedCount = getCheckedCount();
  if (checkedCount < 2) {
    return err('최소 2개 이상 선택해주세요.');
  }
  return true; // 검증 통과
});
```

#### `hangle(qnum)`

텍스트 입력에서 자음/모음 입력을 검사합니다.

```javascript
// 현재 문항의 텍스트 입력 검증
hangle();

// 특정 문항 검증
hangle(5);
```

#### `err(msg)` / `softErr(msg)`

에러 메시지를 표시합니다.

```javascript
// 일반 에러 (항상 표시)
err('필수 항목을 선택해주세요.');

// 소프트 에러 (첫 번째만 표시)
softErr('권장 사항입니다.');
```

#### `exec(fn)` / `cond(fn)`

함수를 안전하게 실행합니다.

```javascript
// 에러 발생 시에도 계속 진행
exec(() => {
  // 실행할 코드
});

// 조건 함수 실행
const result = cond(() => {
  return someCondition();
});
```
