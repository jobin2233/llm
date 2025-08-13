import axios from "axios";

// Gemini API configuration
const GEMINI_API_KEY = "AIzaSyD1UO9ZjWdPlLr_v6-yc2F0_67Aijl6MWc";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Create axios instance for Gemini API
const geminiApi = axios.create({
  baseURL: GEMINI_API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});



/**
 * Generate personalized skincare recommendations using enhanced AI prompting strategies
 * @param {string} skinType - User's skin type (oily, dry, combination, sensitive, normal)
 * @param {Array} skinConcerns - Array of skin concerns (acne, aging, hyperpigmentation, etc.)
 * @param {string} age - User's age range
 * @param {string} currentRoutine - Current skincare routine (optional)
 * @param {Object} constraints - User constraints (budget, time, sensitivity, seasonal)
 * @returns {Promise} Gemini API response with personalized recommendations
 */
export const getPersonalizedRecommendations = async (
  skinType,
  skinConcerns,
  age,
  currentRoutine = "",
  constraints = {}
) => {
  try {
    // Extract constraint parameters with defaults
    const {
      budget = "mid-range",
      timeAvailable = "moderate",
      sensitivityLevel = 3,
      seasonalPreference = "year-round",
      currentSeason = "spring"
    } = constraints;

    const prompt = `You are Dr. Sarah Chen, a board-certified dermatologist with 15 years of experience specializing in personalized skincare routines. You have extensive knowledge of ingredient interactions, skin barrier function, and age-specific skincare needs. Your recommendations are evidence-based and consider both scientific research and practical application.

**PATIENT PROFILE:**
• Skin Type: ${skinType}
• Primary Concerns: ${skinConcerns.join(", ")}
• Age Range: ${age}
• Current Routine: ${currentRoutine || "Not specified"}
• Budget Preference: ${budget}
• Time Available: ${timeAvailable}
• Sensitivity Level: ${sensitivityLevel}/5 (1=very sensitive, 5=very tolerant)
• Seasonal Preference: ${seasonalPreference}
• Current Season: ${currentSeason}

**REASONING PROCESS - Follow this structured Chain of Thought:**

## Step 1: Skin Type Analysis
First, analyze the ${skinType} skin type and its characteristics:
- What are the key features of this skin type?
- How does this skin type typically behave?
- What are the primary needs for this skin type?

## Step 2: Root Cause Analysis
Identify the root causes of the primary concerns (${skinConcerns.join(", ")}):
- What underlying factors contribute to these concerns?
- How do these concerns interact with the identified skin type?
- Are there any hormonal, environmental, or lifestyle factors to consider?

## Step 3: Age-Related Factors
Consider age-related skin factors for ${age} age group:
- What skin changes typically occur in this age range?
- How do aging processes affect the identified concerns?
- What preventive measures are most important at this life stage?

## Step 4: Ingredient Selection & Scientific Rationale
Select ingredients that address the specific concerns:
- Which active ingredients are most effective for these concerns?
- How do these ingredients work at the molecular level?
- What is the scientific evidence supporting their use?
- How do these ingredients interact with each other?

## Step 5: Routine Structure for Maximum Efficacy
Structure the routine for optimal results:
- What is the ideal application order for maximum absorption?
- How should actives be layered to prevent irritation?
- What timing considerations are important?

## Step 6: Constraint Integration & Personalization
Adapt recommendations based on constraints:
- Budget considerations (${budget}): Include options for different price points
- Time constraints (${timeAvailable}): Provide both full routine and minimal routine options
- Sensitivity level (${sensitivityLevel}/5): Rate products by gentleness and provide alternatives
- Seasonal adaptability (${seasonalPreference}, current: ${currentSeason}): Adjust for climate and seasonal needs

**PERSONALIZED RECOMMENDATIONS:**

## Morning Routine (Budget-Conscious Options Included)
[Provide step-by-step morning routine with product recommendations for different budgets]

## Evening Routine (Time-Efficient Alternatives)
[Detailed evening routine with time-saving options for busy schedules]

## Weekly Treatments (Sensitivity-Rated)
[Special treatments with gentleness ratings 1-5 and frequency recommendations]

## Ingredient Deep-Dive & Scientific Rationale
[Explain the science behind each recommended ingredient]

## Seasonal Adaptations
[How to modify the routine for different seasons and climates]

## Budget Breakdown
- **Budget-Friendly (Under $50/month):** [Specific product suggestions]
- **Mid-Range ($50-100/month):** [Balanced options]
- **Premium ($100+/month):** [High-end alternatives]

## Time-Based Routine Options
- **Minimal Routine (5 minutes):** [Essential steps only]
- **Standard Routine (10-15 minutes):** [Complete routine]
- **Comprehensive Routine (20+ minutes):** [Full treatment approach]

## Expected Timeline & Monitoring
[Realistic expectations with specific timeframes and what to monitor]

**IMPORTANT:** All recommendations are evidence-based and consider the patient's specific constraints. Adjust products based on availability in your region and always patch test new products.`;

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    });

    return {
      success: true,
      data: response.data,
      recommendations: response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No recommendations available",
      constraints: constraints // Include constraints in response for debugging
    };
  } catch (error) {
    console.error("❌ Error getting personalized recommendations:", error);
    return {
      success: false,
      error: error.message,
      recommendations: "Unable to generate recommendations at this time. Please try again later."
    };
  }
};

/**
 * Get treatment explanations for specific skin conditions
 * @param {string} condition - Skin condition to explain
 * @param {string} severity - Severity level (mild, moderate, severe)
 * @returns {Promise} Gemini API response with treatment explanation
 */
export const getTreatmentExplanation = async (condition, severity = "moderate") => {
  try {
    const prompt = `As a board-certified dermatologist, provide a comprehensive, well-structured guide about **${condition}** (${severity} severity):

## 1. Understanding ${condition}
Provide a clear, patient-friendly explanation of what this condition is, including:
• Medical definition in simple terms
• How it affects the skin
• Who is most commonly affected

## 2. Causes and Triggers
• Primary causes of ${condition}
• Common triggers that worsen the condition
• Risk factors and predisposing conditions

## 3. Symptoms and Identification
• Early warning signs to watch for
• Visual characteristics and appearance
• How to distinguish from similar conditions
• Severity indicators

## 4. Treatment Options
### Over-the-Counter Treatments:
• Recommended OTC products and ingredients
• How to use them effectively
• Expected results and timeline

### Professional Treatments:
• Prescription medications available
• In-office procedures and therapies
• Advanced treatment options

## 5. Prevention Strategies
• Daily habits to prevent flare-ups
• Skincare routine modifications
• Environmental and lifestyle factors

## 6. When to See a Dermatologist
• Warning signs requiring immediate attention
• Symptoms that indicate professional care is needed
• How to prepare for your appointment

## 7. Treatment Timeline & Expectations
• Realistic timeline for improvement
• What to expect during treatment
• Long-term management strategies

## 8. Lifestyle Modifications
• Dietary considerations
• Stress management techniques
• Environmental modifications
• Sleep and exercise recommendations

**IMPORTANT:** Use clear headers, bullet points, and structured formatting. Provide evidence-based information while emphasizing that this is educational content and not a substitute for professional medical advice.`;

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    });

    return {
      success: true,
      data: response.data,
      explanation: response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No explanation available"
    };
  } catch (error) {
    console.error("❌ Error getting treatment explanation:", error);
    return {
      success: false,
      error: error.message,
      explanation: "Unable to generate treatment explanation at this time. Please try again later."
    };
  }
};

/**
 * Get beauty product recommendations for specific skin types
 * @param {string} skinType - User's skin type
 * @param {string} productCategory - Category of products (cleanser, moisturizer, serum, etc.)
 * @param {string} budget - Budget range (drugstore, mid-range, luxury)
 * @param {Array} specificConcerns - Specific concerns to address
 * @returns {Promise} Gemini API response with product recommendations
 */
export const getProductRecommendations = async (skinType, productCategory, budget = "mid-range", specificConcerns = []) => {
  try {
    const prompt = `As a skincare expert and cosmetic chemist, provide detailed ${productCategory} recommendations for **${skinType} skin** with a **${budget} budget**.

**TARGET PROFILE:**
• Skin Type: ${skinType}
• Product Category: ${productCategory}
• Budget Range: ${budget}
• Specific Concerns: ${specificConcerns.join(", ") || "General skincare maintenance"}

## 1. Top 5 Product Recommendations

For each product, provide:
• **Product Name & Brand**
• **Price Range** (specific pricing)
• **Key Ingredients** (and why they're effective)
• **Why It Works** for ${skinType} skin
• **Where to Buy** (online/retail availability)
• **User Rating** (if known)

## 2. Key Ingredients to Look For
• List the most beneficial ingredients in ${productCategory} for ${skinType} skin
• Explain the science behind why each ingredient works
• Concentration recommendations where applicable

## 3. Application Tips & Best Practices
• Step-by-step application instructions
• When to use in your routine (AM/PM)
• How much product to use
• Frequency of use recommendations
• Tips for maximizing effectiveness

## 4. Ingredients & Formulations to Avoid
• Ingredients that may irritate ${skinType} skin
• Formulation types that don't work well
• Common mistakes to avoid
• Potential interactions with other products

## 5. Budget-Friendly Alternatives
• Drugstore options that deliver similar results
• DIY alternatives (if safe and effective)
• Multi-purpose products that offer good value
• When to invest vs. when to save

## 6. Product Comparison & Selection Guide
• How to choose between similar products
• What to look for on ingredient labels
• Red flags in product marketing
• How to patch test new products

**FORMAT:** Use clear headers, bullet points, and structured formatting. Focus on products that are widely available, well-reviewed, and backed by scientific evidence.`;

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    });

    const productText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No product recommendations available";

    return {
      success: true,
      data: response.data,
      products: productText
    };
  } catch (error) {
    console.error("❌ Error getting product recommendations:", error);
    return {
      success: false,
      error: error.message,
      products: "Unable to generate product recommendations at this time. Please try again later."
    };
  }
};

/**
 * Get educational content about skincare basics
 * @param {string} topic - Topic to explain (skincare routine, ingredients, skin types, etc.)
 * @returns {Promise} Gemini API response with educational content
 */
export const getEducationalContent = async (topic) => {
  try {
    const prompt = `As a skincare educator and dermatologist, provide comprehensive educational content about: ${topic}

Please structure the content as follows:
1. **Introduction** (what is this topic and why is it important)
2. **Key Concepts** (fundamental principles everyone should know)
3. **Common Myths vs Facts** (debunk misconceptions)
4. **Practical Tips** (actionable advice for daily application)
5. **Expert Recommendations** (professional insights)
6. **Further Learning** (what to explore next)

Make the content engaging, scientifically accurate, and suitable for beginners to intermediate skincare enthusiasts. Use clear language and provide practical examples.`;

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    });

    return {
      success: true,
      data: response.data,
      content: response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No educational content available"
    };
  } catch (error) {
    console.error("❌ Error getting educational content:", error);
    return {
      success: false,
      error: error.message,
      content: "Unable to generate educational content at this time. Please try again later."
    };
  }
};

/**
 * Get skincare routine recommendations based on user's analysis results
 * @param {Object} analysisResults - Results from skin analysis
 * @param {string} userPreferences - User preferences (time, budget, complexity)
 * @returns {Promise} Gemini API response with routine recommendations
 */
export const getRoutineFromAnalysis = async (analysisResults, userPreferences = "") => {
  try {
    const prompt = `Based on the following skin analysis results, create a personalized skincare routine:

Analysis Results: ${JSON.stringify(analysisResults, null, 2)}
User Preferences: ${userPreferences || "Standard routine"}

Please provide:
1. **Immediate Priorities** (what to address first)
2. **Customized Morning Routine** (step-by-step with timing)
3. **Customized Evening Routine** (step-by-step with timing)
4. **Weekly Additions** (treatments, masks, exfoliation)
5. **Product Priorities** (what to buy first if on a budget)
6. **Timeline Expectations** (when to expect improvements)
7. **Monitoring Tips** (how to track progress)

Tailor the recommendations specifically to the detected conditions and user preferences. Prioritize the most important steps for their specific concerns.`;

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    });

    return {
      success: true,
      data: response.data,
      routine: response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No routine recommendations available"
    };
  } catch (error) {
    console.error("❌ Error getting routine from analysis:", error);
    return {
      success: false,
      error: error.message,
      routine: "Unable to generate routine recommendations at this time. Please try again later."
    };
  }
};

/**
 * Get ingredient analysis and recommendations
 * @param {Array} ingredients - List of ingredients to analyze
 * @param {string} skinType - User's skin type
 * @returns {Promise} Gemini API response with ingredient analysis
 */
export const analyzeIngredients = async (ingredients, skinType) => {
  try {
    const prompt = `As a cosmetic chemist and dermatologist, analyze these skincare ingredients for ${skinType} skin:

Ingredients: ${ingredients.join(", ")}

Please provide:
1. **Individual Ingredient Analysis** (what each ingredient does)
2. **Compatibility Assessment** (how well they work together)
3. **Suitability for ${skinType} Skin** (benefits and potential concerns)
4. **Application Order** (if using multiple products with these ingredients)
5. **Potential Side Effects** (what to watch out for)
6. **Complementary Ingredients** (what would work well with these)
7. **Ingredients to Avoid** (what not to mix with these)

Focus on evidence-based information and practical guidance for safe and effective use.`;

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    });

    return {
      success: true,
      data: response.data,
      analysis: response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No ingredient analysis available"
    };
  } catch (error) {
    console.error("❌ Error analyzing ingredients:", error);
    return {
      success: false,
      error: error.message,
      analysis: "Unable to analyze ingredients at this time. Please try again later."
    };
  }
};

/**
 * Generate personalized diet plan for skin health using Dr. Sarah Chen's expertise
 * @param {Object} userProfile - User profile containing health and dietary information
 * @returns {Promise} Gemini API response with personalized diet plan
 */
export const generateDietPlan = async (userProfile) => {
  try {
    const {
      age,
      gender,
      weight,
      height,
      activityLevel = "moderate",
      dietaryRestrictions = [],
      allergies = [],
      skinConditions = [],
      currentDiet = "",
      healthGoals = [],
      mealPreferences = "balanced"
    } = userProfile;

    // Calculate BMI for nutritional context
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    const prompt = `You are a team of three specialists working together to create a personalized therapeutic diet plan:

👩⚕️ Dr. Sarah Chen - Board-Certified Dermatologist
12+ years in nutritional dermatology
Specializes in skin-diet connections and evidence-based protocols
Role: Analyze skin conditions, identify nutritional targets, explain skin benefits

👨🍳 Chef Michael Rodriguez - Culinary Nutritionist
Registered dietitian with culinary expertise
Specializes in therapeutic cooking and meal adaptation
Role: Create practical, delicious meals that meet nutritional targets

👩💼 Lisa Thompson - Clinical Nutritionist
Certified in metabolic nutrition and meal planning
Expert in dietary restrictions and food allergies
Role: Calculate nutritional needs, ensure safety, plan balanced intake

**PATIENT PROFILE:**
• Age: ${age} years
• Gender: ${gender}
• Weight: ${weight} kg
• Height: ${height} cm
• BMI: ${bmi.toFixed(1)}
• Activity Level: ${activityLevel}
• Dietary Restrictions: ${dietaryRestrictions.length > 0 ? dietaryRestrictions.join(", ") : "None"}
• Allergies: ${allergies.length > 0 ? allergies.join(", ") : "None"}
• Skin Conditions: ${skinConditions.length > 0 ? skinConditions.join(", ") : "General skin health"}
• Current Diet: ${currentDiet || "Not specified"}
• Health Goals: ${healthGoals.length > 0 ? healthGoals.join(", ") : "Improve skin health"}
• Meal Preferences: ${mealPreferences}

🧠 ANALYSIS FRAMEWORK (Use Chain-of-Thought):

Step 1: Metabolic Calculations (Lisa Thompson)
THINKING PROCESS:
1. Calculate BMR using Mifflin-St Jeor:
   - For males: BMR = (10 × weight) + (6.25 × height) - (5 × age) + 5
   - For females: BMR = (10 × weight) + (6.25 × height) - (5 × age) - 161
2. Apply activity multiplier:
   - Sedentary: 1.2 | Light: 1.375 | Moderate: 1.55 | Very Active: 1.725 | Extra Active: 1.9
3. Adjust for health goals:
   - Skin healing: +100-200 calories
   - Weight management: ±300-500 calories
4. Calculate macronutrient targets based on restrictions and goals

Step 2: Dermatological Assessment (Dr. Sarah Chen)
THINKING PROCESS:
1. Identify primary skin concerns and their nutritional triggers
2. Map skin conditions to evidence-based nutritional interventions:
   - Acne: Low-glycemic, anti-inflammatory, zinc-rich
   - Eczema: Omega-3s, gut health, allergen avoidance
   - Aging: Antioxidants, collagen support, sun protection
3. Consider contraindications with allergies/restrictions
4. Prioritize interventions based on severity and user goals

Step 3: Dietary Integration (Chef Michael Rodriguez)
THINKING PROCESS:
1. Assess cooking constraints: time, budget, skill level
2. Identify compatible foods that meet nutritional targets
3. Plan meal variety and cultural preferences
4. Ensure practical preparation methods
5. Create sustainable, enjoyable meal patterns

TEAM COLLABORATION INSTRUCTIONS:
Work together to create a comprehensive therapeutic diet plan. Each specialist should contribute their expertise while ensuring the final plan is cohesive, practical, and therapeutically effective.

Please provide a detailed analysis and 7-day therapeutic diet plan that includes:

🔬 METABOLIC ANALYSIS (Lisa Thompson):
- BMR calculation and total daily energy expenditure
- Macronutrient targets (protein, carbs, fats)
- Key micronutrients for skin health
- Hydration requirements

🩺 DERMATOLOGICAL ASSESSMENT (Dr. Sarah Chen):
- Analysis of skin conditions and nutritional connections
- Evidence-based interventions for each condition
- Anti-inflammatory protocol design
- Expected timeline for improvements

🍽️ CULINARY IMPLEMENTATION (Chef Michael Rodriguez):
- 7-day meal plan with breakfast, lunch, dinner, and snacks
- Practical recipes that meet nutritional targets
- Meal prep strategies and cooking tips
- Flavor profiles and cultural adaptations

📅 COMPLETE 7-DAY MEAL PLAN:
- Daily nutritional breakdown
- Specific meals with portion sizes
- Skin benefits explanation for each meal
- Recipe variations for dietary restrictions

💊 SUPPLEMENT RECOMMENDATIONS:
- Evidence-based supplements for skin health
- Dosages and timing recommendations
- Safety considerations with allergies/restrictions

🥗 THERAPEUTIC FOOD LISTS:
- Top skin-healing foods to emphasize
- Foods to avoid or limit
- Nutrient-dense alternatives for restrictions

💧 HYDRATION & LIFESTYLE:
- Optimal daily fluid intake
- Skin-boosting beverages
- Lifestyle factors that support the diet plan

📊 MONITORING & ADAPTATION:
- Key indicators to track progress
- Timeline for expected improvements
- When and how to modify the plan

🍲 FEATURED RECIPES:
- 5 detailed therapeutic recipes
- Ingredient substitutions for allergies/restrictions
- Nutritional analysis and skin benefits

Format the response as a collaborative consultation where each specialist contributes their expertise. Use clear headings and maintain a professional yet accessible tone throughout.

## Skin-Specific Supplement Recommendations
- **Essential Supplements:** [Based on skin conditions and dietary gaps]
- **Timing:** [When to take each supplement]
- **Interactions:** [What to avoid combining]

## Foods to Emphasize for Skin Health
- **Anti-Inflammatory Foods:** [Specific list with benefits]
- **Antioxidant-Rich Foods:** [Specific list with benefits]
- **Skin Barrier Support:** [Foods that strengthen skin barrier]
- **Collagen Support:** [Foods that boost collagen production]

## Foods to Limit or Avoid
- **Pro-Inflammatory Foods:** [Specific foods that may worsen skin conditions]
- **High Glycemic Foods:** [Foods that may trigger breakouts]
- **Personal Triggers:** [Based on individual skin conditions]

## Meal Prep Strategies
- **Weekly Prep:** [Batch cooking suggestions]
- **Quick Options:** [15-minute meal ideas]
- **Budget Tips:** [Cost-saving strategies]
- **Storage:** [How to store prepared meals]

## Hydration Protocol
- **Daily Water Intake:** [Specific amount]
- **Timing:** [When to drink water for optimal skin benefits]
- **Skin-Boosting Beverages:** [Herbal teas, infused waters]

## Expected Timeline & Monitoring
- **Week 1-2:** [What to expect]
- **Week 3-4:** [Anticipated improvements]
- **Month 2-3:** [Long-term benefits]
- **Tracking Methods:** [How to monitor progress]

## Recipe Collection
[Provide 5-7 detailed recipes for key meals mentioned in the plan]

**IMPORTANT:** This diet plan is designed specifically for your skin conditions and health profile. All recommendations are evidence-based and consider your dietary restrictions and lifestyle constraints. Consult with a healthcare provider before making significant dietary changes, especially if you have underlying health conditions.`;

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    });

    const dietPlanText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No diet plan available";

    return {
      success: true,
      data: response.data,
      dietPlan: dietPlanText,
      userProfile: userProfile, // Include user profile for reference
      calculatedBMI: bmi.toFixed(1)
    };
  } catch (error) {
    console.error("❌ Error generating diet plan:", error);
    return {
      success: false,
      error: error.message,
      dietPlan: "Unable to generate diet plan at this time. Please try again later."
    };
  }
};

export default {
  getPersonalizedRecommendations,
  getTreatmentExplanation,
  getProductRecommendations,
  getEducationalContent,
  getRoutineFromAnalysis,
  analyzeIngredients,
  generateDietPlan
};
