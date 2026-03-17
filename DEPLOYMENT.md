# Deployment Instructions - FinanceFlow

FinanceFlow is a Next.js application with a PostgreSQL database managed by Prisma.

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   Create a `.env` file with the following:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/financeflow?schema=public"
   JWT_SECRET="your-secret-key"
   ```

3. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

4. **Seed the database (optional):**
   ```bash
   node prisma/seed.js
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## Docker Deployment (Recommended)

The easiest way to deploy is using Docker Compose:

1. **Start the services:**
   ```bash
   docker-compose up -d
   ```

2. **Initialize the database:**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   docker-compose exec app node prisma/seed.js
   ```

The app will be available at `http://localhost:3000`.

## GitHub Integration

To push your project to GitHub, follow these steps:

1. **Initialize Git:**
   ```bash
   git init
   ```

2. **Add Files:**
   ```bash
   git add .
   ```

3. **Commit Changes:**
   ```bash
   git commit -m "Initial commit - FinanceFlow Enterprise"
   ```

4. **Add Remote Repository:**
   ```bash
   git remote add origin https://github.com/yourusername/expense-tracker.git
   ```

5. **Push to Main:**
   ```bash
   git push -u origin main
   ```

## Recommended Folder Structure

For scalability and easy deployment, we maintain a modular architecture:

- `/src/app`: **Routes & Layouts** - The application's core pages and navigation.
- `/src/components`: **UI Components** - Reusable components (Sidebar, Charts, Modals).
- `/src/lib`: **Infrastructure** - Shared logic, Prisma client, and utility functions.
- `/src/hooks`: **Custom States** - React hooks for data fetching and state logic.
- `/src/providers`: **Global Context** - User sessions and organization-wide state.
- `/prisma`: **Database Schema** - Prisma models and migration history.
- `/public`: **Static Assets** - Images, icons, and fonts.

---

## Production Environment Requirements

When deploying to production (Vercel, AWS, or Railway), ensure:

1. **Environment Variables:**
   - `DATABASE_URL`: Connection string for your production PostgreSQL.
   - `JWT_SECRET`: A long, random string (min 32 chars).
   - `NEXT_PUBLIC_APP_URL`: Your production domain URL.

2. **Database Migrations:**
   - Run `npx prisma migrate deploy` in your CI/CD pipeline.
   - Do NOT use `migrate dev` in production.

3. **Optimized Build:**
   - Run `npm run build` before starting the server.
   - Docker deployment already handles this via the `Dockerfile`.

## Production Deployment: Vercel & Supabase

For a professional, scalable deployment, we recommend the following stack:

### 1. Database (Supabase)
1. Create a new project at [supabase.com](https://supabase.com).
2. Go to **Project Settings > Database** and copy your **Connection String** (URI).
3. Ensure you have your database password ready.
4. Your connection string will look like: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`

### 2. Application (Vercel)
1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Add the following **Environment Variables**:
   - `DATABASE_URL`: Your Supabase connection string.
   - `JWT_SECRET`: A long, random string.
   - `NODE_ENV`: `production`
3. Click **Deploy**. Vercel will handle the build and automatically run `prisma generate` via our `postinstall` script.

### 3. Database Migrations
To apply your schema to the production database:
1. Temporarily update your local `.env` with the production `DATABASE_URL`.
2. Run:
   ```bash
   npx prisma migrate deploy
   ```
   *Always use `migrate deploy` in production to apply migrations safely.*

---

## Technical Support & Maintenance
- **Logs**: Monitor Vercel "Runtime Logs" for API errors.
- **Backups**: Supabase provides automatic daily backups.
- **Scale**: This architecture can handle thousands of concurrent users with minimal configuration.
