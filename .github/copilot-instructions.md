# Tailspin Toys 크라우드펀딩 개발 가이드라인

게임 개발자 테마의 크라우드펀딩 플랫폼입니다. 이 애플리케이션은 **Astro 7** 단일 사이트(완전히 사전 렌더링된 정적 출력)로, **Tailwind CSS v4**로 스타일링되었습니다. 데이터는 **Drizzle ORM + Node.js의 기본 SQLite 드라이버**를 통해 빌드 시간에 접근하는 로컬 SQLite 데이터베이스에 저장됩니다. 페이지는 프론트매터에서 데이터베이스에 직접 쿼리하므로 별도의 백엔드 API나 클라이언트 측 UI 프레임워크가 없습니다. 기여할 때 다음 지침을 따르세요:

## 에이전트 주의사항

- 코드 생성을 시작하기 전에 프로젝트를 탐색하세요
- 긴 작업의 경우 할 일 목록을 작성하세요
  - 할 일 목록의 각 단계 전에 지침을 다시 읽어 올바른 방향인지 확인하세요
- 지침 파일을 이용할 수 있으면 항상 사용하고 코드 생성 전에 검토하세요
- 작업 완료 시 요약 마크다운 파일을 생성하지 마세요
- 스크립트 및 BASH 명령 실행 시 항상 절대 경로를 사용하세요
- **명시적 지시가 없는 한 절대로 main에 자동으로 커밋하거나 푸시하지 마세요**

## 코드 표준

### 각 커밋 전 필수 사항

#### 테스트 가이드라인

- **항상 `quality-checks` 스킬을 통해 단위 테스트, 린트, 타입 검사를 실행하세요.** 이 스킬은 `npm run test:unit`, `npm run lint`, `npm run typecheck:all`을 환경 설정, 순서 지정 및 문제 해결과 함께 래핑합니다. Playwright E2E 스위트는 `npm run test:e2e`로 직접 실행하세요. (앱을 수동으로 검증하기 위해 시작하는 것은 품질 검사가 아닙니다. 그럴 때는 `npm run dev`를 직접 실행하세요.)
- Vitest 단위 테스트를 실행하여 데이터 레이어와 변환을 검증하고, Playwright 테스트를 실행하여 E2E 및 프론트엔드 기능을 검증하세요
- 커밋 전에 ESLint를 실행하여 프론트엔드 코드 품질을 확인하세요
- 기존 테스트를 검토하여 중복 작업이 없는지 확인하세요
- 테스트 코드는 프로젝트의 나머지 부분과 같은 품질이어야 하며 DRY 원칙을 따라야 합니다
- 프론트엔드 변경의 경우 빌드(`npm run build`)를 검증하고 end-to-end 테스트(`npm run test:e2e`)를 직접 실행하여 모든 것이 제대로 작동하는지 확인하세요
- 데이터 레이어(스키마, 헬퍼, 변환)를 변경할 때는 해당 단위 테스트를 업데이트하고 실행하세요

#### 프로젝트 가이드라인

- 데이터베이스 스키마를 업데이트할 때 drizzle-kit 마이그레이션을 생성하고 커밋하세요(`npm run db:generate`)
- 새로운 기능을 추가할 때 README를 업데이트하세요
- 프로젝트 구조, 스크립트, 프로그래밍 가이드 등 관련된 모든 변경사항에 대해 Copilot Instructions 파일의 모든 지침을 업데이트하세요

### 코드 포맷팅 요구사항

- TypeScript를 사용하며 특히 데이터 레이어(`db/`, `src/lib/`)에서는 함수 매개변수와 반환값에 명시적 타입을 지정하세요
- 프론트엔드 코드(TypeScript, Astro)는 ESLint 검사를 통과해야 합니다(`npm run lint`)
- All new TypeScript should contain TSDocs comments for documentation purposes.

### 데이터 레이어 패턴 (Drizzle + Node SQLite)

- `db/schema.ts`에서 테이블을 정의하고 drizzle-kit 마이그레이션으로 스키마 변경을 관리하세요 - `drizzle.instructions.md` 참고
- `src/lib/`에서 **주입 가능한 `db`** 인수를 가진 데이터 접근 헬퍼를 유지하여 테스트 가능하게 하세요
- CSV/시드 로직을 `db/transforms.ts`의 순수 함수로 유지하세요
- 시드 유래 값은 결정적이어야 합니다(Math.random 없음). 정적 빌드가 재현 가능하도록 하세요

### Astro 패턴

- **Astro Pages/Components**: 라우팅, 레이아웃, 콘텐츠, 컴포넌트 모두 `.astro`입니다 - `astro.instructions.md` 참고
- `src/lib/` 헬퍼를 통해 페이지 프론트매터에서 데이터에 직접 쿼리하세요(빌드 시간, 정적 출력)
- 동적 경로는 `getStaticPaths()` + `export const prerender = true`를 사용합니다
- 브랜드화된 `404.astro`를 제공하세요(정적 출력에서 알려지지 않은 경로는 실제 404입니다)
- 실제 클라이언트 상호작용이 필요할 때만 범위가 지정된 Astro `<script>`를 추가하세요

### 스타일링

- Tailwind CSS 유틸리티 클래스만 사용하세요 - `style.instructions.md` 참고
- 다크 테마 색상: slate 팔레트(`bg-slate-800`, `text-slate-100` 등)
- 둥근 모서리와 현대적인 UI 패턴
- 깨끗하고 접근 가능한 인터페이스를 통해 현대적인 UI/UX 원칙을 따르세요

### GitHub Actions 워크플로우

- 좋은 보안 관행을 따르세요
- 워크플로우 권한을 명시적으로 설정하세요
- 수행 중인 작업을 문서화하는 주석을 추가하세요

## npm 명령어

- 개발 명령어는 `package.json`에 정의되어 있습니다. 사이트용 Astro 및 데이터베이스 설정용 `db/`의 TypeScript 작업을 실행합니다.
- **스킬이 우선합니다.** 명령을 직접 실행하기 전에 스킬이 작업을 다루는지 확인하세요(예: `quality-checks` 스킬은 단위 테스트, 린트, 타입 검사를 래핑함). 해당하는 경우 따르세요.
- 주요 npm 스크립트:
  - `npm run dev` — Astro 개발 서버 시작(`predev`는 로컬 SQLite 데이터베이스 마이그레이션 + 시딩)
  - `npm run build` — 정적 사이트 빌드(`prebuild`는 로컬 SQLite 데이터베이스 마이그레이션 + 시딩)
  - `npm run preview` — 빌드된 `dist/` 출력 제공
  - `npm run lint` — ESLint
  - `npm run test:unit` — Vitest 단위 테스트
  - `npm run test:e2e` — Playwright E2E 테스트(먼저 빌드 + 미리보기)
  - `npm run typecheck` — `tsconfig.tsgo.json`을 사용하여 `tsgo`(TypeScript 7 네이티브 컴파일러, `@typescript/native-preview`를 통해)로 순수 TypeScript 타입 검사
  - `npm run typecheck:astro` — `astro check`(클래식 TypeScript 패키지)로 `.astro` 파일 타입 검사
  - `npm run typecheck:all` — 두 타입 검사 스크립트 모두 실행(CI `type-check` 작업에서 사용)
  - `npm run db:generate` / `db:migrate` / `db:seed` / `db:setup` — Drizzle 스키마/마이그레이션/시드 작업
  - `npm run db:export` — `predb:export`를 통해 마이그레이션 및 시딩한 후 카탈로그 grounding 파일을 `db/catalog.json`에 작성

> [!NOTE]
> TypeScript 7(`tsgo`)은 타입 검사만을 위해 **나란히** 채택되었습니다. 린팅에 영향을 주지 않습니다. ESLint + `typescript-eslint` 및 `astro check`는 여전히 클래식 `typescript` 패키지(v6으로 유지됨)를 확인합니다. 네이티브 컴파일러의 API가 아직 준비되지 않았기 때문입니다. `typescript-eslint` + `@astrojs/check`가 네이티브 API를 지원할 때까지 클래식 `typescript` 패키지를 7로 업그레이드하지 마세요(Dependabot `ignore`가 유지함). `tsgo`는 `--noEmit` 전용입니다. 사이트는 여전히 `astro build`로 빌드됩니다.

## 저장소 구조

애플리케이션은 저장소 루트에 있습니다:

- `db/`: Drizzle 스키마, 마이그레이션, 변환, 시드 및 `games.csv`
- `src/lib/`: Node SQLite 클라이언트(`db.ts`) 및 데이터 접근 헬퍼(`games.ts`)
- `src/components/`: 재사용 가능한 `.astro` 컴포넌트
- `src/layouts/`: Astro 레이아웃 템플릿
- `src/pages/`: Astro 페이지 경로(`index.astro` 목록, `game/[id].astro`, `404.astro`, `about.astro`)
- `src/styles/`: CSS 및 Tailwind 구성
- `src/types/`: TypeScript 인터페이스(Game, Publisher, Category)
- `e2e-tests/`: Playwright E2E 테스트(홈, 게임, 접근성)
- `drizzle.config.ts`, `vitest.config.ts`, `astro.config.mjs`, `playwright.config.ts`: 도구 구성
- `README.md`: 프로젝트 문서
