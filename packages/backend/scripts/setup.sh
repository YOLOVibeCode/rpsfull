#!/bin/bash
# Setup script for RPSFull Backend
# This script sets up the database and generates Prisma client

set -e

echo "🚀 Setting up RPSFull Backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your configuration."
fi

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
pnpm db:generate

# Check if database is accessible
echo "🔍 Checking database connection..."
if pnpm db:migrate status > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "⚠️  Database connection failed. Make sure Docker services are running:"
    echo "   docker-compose up -d"
    exit 1
fi

# Run migrations
echo "🗄️  Running database migrations..."
pnpm db:migrate

# Seed database (optional)
read -p "Do you want to seed the database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    pnpm db:seed
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start the backend: pnpm dev"
echo "  2. Start the frontend: cd ../frontend && pnpm dev"
echo "  3. Access the app at http://localhost:4445"

