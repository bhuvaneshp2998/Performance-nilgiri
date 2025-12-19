# 📊 Monitoring Setup Guide

This guide explains how to set up and use the local monitoring stack (InfluxDB + Grafana) with your performance tests.

---

## 🚀 Quick Start

### Step 1: Start the Monitoring Stack

```bash
npm run monitor:start
```

This starts:
- **InfluxDB** on `http://localhost:8086` - Time-series database
- **Grafana** on `http://localhost:3000` - Visualization dashboard

### Step 2: Configure Environment Variables (Optional)

Copy and customize the monitoring configuration:

```bash
cp .env.monitoring .env
```

**Default Credentials:**
- Grafana: `admin` / `admin`
- InfluxDB: `admin` / `admin`

### Step 3: Run Tests with Monitoring

```bash
# Option 1: Using npm script with InfluxDB
npm run test:influx

# Option 2: Using environment variable
USE_INFLUX=true npm run test:run

# Option 3: Run all tests with monitoring
npm run all:influx
```

### Step 4: View Real-time Dashboard

Open Grafana in your browser:
```
http://localhost:3000
```

**Login with:**
- Username: `admin`
- Password: `admin` (or from `.env` file)

The **K6 Performance Testing** dashboard will show real-time metrics.

### Step 5: Stop Monitoring Stack

```bash
npm run monitor:stop
```

---

## 📊 Available Monitoring Commands

| Command | Description |
|---------|------------|
| `npm run monitor:start` | Start InfluxDB + Grafana containers |
| `npm run monitor:stop` | Stop monitoring stack |
| `npm run monitor:restart` | Restart containers |
| `npm run monitor:status` | Show container status |
| `npm run monitor:logs` | View real-time logs |

---

## 🧪 Running Tests with Monitoring

### Simple API Test with Monitoring

```javascript
// test/test.js
const { runPerformanceTest } = require('performancenilgiri');

async function testWithMonitoring() {
    const result = await runPerformanceTest({
        scenarioName: 'API Test with Monitoring',
        request: {
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/posts',
            headers: { 'Content-Type': 'application/json' }
        },
        options: { vus: 10, duration: '30s' },
        detailedReportjson: "./reports/json/test_metrics.json",
        htmlReport: "./reports/html/test_report.html",
        checks: `'status is 200': (r) => r.status === 200`,
        thinkTime: 1
    });
    return result;
}

testWithMonitoring().catch(console.error);
```

Then run:
```bash
npm run test:influx
```

---

## 📈 Grafana Dashboard Panels

### Available Metrics

**1. HTTP Request Duration**
- Shows response time trends over time
- Displays min, median, average, max, p90, p95
- Helps identify performance bottlenecks

**2. Total HTTP Requests**
- Cumulative count of requests
- Shows request volume over time
- Stacked bar chart for clarity

**3. Error Rate**
- Percentage of failed requests
- Color-coded (green=good, yellow=warning, red=critical)
- Real-time updates

**4. Active Virtual Users**
- Current number of concurrent users
- Shows VU ramp-up and ramp-down
- Stat display for quick reference

**5. Throughput (req/s)**
- Requests per second
- Shows how many requests the system handles
- Useful for capacity planning

### Customizing Dashboards

Dashboards are stored in: `monitoring/grafana-provisioning/dashboards/`

To create custom dashboards:
1. Edit the dashboard in Grafana UI
2. Export the JSON
3. Save to the provisioning folder
4. Restart containers: `npm run monitor:restart`

---

## 🔧 Configuration

### Environment Variables

Create `.env` file in project root:

```bash
# InfluxDB
INFLUX_URL=http://localhost:8086
INFLUX_ORG=primary
INFLUX_BUCKET=k6
INFLUX_TOKEN=

# Grafana
GRAFANA_PASSWORD=admin

# K6 Tests
BASE_URL=https://api.example.com
VUS=10
DURATION=30s
```

### Docker Compose Configuration

Edit `docker-compose.yml` to customize:

```yaml
services:
  influxdb:
    ports:
      - "8086:8086"  # Change port if needed
    volumes:
      - influxdb-storage:/var/lib/influxdb2  # Data persistence
      
  grafana:
    ports:
      - "3000:3000"  # Change port if needed
    volumes:
      - grafana-storage:/var/lib/grafana  # Data persistence
```

---

## 📊 Data Retention

By default, InfluxDB retains K6 metrics for **7 days** (168 hours).

To change retention:

```bash
# Edit in monitoring/influxdb-init.sh
influx bucket create --name k6 --retention 30d
```

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to Docker daemon"

**Solution:** Ensure Docker is installed and running
```bash
docker --version
docker-compose --version
```

### Issue: "Port already in use"

**Solution:** Change ports in `docker-compose.yml`:
```yaml
ports:
  - "8087:8086"  # InfluxDB on 8087 instead of 8086
  - "3001:3000"  # Grafana on 3001 instead of 3000
```

### Issue: "K6 metrics not appearing in Grafana"

1. Check if containers are running:
   ```bash
   npm run monitor:status
   ```

2. Check logs:
   ```bash
   npm run monitor:logs
   ```

3. Verify InfluxDB connectivity:
   ```bash
   curl http://localhost:8086/health
   ```

4. Run test again with monitoring enabled:
   ```bash
   USE_INFLUX=true npm run test:run
   ```

### Issue: "Grafana login failed"

1. Restart Grafana:
   ```bash
   docker-compose restart grafana
   ```

2. Use default credentials:
   - Username: `admin`
   - Password: `admin`

---

## 🔐 Security Notes

⚠️ **For Production Use:**

1. **Change default passwords** in `.env`:
   ```bash
   INFLUXDB_PASSWORD=your-secure-password
   GRAFANA_PASSWORD=your-secure-password
   ```

2. **Enable InfluxDB authentication**:
   ```yaml
   INFLUXDB_HTTP_AUTH_ENABLED: "true"
   ```

3. **Use HTTPS** for Grafana:
   ```yaml
   GF_SECURITY_ENABLE_LOGIN_TOKEN: "true"
   GF_SECURITY_COOKIE_SECURE: "true"
   ```

4. **Isolate networks** - Don't expose ports publicly:
   ```yaml
   ports:
     - "127.0.0.1:8086:8086"  # Only localhost
     - "127.0.0.1:3000:3000"
   ```

---

## 📚 Additional Resources

- **InfluxDB Documentation**: https://docs.influxdata.com/influxdb/
- **Grafana Documentation**: https://grafana.com/docs/
- **K6 Documentation**: https://k6.io/docs/
- **K6 InfluxDB Integration**: https://k6.io/docs/results-output/real-time/influxdb/

---

## 💡 Best Practices

✅ **DO:**
- Start monitoring stack before running tests
- Use consistent naming for scenarios
- Archive InfluxDB data periodically
- Monitor resource usage of containers
- Tag tests with metadata for better filtering

❌ **DON'T:**
- Leave monitoring stack running continuously (stop when not in use)
- Use production credentials locally
- Share Grafana access without authentication
- Keep old test data for extended periods
- Change dashboard configurations without backups

---

## 🔄 Typical Workflow

```bash
# 1. Start monitoring
npm run monitor:start

# 2. Wait for containers to be healthy (10-15 seconds)
npm run monitor:status

# 3. Run tests with monitoring
npm run test:influx

# 4. Open Grafana
# http://localhost:3000

# 5. Analyze results in real-time

# 6. Stop monitoring when done
npm run monitor:stop
```

---

**Last Updated:** December 19, 2025  
**Version:** 1.0.0
