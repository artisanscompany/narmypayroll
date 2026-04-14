# NARMY Portal V1

Deployable Rails 8 scaffold for the NARMY personnel and payroll portal.

## Runtime

- Ruby `4.0.1`
- Rails `8.1.x`
- PostgreSQL via `DATABASE_URL`
- Redis via `REDIS_URL`
- Docker build ready for Coolify

## Local setup

```bash
bundle install
bin/rails server
```

If Redis is not available locally the portal still renders; it will simply show Redis as unavailable in the runtime status panel.

## Production env

Copy `.env.example` into your deployment environment and set:

- `APP_HOST`
- `DATABASE_URL`
- `REDIS_URL`
- `SECRET_KEY_BASE`

## Pages included

- Overview
- Login
- Onboarding
- Admin dashboard
- Personnel dashboard
- Profile
- Complaints
- Payroll

## Verification

```bash
bundle exec rails test
```
