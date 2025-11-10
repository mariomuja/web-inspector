// Verify that all rules referenced in RULE_SOURCES actually exist and are implemented
const { webDesignRules } = require('./web-design-rules');
const fs = require('fs');

// Read the rule sources from frontend
const ruleSourcesFile = fs.readFileSync('../frontend/src/app/models/rule-source.model.ts', 'utf8');

// Extract all ruleIds from RULE_SOURCES
const ruleIdsMatch = ruleSourcesFile.match(/ruleIds:\s*\[(.*?)\]/gs) || [];
const allReferencedRuleIds = new Set();

ruleIdsMatch.forEach(match => {
  const ids = match.match(/'([^']+)'/g) || [];
  ids.forEach(id => {
    const cleanId = id.replace(/'/g, '');
    if (cleanId) allReferencedRuleIds.add(cleanId);
  });
});

// Get all actual rule IDs from webDesignRules
const actualRuleIds = new Set(webDesignRules.map(r => r.id));

console.log('='.repeat(80));
console.log('VALIDATION SOURCE INTEGRITY CHECK');
console.log('='.repeat(80));

console.log(`\nTotal rules defined in web-design-rules.js: ${actualRuleIds.size}`);
console.log(`Total rule IDs referenced in RULE_SOURCES: ${allReferencedRuleIds.size}`);

// Check for missing rules
const missingRules = [];
allReferencedRuleIds.forEach(id => {
  if (!actualRuleIds.has(id)) {
    missingRules.push(id);
  }
});

if (missingRules.length > 0) {
  console.log('\n❌ ERROR: Rules referenced in RULE_SOURCES but NOT defined:');
  missingRules.forEach(id => console.log(`   - ${id}`));
} else {
  console.log('\n✅ All referenced rules exist in web-design-rules.js');
}

// Check for orphaned rules (defined but never referenced)
const orphanedRules = [];
actualRuleIds.forEach(id => {
  if (!allReferencedRuleIds.has(id)) {
    const rule = webDesignRules.find(r => r.id === id);
    orphanedRules.push({ id, name: rule.name, category: rule.category });
  }
});

if (orphanedRules.length > 0) {
  console.log('\n⚠️  WARNING: Rules defined but NOT referenced in any RULE_SOURCE:');
  orphanedRules.forEach(rule => {
    console.log(`   - ${rule.id}: ${rule.name} (${rule.category})`);
  });
  console.log('\n   These rules will NEVER be used because no validation source references them!');
}

// Parse RULE_SOURCES to show mapping
console.log('\n' + '='.repeat(80));
console.log('VALIDATION SOURCE BREAKDOWN');
console.log('='.repeat(80));

const sourcesMatch = ruleSourcesFile.match(/\{\s*id:\s*'([^']+)',[\s\S]*?ruleIds:\s*\[(.*?)\]/g) || [];
sourcesMatch.forEach(sourceBlock => {
  const idMatch = sourceBlock.match(/id:\s*'([^']+)'/);
  const nameMatch = sourceBlock.match(/name:\s*'([^']+)'/);
  const ruleIdsMatch = sourceBlock.match(/ruleIds:\s*\[(.*?)\]/s);
  
  if (idMatch && nameMatch) {
    const sourceId = idMatch[1];
    const sourceName = nameMatch[1];
    
    if (sourceId === 'all') {
      console.log(`\n📋 ${sourceName}`);
      console.log(`   Uses: ALL ${actualRuleIds.size} rules`);
    } else if (ruleIdsMatch) {
      const ruleIds = (ruleIdsMatch[1].match(/'([^']+)'/g) || []).map(s => s.replace(/'/g, ''));
      const validRules = ruleIds.filter(id => actualRuleIds.has(id));
      const invalidRules = ruleIds.filter(id => !actualRuleIds.has(id));
      
      console.log(`\n📋 ${sourceName}`);
      console.log(`   Expected: ${ruleIds.length} rules`);
      console.log(`   Valid: ${validRules.length} rules`);
      if (invalidRules.length > 0) {
        console.log(`   ❌ INVALID: ${invalidRules.join(', ')}`);
      }
    }
  }
});

console.log('\n' + '='.repeat(80));
console.log('FINAL VERDICT');
console.log('='.repeat(80));

if (missingRules.length === 0 && orphanedRules.length === 0) {
  console.log('\n✅ ✅ ✅ PERFECT! ✅ ✅ ✅');
  console.log('All validation sources are correctly configured!');
  console.log(`All ${actualRuleIds.size} rules can be used and validated!`);
} else {
  console.log('\n⚠️  Issues found that need to be fixed:');
  if (missingRules.length > 0) {
    console.log(`   - ${missingRules.length} referenced rules don't exist`);
  }
  if (orphanedRules.length > 0) {
    console.log(`   - ${orphanedRules.length} rules are orphaned (never used)`);
  }
}

console.log('='.repeat(80));

