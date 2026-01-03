#!/bin/bash

# Load environment variables
source .env.local

# Connect to PostgreSQL using psql
echo "🔗 Connecting to PostgreSQL database..."
echo "📋 Available tables: consent_templates, consent_purposes, consent_records, vendors, audit_logs, email_events"
echo "💡 Example: SELECT * FROM consent_purposes;"
echo ""

psql "$DATABASE_URL"