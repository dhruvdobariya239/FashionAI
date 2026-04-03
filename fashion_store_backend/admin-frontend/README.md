# Fashion Store Admin Frontend

React + Vite + JavaScript + TailwindCSS admin panel for your clothing backend.

## Features

- Admin login with JWT (`/api/auth/login`)
- Protected admin routes
- Dashboard overview (products + categories count)
- Product list with search + pagination
- Add product with image upload (`images` multipart field)
- Edit product details (name, description, pricing, status, arrays)
- Delete product
- Category list + create category
- Clean modern UI with responsive layout

## Backend API Used

- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/categories`
- `POST /api/categories`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Optional: update API URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

If `VITE_API_BASE_URL` is empty, frontend will use relative `/api` and Vite proxy.

4. Run dev server:

```bash
npm run dev
```

5. Build production:

```bash
npm run build
```

## Notes

- Product create sends multipart data exactly as your backend expects:
  - `images` files
  - `sizes` as JSON string
- Product edit currently updates fields via JSON (`PUT /api/products/:id`).
- Category delete button is shown in UI, but your backend currently does not expose category delete endpoint.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
