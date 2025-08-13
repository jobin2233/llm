import { ArrowPathIcon, SparklesIcon, BeakerIcon, BookOpenIcon } from "@heroicons/react/24/outline";

const LoadingAnimation = ({ type = "general", message = "Generating recommendations..." }) => {
  const getIcon = () => {
    switch (type) {
      case "personalized":
        return SparklesIcon;
      case "treatment":
        return BeakerIcon;
      case "education":
        return BookOpenIcon;
      default:
        return ArrowPathIcon;
    }
  };

  const getMessages = () => {
    switch (type) {
      case "personalized":
        return [
          "Analyzing your skin type...",
          "Reviewing your concerns...",
          "Crafting your routine...",
          "Finalizing recommendations..."
        ];
      case "treatment":
        return [
          "Researching treatment options...",
          "Analyzing medical literature...",
          "Compiling expert advice...",
          "Preparing comprehensive guide..."
        ];
      case "products":
        return [
          "Scanning product database...",
          "Matching your preferences...",
          "Checking ingredient compatibility...",
          "Curating best options..."
        ];
      case "education":
        return [
          "Gathering educational content...",
          "Organizing information...",
          "Preparing learning materials...",
          "Structuring content..."
        ];
      default:
        return [
          "Processing your request...",
          "Analyzing data...",
          "Generating content...",
          "Almost ready..."
        ];
    }
  };

  const IconComponent = getIcon();
  const messages = getMessages();

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      {/* Animated Icon */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="w-20 h-20 border-4 border-sky-200 rounded-full animate-spin border-t-sky-500"></div>
        
        {/* Inner icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <IconComponent className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute -inset-4">
          <div className="w-2 h-2 bg-sky-400 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2 animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full absolute top-1/2 right-0 transform -translate-y-1/2 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-sky-500 rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full absolute top-1/2 left-0 transform -translate-y-1/2 animate-bounce" style={{ animationDelay: '0.6s' }}></div>
        </div>
      </div>

      {/* Animated Text */}
      <div className="text-center space-y-2">
        <div className="text-lg font-semibold text-gray-800 animate-pulse">
          {message}
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Cycling messages */}
        <div className="h-6 overflow-hidden">
          <div className="animate-pulse text-sm text-gray-600">
            <div className="animate-slide-up">
              {messages.map((msg, index) => (
                <div key={index} className="h-6 flex items-center justify-center" style={{ animationDelay: `${index * 2}s` }}>
                  {msg}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-64 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full animate-progress"></div>
      </div>
    </div>
  );
};

// Skeleton loading for content
export const ContentSkeleton = ({ lines = 5 }) => (
  <div className="space-y-4 animate-pulse">
    {Array.from({ length: lines }).map((_, index) => (
      <div key={index} className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

// Card skeleton for product loading
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="flex space-x-2">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
  </div>
);

export default LoadingAnimation;
