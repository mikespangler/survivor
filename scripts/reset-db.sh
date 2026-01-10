#!/bin/bash

# Database Reset Script
# This script resets the database by dropping all data and reapplying migrations
# WARNING: This will delete ALL data in the database!

set -e

echo "⚠️  WARNING: This will delete ALL data in the database!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

echo "🔄 Resetting database..."
npx prisma migrate reset --force

echo "✅ Database reset complete!"

