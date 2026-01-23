/**
 * Simple test script for Website Intelligence API
 * 
 * Usage:
 *   node test-api.js https://example.com
 * 
 * Make sure your dev server is running first:
 *   npm run dev
 */

const testUrl = process.argv[2] || 'https://stripe.com';
const apiEndpoint = 'http://localhost:4321/api/analyze-website';

console.log('🔍 Testing Website Intelligence API\n');
console.log(`Target URL: ${testUrl}`);
console.log(`API Endpoint: ${apiEndpoint}\n`);
console.log('⏳ Analyzing... (this takes 10-15 seconds)\n');

const startTime = Date.now();

fetch(apiEndpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ url: testUrl })
})
  .then(response => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️  Response received in ${duration}s\n`);
    
    if (!response.ok) {
      return response.json().then(err => {
        throw new Error(err.error || `HTTP ${response.status}`);
      });
    }
    
    return response.json();
  })
  .then(data => {
    console.log('✅ Analysis Complete!\n');
    console.log('═══════════════════════════════════════════\n');
    
    if (data.success && data.data) {
      const { executiveSnapshot, coreVariables, strategicSignals, nextMoves } = data.data;
      
      console.log('📊 EXECUTIVE SNAPSHOT');
      console.log('─────────────────────');
      console.log(`Business Type: ${executiveSnapshot.businessType}`);
      console.log(`Market Scope: ${executiveSnapshot.marketScope}`);
      console.log(`Primary Goal: ${executiveSnapshot.primaryGoal}`);
      console.log(`Clarity Score: ${executiveSnapshot.clarityScore}/100\n`);
      
      console.log('🎯 CORE VARIABLES');
      console.log('─────────────────');
      Object.entries(coreVariables).forEach(([key, value]) => {
        if (value) {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          console.log(`${label}: ${value}`);
        }
      });
      console.log('');
      
      console.log('💡 STRATEGIC SIGNALS');
      console.log('────────────────────');
      strategicSignals.forEach((signal, i) => {
        console.log(`${i + 1}. ${signal}`);
      });
      console.log('');
      
      console.log('🚀 NEXT MOVES');
      console.log('─────────────');
      nextMoves.forEach((move, i) => {
        const priorityIcon = move.priority === 'high' ? '🔴' : move.priority === 'medium' ? '🟡' : '🟢';
        console.log(`${i + 1}. ${priorityIcon} ${move.title} [${move.priority.toUpperCase()}]`);
        console.log(`   ${move.description}\n`);
      });
      
      console.log('═══════════════════════════════════════════\n');
      console.log('✨ Test completed successfully!');
    } else {
      console.log('⚠️  Unexpected response format:', JSON.stringify(data, null, 2));
    }
  })
  .catch(error => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`❌ Error after ${duration}s\n`);
    console.log('Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure dev server is running (npm run dev)');
    console.log('2. Check OPENAI_API_KEY is set in .env file');
    console.log('3. Verify the website URL is accessible');
    console.log('4. Check browser console for more details');
  });
