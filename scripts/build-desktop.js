
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
  execSync('npx cap sync electron', { stdio: 'inherit' });

  // Check if electron:pack script exists, if not add it
  const electronPackageJsonPath = path.join(process.cwd(), 'electron', 'package.json');
  if (fs.existsSync(electronPackageJsonPath)) {
    const electronPackageJson = JSON.parse(fs.readFileSync(electronPackageJsonPath, 'utf8'));
    
    if (!electronPackageJson.scripts || !electronPackageJson.scripts['electron:pack']) {
      console.log('Adding missing electron:pack script...');
      
      if (!electronPackageJson.scripts) {
        electronPackageJson.scripts = {};
      }
      
      electronPackageJson.scripts['electron:pack'] = 'electron-builder';
      electronPackageJson.scripts['electron:build'] = 'npm run build && electron-builder';
      
      fs.writeFileSync(electronPackageJsonPath, JSON.stringify(electronPackageJson, null, 2));
      
      // Install electron-builder if not already installed
      console.log('Installing electron-builder...');
      execSync('cd electron && npm install electron-builder --save-dev', { stdio: 'inherit' });
    }
  }

  // Build Electron app
  console.log('Building Electron application...');
  execSync('cd electron && npm run electron:pack', { stdio: 'inherit' });

  console.log('Desktop application built successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
