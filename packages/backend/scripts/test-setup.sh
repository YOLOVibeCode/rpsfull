#!/bin/bash
# Test Environment Setup Script
# Sets up Docker test environment and runs tests

set -e

echo "🧪 Setting up test environment..."

# Check if test Docker Compose is running
if ! docker-compose -f docker-compose.test.yml ps | grep -q "Up"; then
    echo "🐳 Starting test Docker services..."
    docker-compose -f docker-compose.test.yml up -d
    
    echo "⏳ Waiting for services to be ready..."
    sleep 5
fi

# Check if .env.test exists
if [ ! -f .env.test ]; then
    echo "⚠️  .env.test not found. Copying from .env.test.example..."
    cp .env.test.example .env.test
fi

# Generate Prisma Client for test database
echo "📦 Generating Prisma Client..."
DATABASE_URL=$(grep DATABASE_URL .env.test | cut -d '=' -f2-)
export DATABASE_URL
pnpm db:generate

# Run migrations on test database
echo "🗄️  Running migrations on test database..."
pnpm db:migrate

echo "✅ Test environment ready!"
echo ""
echo "To run tests:"
echo "  pnpm test"
echo ""
echo "To stop test services:"
echo "  docker-compose -f docker-compose.test.yml down"

