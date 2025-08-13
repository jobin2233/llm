import { useState } from "react";
import { 
  UserIcon, 
  BeakerIcon, 
  SparklesIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

const SkinTypeGuide = ({ selectedSkinType, onSkinTypeSelect, showQuiz = true }) => {
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const skinTypes = [
    {
      type: "normal",
      name: "Normal Skin",
      description: "Balanced skin that's not too oily or too dry",
      characteristics: [
        "Balanced oil production",
        "Small, barely visible pores",
        "Smooth, even texture",
        "Rarely experiences breakouts",
        "Good elasticity and firmness"
      ],
      concerns: ["Maintaining balance", "Preventing aging", "Sun protection"],
      recommendations: [
        "Gentle cleanser twice daily",
        "Lightweight moisturizer",
        "Broad-spectrum SPF",
        "Weekly exfoliation"
      ],
      color: "green",
      icon: CheckCircleIcon
    },
    {
      type: "oily",
      name: "Oily Skin",
      description: "Produces excess sebum, especially in the T-zone",
      characteristics: [
        "Shiny appearance, especially T-zone",
        "Enlarged, visible pores",
        "Prone to blackheads and acne",
        "Makeup may not last long",
        "Thick, coarse texture"
      ],
      concerns: ["Excess oil", "Acne", "Large pores", "Shine control"],
      recommendations: [
        "Foaming or gel cleanser",
        "Oil-free moisturizer",
        "Salicylic acid treatment",
        "Clay masks weekly"
      ],
      color: "blue",
      icon: BeakerIcon
    },
    {
      type: "dry",
      name: "Dry Skin",
      description: "Lacks moisture and natural oils",
      characteristics: [
        "Tight, uncomfortable feeling",
        "Flaky or rough texture",
        "Fine lines more visible",
        "Small, tight pores",
        "May appear dull"
      ],
      concerns: ["Dehydration", "Flakiness", "Premature aging", "Sensitivity"],
      recommendations: [
        "Cream or oil cleanser",
        "Rich, hydrating moisturizer",
        "Hyaluronic acid serum",
        "Gentle exfoliation"
      ],
      color: "orange",
      icon: SparklesIcon
    },
    {
      type: "combination",
      name: "Combination Skin",
      description: "Oily T-zone with normal to dry cheeks",
      characteristics: [
        "Oily forehead, nose, and chin",
        "Normal to dry cheeks",
        "Enlarged pores in T-zone",
        "Different needs in different areas",
        "May have occasional breakouts"
      ],
      concerns: ["Balancing different areas", "T-zone oil", "Cheek dryness"],
      recommendations: [
        "Gentle, balanced cleanser",
        "Different products for different areas",
        "Lightweight moisturizer",
        "Targeted treatments"
      ],
      color: "purple",
      icon: UserIcon
    },
    {
      type: "sensitive",
      name: "Sensitive Skin",
      description: "Easily irritated and reactive to products",
      characteristics: [
        "Easily irritated or inflamed",
        "Redness and burning sensations",
        "Reacts to new products",
        "May have rosacea or eczema",
        "Thin, delicate appearance"
      ],
      concerns: ["Irritation", "Redness", "Product reactions", "Inflammation"],
      recommendations: [
        "Fragrance-free products",
        "Gentle, minimal ingredients",
        "Patch test new products",
        "Soothing ingredients like aloe"
      ],
      color: "red",
      icon: ExclamationCircleIcon
    }
  ];

  const quizQuestions = [
    {
      question: "How does your skin feel after cleansing?",
      answers: [
        { text: "Comfortable and balanced", points: { normal: 3, combination: 1 } },
        { text: "Tight and dry", points: { dry: 3, sensitive: 1 } },
        { text: "Still oily", points: { oily: 3, combination: 1 } },
        { text: "Irritated or stinging", points: { sensitive: 3, dry: 1 } }
      ]
    },
    {
      question: "How often do you experience breakouts?",
      answers: [
        { text: "Rarely or never", points: { normal: 3, dry: 2 } },
        { text: "Occasionally", points: { normal: 1, combination: 2, sensitive: 1 } },
        { text: "Frequently", points: { oily: 3, combination: 1 } },
        { text: "When I try new products", points: { sensitive: 3 } }
      ]
    },
    {
      question: "How does your skin look by midday?",
      answers: [
        { text: "Same as morning", points: { normal: 3, dry: 1 } },
        { text: "Shiny all over", points: { oily: 3 } },
        { text: "Shiny in T-zone only", points: { combination: 3 } },
        { text: "Tight or flaky", points: { dry: 3, sensitive: 1 } }
      ]
    },
    {
      question: "How do your pores look?",
      answers: [
        { text: "Small and barely visible", points: { normal: 3, dry: 2 } },
        { text: "Large and visible", points: { oily: 3, combination: 1 } },
        { text: "Large in T-zone, small on cheeks", points: { combination: 3 } },
        { text: "Variable, depends on products used", points: { sensitive: 2 } }
      ]
    },
    {
      question: "How does your skin react to new products?",
      answers: [
        { text: "Generally well", points: { normal: 3, oily: 1 } },
        { text: "Sometimes breaks out", points: { oily: 2, combination: 1 } },
        { text: "Gets dry or tight", points: { dry: 2, sensitive: 1 } },
        { text: "Often gets red or irritated", points: { sensitive: 3 } }
      ]
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: "bg-green-100 text-green-800 border-green-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      red: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[color] || colors.green;
  };

  const handleQuizAnswer = (answerIndex) => {
    const currentQuestion = quizQuestions[quizStep];
    const selectedAnswer = currentQuestion.answers[answerIndex];
    
    setQuizAnswers(prev => {
      const newAnswers = { ...prev };
      Object.entries(selectedAnswer.points).forEach(([skinType, points]) => {
        newAnswers[skinType] = (newAnswers[skinType] || 0) + points;
      });
      return newAnswers;
    });

    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      // Quiz completed, determine skin type
      const maxScore = Math.max(...Object.values(quizAnswers));
      const determinedType = Object.entries(quizAnswers).find(([_, score]) => score === maxScore)?.[0];
      
      if (determinedType && onSkinTypeSelect) {
        onSkinTypeSelect(determinedType);
      }
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers({});
    setShowResults(false);
  };

  const getSkinTypeData = (type) => {
    return skinTypes.find(st => st.type === type);
  };

  return (
    <div className="space-y-8">
      {/* Skin Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skinTypes.map((skinType) => {
          const IconComponent = skinType.icon;
          const isSelected = selectedSkinType === skinType.type;
          
          return (
            <div
              key={skinType.type}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                isSelected 
                  ? `${getColorClasses(skinType.color)} shadow-lg transform scale-105` 
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => onSkinTypeSelect && onSkinTypeSelect(skinType.type)}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-full ${
                  isSelected ? "bg-white/20" : getColorClasses(skinType.color)
                }`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{skinType.name}</h3>
              </div>
              
              <p className="text-sm mb-4 opacity-90">{skinType.description}</p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Key Characteristics:</h4>
                  <ul className="text-xs space-y-1">
                    {skinType.characteristics.slice(0, 3).map((char, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-current rounded-full"></div>
                        <span>{char}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Skin Type Quiz */}
      {showQuiz && (
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Not sure about your skin type?
            </h2>
            <p className="text-gray-600">
              Take our quick quiz to find out!
            </p>
          </div>

          {!showResults ? (
            <div className="max-w-2xl mx-auto">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Question {quizStep + 1} of {quizQuestions.length}</span>
                  <span>{Math.round(((quizStep + 1) / quizQuestions.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-sky-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((quizStep + 1) / quizQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  {quizQuestions[quizStep].question}
                </h3>
                
                <div className="space-y-3">
                  {quizQuestions[quizStep].answers.map((answer, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuizAnswer(index)}
                      className="w-full p-4 text-left bg-white rounded-lg border border-gray-200 hover:border-sky-300 hover:bg-sky-50 transition-all duration-200"
                    >
                      {answer.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Quiz Complete!
              </h3>
              <p className="text-gray-600 mb-6">
                Based on your answers, your skin type appears to be selected above.
              </p>
              <button
                onClick={resetQuiz}
                className="px-6 py-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Retake Quiz
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selected Skin Type Details */}
      {selectedSkinType && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {(() => {
            const skinTypeData = getSkinTypeData(selectedSkinType);
            if (!skinTypeData) return null;
            
            const IconComponent = skinTypeData.icon;
            
            return (
              <div>
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`p-3 rounded-full ${getColorClasses(skinTypeData.color)}`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{skinTypeData.name}</h2>
                    <p className="text-gray-600">{skinTypeData.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Characteristics</h3>
                    <ul className="space-y-2">
                      {skinTypeData.characteristics.map((char, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{char}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommended Routine</h3>
                    <ul className="space-y-2">
                      {skinTypeData.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-sky-400 rounded-full flex-shrink-0"></div>
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default SkinTypeGuide;
