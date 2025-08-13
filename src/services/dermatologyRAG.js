import dermatologyDatabase from '../../dermatology_database.json';

// 🔍 RAG System for Dermatology Database
class DermatologyRAG {
  constructor() {
    this.database = dermatologyDatabase.dermatology_medicines_database;
    this.categories = this.database.categories;
    
    // Create searchable index
    this.medicationIndex = this.createMedicationIndex();
    this.conditionKeywords = this.createConditionKeywords();
  }

  // Create a searchable index of all medications
  createMedicationIndex() {
    const index = [];
    
    Object.keys(this.categories).forEach(categoryKey => {
      const category = this.categories[categoryKey];
      
      // Handle different category structures
      if (Array.isArray(category)) {
        // Direct array (like rosacea_medications)
        category.forEach(medication => {
          index.push({
            ...medication,
            category: categoryKey,
            subcategory: null
          });
        });
      } else {
        // Nested structure (like acne_medications with topical_treatments, oral_treatments)
        Object.keys(category).forEach(subcategoryKey => {
          if (Array.isArray(category[subcategoryKey])) {
            category[subcategoryKey].forEach(medication => {
              index.push({
                ...medication,
                category: categoryKey,
                subcategory: subcategoryKey
              });
            });
          }
        });
      }
    });
    
    return index;
  }

  // Create keyword mappings for conditions
  createConditionKeywords() {
    return {
      'acne': ['acne', 'pimples', 'blackheads', 'whiteheads', 'comedones', 'breakouts', 'zits'],
      'eczema': ['eczema', 'dermatitis', 'atopic dermatitis', 'dry skin', 'itchy skin', 'rash'],
      'psoriasis': ['psoriasis', 'plaque psoriasis', 'scaly skin', 'red patches', 'silvery scales'],
      'rosacea': ['rosacea', 'facial redness', 'red face', 'flushing', 'papules', 'pustules'],
      'fungal': ['fungal infection', 'athlete\'s foot', 'ringworm', 'jock itch', 'candidiasis', 'yeast infection'],
      'bacterial': ['bacterial infection', 'impetigo', 'cellulitis', 'staph infection', 'strep infection'],
      'viral': ['viral infection', 'herpes', 'cold sores', 'shingles', 'warts'],
      'hyperpigmentation': ['dark spots', 'melasma', 'age spots', 'sun spots', 'hyperpigmentation', 'discoloration'],
      'seborrheic_dermatitis': ['seborrheic dermatitis', 'dandruff', 'scalp irritation', 'oily skin'],
      'hair_loss': ['hair loss', 'alopecia', 'baldness', 'thinning hair', 'male pattern baldness']
    };
  }

  // Detect conditions from text
  detectConditions(text) {
    const detectedConditions = [];
    const lowerText = text.toLowerCase();
    
    Object.keys(this.conditionKeywords).forEach(condition => {
      const keywords = this.conditionKeywords[condition];
      const found = keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
      
      if (found) {
        detectedConditions.push(condition);
      }
    });
    
    return detectedConditions;
  }

  // Get medications for specific conditions
  getMedicationsForConditions(conditions) {
    const recommendations = [];
    
    conditions.forEach(condition => {
      // Map condition to database category
      const categoryMapping = {
        'acne': 'acne_medications',
        'eczema': 'eczema_dermatitis_medications',
        'psoriasis': 'psoriasis_medications',
        'rosacea': 'rosacea_medications',
        'fungal': 'fungal_infection_medications',
        'bacterial': 'bacterial_skin_infection_medications',
        'viral': 'viral_skin_infection_medications',
        'hyperpigmentation': 'hyperpigmentation_medications',
        'seborrheic_dermatitis': 'seborrheic_dermatitis_medications',
        'hair_loss': 'hair_loss_medications'
      };
      
      const categoryKey = categoryMapping[condition];
      if (categoryKey && this.categories[categoryKey]) {
        const categoryMeds = this.medicationIndex.filter(med => med.category === categoryKey);
        
        // Sort by rating (highest first) and take top 3
        const topMeds = categoryMeds
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 3);
        
        recommendations.push({
          condition,
          medications: topMeds
        });
      }
    });
    
    return recommendations;
  }

  // Search medications by name or mechanism
  searchMedications(query) {
    const lowerQuery = query.toLowerCase();
    
    return this.medicationIndex.filter(med => {
      return (
        med.name.toLowerCase().includes(lowerQuery) ||
        (med.mechanism_of_action && med.mechanism_of_action.toLowerCase().includes(lowerQuery)) ||
        (med.specific_uses && med.specific_uses.toLowerCase().includes(lowerQuery))
      );
    });
  }

  // Get comprehensive treatment recommendations
  getComprehensiveRecommendations(userQuery, detectedConditions = []) {
    // If no conditions detected, try to detect from query
    if (detectedConditions.length === 0) {
      detectedConditions = this.detectConditions(userQuery);
    }
    
    const recommendations = this.getMedicationsForConditions(detectedConditions);
    
    // Also search for any specific medications mentioned
    const medicationSearch = this.searchMedications(userQuery);
    
    return {
      detectedConditions,
      conditionBasedRecommendations: recommendations,
      medicationSearchResults: medicationSearch.slice(0, 5), // Top 5 search results
      totalMedications: this.medicationIndex.length
    };
  }

  // Format recommendations for display
  formatRecommendationsForChat(recommendations) {
    let response = "🏥 **Medical Recommendations Based on Analysis**\n\n";
    
    if (recommendations.detectedConditions.length > 0) {
      response += `**Detected Conditions:** ${recommendations.detectedConditions.join(', ')}\n\n`;
    }
    
    if (recommendations.conditionBasedRecommendations.length > 0) {
      response += "**Recommended Medications:**\n\n";
      
      recommendations.conditionBasedRecommendations.forEach(conditionRec => {
        response += `**For ${conditionRec.condition.replace('_', ' ').toUpperCase()}:**\n`;
        
        conditionRec.medications.forEach((med, index) => {
          response += `${index + 1}. **${med.name}** (Rating: ${med.rating}/10)\n`;
          response += `   - Mechanism: ${med.mechanism_of_action || 'N/A'}\n`;
          response += `   - Uses: ${med.specific_uses || 'N/A'}\n\n`;
        });
      });
    }
    
    response += "\n⚠️ **Important:** These are general recommendations. Always consult with a healthcare professional before starting any medication.";
    
    return response;
  }
}

// Create singleton instance
const dermatologyRAG = new DermatologyRAG();

export default dermatologyRAG;
export { DermatologyRAG };
