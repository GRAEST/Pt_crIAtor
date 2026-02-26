#!/bin/sh
set -e

# Initialize/update SQLite database schema
npx prisma db push --skip-generate

# Seed default data (snippets, staff members, images)
npx tsx prisma/seed.ts

# Start the Next.js server
exec node server.js
