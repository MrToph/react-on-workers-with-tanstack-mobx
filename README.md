# React App on Cloudflare Workers with TanStack & MobX & tRPC & webauthn & drizzle SQL

This project demonstrates a full-stack React application deployed entirely on the Cloudflare edge network, utilizing Cloudflare Workers for the server-side logic and Cloudflare Workers with (Assets) for hosting the static frontend assets.

It leverages the power of the TanStack ecosystem (Query for data fetching/caching, Router for type-safe routing), separates logic and view via MobX, uses tRPC for end-to-end typesafe APIs between the React frontend and the Cloudflare Worker backend.
It hosts an example Webauthn user signup/login flow using Cloudflare's D1 SQL database via drizzle.

## ✨ Features

*   **React Frontend:** Modern UI built with React.
*   **Cloudflare Workers Backend:** Serverless API powered by Cloudflare Workers.
*   **Cloudflare Pages (Assets) Deployment:** Static assets hosted globally on Cloudflare's edge network.
*   **TanStack Router:** Type-safe routing within the React application.
*   **TanStack Query:** Efficient data fetching, caching, and state management.
*   **MobX:** State management for the React application.
*   **tRPC:** End-to-end typesafe APIs, eliminating the need for manual API contract maintenance.
*   **Webauthn:** User registration and login via passkeys. No email or passwords needed. Supports adding multiple passkeys to the same user account via the Settings page.
*   **D1:** Cloudflare's SQL database.
*   **Edge Deployment:** Low latency and high availability thanks to Cloudflare's global network.

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn or pnpm
*   A Cloudflare account

### Installation



**Install dependencies:**

```bash
pnpm install
```

### Development

1. Copy `.dev.vars.example` to `.dev.vars`. Edit the values.
2.  **Start the development server:**
    ```bash
    # In the client directory or project root
    pnpm run dev
    ```


    Your frontend will likely run on `http://localhost:5173` (Vite default) and the worker dev server on `http://localhost:8787`. Configure your frontend tRPC client to point to the worker's dev URL.

### Building

1.  **Build the frontend:**
    ```bash
    # In the client directory or project root
    pnpm run build
    ```
    This will typically generate a `dist` directory with static assets.



## ☁️ Deployment to Cloudflare

This project uses Cloudflare Worker as a compute platform.
Requires login via wrangler to deploy to Cloudflare Workers.
Correct bindings for the "Pages" and "D1" database need to be set up in the Cloudflare Dashboard.

**Deploy to Cloudflare:**
```bash
pnpm run deploy
```

**Add secret environment vars**

Add secrets via the Cloudflare "Pages" Dashboard. (Make sure to set the type to "Secret" not "Plaintext".)

**Database Schema**

The database is managed using a code-first approach by the `worker/drizzle/schemas.ts` file.
Changes to the database schema are performed in this file first and the corresponding migration SQL statements created via `pnpm run drizzle:generate`.

1. For local development, `wrangler` can simulate the remote Cloudflare D1 database with a local sqlite file that persists (in `.wrangler/`). The migration is applied by running `pnpm run drizzle:migrate:local`.
2. To migrate the remote Cloudflare D1 database instead, run `pnpm run drizzle:migrate:prod`.
