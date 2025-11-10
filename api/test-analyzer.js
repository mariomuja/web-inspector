// Quick test script to verify the analyzer works locally
const { analyzeWebsite } = require('./website-analyzer');

async function test() {
  try {
    console.log('Testing analyzer with google.com...');
    const result = await analyzeWebsite('https://www.google.com', 'all');
    console.log('Success!');
    console.log('Site Name:', result.siteName);
    console.log('Overall Score:', result.overallScore);
    console.log('Total Rules:', result.summary.totalRules);
    console.log('Violations:', result.violations.length);
    console.log('First 3 violations:');
    result.violations.slice(0, 3).forEach(v => {
      console.log(`  - ${v.ruleName} (${v.severity})`);
    });
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();

