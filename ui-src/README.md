# API Tester

A self-hosted, browser-based API testing tool built with Next.js. Similar to Postman/Hoppscotch but designed for internal use.

## Features

- **Server-side API execution** - No CORS issues, can test internal APIs
- **Collections** - Organize requests into collections
- **Environment Variables** - Use `{{VARIABLE}}` syntax for dynamic values
- **Multiple HTTP methods** - GET, POST, PUT, PATCH, DELETE
- **Request/Response viewer** - View status, headers, body, timing
- **Authentication** - Simple email/password auth with JWT

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema (creates SQLite file)
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build -d

# View logs
docker-compose logs -f
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./dev.db` |
| `JWT_SECRET` | Secret for JWT signing | Required in production |

## First Use

1. Go to the login page
2. Click "Sign up" to create an account
3. Login with your credentials
4. Create a collection to organize your requests
5. Add an environment with variables like `{"BASE_URL": "https://api.example.com"}`
6. Start testing APIs!

## Usage Tips

- Use `{{VARIABLE_NAME}}` in URLs, headers, or body to reference environment variables
- Select an environment from the dropdown before sending requests
- Save frequently used requests to collections
- The response shows status code, timing, headers, and formatted body

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite with Prisma ORM
- **UI**: Chakra UI
- **Auth**: JWT with bcrypt password hashing
- **HTTP Client**: Axios (server-side)
- **Validation**: Zod
