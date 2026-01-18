# Image Processing Service

Production-ready image processing backend service built with **Node.js**, **Express**, **PostgreSQL**, **AWS S3**, and **Sharp**. The service supports secure image uploads, on-the-fly image transformations, user-based authorization, and a robust **daily rate limit** mechanism to prevent abuse.

---

## 🚀 Features

- 🔐 **JWT-based Authentication & Authorization**
- 🖼️ **Image Upload & Storage** (AWS S3)
- ✂️ **Image Transformations** (resize, crop, format, quality, etc.) using Sharp
- ⚡ **Streaming & Presigned URLs** for efficient image delivery
- 🧠 **Atomic, Daily Rate Limiting** for image transformations (20/day per user)
- 🗄️ **PostgreSQL-backed persistence**
- 🧩 Clean **Controller / Service / Middleware** architecture
- 🛡️ Abuse prevention without cron jobs or background workers

---

## 🏗️ Architecture Overview

```
client
  ↓
Express API
  ├── Auth Middleware (JWT)
  ├── Authorization Middleware
  ├── Transform Rate Limit Middleware (DB-level, atomic)
  ├── Validators
  ├── Controllers
  ├── Services
  ↓
PostgreSQL        AWS S3
```

The system is designed with **production constraints** in mind: concurrency safety, minimal DB load, and clear separation of responsibilities.

---

## 📁 Project Structure

```
src/
├── controllers/      # HTTP request handling
├── services/         # Business logic (image processing, S3, DB)
├── middlewares/      # Auth, rate limit, validation
├── routes/           # Express route definitions
├── db/               # Database connection & queries
├── utils/            # Helper utilities
├── config/           # Environment & app configuration
├── app.js            # Express app setup
└── server.js         # Server bootstrap
```

---

## 🔐 Authentication & Authorization

- JWT-based authentication
- User context is extracted from the token and attached to `req.user`
- Authorization middleware ensures users can only access their own images

---

## 🖼️ Image Upload Flow

1. User uploads an image via multipart/form-data
2. Image is validated and processed
3. Original image is stored in **AWS S3**
4. Image metadata is persisted in **PostgreSQL**
5. API returns image ID and access information

---

## ✂️ Image Transformation Flow

```
JWT Check
  → Authorization Check
    → Transform Rate Limit Check
      → Input Validation
        → Image Transform (Sharp)
          → Response / Stream
```

Transformations are applied **on demand** and can include:
- Resize
- Crop
- Format conversion
- Quality adjustments

---

## ⏱️ Daily Transform Rate Limit (Key Feature)

To prevent abuse, each user is limited to **20 image transformations per day**.

### ✅ Design Goals
- No cron jobs
- No race conditions
- No in-memory counters
- Fully DB-enforced

### 🧠 Implementation Strategy

- Rate limit is enforced using a **single atomic SQL UPDATE**
- Uses `DATE` instead of timestamps for daily quota tracking
- Automatically resets when the date changes

### 🗄️ Database Fields

```sql
transform_count INT DEFAULT 0,
transform_date  DATE
```

### 🔒 Atomic Update Logic

- If `transform_date` is today and `transform_count < 20` → increment
- If `transform_date` is not today → reset count to 1
- If limit is exceeded → no row updated → request rejected

### 🧪 Result

- Concurrency-safe
- Zero race conditions
- Production-grade daily quota system

---

## 🗄️ Database

- PostgreSQL is used as the primary datastore
- Raw SQL is preferred for critical paths (rate limiting)
- Recommended index:

```sql
CREATE INDEX idx_users_transform
ON users (id, transform_date);
```

---

## ☁️ AWS S3 Integration

- Images stored securely in S3 buckets
- Supports:
  - Streaming responses
  - Presigned URLs
- AWS SDK v3 is used

---

## ⚙️ Environment Variables

Example `.env`:

```
PORT=3000
DATABASE_URL=postgres://...
JWT_SECRET=your-secret
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
AWS_S3_BUCKET=...
```

> ⚠️ Do not commit real secrets to version control.

---

## 🧪 Error Handling

- Centralized error handling via middleware
- Proper HTTP status codes
  - `401` Unauthorized
  - `403` Forbidden
  - `429` Too Many Requests (rate limit)
  - `500` Internal Server Error

---

## 📈 Scalability Notes

This project is ready for real-world usage. Possible future improvements:

- Redis-backed rate limiting (for very high traffic)
- Async image processing with queues (BullMQ / SQS)
- Plan-based quotas (Free / Pro)
- CDN integration
- OpenAPI / Swagger documentation

---

## ✅ Production Readiness Checklist

- [x] Authentication & Authorization
- [x] Secure file handling
- [x] Concurrency-safe rate limiting
- [x] No cron dependencies
- [x] Clean architecture
- [x] Environment-based configuration

---

## 🧠 What This Project Demonstrates

- Strong backend fundamentals
- Understanding of race conditions & atomic operations
- Practical PostgreSQL usage
- Real-world rate limiting strategies
- Clean and maintainable Node.js architecture

---

## 📄 License

MIT License

---

**This project is designed and implemented with production constraints and best practices in mind.**

**Project Link:** https://roadmap.sh/projects/image-processing-service