# 5. API Reference — Accounts

Base path: `/api/v1/auth/`

Handles signup, login, the current-user profile, API key management, and
API usage reporting. See
[04-authentication-and-authorization.md](./04-authentication-and-authorization.md)
for how JWT and API keys work generally.

---

## `POST /api/v1/auth/signup/`

Create a new user account.

**Auth:** none

**Body**
```json
{
  "email": "farmer@example.com",
  "username": "farmer1",
  "password": "at-least-8-characters"
}
```

**Response `201`**
```json
{
  "email": "farmer@example.com",
  "username": "farmer1"
}
```
(password never echoed back — it's `write_only`)

---

## `POST /api/v1/auth/login/`

Obtain a JWT access/refresh token pair. Standard SimpleJWT
`TokenObtainPairView`, subclassed to embed `email` and `username` into the
token claims.

**Auth:** none

**Body**
```json
{ "email": "farmer@example.com", "password": "..." }
```

**Response `200`**
```json
{
  "refresh": "<refresh_token>",
  "access": "<access_token>"
}
```

Access tokens expire after 30 minutes; refresh tokens after 7 days.

---

## `POST /api/v1/auth/refresh/`

Standard SimpleJWT `TokenRefreshView`. Exchange a refresh token for a new
access token.

**Auth:** none

**Body**
```json
{ "refresh": "<refresh_token>" }
```

**Response `200`**
```json
{ "access": "<new_access_token>" }
```

---

## `GET /api/v1/auth/me/`

Return the authenticated user's profile.

**Auth:** JWT, `IsAuthenticated`

**Response `200`**
```json
{
  "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "email": "farmer@example.com",
  "username": "farmer1",
  "date_joined": "2026-01-15T09:00:00Z",
  "is_staff": false
}
```

---

## `POST /api/v1/auth/api-keys/create/`

Create a new API key for the authenticated user. The key value is
generated server-side (`secrets.token_hex(32)`).

**Auth:** JWT, `IsAuthenticated`

**Body**
```json
{ "name": "backend-integration" }
```

**Response `201`**
```json
{
  "id": "b3f1...",
  "name": "backend-integration",
  "key": "9f2c...64-hex-chars",
  "created_at": "2026-08-11T10:00:00Z",
  "is_active": true
}
```

> The `key` value is not masked or hidden — store it securely on receipt.
> Default limits are 60 requests/minute and 10,000 requests/day; these are
> set per-key at the model level (not currently exposed for the caller to
> customize via this endpoint).

---

## `GET /api/v1/auth/api-keys/`

List the authenticated user's API keys.

**Auth:** JWT, `IsAuthenticated`

**Response `200`**
```json
[
  {
    "id": "b3f1...",
    "name": "backend-integration",
    "key": "9f2c...",
    "created_at": "2026-08-11T10:00:00Z",
    "is_active": true
  }
]
```

---

## `DELETE /api/v1/auth/api-keys/<id>/`

Delete (revoke) one of the authenticated user's API keys.

**Auth:** JWT, `IsAuthenticated`

**Response:** `204 No Content`

---

## `GET /api/v1/auth/api-usage/`

Report current rate-limit / quota consumption for the user's active API
key.

**Auth:** JWT, `IsAuthenticated`

**Response `200`**
```json
{
  "daily_quota": 10000,
  "requests_today": 342,
  "requests_remaining": 9658,
  "requests_per_minute": 60,
  "requests_this_minute": 3,
  "total_requests": 15820
}
```

**Response `404`** if the user has no active API key:
```json
{ "detail": "No active API key found." }
```
