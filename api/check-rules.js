// Script to check which rules are defined and which are implemented
const { webDesignRules } = require('./web-design-rules');
const fs = require('fs');

// Read the analyzer file
const analyzerCode = fs.readFileSync('./website-analyzer.js', 'utf8');

console.log('='.repeat(80));
console.log('RULE COVERAGE ANALYSIS');
console.log('='.repeat(80));
console.log(`\nTotal rules defined: ${webDesignRules.length}`);

// Group by category
const byCategory = {};
webDesignRules.forEach(r => {
  byCategory[r.category] = (byCategory[r.category] || []);
  byCategory[r.category].push(r);
});

console.log('\nRules by category:');
Object.entries(byCategory).sort((a,b) => b[1].length - a[1].length).forEach(([cat, rules]) => {
  console.log(`  ${cat}: ${rules.length} rules`);
});

// Check which rules are implemented
console.log('\n' + '='.repeat(80));
console.log('IMPLEMENTATION CHECK');
console.log('='.repeat(80));

const implemented = [];
const notImplemented = [];

webDesignRules.forEach(rule => {
  const hasCase = new RegExp(`case\\s+['"]${rule.id}['"]`, 'i').test(analyzerCode);
  if (hasCase) {
    implemented.push(rule.id);
  } else {
    notImplemented.push({ id: rule.id, name: rule.name, category: rule.category });
  }
});

console.log(`\n✅ Implemented: ${implemented.length}/${webDesignRules.length} rules`);
console.log(`❌ Not implemented: ${notImplemented.length}/${webDesignRules.length} rules`);

if (notImplemented.length > 0) {
  console.log('\n' + '='.repeat(80));
  console.log('MISSING IMPLEMENTATIONS:');
  console.log('='.repeat(80));
  notImplemented.forEach(rule => {
    console.log(`\n❌ ${rule.id}`);
    console.log(`   ${rule.name}`);
    console.log(`   Category: ${rule.category}`);
  });
}

console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log(`Coverage: ${Math.round(implemented.length / webDesignRules.length * 100)}%`);
console.log(`Need to implement: ${notImplemented.length} additional rule checks`);
console.log('='.repeat(80));

