import { useState } from "react";
import { 
  BookOpenIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

const EducationalCard = ({ 
  title, 
  content, 
  type = "general", // general, tip, warning, fact
  expandable = true,
  defaultExpanded = false,
  icon: CustomIcon,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getCardStyles = () => {
    switch (type) {
      case "tip":
        return "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200";
      case "warning":
        return "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200";
      case "fact":
        return "bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200";
      default:
        return "bg-gradient-to-br from-white to-sky-50 border-sky-200";
    }
  };

  const getIconStyles = () => {
    switch (type) {
      case "tip":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "fact":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-sky-600 bg-sky-100";
    }
  };

  const getDefaultIcon = () => {
    switch (type) {
      case "tip":
        return LightBulbIcon;
      case "warning":
        return ExclamationTriangleIcon;
      case "fact":
        return InformationCircleIcon;
      default:
        return BookOpenIcon;
    }
  };

  const IconComponent = CustomIcon || getDefaultIcon();

  // Parse content if it's a string with markdown-like formatting
  const parseContent = (text) => {
    if (typeof text !== 'string') return text;

    // Split by double newlines to create paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if it's a header (starts with #)
      if (paragraph.startsWith('# ')) {
        return (
          <h3 key={index} className="text-xl font-semibold text-gray-800 mb-3 mt-6 first:mt-0">
            {paragraph.replace('# ', '')}
          </h3>
        );
      }
      
      // Check if it's a subheader (starts with ##)
      if (paragraph.startsWith('## ')) {
        return (
          <h4 key={index} className="text-lg font-medium text-gray-700 mb-2 mt-4 first:mt-0">
            {paragraph.replace('## ', '')}
          </h4>
        );
      }

      // Check if it's a list (contains bullet points)
      if (paragraph.includes('• ') || paragraph.includes('- ')) {
        const items = paragraph.split('\n').filter(item => item.trim());
        return (
          <ul key={index} className="space-y-2 mb-4">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-sky-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">
                  {item.replace(/^[•\-]\s*/, '')}
                </span>
              </li>
            ))}
          </ul>
        );
      }

      // Regular paragraph
      return (
        <p key={index} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className={`border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${getCardStyles()} ${className}`}>
      {/* Header */}
      <div 
        className={`p-6 ${expandable ? 'cursor-pointer' : ''}`}
        onClick={() => expandable && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className={`p-3 rounded-full ${getIconStyles()} flex-shrink-0`}>
            <IconComponent className="h-6 w-6" />
          </div>

          {/* Title and Toggle */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800 leading-tight">
                {title}
              </h3>
              {expandable && (
                <button className="ml-4 p-1 rounded-full hover:bg-white/50 transition-colors">
                  {isExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              )}
            </div>
            
            {/* Preview text when collapsed */}
            {expandable && !isExpanded && (
              <p className="text-gray-600 mt-2 line-clamp-2">
                {typeof content === 'string' 
                  ? content.substring(0, 120) + (content.length > 120 ? '...' : '')
                  : 'Click to expand and read more'
                }
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {(!expandable || isExpanded) && (
        <div className="px-6 pb-6">
          <div className="prose prose-sky max-w-none">
            {typeof content === 'string' ? parseContent(content) : content}
          </div>
        </div>
      )}
    </div>
  );
};

// Specialized components for different types of educational content
export const TipCard = ({ title, content, ...props }) => (
  <EducationalCard 
    title={title} 
    content={content} 
    type="tip" 
    icon={LightBulbIcon}
    {...props} 
  />
);

export const WarningCard = ({ title, content, ...props }) => (
  <EducationalCard 
    title={title} 
    content={content} 
    type="warning" 
    icon={ExclamationTriangleIcon}
    {...props} 
  />
);

export const FactCard = ({ title, content, ...props }) => (
  <EducationalCard 
    title={title} 
    content={content} 
    type="fact" 
    icon={CheckCircleIcon}
    {...props} 
  />
);

// Component for displaying a collection of educational cards
export const EducationalSection = ({ 
  title, 
  cards = [], 
  className = "",
  columns = 1 
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
          {title}
        </h2>
      )}
      
      <div className={`grid gap-6 ${
        columns === 1 ? 'grid-cols-1' :
        columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {cards.map((card, index) => (
          <EducationalCard
            key={index}
            title={card.title}
            content={card.content}
            type={card.type}
            expandable={card.expandable}
            defaultExpanded={card.defaultExpanded}
            icon={card.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default EducationalCard;
