#!/bin/sh
set -e

echo "Waiting for database to be ready..."

host="${DB_HOST:-db}"
port="${DB_PORT:-5432}"
user="${DB_USER:-postgres}"
db="${DB_NAME:-scheduler}"

until pg_isready -h "$host" -p "$port" -U "$user" -d "$db" >/dev/null 2>&1; do
  sleep 1
done

echo "Database is ready."

