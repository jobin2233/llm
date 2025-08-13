import { useState, useEffect } from "react";
import {
  getPersonalizedRecommendations,
  getProductRecommendations,
  generateDietPlan
} from "../services/geminiAPI";
import { searchSkincareProducts, searchSkincareVideos } from "../services/amazonAPI";
import { getCurrentUser } from "../services/firebase";

import {
  SparklesIcon,
  BookOpenIcon,
  HeartIcon,
  ShoppingBagIcon,
  UserIcon,
  AcademicCapIcon,
  StarIcon,
  ArrowPathIcon,
  CakeIcon
} from "@heroicons/react/24/outline";
import LoadingAnimation, { ContentSkeleton } from "../components/recommendations/LoadingAnimation";
import ContentFormatter, {
  RoutineFormatter,
  ProductFormatter
} from "../components/recommendations/ContentFormatter";

import ProductGrid from "../components/recommendations/ProductGrid";
import VideoGrid from "../components/recommendations/VideoGrid";

const Recommendations = () => {
  const [activeTab, setActiveTab] = useState("personalized");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState("");
  const [productRecs, setProductRecs] = useState("");
  const [educationalVideos, setEducationalVideos] = useState([]);
  const [videoError, setVideoError] = useState(null);
  const [amazonProducts, setAmazonProducts] = useState([]);
  const [productError, setProductError] = useState(null);

  // Form states
  const [skinType, setSkinType] = useState("normal");
  const [skinConcerns, setSkinConcerns] = useState([]);
  const [ageRange, setAgeRange] = useState("25-35");
  const [productCategory, setProductCategory] = useState("cleanser");
  const [budget, setBudget] = useState("mid-range");
  const [educationTopic, setEducationTopic] = useState("skincare-basics");

  // Enhanced constraint states for Dr. Sarah Chen prompting
  const [timeAvailable, setTimeAvailable] = useState("moderate");
  const [sensitivityLevel, setSensitivityLevel] = useState(3);
  const [seasonalPreference, setSeasonalPreference] = useState("year-round");
  const [currentSeason, setCurrentSeason] = useState("spring");

  // Diet Plan states
  const [dietPlan, setDietPlan] = useState("");
  const [dietLoading, setDietLoading] = useState(false);
  const [dietError, setDietError] = useState(null);

  // Diet Plan form states
  const [dietAge, setDietAge] = useState("");
  const [dietGender, setDietGender] = useState("female");
  const [dietWeight, setDietWeight] = useState("");
  const [dietHeight, setDietHeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [skinConditions, setSkinConditions] = useState([]);
  const [currentDiet, setCurrentDiet] = useState("");
  const [healthGoals, setHealthGoals] = useState([]);
  const [mealPreferences, setMealPreferences] = useState("balanced");

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const skinTypeOptions = [
    { value: "normal", label: "Normal", description: "Balanced, not too oily or dry" },
    { value: "oily", label: "Oily", description: "Shiny, enlarged pores, prone to breakouts" },
    { value: "dry", label: "Dry", description: "Tight, flaky, rough texture" },
    { value: "combination", label: "Combination", description: "Oily T-zone, dry cheeks" },
    { value: "sensitive", label: "Sensitive", description: "Easily irritated, reactive" }
  ];

  const concernOptions = [
    "Acne", "Aging", "Hyperpigmentation", "Dryness", "Oiliness", 
    "Sensitivity", "Rosacea", "Dark Circles", "Fine Lines", "Large Pores"
  ];



  const productCategories = [
    { value: "cleanser", label: "Cleanser" },
    { value: "moisturizer", label: "Moisturizer" },
    { value: "serum", label: "Serum" },
    { value: "sunscreen", label: "Sunscreen" },
    { value: "exfoliant", label: "Exfoliant" },
    { value: "mask", label: "Face Mask" }
  ];

  const educationTopics = [
    { value: "skincare-basics", label: "Skincare Basics", query: "skincare routine basics beginner" },
    { value: "ingredient-guide", label: "Ingredient Guide", query: "skincare ingredients explained dermatologist" },
    { value: "routine-building", label: "Building a Routine", query: "how to build skincare routine step by step" },
    { value: "anti-aging", label: "Anti-Aging Strategies", query: "anti aging skincare routine dermatologist" },
    { value: "acne-treatment", label: "Acne Treatment", query: "acne treatment skincare routine dermatologist" },
    { value: "sun-protection", label: "Sun Protection", query: "sunscreen skincare SPF protection dermatologist" }
  ];

  // Enhanced constraint options for Dr. Sarah Chen prompting
  const timeOptions = [
    { value: "minimal", label: "Minimal (5 minutes)", description: "Quick essential steps only" },
    { value: "moderate", label: "Moderate (10-15 minutes)", description: "Standard comprehensive routine" },
    { value: "extensive", label: "Extensive (20+ minutes)", description: "Full treatment approach" }
  ];

  const budgetOptions = [
    { value: "budget-friendly", label: "Budget-Friendly", description: "Under $50/month" },
    { value: "mid-range", label: "Mid-Range", description: "$50-100/month" },
    { value: "premium", label: "Premium", description: "$100+/month" }
  ];

  const seasonalOptions = [
    { value: "year-round", label: "Year-Round", description: "Consistent routine regardless of season" },
    { value: "seasonal", label: "Seasonal Adaptation", description: "Adjust routine based on climate changes" }
  ];

  const currentSeasonOptions = [
    { value: "spring", label: "Spring" },
    { value: "summer", label: "Summer" },
    { value: "fall", label: "Fall/Autumn" },
    { value: "winter", label: "Winter" }
  ];

  // Diet Plan options
  const activityLevelOptions = [
    { value: "sedentary", label: "Sedentary", description: "Little to no exercise" },
    { value: "light", label: "Light Activity", description: "Light exercise 1-3 days/week" },
    { value: "moderate", label: "Moderate Activity", description: "Moderate exercise 3-5 days/week" },
    { value: "active", label: "Very Active", description: "Hard exercise 6-7 days/week" },
    { value: "extra", label: "Extra Active", description: "Very hard exercise, physical job" }
  ];

  const dietaryRestrictionOptions = [
    "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo",
    "Mediterranean", "Low-Carb", "Low-Fat", "Halal", "Kosher", "Pescatarian"
  ];

  const allergyOptions = [
    "Nuts", "Shellfish", "Fish", "Eggs", "Dairy", "Soy", "Gluten",
    "Sesame", "Sulfites", "Nightshades", "Citrus", "Chocolate"
  ];

  const skinConditionOptions = [
    "Acne", "Eczema", "Psoriasis", "Rosacea", "Dermatitis", "Melasma",
    "Hyperpigmentation", "Premature Aging", "Dry Skin", "Oily Skin", "Sensitive Skin"
  ];

  const healthGoalOptions = [
    "Clear Skin", "Anti-Aging", "Reduce Inflammation", "Improve Skin Texture",
    "Boost Collagen", "Reduce Acne", "Even Skin Tone", "Strengthen Skin Barrier"
  ];

  const mealPreferenceOptions = [
    { value: "balanced", label: "Balanced", description: "Mix of all food groups" },
    { value: "plant-based", label: "Plant-Based", description: "Emphasis on fruits and vegetables" },
    { value: "protein-rich", label: "Protein-Rich", description: "Higher protein content" },
    { value: "low-carb", label: "Low-Carb", description: "Reduced carbohydrate intake" },
    { value: "mediterranean", label: "Mediterranean", description: "Mediterranean diet style" }
  ];



  const handleConcernToggle = (concern) => {
    setSkinConcerns(prev => 
      prev.includes(concern) 
        ? prev.filter(c => c !== concern)
        : [...prev, concern]
    );
  };

  const handleGetRecommendations = async () => {
    setLoading(true);
    try {
      // Prepare constraints object for Dr. Sarah Chen enhanced prompting
      const constraints = {
        budget,
        timeAvailable,
        sensitivityLevel,
        seasonalPreference,
        currentSeason
      };

      const result = await getPersonalizedRecommendations(
        skinType,
        skinConcerns,
        ageRange,
        "", // currentRoutine - could be added as a form field later
        constraints
      );
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error("Error getting recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Diet Plan helper functions
  const handleDietaryRestrictionToggle = (restriction) => {
    setDietaryRestrictions(prev =>
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const handleAllergyToggle = (allergy) => {
    setAllergies(prev =>
      prev.includes(allergy)
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const handleSkinConditionToggle = (condition) => {
    setSkinConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const handleHealthGoalToggle = (goal) => {
    setHealthGoals(prev =>
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleGenerateDietPlan = async () => {
    setDietLoading(true);
    setDietError(null);

    try {
      // Validate required fields
      if (!dietAge || !dietWeight || !dietHeight) {
        setDietError("Please fill in all required fields (age, weight, height)");
        return;
      }

      const userProfile = {
        age: parseInt(dietAge),
        gender: dietGender,
        weight: parseFloat(dietWeight),
        height: parseFloat(dietHeight),
        activityLevel,
        dietaryRestrictions,
        allergies,
        skinConditions,
        currentDiet,
        healthGoals,
        mealPreferences
      };

      const result = await generateDietPlan(userProfile);

      if (result.success) {
        setDietPlan(result.dietPlan);
      } else {
        setDietError(result.error || "Failed to generate diet plan");
      }
    } catch (error) {
      console.error("Error generating diet plan:", error);
      setDietError("Unable to generate diet plan. Please try again.");
    } finally {
      setDietLoading(false);
    }
  };



  const handleGetProductRecs = async () => {
    setLoading(true);
    setProductError(null);
    setProductRecs(""); // Clear any previous recommendations

    try {
      // Call ONLY SERP API for Amazon products
      const amazonProducts = await searchSkincareProducts(productCategory, skinType, budget, skinConcerns);
      setAmazonProducts(amazonProducts);
    } catch (error) {
      console.error("Error getting Amazon products:", error);
      setProductError("Unable to load Amazon products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetEducation = async () => {
    setLoading(true);
    setVideoError(null);
    setEducationalVideos([]); // Clear previous videos

    try {
      // Find the selected topic's query
      const selectedTopic = educationTopics.find(topic => topic.value === educationTopic);
      const searchQuery = selectedTopic ? selectedTopic.query : educationTopic;

      console.log('Searching for educational videos:', searchQuery);

      // Call ONLY SERP API for YouTube videos
      const videos = await searchSkincareVideos(searchQuery);
      setEducationalVideos(videos);
    } catch (error) {
      console.error("Error getting educational videos:", error);
      setVideoError("Unable to load educational videos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "personalized", label: "Personalized Routine", icon: UserIcon },
    { id: "diet", label: "Diet Plan", icon: CakeIcon },
    { id: "products", label: "Product Finder", icon: ShoppingBagIcon },
    { id: "education", label: "Learn", icon: AcademicCapIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 relative animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 rounded-3xl -z-10 mx-4 animate-gradient-shift"></div>
          <div className="relative py-16 px-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 bg-clip-text text-transparent animate-gradient-shift">
              AI-Powered Skincare Recommendations
            </h1>
            <p className="text-xl text-sky-700 max-w-3xl mx-auto mb-8 leading-relaxed">
              Get personalized skincare advice, treatment explanations, and product recommendations powered by advanced AI
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 bg-white rounded-2xl shadow-lg p-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md"
                    : "text-gray-600 hover:text-sky-600 hover:bg-sky-50"
                }`}
              >
                <IconComponent className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="glass-strong rounded-3xl shadow-luxury p-8 border border-white/20">
          {activeTab === "personalized" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-crystal-white mb-4 heading-professional bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Dr. Sarah Chen's Personalized Analysis
                </h2>
                <p className="text-crystal-white/80 max-w-3xl mx-auto text-lg text-professional">
                  Experience advanced AI-powered skincare analysis with Role Prompting, Chain of Thought reasoning, and constraint-based personalization for optimal results
                </p>
                <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-crystal-white/70">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>15+ Years Dermatology Experience</span>
                  <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                  <span>Evidence-Based Recommendations</span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>Personalized Constraints</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Form */}
                <div className="space-y-6">
                  {/* Skin Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Skin Type</label>
                    <div className="grid grid-cols-1 gap-3">
                      {skinTypeOptions.map((option) => (
                        <label key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-sky-50 cursor-pointer">
                          <input
                            type="radio"
                            name="skinType"
                            value={option.value}
                            checked={skinType === option.value}
                            onChange={(e) => setSkinType(e.target.value)}
                            className="text-sky-600 focus:ring-sky-500"
                          />
                          <div>
                            <div className="font-medium text-gray-800">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Skin Concerns */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Skin Concerns (Select all that apply)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {concernOptions.map((concern) => (
                        <label key={concern} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-sky-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={skinConcerns.includes(concern)}
                            onChange={() => handleConcernToggle(concern)}
                            className="text-sky-600 focus:ring-sky-500"
                          />
                          <span className="text-sm text-gray-700">{concern}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Age Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Age Range</label>
                    <select
                      value={ageRange}
                      onChange={(e) => setAgeRange(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value="18-25">18-25</option>
                      <option value="25-35">25-35</option>
                      <option value="35-45">35-45</option>
                      <option value="45-55">45-55</option>
                      <option value="55+">55+</option>
                    </select>
                  </div>

                  {/* Enhanced Constraints Section */}
                  <div className="glass-light rounded-2xl p-6 border border-white/20">
                    <h4 className="text-lg font-semibold text-crystal-white mb-4 heading-professional">
                      🎯 Dr. Sarah Chen's Personalization Preferences
                    </h4>
                    <p className="text-sm text-crystal-white/80 mb-6">
                      Enhanced AI analysis considering your lifestyle and preferences
                    </p>

                    {/* Budget Preference */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-crystal-white mb-3">Budget Preference</label>
                      <div className="grid grid-cols-1 gap-3">
                        {budgetOptions.map((option) => (
                          <label key={option.value} className="flex items-center space-x-3 p-3 glass-light rounded-xl hover:glass-medium cursor-pointer border border-white/10">
                            <input
                              type="radio"
                              name="budget"
                              value={option.value}
                              checked={budget === option.value}
                              onChange={(e) => setBudget(e.target.value)}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <div>
                              <div className="font-medium text-crystal-white">{option.label}</div>
                              <div className="text-sm text-crystal-white/70">{option.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Time Available */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-crystal-white mb-3">Time Available for Routine</label>
                      <div className="grid grid-cols-1 gap-3">
                        {timeOptions.map((option) => (
                          <label key={option.value} className="flex items-center space-x-3 p-3 glass-light rounded-xl hover:glass-medium cursor-pointer border border-white/10">
                            <input
                              type="radio"
                              name="timeAvailable"
                              value={option.value}
                              checked={timeAvailable === option.value}
                              onChange={(e) => setTimeAvailable(e.target.value)}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <div>
                              <div className="font-medium text-crystal-white">{option.label}</div>
                              <div className="text-sm text-crystal-white/70">{option.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Sensitivity Level */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-crystal-white mb-3">
                        Skin Sensitivity Level: {sensitivityLevel}/5
                      </label>
                      <div className="px-3">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={sensitivityLevel}
                          onChange={(e) => setSensitivityLevel(parseInt(e.target.value))}
                          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-xs text-crystal-white/70 mt-2">
                          <span>Very Sensitive</span>
                          <span>Moderate</span>
                          <span>Very Tolerant</span>
                        </div>
                      </div>
                    </div>

                    {/* Seasonal Preference */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-crystal-white mb-3">Seasonal Adaptation</label>
                      <div className="grid grid-cols-1 gap-3 mb-4">
                        {seasonalOptions.map((option) => (
                          <label key={option.value} className="flex items-center space-x-3 p-3 glass-light rounded-xl hover:glass-medium cursor-pointer border border-white/10">
                            <input
                              type="radio"
                              name="seasonalPreference"
                              value={option.value}
                              checked={seasonalPreference === option.value}
                              onChange={(e) => setSeasonalPreference(e.target.value)}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <div>
                              <div className="font-medium text-crystal-white">{option.label}</div>
                              <div className="text-sm text-crystal-white/70">{option.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>

                      {/* Current Season (only show if seasonal adaptation is selected) */}
                      {seasonalPreference === "seasonal" && (
                        <div>
                          <label className="block text-sm font-medium text-crystal-white mb-3">Current Season</label>
                          <select
                            value={currentSeason}
                            onChange={(e) => setCurrentSeason(e.target.value)}
                            className="w-full p-3 glass-light border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-crystal-white bg-transparent"
                          >
                            {currentSeasonOptions.map((season) => (
                              <option key={season.value} value={season.value} className="bg-gray-800 text-white">
                                {season.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleGetRecommendations}
                    disabled={loading}
                    className="w-full glass-medium hover:glass-strong text-crystal-white py-4 px-6 rounded-2xl font-semibold hover:shadow-luxury transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-3 border border-white/20 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 heading-professional"
                  >
                    {loading && activeTab === "personalized" ? (
                      <>
                        <ArrowPathIcon className="h-6 w-6 animate-spin" />
                        <span>Dr. Sarah Chen is analyzing...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-6 w-6" />
                        <span>Get Dr. Sarah Chen's Analysis</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Results */}
                <div className="glass-strong rounded-3xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold text-crystal-white mb-6 flex items-center heading-professional">
                    <HeartIcon className="h-8 w-8 text-purple-400 mr-3" />
                    Dr. Sarah Chen's Analysis
                  </h3>
                  {loading && activeTab === "personalized" ? (
                    <LoadingAnimation
                      type="personalized"
                      message="Dr. Sarah Chen is creating your personalized routine with advanced AI analysis..."
                    />
                  ) : recommendations ? (
                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                      <div className="glass-light rounded-2xl p-6 border border-white/10">
                        <RoutineFormatter content={recommendations} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 glass-light rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/20">
                        <SparklesIcon className="h-10 w-10 text-purple-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-crystal-white mb-3 heading-professional">
                        Ready for Professional Analysis
                      </h4>
                      <p className="text-crystal-white/80 text-professional max-w-md mx-auto">
                        Complete the form above to receive Dr. Sarah Chen's comprehensive skincare analysis with personalized recommendations
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "diet" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-crystal-white mb-4 heading-professional bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  SkinNutrition Pro™ Team Consultation
                </h2>
                <p className="text-crystal-white/80 max-w-3xl mx-auto text-lg text-professional">
                  Collaborative therapeutic diet plan from our expert team of dermatologist, culinary nutritionist, and clinical nutritionist
                </p>
                <div className="mt-4 flex items-center justify-center space-x-3 text-sm text-crystal-white/70">
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    <span>👩⚕️ Dr. Sarah Chen</span>
                  </div>
                  <span className="text-crystal-white/50">•</span>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                    <span>👨🍳 Chef Michael Rodriguez</span>
                  </div>
                  <span className="text-crystal-white/50">•</span>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    <span>👩💼 Lisa Thompson</span>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Diet Plan Form */}
                <div className="glass-light rounded-2xl p-6 border border-white/20 space-y-6">
                  <h3 className="text-xl font-semibold text-crystal-white mb-4 heading-professional">
                    📋 Health Profile Assessment
                  </h3>

                  {/* Basic Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-crystal-white mb-2">Age *</label>
                      <input
                        type="number"
                        value={dietAge}
                        onChange={(e) => setDietAge(e.target.value)}
                        placeholder="Enter your age"
                        className="w-full p-3 glass-light border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-crystal-white bg-transparent placeholder-crystal-white/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-crystal-white mb-2">Gender</label>
                      <select
                        value={dietGender}
                        onChange={(e) => setDietGender(e.target.value)}
                        className="w-full p-3 glass-light border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-crystal-white bg-transparent"
                      >
                        <option value="female" className="bg-gray-800 text-white">Female</option>
                        <option value="male" className="bg-gray-800 text-white">Male</option>
                        <option value="other" className="bg-gray-800 text-white">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-crystal-white mb-2">Weight (kg) *</label>
                      <input
                        type="number"
                        value={dietWeight}
                        onChange={(e) => setDietWeight(e.target.value)}
                        placeholder="Enter weight in kg"
                        className="w-full p-3 glass-light border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-crystal-white bg-transparent placeholder-crystal-white/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-crystal-white mb-2">Height (cm) *</label>
                      <input
                        type="number"
                        value={dietHeight}
                        onChange={(e) => setDietHeight(e.target.value)}
                        placeholder="Enter height in cm"
                        className="w-full p-3 glass-light border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-crystal-white bg-transparent placeholder-crystal-white/50"
                        required
                      />
                    </div>
                  </div>

                  {/* Activity Level */}
                  <div>
                    <label className="block text-sm font-medium text-crystal-white mb-3">Activity Level</label>
                    <div className="space-y-2">
                      {activityLevelOptions.map((option) => (
                        <label key={option.value} className="flex items-center space-x-3 p-3 glass-light rounded-xl hover:glass-medium cursor-pointer border border-white/10">
                          <input
                            type="radio"
                            name="activityLevel"
                            value={option.value}
                            checked={activityLevel === option.value}
                            onChange={(e) => setActivityLevel(e.target.value)}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <div>
                            <div className="font-medium text-crystal-white">{option.label}</div>
                            <div className="text-sm text-crystal-white/70">{option.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Restrictions */}
                  <div>
                    <label className="block text-sm font-medium text-crystal-white mb-3">Dietary Restrictions</label>
                    <div className="grid grid-cols-2 gap-2">
                      {dietaryRestrictionOptions.map((restriction) => (
                        <label key={restriction} className="flex items-center space-x-2 p-2 glass-light rounded-lg hover:glass-medium cursor-pointer border border-white/10">
                          <input
                            type="checkbox"
                            checked={dietaryRestrictions.includes(restriction)}
                            onChange={() => handleDietaryRestrictionToggle(restriction)}
                            className="text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <span className="text-sm text-crystal-white">{restriction}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Allergies */}
                  <div>
                    <label className="block text-sm font-medium text-crystal-white mb-3">Food Allergies</label>
                    <div className="grid grid-cols-2 gap-2">
                      {allergyOptions.map((allergy) => (
                        <label key={allergy} className="flex items-center space-x-2 p-2 glass-light rounded-lg hover:glass-medium cursor-pointer border border-white/10">
                          <input
                            type="checkbox"
                            checked={allergies.includes(allergy)}
                            onChange={() => handleAllergyToggle(allergy)}
                            className="text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <span className="text-sm text-crystal-white">{allergy}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Skin Conditions */}
                  <div>
                    <label className="block text-sm font-medium text-crystal-white mb-3">Skin Conditions to Address</label>
                    <div className="grid grid-cols-2 gap-2">
                      {skinConditionOptions.map((condition) => (
                        <label key={condition} className="flex items-center space-x-2 p-2 glass-light rounded-lg hover:glass-medium cursor-pointer border border-white/10">
                          <input
                            type="checkbox"
                            checked={skinConditions.includes(condition)}
                            onChange={() => handleSkinConditionToggle(condition)}
                            className="text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <span className="text-sm text-crystal-white">{condition}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Health Goals */}
                  <div>
                    <label className="block text-sm font-medium text-crystal-white mb-3">Health Goals</label>
                    <div className="grid grid-cols-2 gap-2">
                      {healthGoalOptions.map((goal) => (
                        <label key={goal} className="flex items-center space-x-2 p-2 glass-light rounded-lg hover:glass-medium cursor-pointer border border-white/10">
                          <input
                            type="checkbox"
                            checked={healthGoals.includes(goal)}
                            onChange={() => handleHealthGoalToggle(goal)}
                            className="text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <span className="text-sm text-crystal-white">{goal}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Current Diet */}
                  <div>
                    <label className="block text-sm font-medium text-crystal-white mb-2">Current Diet Description</label>
                    <textarea
                      value={currentDiet}
                      onChange={(e) => setCurrentDiet(e.target.value)}
                      placeholder="Describe your current eating habits, typical meals, etc."
                      rows={3}
                      className="w-full p-3 glass-light border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-crystal-white bg-transparent placeholder-crystal-white/50"
                    />
                  </div>

                  {/* Meal Preferences */}
                  <div>
                    <label className="block text-sm font-medium text-crystal-white mb-3">Meal Preferences</label>
                    <div className="space-y-2">
                      {mealPreferenceOptions.map((option) => (
                        <label key={option.value} className="flex items-center space-x-3 p-3 glass-light rounded-xl hover:glass-medium cursor-pointer border border-white/10">
                          <input
                            type="radio"
                            name="mealPreferences"
                            value={option.value}
                            checked={mealPreferences === option.value}
                            onChange={(e) => setMealPreferences(e.target.value)}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <div>
                            <div className="font-medium text-crystal-white">{option.label}</div>
                            <div className="text-sm text-crystal-white/70">{option.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>



                  {/* Generate Button */}
                  <button
                    onClick={handleGenerateDietPlan}
                    disabled={dietLoading || !dietAge || !dietWeight || !dietHeight}
                    className="w-full glass-medium hover:glass-strong text-crystal-white py-4 px-6 rounded-2xl font-semibold hover:shadow-luxury transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-3 border border-white/20 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 heading-professional"
                  >
                    {dietLoading ? (
                      <>
                        <ArrowPathIcon className="h-6 w-6 animate-spin" />
                        <span>SkinNutrition Pro™ team is collaborating...</span>
                      </>
                    ) : (
                      <>
                        <CakeIcon className="h-6 w-6" />
                        <span>Get SkinNutrition Pro™ Team Consultation</span>
                      </>
                    )}
                  </button>

                  {dietError && (
                    <div className="p-4 glass-light border border-red-400/20 rounded-xl">
                      <p className="text-red-400 text-sm">{dietError}</p>
                    </div>
                  )}
                </div>

                {/* Results */}
                <div className="glass-strong rounded-3xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold text-crystal-white mb-6 flex items-center heading-professional">
                    <CakeIcon className="h-8 w-8 text-purple-400 mr-3" />
                    SkinNutrition Pro™ Team Plan
                  </h3>
                  {dietLoading ? (
                    <LoadingAnimation
                      type="diet"
                      message="SkinNutrition Pro™ team is analyzing your profile and creating a collaborative therapeutic diet plan..."
                    />
                  ) : dietPlan ? (
                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                      <div className="glass-light rounded-2xl p-6 border border-white/10">
                        <RoutineFormatter content={dietPlan} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 glass-light rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/20">
                        <CakeIcon className="h-10 w-10 text-purple-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-crystal-white mb-3 heading-professional">
                        Ready for Team Consultation
                      </h4>
                      <p className="text-crystal-white/80 text-professional max-w-md mx-auto">
                        Complete your health profile to receive a collaborative therapeutic diet plan from our expert team
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Product Finder</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Discover the best skincare products for your specific needs and budget
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Form */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Product Category</label>
                    <select
                      value={productCategory}
                      onChange={(e) => setProductCategory(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                      {productCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Budget Range</label>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value="drugstore">Drugstore ($5-$20)</option>
                      <option value="mid-range">Mid-range ($20-$50)</option>
                      <option value="luxury">Luxury ($50+)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Your Skin Type</label>
                    <select
                      value={skinType}
                      onChange={(e) => setSkinType(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                      {skinTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleGetProductRecs}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {loading && activeTab === "products" ? (
                      <>
                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                        <span>Finding Products...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBagIcon className="h-5 w-5" />
                        <span>Find Products</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Results */}
                <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-8 mt-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <ShoppingBagIcon className="h-7 w-7 text-sky-600 mr-3" />
                    Amazon Products with Prices
                  </h3>
                  {loading && activeTab === "products" ? (
                    <LoadingAnimation
                      type="products"
                      message="Searching Amazon for products with prices..."
                    />
                  ) : amazonProducts.length > 0 ? (
                    <ProductGrid
                      products={amazonProducts}
                      title=""
                      showFilters={true}
                      loading={loading && activeTab === "products"}
                      error={productError}
                    />
                  ) : productError ? (
                    <div className="text-center py-8">
                      <div className="text-red-400 mb-4">
                        <ShoppingBagIcon className="h-16 w-16 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-red-700 mb-2">Unable to Load Products</h3>
                      <p className="text-red-600 mb-4">{productError}</p>
                      <button
                        onClick={handleGetProductRecs}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBagIcon className="h-12 w-12 text-sky-300 mx-auto mb-3" />
                      <p className="text-gray-600 italic">
                        Select your preferences and click "Find Products" to get Amazon products with prices
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "education" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Skincare Education Videos</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Learn from dermatologists and skincare experts with curated YouTube videos
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Form */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Choose Topic</label>
                    <div className="space-y-3">
                      {educationTopics.map((topic) => (
                        <label key={topic.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-sky-50 cursor-pointer">
                          <input
                            type="radio"
                            name="educationTopic"
                            value={topic.value}
                            checked={educationTopic === topic.value}
                            onChange={(e) => setEducationTopic(e.target.value)}
                            className="text-sky-600 focus:ring-sky-500"
                          />
                          <span className="font-medium text-gray-800">{topic.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGetEducation}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {loading && activeTab === "education" ? (
                      <>
                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                        <span>Finding Videos...</span>
                      </>
                    ) : (
                      <>
                        <BookOpenIcon className="h-5 w-5" />
                        <span>Find Videos</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Results */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6">
                  <VideoGrid
                    videos={educationalVideos}
                    title="Educational Videos"
                    loading={loading && activeTab === "education"}
                    error={videoError}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Recommendations;
