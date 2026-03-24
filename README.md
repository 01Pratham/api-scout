<div align="center">
  <img src="https://raw.githubusercontent.com/01Pratham/restiqo/main/ui-src/public/logo.svg" alt="restiQo logo" width="120" height="120">
  <h1>restiQo</h1>
  <p><strong>A lightweight, auto-generating Postman-like UI for Express.js</strong></p>
</div>

---

**restiQo** transforms your Express.js server into a self-documenting API testing platform. It automatically scans your routes, captures incoming traffic, and provides a premium, browser-based dashboard to test your endpoints without ever leaving your development environment.

## 🚀 Key Features

- **📂 Postman-Style Dashboard**: A familiar, premium UI with Tabs, Collections, and Request/Response panels.
- **✨ Auto-Capture & Scanner**: Automatically scans your Express routes and builds request templates with zero manual effort.
- **📋 Params, Headers & Body**: Full support for query parameters (with Postman-like grid), custom headers, and JSON/Form-Data bodies.
- **🌍 Dynamic Environment Variables**: Use `{{BASE_URL}}` style placeholders that resolve in real-time.
- **⌨️ Smart Autocomplete**: Type `{{` in any field to get a searchable list of your environment variables.
- **🔍 Schema Detection**: Automatically extracts and displays request body schemas from **Zod, Joi, Yup, and TypeBox**.
- **📜 Traffic History**: Every request sent through your app is captured in a searchable history log for easy debugging.
- **💾 Stable Persistence**: Uses hash-based stable IDs to ensure your saved requests remain valid even after server restarts.
- **⚡ Code Generation**: Instantly generate production-ready code snippets (JavaScript, cURL, etc.) with variables already resolved to their values.

---

## 🛠️ Step-by-Step Integration

Integrating **restiQo** into your project is a 3-minute process.

### 1. Installation

```bash
npm install restiqo
```

### 2. Basic Setup (Express)

In your main `app.ts` or `server.ts` file, import and mount the middleware. 

> [!IMPORTANT]
> **Order Matters**: Mount `restiqo` **BEFORE** your main router to ensure it captures all incoming traffic.

```typescript
import express from 'express';
import { restiqo } from 'restiqo';

const app = express();

// 1. Standard Express Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Initialize restiQo
app.use('/api-tester', restiqo<express.Application, express.Router>({
    app,
    path: '/api-tester',       // The URL where the UI will be served
    autoCapture: true,         // Capture all traffic to history
    autoScan: true,            // Scan routes for templates
    customizationPath: './restiqo-db.json' // Where your saved collections go
}));

// 3. Your API Routes
app.use('/api', myRouter);

app.listen(35000, () => {
    console.log('🚀 restiQo UI available at http://localhost:35000/api-tester');
});
```

---

## 📖 Feature Guide

### 🌍 Environment Management
Manage multiple environments (Local, Staging, Prod). Define variables in JSON format and use them anywhere using `{{variable_name}}`.

*   **Highlighting**: Valid variables appear **blue**, missing ones appear **red**.
*   **Autocomplete**: Simply type `{{` and use arrow keys + enter to select a variable.

### 📋 Query Parameters (Params)
The **Params** tab allows you to manage URL parameters in a clean grid.
*   **Two-Way Sync**: Editing the grid updates the URL bar instantly, and typing `?key=val` in the URL bar updates the grid.
*   **Toggle**: Use the checkbox to enable/disable specific parameters without deleting them.

### 🔍 Automatic Schema Extraction
One of restiQo's most powerful features is its ability to "read" your validation schemas (like **Zod**) and pre-fill the request body in the UI automatically.

#### Step 1: Set Up Your Validator
Your validation middleware must attach the schema to the middleware function so restiQo can "see" it during the scan.

```typescript
import { AnyZodObject } from 'zod';

export const validate = (schema: AnyZodObject) => {
    const middleware = async (req: any, res: any, next: any) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            req.body = parsed.body; // Transformation support
            next();
        } catch (error) {
            next(error);
        }
    };

    // CRITICAL: Attach schema to middleware function
    Object.assign(middleware, { zodSchema: schema });
    
    return middleware;
};
```

#### Step 2: Apply to Routes
Apply your validation middleware as usual. restiQo will detect the schema during its route-scanning phase.

```typescript
import { Router } from 'express';
import { validate } from './middleware/validate';
import { signupSchema } from './auth.validator';

const router = Router();

router.post(
    '/signup',
    validate(signupSchema), // restiQo captures signupSchema automatically
    (req, res) => {
        res.status(201).json({ success: true });
    }
);
```

---

## ⚙️ Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `app` | `Express` | **Required** | Your express application instance. |
| `path` | `string` | `'/api-tester'` | The base path for the UI. |
| `autoCapture` | `boolean` | `true` | Log all server traffic to the "History" tab. |
| `autoScan` | `boolean` | `true` | Scan all routes on startup for templates. |
| `customizationPath` | `string` | `undefined` | Path to a JSON file for persistent collections. |
| `storagePath` | `string` | `undefined` | Path to a JSON file for the temporary cache. |
| `authMiddleware` | `Middleware` | `undefined` | Custom middleware to protect the UI. |

---

## 🎨 Design Philosophy
**restiQo** is built to be "Zero-Config" yet powerful. It focuses on a premium developer experience:
- **Responsive**: Works perfectly on wide monitors and laptops.
- **Glassmorphism**: Modern UI with subtle blurs and sleek dark mode.
- **Zero Dependencies**: Uses native `fetch` and browser APIs for light overhead.

## 📄 License
MIT © 2026 restiQo Team
