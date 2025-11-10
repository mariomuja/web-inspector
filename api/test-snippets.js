// Test how many violations have code snippets
const { analyzeWebsite } = require('./website-analyzer');

async function test() {
  try {
    console.log('Testing analyzer with google.com...\n');
    const result = await analyzeWebsite('https://www.google.com', 'all');
    
    console.log('='.repeat(80));
    console.log('ANALYSIS RESULTS');
    console.log('='.repeat(80));
    console.log(`Site: ${result.siteName}`);
    console.log(`Score: ${result.overallScore}/100`);
    console.log(`Total Violations: ${result.violations.length}`);
    
    const withSnippets = result.violations.filter(v => v.codeSnippet).length;
    const withoutSnippets = result.violations.filter(v => !v.codeSnippet).length;
    
    console.log(`\nCode Snippet Coverage:`);
    console.log(`  ✅ With snippets: ${withSnippets}/${result.violations.length} (${Math.round(withSnippets/result.violations.length*100)}%)`);
    console.log(`  ❌ Without snippets: ${withoutSnippets}/${result.violations.length} (${Math.round(withoutSnippets/result.violations.length*100)}%)`);
    
    console.log('\n' + '='.repeat(80));
    console.log('VIOLATIONS WITH CODE SNIPPETS');
    console.log('='.repeat(80));
    
    result.violations.filter(v => v.codeSnippet).slice(0, 5).forEach((v, i) => {
      console.log(`\n${i + 1}. ${v.ruleName} (${v.severity})`);
      console.log(`   Line: ${v.lineNumber || 'N/A'}`);
      console.log(`   Snippet: ${v.codeSnippet.substring(0, 100)}...`);
    });
    
    if (withoutSnippets > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('VIOLATIONS WITHOUT CODE SNIPPETS (Need improvement)');
      console.log('='.repeat(80));
      result.violations.filter(v => !v.codeSnippet).forEach((v, i) => {
        console.log(`${i + 1}. ${v.id}: ${v.ruleName}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();

