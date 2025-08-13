import { useState } from "react";
import { PlayIcon, EyeIcon, ClockIcon, UserIcon } from "@heroicons/react/24/outline";

const VideoCard = ({ video }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatViews = (views) => {
    if (!views || views === 0) return 'No views';
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const formatDuration = (duration) => {
    if (!duration || duration === 'N/A') return '';
    return duration;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleVideoClick = () => {
    if (video.link) {
      window.open(video.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleVideoClick}
    >
      {/* Video Thumbnail */}
      <div className="relative aspect-video bg-gray-200 overflow-hidden">
        {!imageError ? (
          <img
            src={isHovered && video.richThumbnail ? video.richThumbnail : video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <PlayIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className={`bg-red-600 rounded-full p-3 transform transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
            <PlayIcon className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Duration Badge */}
        {formatDuration(video.length) && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.length)}
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-2 line-clamp-2 hover:text-red-600 transition-colors">
          {video.title}
        </h3>

        {/* Channel Info */}
        <div className="flex items-center space-x-2 mb-2">
          <UserIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600 truncate">{video.channel.name}</span>
        </div>

        {/* Video Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <EyeIcon className="h-3 w-3" />
            <span>{formatViews(video.views)}</span>
          </div>
          
          {video.publishedDate && (
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-3 w-3" />
              <span>{video.publishedDate}</span>
            </div>
          )}
        </div>

        {/* Description Preview */}
        {video.description && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
            {video.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
