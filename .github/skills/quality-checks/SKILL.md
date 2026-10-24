---
name: quality-checks
description: 이 프로젝트의 단위 테스트(Vitest), 린트(ESLint), 타입 검사(tsgo + astro check)를 실행합니다. 커밋, 푸시 또는 병합 전에 실패를 디버깅하기 위한 지침을 제공합니다. `npm run test:unit`, `npm run lint` 또는 `npm run typecheck:all`을 실행할 때 이 스킬을 사용하세요.
allowed-tools:
  - shell
---

# 품질 검사

이 스킬은 단일 Astro 애플리케이션(Astro 7 + Drizzle ORM/Node SQLite)에 대한 단위 테스트, 린트, 타입 검사를 실행합니다. 저장소 루트에서 `package.json`에 정의된 npm 명령을 실행하세요.

## 빠른 참고사항

| 검사 | 명령 | 사용 시기 |
|------------|----------------------------|-------------|
| 단위 테스트(Vitest) | `npm run test:unit` | 모든 데이터 레이어 / 변환 / 헬퍼 변경 후 |
| 린트(ESLint) | `npm run lint` | 모든 TypeScript 또는 Astro 변경 후 |
| 타입 검사(tsgo + astro check) | `npm run typecheck:all` | 모든 TypeScript 또는 Astro 변경 후 |

모든 명령은 의존성이 설치되었다고 가정합니다(`npm ci`).

---

## 단위 테스트, 린트 및 타입 검사 실행

### 단위 테스트

```bash
npm run test:unit
```

- `db/**/*.test.ts` 및 `src/**/*.test.ts`에 대해 Vitest(`vitest run`)를 실행합니다.
- 인메모리 Node SQLite 데이터베이스에 대한 순수 시드/변환 함수 및 Drizzle 데이터 접근 헬퍼를 다룹니다.

### 린트

```bash
npm run lint
```

- 프로젝트의 모든 TypeScript 및 Astro 파일에 대해 ESLint를 실행합니다.
- 커밋 전에 오류 0개로 통과해야 합니다.

### 타입 검사

```bash
npm run typecheck:all
```

- `npm run typecheck`는 `tsconfig.tsgo.json`을 통해 순수 TypeScript(`db/`, `src/lib/`, `src/types/`, 설정, 테스트)에서 **TypeScript 7** 네이티브 컴파일러(`tsgo`, `@typescript/native-preview`에서)를 실행합니다(`--noEmit`).
- `npm run typecheck:astro`는 `astro sync`를 실행한 후 `.astro` 파일에 대해 `astro check`를 실행합니다(클래식 `typescript` 패키지).
- 타입 검사는 린팅과 독립적입니다. `tsgo`는 ESLint에 영향을 주지 않으며, ESLint는 여전히 클래식 `typescript` 패키지를 사용합니다. 커밋 전에 둘 다 오류 0개로 통과해야 합니다.

---

## 디버깅 및 문제 해결

### 환경 / 설정 실패

**증상**: `command not found`, 누락된 모듈, 또는 `Cannot find package`.

```bash
npm ci
```

- Node 22.13+ 사용 가능 확인: `node --version`.
- 편집기/타입 오류가 누락된 생성 Astro 타입을 참조하는 경우 `npx astro sync`를 실행하세요.

---

### 데이터베이스 / 빌드 시간 데이터

**증상**: 빈 페이지, `no such table`, 또는 게임 페이지가 없는 빌드.

SQLite 데이터베이스는 `astro build` **전에** 마이그레이션되고 시드되어야 합니다. `prebuild` 및 `predev` npm 훅은 `npm run build` 또는 `npm run dev`를 사용할 때 `db/`의 TypeScript 마이그레이션 및 시드 작업을 자동으로 실행합니다. 데이터베이스를 직접 설정하려면:

```bash
npm run db:setup     # db:migrate + db:seed
```

- 데이터베이스는 `tailspin.db`(gitignored)에 있고 `db/games.csv`에서 재생성됩니다.
- 깨끗한 재빌드를 강제하려면: `rm -f tailspin.db && rm -rf dist && npm run build`.

---

### 단위 테스트 실패

**증상**: `npm run test:unit`에서 어설션 실패.

1. **실패한 어설션 읽기** — Vitest는 예상 vs 실제를 인라인으로 인쇄합니다.
2. **인메모리 데이터베이스**: 헬퍼 테스트는 새 `:memory:` Node SQLite 데이터베이스를 빌드하고, 마이그레이션을 실행하고, 테스트당 픽스처를 시드합니다. 스키마 변경이 반영되지 않으면 `npm run db:generate`로 마이그레이션을 재생성하세요.
3. **결정론**: 별 등급은 제목의 안정적인 해시(`ratingFromTitle`)에서 파생됩니다. `Math.random` 절대 금지. 불안정한 등급 어설션은 일반적으로 비결정론적 데이터가 발생했을 때입니다.

단일 파일 실행:

```bash
npx vitest run src/lib/games.test.ts
```

---

### 린트 실패

**증상**: `npm run lint`에서 ESLint 오류.

1. **안전한 문제 자동 수정**: `npm run lint -- --fix`.
2. **사용하지 않는 변수**: 의도적으로 사용하지 않는 식별자 앞에 `_`를 붙이세요.
3. **TypeScript 타입 오류**: 누락된 타입 주석을 추가하거나 잘못된 타입을 수정하세요.
4. **`--fix` 후 남은 오류**: 수동으로 해결하세요. 정당한 이유 없이 `eslint-disable`로 억제하지 마세요.

---

### 로컬 vs CI 차이

**증상**: 단위 테스트, 린트 또는 타입 검사가 로컬에서는 통과하지만 CI에서는 실패(또는 그 반대).

- **Node 버전 불일치**: CI는 현재 Node LTS 릴리스를 사용합니다.
- **데이터베이스 상태**: CI는 항상 깨끗한 시드에서 빌드합니다. 로컬에서 오래된 데이터를 의심하면 `tailspin.db`를 삭제하고 재빌드하세요.

---

## 검증 정책

### 커밋/병합 전에 단위 테스트, 린트, 타입 검사가 통과해야 합니다

- 변경사항을 커밋하기 전에 모든 기존 단위 테스트, 린트, 타입 검사가 통과해야 합니다
- 명시적 정당화 없이 단위 테스트를 건너뛰거나 비활성화하지 마세요
- 실패한 단위 테스트, 린트, 타입 검사는 병합을 차단합니다. 무시하지 말고 수정하세요
- 변경된 코드의 테스트만 아니라 전체 단위 테스트 스위트를 실행하세요
- 새로운 기능은 적절한 단위 테스트 커버리지와 함께 제공되어야 합니다

> [!NOTE]
> 이 스킬은 단위 테스트, 린트, 타입 검사를 **실행, 검증 및 디버깅**하는 것을 다룹니다. **단위 테스트 코드 작성 방법** — 구조, 픽스처, 명명, 품질 표준 — 지침 파일을 따르세요. 이것들이 단일 정보원입니다:
> - 단위 테스트(`**/*.test.ts`): [unit-tests.instructions.md](../../instructions/unit-tests.instructions.md)

---

## 커밋 전 체크리스트

1. 린트 실행(프론트엔드 파일이 변경된 경우): `npm run lint`
2. 타입 검사 실행(TypeScript / Astro 파일이 변경된 경우): `npm run typecheck:all`
3. 단위 테스트 실행(데이터 레이어 / 헬퍼가 변경된 경우): `npm run test:unit`
4. 새로운 기능이 적절한 단위 테스트 커버리지를 가지고 있는지 확인
5. 단위 테스트가 손상되지 않았거나, 건너뛰거나, 비활성화되지 않았는지 확인
