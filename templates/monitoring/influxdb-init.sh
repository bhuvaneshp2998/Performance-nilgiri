#!/bin/bash
set -e

echo "Initializing InfluxDB v2..."

# Create the database and retention policy for K6 metrics
influx bucket create --name k6 --retention 168h 2>/dev/null || true
influx bucket create --name telegraf 2>/dev/null || true

echo "InfluxDB initialization complete!"
