#!/bin/bash
set -e

die() {
    printf '\033[1;31mERROR:\033[0m %s\n' "$@" >&2
    exit 1
}

einfo() {
    printf '\n\033[1;36m> %s\033[0m\n' "$@" >&2
}

ewarn() {
    printf '\033[1;33mWARNING:\033[0m %s\n' "$@" >&2
}

# Wait for database if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
    einfo "Database URL detected, waiting for database connection..."
    # Add database wait logic here if needed
fi

# Run database migrations if needed
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    einfo "Running database migrations"
    npm run migrate || ewarn "Migration failed or not configured"
fi

# Seed database if needed
if [ "${SEED_DATABASE:-false}" = "true" ]; then
    einfo "Seeding database"
    npm run seed || ewarn "Seeding failed or not configured"
fi

# Replace environment variables in config files if needed
if [ "${REPLACE_ENV_VARIABLES:-false}" = "true" ]; then
    einfo "Replacing environment variables in backend configuration"
fi

if [ "$#" -eq 0 ]; then
    einfo "No command provided; defaulting to 'npm start'"
    exec npm start
else
    einfo "Executing command: $*"
    exec "$@"
fi