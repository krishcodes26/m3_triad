#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║        M3 TRIAD SETUP VERIFICATION                        ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const checks = [
  {
    name: 'Environment Configuration',
    checks: [
      { file: '.env.local', critical: true },
      { file: '.gitignore', critical: true },
    ],
  },
  {
    name: 'Database Setup',
    checks: [
      { file: 'migrations/001_create_m3_triad_schema.sql', critical: true },
      { file: 'migrations/002_setup_rls_policies.sql', critical: true },
    ],
  },
  {
    name: 'TypeScript & Code',
    checks: [
      { file: 'src/types/database.ts', critical: true },
      { file: 'src/lib/supabase.ts', critical: true },
    ],
  },
  {
    name: 'Documentation',
    checks: [
      { file: 'DATABASE_SETUP_COMPLETE.md', critical: true },
      { file: 'NEXTJS_SETUP.md', critical: true },
      { file: 'QUICK_REFERENCE.md', critical: false },
      { file: 'SETUP_COMPLETE.md', critical: false },
      { file: 'DATABASE_ARCHITECTURE.txt', critical: false },
    ],
  },
  {
    name: 'Dependencies',
    checks: [
      { file: 'package.json', critical: true },
      { file: 'node_modules', isDir: true, critical: true },
    ],
  },
];

let totalChecks = 0;
let passedChecks = 0;
let criticalFailed = false;

checks.forEach((section) => {
  console.log(`\n📋 ${section.name}`);
  console.log('─'.repeat(60));

  section.checks.forEach((check) => {
    totalChecks++;
    const filePath = path.join(__dirname, check.file);
    const exists = check.isDir ? fs.existsSync(filePath) && fs.statSync(filePath).isDirectory() : fs.existsSync(filePath);

    if (exists) {
      console.log(`  ✅ ${check.file}`);
      passedChecks++;
    } else {
      const status = check.critical ? '❌ CRITICAL' : '⚠️  OPTIONAL';
      console.log(`  ${status}: ${check.file}`);
      if (check.critical) criticalFailed = true;
    }
  });
});

console.log('\n' + '═'.repeat(60));
console.log(`\n📊 Results: ${passedChecks}/${totalChecks} checks passed\n`);

if (criticalFailed) {
  console.log('❌ CRITICAL FILES MISSING!\n');
  console.log('Please run the setup process again.\n');
  process.exit(1);
} else if (passedChecks === totalChecks) {
  console.log('✅ ALL CHECKS PASSED!\n');
  console.log('Your M3 Triad backend is ready for development!\n');
  console.log('Next steps:');
  console.log('  1. Read NEXTJS_SETUP.md');
  console.log('  2. npm install (if not done)');
  console.log('  3. npm run dev');
  console.log('  4. Start building!\n');
  process.exit(0);
} else {
  console.log('⚠️  Some optional files are missing, but setup is functional.\n');
  process.exit(0);
}
