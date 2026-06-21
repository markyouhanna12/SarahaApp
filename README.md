# Sara7a App — Anonymous Messaging API

> A secure, production-style **anonymous messaging backend** (inspired by Saraha / صراحة). Anyone can send an anonymous message to a registered user, and that user can log in to read the messages addressed to them — without ever knowing who sent them.

Built with **Node.js + Express 5**, **MongoDB**, and **Redis**, the API focuses on strong authentication, secure data handling, and clean modular architecture.

---

## Overview

The application solves a simple but popular problem: **letting people receive honest, anonymous feedback.**

**Workflow:**

1. A user **signs up** and receives a one-time-password (OTP) by email to **confirm their account**.
2. Once confirmed, the user can **log in** (via email/password or **Google Sign-In**) and obtains JWT **access** and **refresh** tokens.
3. **Anyone** (even unauthenticated visitors) can **send an anonymous message** to that user using their user ID.
4. The user can **read messages** sent to them; **admins** can read all messages.
5. Users can **freeze (deactivate)**, **recover**, or have their account **hard-deleted** (admin only), and manage their **profile/cover pictures**.

**Architecture:**

The codebase follows a **modular, layered architecture**:

```
Route (Controller)  →  Service (Business Logic)  →  Repository (DB abstraction)  →  Mongoose Model
```

Cross-cutting concerns (authentication, validation, rate limiting, logging, file uploads, email, encryption, hashing) live in dedicated `middlewares/` and `utils/` layers. Emails are sent **asynchronously** via a Node `EventEmitter` to keep request latency low, and **Redis** is used for OTP storage, rate limiting, and JWT revocation.

---

## Features

- **User registration** with email + hashed password and encrypted phone number.
- **Email confirmation** via OTP (one-time password) with secure hashing.
- **Resend OTP** with cooldown + per-window request limits (anti-abuse).
- **Login** with email/password.
- **Google Social Login** (`google-auth-library`) with automatic account provisioning.
- **JWT authentication** with separate **Access** and **Refresh** tokens.
- **Refresh token** endpoint to renew access tokens.
- **Role-based authorization** (Admin / User) with separate signing keys per role.
- **Logout (single device)** and **logout from all devices**, implemented both via **MongoDB token blacklist (TTL)** and **Redis** revocation.
- **Forgot / Reset password** via OTP.
- **Profile management:** upload profile picture and up to 5 cover images (Multer).
- **Account freeze (soft delete)** by the owner or an admin.
- **Account restore** by an admin.
- **Self-service account recovery** via OTP (public, for frozen accounts).
- **Hard delete** of frozen accounts (admin only).
- **Anonymous messaging:** send a message to any user by ID (no auth required).
- **Read messages:** users read messages sent to them; admins read all messages.
- **Security hardening:** Helmet, CORS whitelist, custom + library-based rate limiting.
- **Request logging** to per-module log files via Morgan.

---

## Tech Stack

| Category | Technology |
| --- | --- |
| **Language** | JavaScript (Node.js, ES Modules) |
| **Framework** | Express `^5.2.1` |
| **Database** | MongoDB via Mongoose `^9.6.2` |
| **Cache / Store** | Redis `^6.0.0` |
| **Authentication** | JWT (`jsonwebtoken`), Google OAuth (`google-auth-library`) |
| **Password Hashing** | Argon2 (`argon2`), bcrypt (`bcrypt`) |
| **Encryption** | AES-256-CBC (`node:crypto`) for phone numbers |
| **Validation** | Joi `^18.2.1` |
| **File Uploads** | Multer `^2.1.1` (local disk storage) |
| **Email** | Nodemailer `^9.0.1` + Node `EventEmitter` |
| **Security** | Helmet, CORS, `express-rate-limit` + custom limiter |
| **Logging** | Morgan |
| **Utilities** | `uuid`, `nanoid`, `chalk`, `dotenv` |
| **Testing** | _Not configured_ (Postman collection included) |

---

## Project Structure

```
Sara7a App/
├── server.js                      # App entrypoint — starts the HTTP server
├── package.json
├── Sara7a App.postman_collection.json   # Postman API collection
├── config/                        # Environment config (gitignored)
│   └── config.service.js          # Reads & exports environment variables
└── src/
    ├── app.js                     # Express app: middleware, routers, DB/Redis connect
    ├── DB/
    │   ├── connection.js          # MongoDB connection
    │   ├── database.repository.js # Generic Mongoose CRUD helpers
    │   ├── redis.connection.js    # Redis client
    │   ├── redis.repository.js    # Redis helpers + key builders (OTP, revocation)
    │   └── models/
    │       ├── user.model.js       # User schema
    │       ├── message.model.js    # Message schema
    │       └── token.model.js      # Revoked-token schema (TTL index)
    ├── middlewares/
    │   ├── Auth.middleware.js          # authentication & authorization
    │   ├── Validation.middleware.js    # Joi validation + shared field rules
    │   └── rateLimitter.middleware.js  # Custom in-memory IP rate limiter
    ├── modules/
    │   ├── Auth/      # auth.controller / auth.service / auth.validation
    │   ├── User/      # user.controller / user.service / user.validation
    │   └── message/   # message.controller / message.service / message.validation
    ├── logger/
    │   └── morgan.logger.js       # Attaches routers with per-module file logging
    └── utils/
        ├── cors/                  # CORS options (whitelist)
        ├── email/                 # Nodemailer transport + HTML template
        ├── enums/                 # Role, Gender, Provider, Token, Hash enums
        ├── events/                # Async email event handlers
        ├── multer/                # File upload config & file-type validation
        ├── response/              # Standard success & error responses
        ├── security/              # Hashing & encryption helpers
        ├── tokens/                # JWT generate/verify, signature selection
        └── generateOTP.js         # OTP generator
```

**Key directories:**

- **`modules/`** — Each feature is self-contained (`controller` for routes, `service` for logic, `validation` for Joi schemas).
- **`DB/`** — Database/Redis connections, models, and reusable repository helpers that abstract Mongoose calls.
- **`middlewares/`** — Auth, validation, and rate limiting applied across routes.
- **`utils/`** — Shared, reusable infrastructure (security, email, tokens, responses, uploads).

---

## Installation & Setup

### Prerequisites

- **Node.js** (v18+ recommended, for native `--watch` and ESM support)
- **MongoDB** instance (local or Atlas)
- **Redis** instance

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "Sara7a App"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

> ⚠️ This project loads configuration from `config/config.service.js`, which is **gitignored**. Create the `config/` folder and a `config.service.js` that reads from `process.env` (loaded via `dotenv`) and exports the variables listed in [Environment Variables](#environment-variables).

Example `config/config.service.js`:

```js
import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT;
export const dbUrl = process.env.DB_URL;
export const RedisUrl = process.env.REDIS_URL;

export const SALT = Number(process.env.SALT);
export const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;

export const TOKEN_ACCESS_USER_SECRET_KEY = process.env.TOKEN_ACCESS_USER_SECRET_KEY;
export const TOKEN_ACCESS_ADMIN_SECRET_KEY = process.env.TOKEN_ACCESS_ADMIN_SECRET_KEY;
export const TOKEN_REFRESH_USER_SECRET_KEY = process.env.TOKEN_REFRESH_USER_SECRET_KEY;
export const TOKEN_REFRESH_ADMIN_SECRET_KEY = process.env.TOKEN_REFRESH_ADMIN_SECRET_KEY;
export const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES;
export const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES;

export const USER_EMAIL = process.env.USER_EMAIL;
export const USER_PASSWORD = process.env.USER_PASSWORD;

export const WHITE_LIST = process.env.WHITE_LIST?.split(",") || [];
export const Client_ID = process.env.CLIENT_ID;

export const OTP_TTL = Number(process.env.OTP_TTL) || 60;
export const MAX_OTP_TRIALS = Number(process.env.MAX_OTP_TRIALS) || 3;
export const OTP_WINDOW = Number(process.env.OTP_WINDOW) || 3600;
```

### 4. Database setup

No manual schema setup is needed — Mongoose creates collections automatically. Just ensure **MongoDB** and **Redis** are running and reachable via `DB_URL` and `REDIS_URL`.

### 5. Run the application

```bash
npm run dev
```

The server starts on the configured `PORT` and prints:

```
Server running on port <PORT>
```

---

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Port the HTTP server listens on. |
| `DB_URL` | MongoDB connection string. |
| `REDIS_URL` | Redis connection URL. |
| `SALT` | Salt rounds used by bcrypt hashing. |
| `ENCRYPTION_SECRET` | Secret key for AES encryption of phone numbers. |
| `TOKEN_ACCESS_USER_SECRET_KEY` | Signing secret for **user** access tokens. |
| `TOKEN_ACCESS_ADMIN_SECRET_KEY` | Signing secret for **admin** access tokens. |
| `TOKEN_REFRESH_USER_SECRET_KEY` | Signing secret for **user** refresh tokens. |
| `TOKEN_REFRESH_ADMIN_SECRET_KEY` | Signing secret for **admin** refresh tokens. |
| `ACCESS_EXPIRES` | Access token lifetime (e.g. `1h`). |
| `REFRESH_EXPIRES` | Refresh token lifetime (e.g. `7d`). |
| `USER_EMAIL` | Sender email account for Nodemailer. |
| `USER_PASSWORD` | App password / SMTP credential for the sender email. |
| `WHITE_LIST` | Allowed CORS origins. |
| `CLIENT_ID` | Google OAuth client ID (for social login). |
| `OTP_TTL` | OTP validity in seconds (default `60`). |
| `MAX_OTP_TRIALS` | Max OTP requests allowed per window (default `3`). |
| `OTP_WINDOW` | OTP trial-counter reset window in seconds (default `3600`). |

> 🔒 **Never commit real secret values.** Keep `config/` out of version control (it is already in `.gitignore`).

---

## API Documentation

Base URL: `http://localhost:<PORT>`

Authenticated routes expect an `Authorization` header in the form **`<Bearer> <token>`**, where the prefix encodes the role signature (`Admin` or `User`), e.g. `User <access_token>`.

### Auth — `/auth`

| Method | Endpoint | Purpose | Auth |
| --- | --- | --- | --- |
| `POST` | `/auth/signup` | Register a new user & send confirmation OTP | No |
| `PATCH` | `/auth/confirm-email` | Confirm account with OTP | No |
| `POST` | `/auth/resend-otp` | Resend confirmation OTP | No |
| `POST` | `/auth/login` | Login with email & password | No |
| `POST` | `/auth/refresh-token` | Get a new access token from a refresh token | Refresh token |
| `POST` | `/auth/social-login` | Login / register via Google | No |
| `POST` | `/auth/logout` | Logout (MongoDB token blacklist) | Yes |
| `POST` | `/auth/logout-with-Redis` | Logout (Redis revocation) | Yes |
| `PATCH` | `/auth/forget-password` | Send password-reset OTP | No |
| `PATCH` | `/auth/reset-password` | Reset password using OTP | No |

**Signup — request body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "StrongP@ss1",
  "phone": "01012345678",
  "age": 25
}
```

**Signup — response:**

```json
{
  "message": "User Created successfully",
  "statusCode": 201,
  "data": { "newUser": { "_id": "...", "email": "john@example.com" } }
}
```

**Login — response:**

```json
{
  "message": "Login successfully",
  "statusCode": 200,
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```

**Logout — request body** (`flag` controls scope):

```json
{ "flag": "logout" }          // single device
{ "flag": "logoutFromAll" }   // all devices
```

### User — `/user`

| Method | Endpoint | Purpose | Auth |
| --- | --- | --- | --- |
| `GET` | `/user/` | Get the authenticated user's profile | User / Admin |
| `PATCH` | `/user/update-profile-pic` | Upload a profile picture (`attachments`) | User |
| `PATCH` | `/user/update-profile-Cover` | Upload up to 5 cover images (`attachments`) | User |
| `DELETE` | `/user/:userId/freeze-account` | Freeze (soft-delete) account; self or admin | User / Admin |
| `PATCH` | `/user/:userId/restore-account` | Restore a frozen account | Admin |
| `POST` | `/user/recover-account` | Send recovery OTP for a frozen account | No |
| `PATCH` | `/user/recover-account/verify` | Verify OTP & unfreeze account | No |
| `DELETE` | `/user/:userId/hard-delete` | Permanently delete a frozen account | Admin |

> File uploads use `multipart/form-data` with the field name **`attachments`**. Allowed types: JPEG, PNG, GIF, WebP.

### Message — `/message`

| Method | Endpoint | Purpose | Auth |
| --- | --- | --- | --- |
| `POST` | `/message/send-message/:receiverId` | Send an anonymous message to a user | No |
| `GET` | `/message/get-messages` | Get messages sent to the logged-in user | User |
| `GET` | `/message/get-messages-admin` | Get all messages | Admin |

**Send message — request body:**

```json
{ "content": "You are doing great work!" }
```

**Send message — response:**

```json
{
  "message": "Message sent successfully",
  "statusCode": 201,
  "data": { "message": { "_id": "...", "content": "You are doing great work!", "receiverId": "..." } }
}
```

> A full, ready-to-import **Postman collection** is included: `Sara7a App.postman_collection.json`.

---

## Database Models

### User (`user.model.js`)

| Field | Type | Notes |
| --- | --- | --- |
| `firstName` | String | Required, 2–25 chars |
| `lastName` | String | Required, 2–25 chars |
| `email` | String | Required, **unique** |
| `password` | String | Required only when `provider = System` |
| `DOB` | Date | Optional date of birth |
| `phone` | String | **Unique**, stored **AES-encrypted** |
| `role` | Number | `RoleEnum` → Admin `0`, User `1` (default User) |
| `provider` | Number | `ProviderEnum` → System `0`, Google `1` |
| `gender` | Number | `GenderEnum` → Male `0`, Female `1` |
| `confirmEmail` | Date | Set when email is confirmed |
| `cofirmEmailOTP` | String | Hashed confirmation OTP |
| `forgetPasswordOTP` | String | Hashed reset OTP |
| `profilePic` | String | Profile image path |
| `coverImages` | [String] | Cover image paths |
| `age` | Number | |
| `changeCredentialsTime` | Date | Used to invalidate old tokens (logout-all) |
| `freezedBy` / `freezedAt` | ObjectId / Date | Soft-delete metadata |
| `restoredBy` / `restoredAt` | ObjectId / Date | Restore metadata |
| _virtual_ `username` | String | Getter/setter mapping to `firstName lastName` |

**Relationships:** `freezedBy` and `restoredBy` reference `User` (self-reference). Timestamps enabled.

### Message (`message.model.js`)

| Field | Type | Notes |
| --- | --- | --- |
| `content` | String | Required, 2–500 chars, trimmed |
| `senderId` | ObjectId → `User` | Optional (anonymous senders) |
| `receiverId` | ObjectId → `User` | Required |

Timestamps enabled.

### Token (`token.model.js`)

| Field | Type | Notes |
| --- | --- | --- |
| `jti` | String | Required, **unique** JWT ID |
| `userId` | ObjectId → `User` | Required |
| `expiresIn` | Date | **TTL index** — document auto-expires |

Used as a blacklist for revoked tokens (MongoDB logout strategy).

---

## Security Features

- **Authentication:** JWT access & refresh tokens with role-specific signing secrets.
- **Authorization:** Role-based access control (`authorization` middleware, `RoleEnum`).
- **Password hashing:** Argon2 (primary) with bcrypt support.
- **Sensitive data encryption:** Phone numbers encrypted with **AES-256-CBC**.
- **OTP security:** OTPs are hashed before storage, expire via TTL, and are rate-limited per email window.
- **Token revocation:** Single-device and all-device logout via **Redis** and a **MongoDB TTL blacklist**; `changeCredentialsTime` invalidates older tokens.
- **Input validation:** All request bodies/params validated with **Joi** before hitting services.
- **Rate limiting:** A custom in-memory IP limiter plus `express-rate-limit` to mitigate brute-force/abuse.
- **HTTP hardening:** **Helmet** secures headers; **CORS** restricted to a configurable whitelist.
- **Centralized error handling:** Consistent error responses via a global error handler and a `404` catch-all.
- **Environment isolation:** All secrets read from gitignored config / environment variables.

---

## Testing

- **Automated tests:** Not yet configured — `npm test` is a placeholder script.
- **Manual / API testing:** Import the included **Postman collection** to exercise every endpoint:

  1. Open Postman → **Import** → select `Sara7a App.postman_collection.json`.
  2. Set the base URL (and tokens) as collection variables.
  3. Run requests for `Auth`, `User`, and `Message` flows.

---

## Future Improvements

- Add an automated test suite (e.g. **Jest** + **Supertest**) and CI.
- Provide a committed `.env.example` to simplify onboarding.
- Add **pagination, filtering, and sorting** to message-listing endpoints.
- Move file storage to a cloud provider (e.g. **Cloudinary / S3**).
- Add **API documentation via Swagger / OpenAPI**.
- Containerize with **Docker** and add docker-compose for MongoDB + Redis.
- Introduce structured logging and monitoring.

---

## Author

**Mark Youhanna**

- GitHub: [@markyouhanna12](https://github.com/markyouhanna12)

> Built as part of a Node.js backend development journey. Contributions, issues, and suggestions are welcome.
