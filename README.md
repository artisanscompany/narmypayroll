# NARMY Portal v1

Rails 8 application for the NARMY portal rollout.

## Runtime configuration

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `SECRET_KEY_BASE`: Rails secret key base for production
- `APP_HOST`: public hostname, defaults to `narmyapp.gitgar.com`
- `RAILS_LOG_LEVEL`: optional, defaults to `info`

## Local setup

```sh
bundle install
bin/rails db:prepare
bin/rails server
```

## Production

The app is designed to run behind Coolify using the included `Dockerfile`.
