const { spawn } = require('child_process');
const path = require('path');

/**
 * Script to start all components of the University Record Management System
 * This will start the backend, admin portal, and student portal concurrently
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function startProcess(name, command, args, cwd, color) {
  log(`🚀 Starting ${name}...`, color);
  
  const process = spawn(command, args, {
    cwd: path.resolve(__dirname, cwd),
    stdio: 'pipe',
    shell: true
  });

  process.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      log(`[${name}] ${output}`, color);
    }
  });

  process.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      log(`[${name}] ${output}`, colors.red);
    }
  });

  process.on('close', (code) => {
    if (code !== 0) {
      log(`❌ ${name} exited with code ${code}`, colors.red);
    } else {
      log(`✅ ${name} exited successfully`, colors.green);
    }
  });

  process.on('error', (error) => {
    log(`❌ Error starting ${name}: ${error.message}`, colors.red);
  });

  return process;
}

async function main() {
  log('🎓 University Record Management System - Starting All Services', colors.bright);
  log('================================================================', colors.bright);
  
  // Check if we're in the right directory
  const fs = require('fs');
  if (!fs.existsSync('./backend') || !fs.existsSync('./admin-portal') || !fs.existsSync('./student-portal')) {
    log('❌ Error: Please run this script from the project root directory', colors.red);
    log('   Make sure you have backend/, admin-portal/, and student-portal/ directories', colors.red);
    process.exit(1);
  }

  log('\n📋 Starting services in order:', colors.cyan);
  log('1. Backend API Server (Port 5000)', colors.cyan);
  log('2. Student Portal (Port 3000)', colors.cyan);
  log('3. Admin Portal (Port 3001)', colors.cyan);
  log('', colors.reset);

  // Start backend first
  const backend = startProcess(
    'Backend',
    'npm',
    ['run', 'dev'],
    './backend',
    colors.green
  );

  // Wait a bit for backend to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Start student portal
  const studentPortal = startProcess(
    'Student Portal',
    'npm',
    ['run', 'dev'],
    './student-portal',
    colors.blue
  );

  // Wait a bit before starting admin portal
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Start admin portal
  const adminPortal = startProcess(
    'Admin Portal',
    'npm',
    ['start'],
    './admin-portal',
    colors.magenta
  );

  log('\n🌐 Services will be available at:', colors.bright);
  log('• Backend API: http://localhost:5000', colors.green);
  log('• Student Portal: http://localhost:3000', colors.blue);
  log('• Admin Portal: http://localhost:3001', colors.magenta);
  log('\n💡 Press Ctrl+C to stop all services', colors.yellow);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\n🛑 Shutting down all services...', colors.yellow);
    
    backend.kill('SIGTERM');
    studentPortal.kill('SIGTERM');
    adminPortal.kill('SIGTERM');
    
    setTimeout(() => {
      log('✅ All services stopped', colors.green);
      process.exit(0);
    }, 2000);
  });

  process.on('SIGTERM', () => {
    log('\n🛑 Received SIGTERM, shutting down...', colors.yellow);
    backend.kill('SIGTERM');
    studentPortal.kill('SIGTERM');
    adminPortal.kill('SIGTERM');
    process.exit(0);
  });
}

// Run the main function
main().catch((error) => {
  log(`❌ Error: ${error.message}`, colors.red);
  process.exit(1);
});
