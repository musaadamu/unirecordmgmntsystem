const { spawn } = require('child_process');
const path = require('path');

/**
 * Script to start only the Student Portal of the University Record Management System
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
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
  log('🎓 University Record Management System - Starting Student Portal Only', colors.bright);
  log('================================================================', colors.bright);
  const fs = require('fs');
  if (!fs.existsSync('./student-portal')) {
    log('❌ Error: Please run this script from the project root directory', colors.red);
    log('   Make sure you have student-portal/ directory', colors.red);
    process.exit(1);
  }
  log('\n📋 Starting service:', colors.blue);
  log('1. Student Portal (Port 3000)', colors.blue);
  log('', colors.reset);
  // Start student portal
  const studentPortal = startProcess(
    'Student Portal',
    'npm',
    ['run', 'dev'],
    './student-portal',
    colors.blue
  );
  log('\n🌐 Service will be available at:', colors.bright);
  log('• Student Portal: http://localhost:3000', colors.blue);
  log('\n💡 Press Ctrl+C to stop the service', colors.yellow);
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\n🛑 Shutting down student portal...', colors.yellow);
    studentPortal.kill('SIGTERM');
    setTimeout(() => {
      log('✅ Student portal stopped', colors.green);
      process.exit(0);
    }, 2000);
  });
  process.on('SIGTERM', () => {
    log('\n🛑 Received SIGTERM, shutting down...', colors.yellow);
    studentPortal.kill('SIGTERM');
    process.exit(0);
  });
}

main().catch((error) => {
  log(`❌ Error: ${error.message}`, colors.red);
  process.exit(1);
});
