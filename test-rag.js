// Simple test script to verify RAG system functionality
import dermatologyRAG from './src/services/dermatologyRAG.js';

console.log('🧪 Testing SynthesisAI DermatologyRAG System...\n');

// Test 1: Condition Detection
console.log('Test 1: Condition Detection');
const testQueries = [
  "I have acne on my face with blackheads",
  "My skin is very dry and itchy, looks like eczema",
  "Red scaly patches on my arms, might be psoriasis",
  "Fungal infection on my feet, athlete's foot"
];

testQueries.forEach((query, index) => {
  const conditions = dermatologyRAG.detectConditions(query);
  console.log(`Query ${index + 1}: "${query}"`);
  console.log(`Detected conditions: ${conditions.join(', ') || 'None'}\n`);
});

// Test 2: Medication Recommendations
console.log('Test 2: Medication Recommendations');
const testConditions = ['acne', 'eczema', 'psoriasis'];

testConditions.forEach(condition => {
  const recommendations = dermatologyRAG.getMedicationsForConditions([condition]);
  console.log(`Condition: ${condition}`);
  if (recommendations.length > 0) {
    recommendations[0].medications.forEach((med, index) => {
      console.log(`  ${index + 1}. ${med.name} (Rating: ${med.rating}/10)`);
    });
  }
  console.log('');
});

// Test 3: Comprehensive Recommendations
console.log('Test 3: Comprehensive Recommendations');
const testQuery = "I have acne and dry skin, need treatment recommendations";
const comprehensive = dermatologyRAG.getComprehensiveRecommendations(testQuery);

console.log(`Query: "${testQuery}"`);
console.log(`Detected conditions: ${comprehensive.detectedConditions.join(', ')}`);
console.log(`Total recommendations: ${comprehensive.conditionBasedRecommendations.length}`);
console.log(`Medication search results: ${comprehensive.medicationSearchResults.length}`);

// Test 4: Database Statistics
console.log('\nTest 4: Database Statistics');
console.log(`Total medications in database: ${dermatologyRAG.medicationIndex.length}`);
console.log(`Available condition categories: ${Object.keys(dermatologyRAG.conditionKeywords).length}`);

console.log('\n✅ RAG System tests completed!');
