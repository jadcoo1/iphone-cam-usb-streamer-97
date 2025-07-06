
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building desktop application...');

try {
  // Build the web app first
  console.log('Building web application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Add Electron platform if not already added
  if (!fs.existsSync(path.join(process.cwd(), 'electron'))) {
    console.log('Adding Electron platform...');
    execSync('npx cap add @capacitor/electron', { stdio: 'inherit' });
  }

  // Copy web assets to Electron
  console.log('Syncing with Electron...');
  execSync('npx cap copy electron', { stdio: 'inherit' });

  // Build Electron app
  console.log('Building Electron application...');
  execSync('cd electron && npm run electron:pack', { stdio: 'inherit' });

  console.log('Desktop application built successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
