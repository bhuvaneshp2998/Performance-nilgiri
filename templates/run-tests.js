const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);
const useInflux = process.env.USE_INFLUX === 'true' || args.includes('--use-influx');
const influxUrl = process.env.INFLUX_URL || 'http://localhost:8086';
const influxOrg = process.env.INFLUX_ORG || 'primary';
const influxBucket = process.env.INFLUX_BUCKET || 'k6';
const influxToken = process.env.INFLUX_TOKEN || '';

const runFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  
  // Build command with InfluxDB output if enabled
  const k6Args = ['run'];
  
  if (useInflux) {
    k6Args.push('--out', `influxdb=${influxUrl}`);
    // Set environment variables for K6
    process.env.K6_INFLUXDB_ADDR = influxUrl;
    process.env.K6_INFLUXDB_ORG = influxOrg;
    process.env.K6_INFLUXDB_BUCKET = influxBucket;
    if (influxToken) {
      process.env.K6_INFLUXDB_TOKEN = influxToken;
    }
  }
  
  k6Args.push(filePath);
  
  if (filePath.endsWith('.ts')) {
    const tsFilePath = path.basename(filePath);
    const jsFilePath = tsFilePath.replace('.ts', '.js');
    
    // Compile TypeScript first
    spawnSync('npx', ['tsc', filePath], { stdio: 'inherit' });
    
    // Run the compiled JS with k6 if monitoring is enabled
    if (useInflux) {
      spawnSync('k6', k6Args.map(arg => arg === filePath ? jsFilePath : arg), { 
        stdio: 'inherit',
        env: process.env
      });
    } else {
      spawnSync('node', [jsFilePath], { stdio: 'inherit' });
    }
  } else {
    // For JS files, run directly with K6 if monitoring enabled
    if (useInflux) {
      spawnSync('k6', k6Args, { 
        stdio: 'inherit',
        env: process.env
      });
    } else {
      spawnSync('node', [filePath], { stdio: 'inherit' });
    }
  }
};

if (!args.length) {
  console.log('Usage: node run-tests.js <file1> <file2> ... | all [--use-influx]');
  console.log('');
  console.log('Options:');
  console.log('  --use-influx    Send metrics to InfluxDB (requires running docker-compose)');
  console.log('  all             Run all test files');
  process.exit(1);
}

// Filter out flags from file list
const files = args.filter(arg => !arg.startsWith('--'));

if (files[0] === 'all') {
  const testFiles = fs.readdirSync(process.cwd())
    .filter(f => (f.endsWith('.ts') || f.endsWith('.js')) && !f.startsWith('.'));
  testFiles.forEach(f => runFile(path.join(process.cwd(), f)));
} else {
  files.forEach(f => runFile(path.join(process.cwd(), f)));
}
