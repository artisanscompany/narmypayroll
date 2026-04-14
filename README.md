# Army Finance Payroll Prototype

Deployable Rails 8 prototype for the payroll application that will serve `narmypayroll.gitgar.com`.

## Runtime

- Ruby `4.0.1`
- Rails `8.1.x`
- PostgreSQL via `DATABASE_URL`
- Redis via `REDIS_URL`
- Active Storage via MinIO on the data node
- Docker build ready for Coolify

## Local setup

```bash
bundle install
bin/rails server
```

If Redis is not available locally the portal still renders; it will simply show Redis as unavailable in the runtime status panel.
Active Storage is configured for production object storage through MinIO; local development can continue using `local` storage unless you export the MinIO env vars.

## Production env

Copy `.env.example` into your deployment environment and set:

- `APP_HOST`
- `PAYROLL_HOST`
- `WEBSITE_HOST`
- `DATABASE_URL`
- `REDIS_URL`
- `ACTIVE_STORAGE_SERVICE`
- `ACTIVE_STORAGE_ENDPOINT`
- `ACTIVE_STORAGE_BUCKET`
- `ACTIVE_STORAGE_ACCESS_KEY_ID`
- `ACTIVE_STORAGE_SECRET_ACCESS_KEY`
- `FORCE_SSL`
- `RAILS_LOG_LEVEL`
- `SECRET_KEY_BASE`

`APP_HOST` and `PAYROLL_HOST` should point to the payroll application host. `WEBSITE_HOST` is used for cross-links to the separate marketing site.

## Pages included

- Overview
- Secure access
- Onboarding
- Admin console
- Personnel dashboard
- Profile
- Inquiries
- Pay and documents

## Verification

```bash
bundle exec rails test
```

## CI/CD

GitHub Actions runs the test suite on every push and pull request, then triggers the standalone Coolify deployment for the payroll app after a successful push to `main`.
