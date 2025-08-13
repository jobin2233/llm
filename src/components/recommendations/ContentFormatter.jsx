import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  LightBulbIcon,
  ClockIcon,
  StarIcon,
  BeakerIcon,
  HeartIcon
} from "@heroicons/react/24/outline";

const ContentFormatter = ({ content, type = "general" }) => {
  if (!content || typeof content !== 'string') {
    return <div className="text-gray-500 italic">No content available</div>;
  }

  // Clean and format text content - Remove all HTML tags and markdown symbols
  const cleanText = (text) => {
    return text
      // Remove HTML tags completely
      .replace(/<\/?[^>]+(>|$)/g, '')
      // Remove markdown bold/italic symbols but keep the text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      // Convert markdown bullets to clean bullets
      .replace(/^\* /gm, '• ')
      .replace(/^\*([^*])/gm, '• $1')
      // Remove extra asterisks and formatting symbols
      .replace(/\*/g, '')
      .replace(/#{1,6}\s*/g, '') // Remove markdown headers
      // Clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Parse the content into structured sections
  const parseContent = (text) => {
    // Clean the text first
    const cleanedText = cleanText(text);

    // Split by double newlines and filter empty lines
    const sections = cleanedText.split('\n\n').filter(section => section.trim());

    return sections.map((section, index) => {
      const lines = section.split('\n').filter(line => line.trim());

      // Check if it's a header (starts with # or contains <strong>)
      if (lines[0].startsWith('# ') || lines[0].startsWith('## ') ||
          lines[0].includes('<strong>') || lines[0].match(/^\d+\.\s*<strong>/)) {
        return parseHeader(lines, index);
      }

      // Check if it's a numbered list
      if (lines.some(line => /^\d+\./.test(line.trim()))) {
        return parseNumberedList(lines, index);
      }

      // Check if it's a bullet list
      if (lines.some(line => line.trim().startsWith('•') || line.trim().startsWith('-'))) {
        return parseBulletList(lines, index);
      }

      // Regular paragraph
      return parseParagraph(lines, index);
    });
  };

  const parseHeader = (lines, index) => {
    let headerText = lines[0]
      .replace(/^#+\s*/, '')
      .replace(/^\d+\.\s*/, '') // Remove numbered list prefix
      .replace(/<\/?[^>]+(>|$)/g, '') // Remove all HTML tags
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/\*(.*?)\*/g, '$1') // Remove markdown italic
      .replace(/\*/g, '') // Remove remaining asterisks
      .trim();

    const content = lines.slice(1).join('\n').trim();

    const getHeaderIcon = (text) => {
      const lowerText = text.toLowerCase();
      if (lowerText.includes('morning') || lowerText.includes('routine')) return ClockIcon;
      if (lowerText.includes('ingredient') || lowerText.includes('key')) return BeakerIcon;
      if (lowerText.includes('tip') || lowerText.includes('advice')) return LightBulbIcon;
      if (lowerText.includes('warning') || lowerText.includes('avoid')) return ExclamationTriangleIcon;
      if (lowerText.includes('benefit') || lowerText.includes('result')) return HeartIcon;
      if (lowerText.includes('treatment') || lowerText.includes('application')) return BeakerIcon;
      if (lowerText.includes('timeline') || lowerText.includes('expect')) return ClockIcon;
      return InformationCircleIcon;
    };

    const IconComponent = getHeaderIcon(headerText);

    return (
      <div key={index} className="mb-6">
        <div className="flex items-start space-x-3 mb-4">
          <div className="p-2 bg-sky-100 rounded-full flex-shrink-0 mt-1">
            <IconComponent className="h-5 w-5 text-sky-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{headerText}</h3>
            {content && (
              <div className="text-gray-700 leading-relaxed">
                {content.split('\n').map((line, lineIndex) => (
                  <p key={lineIndex} className="mb-2 last:mb-0">
                    {cleanText(line)}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const parseNumberedList = (lines, index) => {
    const items = [];
    let currentItem = null;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      const numberMatch = trimmed.match(/^(\d+)\.\s*(.+)/);
      
      if (numberMatch) {
        if (currentItem) items.push(currentItem);
        currentItem = {
          number: numberMatch[1],
          title: numberMatch[2],
          details: []
        };
      } else if (currentItem && trimmed) {
        currentItem.details.push(trimmed);
      }
    });
    
    if (currentItem) items.push(currentItem);

    return (
      <div key={index} className="mb-6">
        <div className="space-y-4">
          {items.map((item, itemIndex) => (
            <div key={itemIndex} className="flex space-x-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg border border-sky-100">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {item.number}
                </div>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800 mb-2">
                  {cleanText(item.title)}
                </div>
                {item.details.length > 0 && (
                  <div className="text-sm text-gray-600 space-y-1">
                    {item.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-sky-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="leading-relaxed">
                          {cleanText(detail)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const parseBulletList = (lines, index) => {
    const items = lines
      .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
      .map(line => line.replace(/^[•\-]\s*/, '').trim());

    return (
      <div key={index} className="mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <ul className="space-y-3">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="flex items-start space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="text-gray-700 leading-relaxed flex-1">
                  {cleanText(item)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const parseParagraph = (lines, index) => {
    const text = lines.join('\n').trim();

    // Check if it's a special type of paragraph
    const isWarning = text.toLowerCase().includes('warning') || text.toLowerCase().includes('caution');
    const isTip = text.toLowerCase().includes('tip:') || text.toLowerCase().includes('note:');

    const getStyle = () => {
      if (isWarning) return "bg-yellow-50 border-yellow-200 text-yellow-800";
      if (isTip) return "bg-green-50 border-green-200 text-green-800";
      return "bg-gray-50 border-gray-200 text-gray-700";
    };

    const getIcon = () => {
      if (isWarning) return ExclamationTriangleIcon;
      if (isTip) return LightBulbIcon;
      return InformationCircleIcon;
    };

    const IconComponent = getIcon();

    return (
      <div key={index} className={`mb-4 p-4 rounded-lg border ${getStyle()}`}>
        <div className="flex items-start space-x-3">
          <IconComponent className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            {cleanText(text).split('\n').map((line, lineIndex) => (
              <p key={lineIndex} className="mb-2 last:mb-0">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Add custom CSS for animations
  const customStyles = `
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animate-slide-in-up {
      animation: slideInUp 0.5s ease-out;
    }
  `;

  return (
    <div className="space-y-4">
      <style>{customStyles}</style>
      <div className="animate-slide-in-up">
        {parseContent(content)}
      </div>
      
      {/* Add a subtle footer for long content */}
      {content.length > 1000 && (
        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <StarIcon className="h-4 w-4" />
            <span>AI-generated recommendations • Always consult with a dermatologist for serious concerns</span>
            <StarIcon className="h-4 w-4" />
          </div>
        </div>
      )}
    </div>
  );
};

// Specialized formatters for different content types
export const RoutineFormatter = ({ content }) => (
  <ContentFormatter content={content} type="routine" />
);



export const ProductFormatter = ({ content }) => (
  <ContentFormatter content={content} type="products" />
);

export const EducationFormatter = ({ content }) => (
  <ContentFormatter content={content} type="education" />
);

export default ContentFormatter;
