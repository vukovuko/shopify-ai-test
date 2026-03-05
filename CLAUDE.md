# Shopify App - Claude Code Guide

## Quick Overview

This is an **embedded Shopify app** built with React Router v7 (formerly Remix), Prisma (SQLite), and Polaris Web Components. It runs inside the Shopify admin iframe.

---

## Project Structure

```
testing-ai/
├── app/                          # All application code lives here
│   ├── shopify.server.js         # Shopify app config & auth exports (THE core file)
│   ├── db.server.js              # Prisma client singleton
│   ├── entry.server.jsx          # SSR entry point (streaming React rendering)
│   ├── root.jsx                  # Root HTML layout
│   ├── routes.js                 # File-based routing config (flatRoutes)
│   └── routes/                   # All routes (see routing section below)
├── extensions/                   # Shopify extensions (empty scaffold, use `npm run generate`)
├── prisma/
│   └── schema.prisma             # Database schema (Session table, SQLite)
├── public/                       # Static assets
├── shopify.app.toml              # Shopify app config (scopes, webhooks, client_id)
├── shopify.web.toml              # Web server config (dev commands, webhook path)
├── vite.config.js                # Vite build config
├── .graphqlrc.js                 # GraphQL codegen config (Admin API v2025-10)
└── Dockerfile                    # Production Docker deployment
```

---

## Routing (file-based, React Router flat routes)

Routes live in `app/routes/`. The filename determines the URL path.

| File | URL | Purpose |
|------|-----|---------|
| `_index/route.jsx` | `/` | Landing page (unauthenticated, shows login) |
| `auth.login/route.jsx` | `/auth/login` | Login form (shop domain input) |
| `auth.$.jsx` | `/auth/*` | OAuth callback catch-all |
| `app.jsx` | `/app` | **Protected app shell** - wraps all app pages, has nav |
| `app._index.jsx` | `/app` | Home page (product generation demo) |
| `app.additional.jsx` | `/app/additional` | Example additional page |
| `webhooks.app.uninstalled.jsx` | `/webhooks/app/uninstalled` | Webhook: app uninstalled |
| `webhooks.app.scopes_update.jsx` | `/webhooks/app/scopes_update` | Webhook: scopes changed |

### Where to add new pages

Add new files in `app/routes/` prefixed with `app.` to make them protected (nested under the app shell):

```
app.my-feature.jsx      -> /app/my-feature
app.settings.jsx        -> /app/settings
app.orders.jsx          -> /app/orders
```

Then add a nav link in `app.jsx` inside `<s-app-nav>`.

---

## Key Patterns

### Authentication (every protected route needs this)

```js
// In any loader or action under app.*
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  // `admin` gives you access to GraphQL client
  return null;
};
```

### GraphQL Queries (Admin API)

```js
export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    #graphql
    mutation createProduct($product: ProductCreateInput!) {
      productCreate(product: $product) {
        product { id title }
      }
    }
  `, { variables: { product: { title: "My Product" } } });

  const data = await response.json();
  return data;
};
```

Always use the `#graphql` comment for syntax highlighting and codegen.

### Form Submissions (mutations)

```jsx
import { useFetcher } from "react-router";

function MyPage() {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method="POST">
      <button type="submit">Do Thing</button>
    </fetcher.Form>
  );
}
```

Use `useFetcher()` for non-navigating submissions. Use `<Form>` from react-router for navigating submissions.

### UI Components (Polaris Web Components)

This app uses **Polaris Web Components** (native `<s-*>` elements), NOT the old React Polaris library:

```jsx
<s-page title="My Page">
  <s-section>
    <s-text>Hello world</s-text>
  </s-section>
  <s-button variant="primary" onClick={handleClick}>
    Click me
  </s-button>
</s-page>
```

### Webhooks

Webhook handlers go in `app/routes/webhooks.*.jsx`. Pattern:

```js
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, session, topic, payload } = await authenticate.webhook(request);
  // Handle webhook payload
  return new Response();
};
```

---

## Where To Put Things

| What | Where |
|------|-------|
| New page | `app/routes/app.my-page.jsx` |
| Server-only utility | `app/my-util.server.js` (`.server` suffix = never sent to client) |
| GraphQL query/mutation | Inline in the route's `loader` or `action` function |
| New database model | `prisma/schema.prisma` then run `npx prisma migrate dev` |
| Shopify extension | `extensions/` via `npm run generate` |
| Shared components | `app/components/MyComponent.jsx` (create dir as needed) |
| Webhook handler | `app/routes/webhooks.event.name.jsx` |
| Environment variables | Set via Shopify CLI (never commit `.env`) |

---

## Auth Flow

1. User visits `/` -> landing page with login form
2. Submits shop domain -> POST `/auth/login`
3. Redirected to Shopify OAuth -> back to `/auth/*` callback
4. Session created in Prisma DB -> redirected to `/app`
5. All `app.*` routes call `authenticate.admin(request)` to verify session

---

## Database

- **ORM:** Prisma
- **Default DB:** SQLite (`prisma/dev.sqlite`)
- **Current tables:** `Session` only (stores Shopify auth sessions)
- **Add models:** Edit `prisma/schema.prisma`, then `npx prisma migrate dev --name description`
- **Production:** Switch datasource to PostgreSQL/MySQL in `schema.prisma`

---

## API & Scopes

- **API version:** 2025-10 (October 2025) for GraphQL codegen, 2026-04 for webhooks
- **Current scopes:** `write_metaobject_definitions`, `write_metaobjects`, `write_products`
- **Change scopes:** Edit `shopify.app.toml` under `[access_scopes]`

---

## Commands

```bash
npm run dev          # Start dev server (Shopify CLI tunnel + Vite HMR)
npm run build        # Production build
npm run start        # Start production server
npm run setup        # Run Prisma migrations
npm run deploy       # Deploy to Shopify
npm run generate     # Scaffold new extension
npm run typecheck    # TypeScript check
npm run lint         # ESLint
```

---

## Rules

- Use Shopify MCP tools (`introspect_graphql_schema`, `validate_graphql_codeblocks`) to verify all GraphQL queries against the actual schema before writing them
- Use Shopify MCP (`validate_component_codeblocks`) to validate Polaris Web Components (`<s-*>`) usage
- Admin routes: always call `await authenticate.admin(request)` in every loader/action
- Public API routes (App Proxy): use `await authenticate.public.appProxy(request)` to validate requests come through Shopify's proxy with a valid HMAC signature
- Use `learn_shopify_api` first before any other Shopify MCP tool call - it provides the required `conversationId`
- Route files should be thin: authenticate, call a service function, return data. Heavy logic belongs in `app/services/` or `app/utils/`
- **Embedded app:** Navigation must use `<s-link>` or App Bridge redirect, NOT React Router's `<Link>`
- **`.server` suffix:** Files ending in `.server.js` are server-only and never bundled to the client
- **Session storage:** Handled automatically by `@shopify/shopify-app-session-storage-prisma`
- **GraphQL codegen:** Configured in `.graphqlrc.js`, scans `app/**/*.{js,ts,jsx,tsx}`
- **Node version:** >=20.19 <22 || >=22.12
