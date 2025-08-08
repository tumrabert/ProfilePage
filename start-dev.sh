#!/bin/bash

echo "🚀 Starting Portfolio Development Environment..."
echo ""

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose -f docker-compose.dev.yml down 2>/dev/null

# Build and start development environment
echo "🐳 Building and starting development containers..."
docker-compose -f docker-compose.dev.yml up --build -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check if containers are running
if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo ""
    echo "🎉 Development environment is ready!"
    echo ""
    echo "📍 Your portfolio is running at:"
    echo "   🌐 Frontend: http://localhost:3000"
    echo "   🔐 Admin Login: admin / admin123"
    echo "   📊 MongoDB: localhost:27017"
    echo ""
    echo "✨ Hot reloading is enabled - your changes will appear instantly!"
    echo ""
    echo "🔧 Useful commands:"
    echo "   📝 View logs: docker-compose -f docker-compose.dev.yml logs -f"
    echo "   ⏹️  Stop services: docker-compose -f docker-compose.dev.yml down"
    echo "   🔄 Restart: docker-compose -f docker-compose.dev.yml restart portfolio-app"
    echo ""
else
    echo "❌ Failed to start containers. Check logs:"
    docker-compose -f docker-compose.dev.yml logs
fi