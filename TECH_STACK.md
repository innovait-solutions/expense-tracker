# Technology Stack - FinanceFlow

This document outlines the core technologies, libraries, and services used to build and deploy the FinanceFlow expense tracker.

## 🚀 Core Framework & Language
- **Next.js 14 (App Router)**: The React framework for production, utilizing Server Components and dynamic routing.
- **TypeScript**: Ensuring type safety across the entire codebase.

## 🎨 UI & Styling
- **Tailwind CSS**: Utility-first CSS framework for rapid and consistent UI development.
- **Lucide React**: Modern and consistent icon set.
- **Tailwind CSS Animate**: For smooth micro-animations and transitions.
- **Clsx & TailwindMerge**: Utilities for managing conditional and overlapping Tailwind classes.

## 🗄️ Database & Models
- **PostgreSQL**: Robust relational database hosted on **Supabase**.
- **Prisma (ORM)**: Type-safe database client for modeling and querying.
- **Supabase Connection Pooler**: Used for efficient connection management in serverless environments.

## 🔐 Authentication & Security
- **JWT (JSON Web Tokens)**: Handled via the `jose` library for secure session management.
- **Bcryptjs**: Industrial-grade password hashing.
- **Cookies**: Secure, HTTP-only cookies for token storage.

## ☁️ External Services
- **Vercel**: Deployment platform for frontend and serverless API routes.
- **Resend**: Email API for sending partner invitations and notifications.
- **Supabase Storage**: Secure object storage for uploading and serving expense receipts.

## 📊 Data & Reporting
- **PDFKit**: Server-side PDF generation for financial reports.
- **Recharts**: Composable charting library for visualizing cash flow and categories.
- **Date-fns**: Comprehensive library for date manipulation and formatting.
- **XLSX**: Support for spreadsheet data processing.

## 🛠️ Data Handling & Validation
- **React Hook Form**: Performant and flexible form management.
- **Zod**: TypeScript-first schema validation for forms and API requests.
- **Axios**: Promised-based HTTP client for API communication.
