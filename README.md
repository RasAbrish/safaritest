# Stockroom

A responsive product catalog built with Next.js and TanStack Query using the DummyJSON fake REST API.

## Features

- Server-side pagination, search, and sorting
- Reusable TanStack Query product hook
- Loading, empty, and error states
- Validated API proxy with boundary handling
- Excel export for the current result page
- Responsive product grid
- API route tests

## Run locally

```bash
npm install
npm run dev
```

Create `.env.local` only when a different compatible API base URL is needed:

```bash
PRODUCTS_API_URL=https://dummyjson.com
```

## Verify

```bash
npm run lint
npm test
npm run build
```
