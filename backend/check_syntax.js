const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Node.js syntax for all backend files...\n');

const filesToCheck = [
  'server.js',
  'create_tables.js',
  'startup.js',
  'config/database.serverless.js',
  'config/paystack.config.js',
  'config/env.validation.js',
  'middleware/auth.js',
  'middleware/errorHandler.js',
  'middleware/security.js',
  'middleware/featureGate.js',
  'services/email.service.js',
  'services/logger.service.js',
  'services/ai.service.js',
  'services/cache.service.js',
  'services/quiz.service.js',
  'services/storage.service.js',
  'controllers/quiz.controller.js',
  'controllers/teaching.controller.js',
  'controllers/notes.controller.js',
];

const { spawnSync } = require('child_process');
let errors = 0;
let success = 0;

filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  ${file} - NOT FOUND`);
    return;
  }

  const result = spawnSync('node', ['-c', fullPath], { encoding: 'utf-8' });
  if (result.error || result.status !== 0) {
    console.log(`❌ ${file}`);
    if (result.stderr) console.log(`   Error: ${result.stderr.split('\n')[0]}`);
    errors++;
  } else {
    console.log(`✅ ${file}`);
    success++;
  }
});

console.log(`\n════════════════════════════════════════════`);
console.log(`✅ Syntax OK: ${success}`);
console.log(`❌ Errors: ${errors}`);
console.log(`════════════════════════════════════════════`);

process.exit(errors > 0 ? 1 : 0);
