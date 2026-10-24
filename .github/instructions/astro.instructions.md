---
description: 'Astro 페이지, 레이아웃, 컴포넌트, 라우팅 패턴'
applyTo: '**/*.astro'
---

# Astro 컴포넌트 지침

## Astro 컴포넌트 패턴

Astro는 UI의 모든 것을 다룹니다: 페이지, 레이아웃, 컴포넌트, 라우팅, 콘텐츠. 사이트는 **완전히 사전 렌더링됩니다**(`output: 'static'`). 클라이언트 측 UI 프레임워크나 별도의 API 서버가 없습니다. 페이지는 빌드 시간에 `src/lib/`의 Drizzle/Node SQLite 데이터 접근 헬퍼를 통해 **프론트매터에서 직접** 데이터를 읽습니다.

### 컴포넌트 구조

```astro
---
// 프론트매터: 빌드 시간에 실행됨(정적 출력)
import Layout from '../layouts/Layout.astro';
import GameCard from '../components/GameCard.astro';
import { getDatabase } from '../lib/db';
import { getAllGames } from '../lib/games';

interface Props {
  title: string;
}

const { title } = Astro.props;
const games = await getAllGames(getDatabase());
---

<Layout title={title}>
  {games.map((game) => <GameCard {game} />)}
</Layout>
```

## 레이아웃

- `src/layouts/`에서 재사용 가능한 레이아웃 컴포넌트를 만드세요
- 콘텐츠 삽입을 위해 `<slot />`을 사용하세요
- 공통 요소를 포함하세요: `<head>`, 네비게이션, 푸터
- 레이아웃에서 전역 스타일을 임포트하세요

### 레이아웃 예시

```astro
---
interface Props {
  title: string;
}
const { title } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

## 페이지

- `src/pages/`에서 페이지를 만드세요
- 파일 기반 라우팅: `src/pages/about.astro` → `/about`
- 동적 경로: `src/pages/game/[id].astro`
- 브랜드화된 `src/pages/404.astro`를 제공하세요. 정적 출력에서 생성된 페이지가 없는 모든 URL은 실제 404입니다.

### 동적 경로(정적 출력)

`output: 'static'`에서 모든 동적 경로는 `getStaticPaths()`로 페이지를 열거하고 `prerender = true`를 설정해야 합니다. 데이터 접근 헬퍼를 사용하여 프론트매터에서 데이터를 쿼리하세요:

```astro
---
import type { GetStaticPaths } from 'astro';
import Layout from '../../layouts/Layout.astro';
import { getDatabase } from '../../lib/db';
import { getAllGameIds, getGameById } from '../../lib/games';

export const prerender = true;

export const getStaticPaths = (async () => {
  const ids = await getAllGameIds(getDatabase());
  return ids.map((id) => ({ params: { id: String(id) } }));
}) satisfies GetStaticPaths;

const { id } = Astro.params;
const game = await getGameById(getDatabase(), Number(id));
---

<Layout title="Game Details - Tailspin Toys">
  <!-- 게임 세부정보 -->
</Layout>
```

## 데이터 접근

- 빌드 시간 데이터는 **Drizzle ORM + Node SQLite**를 통해 로컬 SQLite 데이터베이스에서 가져옵니다([`drizzle.instructions.md`](drizzle.instructions.md) 참고).
- `src/lib/db.ts`에서 `getDatabase()`를 임포트하고 `src/lib/games.ts`에서 타입 헬퍼를 임포트하세요.
- `astro build` 전에 데이터베이스를 마이그레이션하고 시드해야 합니다. `prebuild` npm 스크립트(`db:setup`)가 이를 처리합니다.

## 클라이언트 상호작용(드물게)

Svelte/React 레이어가 없습니다. 페이지에 클라이언트 동작이 정말 필요하면 표준 DOM API를 사용하여 범위가 지정된 Astro `<script>`를 추가하세요. 네이티브 인터랙티브 요소(`<button>`, `<a href>`)를 선호하면 키보드 및 포커스 동작이 자동으로 제공됩니다.

## TypeScript

- 타입 안전한 props에 TypeScript를 사용하세요
- 프론트매터에서 `Props` 인터페이스를 정의하세요
- 컴포넌트 임포트 및 헬퍼 반환값을 타입화하세요
- 린팅 또는 타입 검사 전에 `npx astro sync`를 실행하여 경로/콘텐츠 타입을 (다시) 생성하세요
- `.astro` 파일은 `npm run typecheck:astro`(클래식 `typescript` 패키지에서 `astro sync` 다음 `astro check`를 실행함)로 타입 검사됩니다. `db/`, `src/lib/`, `src/types/`의 순수 TypeScript는 `npm run typecheck`(네이티브 TS 7 컴파일러, `tsgo`)로 별도로 타입 검사됩니다. 이것은 `.astro` 파일을 처리하지 **않습니다**.

## 모범 사례

- 데이터 페칭을 프론트매터에 유지하세요(빌드 시간). 클라이언트 측 페칭을 피하세요
- 클라이언트 측 JavaScript를 최소화하세요. 기본값은 제로 JS입니다
- 레이아웃에서 전역 CSS 스타일을 임포트하고 사용하세요
- 인터랙티브 요소에 항상 `data-testid`를 포함하세요(`ui.instructions.md` 참고)
