import { useState } from "react";
import VideoCard from "./VideoCard";
import { PlayIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

const VideoGrid = ({ 
  videos = [], 
  title = "Educational Videos", 
  loading = false, 
  error = null 
}) => {
  const [filter, setFilter] = useState('all');

  const filterOptions = [
    { value: 'all', label: 'All Videos' },
    { value: 'tutorial', label: 'Tutorials' },
    { value: 'dermatologist', label: 'Expert Content' },
    { value: 'popular', label: 'Most Popular' }
  ];

  const getFilteredVideos = () => {
    if (filter === 'all') return videos;
    
    return videos.filter(video => {
      const title = video.title.toLowerCase();
      const channel = video.channel.name.toLowerCase();
      
      switch (filter) {
        case 'tutorial':
          return title.includes('tutorial') || title.includes('how to') || title.includes('guide');
        case 'dermatologist':
          return title.includes('dermatologist') || channel.includes('derm') || title.includes('expert');
        case 'popular':
          return video.views > 100000;
        default:
          return true;
      }
    });
  };

  const filteredVideos = getFilteredVideos();

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-200"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <PlayIcon className="h-12 w-12 text-red-300 mx-auto mb-3" />
        <p className="text-red-600 font-medium">Error loading videos</p>
        <p className="text-gray-500 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-8">
        <AcademicCapIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 italic">
          Select a topic and click "Find Videos" to discover educational content
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <PlayIcon className="h-6 w-6 text-red-600 mr-2" />
            {title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Video Grid - Single Column Layout */}
      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        <div className="space-y-4 pr-2">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
            />
          ))}
        </div>
      </div>

      {filteredVideos.length === 0 && videos.length > 0 && (
        <div className="text-center py-8">
          <PlayIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No videos match the selected filter</p>
          <button
            onClick={() => setFilter('all')}
            className="text-red-600 hover:text-red-700 text-sm mt-2 underline"
          >
            Show all videos
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
