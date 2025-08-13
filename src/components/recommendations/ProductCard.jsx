import { useState } from "react";
import {
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  TruckIcon,
  CheckBadgeIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);

  // Handle both old format (for fallback) and new Amazon format
  const {
    id,
    title,
    name, // fallback
    brand,
    price,
    rating,
    reviewCount,
    image,
    imageUrl, // fallback
    link,
    delivery,
    prime,
    sponsored,
    category
  } = product || {};

  // Use title from Amazon or fallback to name
  const productTitle = title || name || 'Product Name';
  const productImage = image || imageUrl;
  const productBrand = brand || 'Unknown Brand';
  const productPrice = price || 'Price not available';
  const productRating = rating || 0;
  const productReviews = reviewCount || 0;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="h-4 w-4 text-gray-300" />
            <StarIconSolid className="h-4 w-4 text-yellow-400 absolute top-0 left-0 w-1/2 overflow-hidden" />
          </div>
        );
      } else {
        stars.push(
          <StarIcon key={i} className="h-4 w-4 text-gray-300" />
        );
      }
    }
    return stars;
  };

  const handleImageError = (e) => {
    setImageError(true);
  };

  const truncateTitle = (title, maxLength = 60) => {
    if (!title) return 'Product Name';
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 h-[500px] flex flex-col">
      {/* Product Image */}
      <div className="relative h-64 bg-gradient-to-br from-sky-50 to-blue-50 overflow-hidden flex-shrink-0">
        {productImage && !imageError ? (
          <img
            src={productImage}
            alt={productTitle}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <PhotoIcon className="h-16 w-16 text-sky-300 mx-auto mb-2" />
              <p className="text-sm text-sky-600 font-medium">Product Image</p>
              <p className="text-xs text-sky-500">Not Available</p>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1">
          {sponsored && (
            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">
              Sponsored
            </span>
          )}
          {prime && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1">
              <CheckBadgeIcon className="h-3 w-3" />
              <span>Prime</span>
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <div className="absolute top-3 right-3">
          <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm">
            <HeartIcon className="h-4 w-4 text-gray-600 hover:text-red-500" />
          </button>
        </div>

        {/* Price Badge */}
        {productPrice && productPrice !== 'Price not available' && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-gray-800 shadow-sm">
              {productPrice}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Brand & Category */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-sky-600 uppercase tracking-wide">
              {productBrand}
            </span>
            {category && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {category}
              </span>
            )}
          </div>
        </div>

        {/* Product Title */}
        <h3 className="font-semibold text-gray-800 mb-3 leading-tight text-base flex-1">
          {truncateTitle(productTitle, 80)}
        </h3>

        {/* Rating & Reviews */}
        {productRating > 0 && (
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center space-x-1">
              <div className="flex">{renderStars(productRating)}</div>
              <span className="text-sm font-medium text-gray-700">{productRating}</span>
            </div>
            {productReviews > 0 && (
              <span className="text-xs text-gray-500">
                ({productReviews.toLocaleString()} reviews)
              </span>
            )}
          </div>
        )}

        {/* Delivery Info */}
        {delivery && (
          <div className="flex items-center space-x-1 mb-3 text-xs text-gray-600">
            <TruckIcon className="h-3 w-3" />
            <span>{delivery}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-auto">
          <button
            onClick={() => link && window.open(link, '_blank')}
            className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg hover:from-sky-500 hover:to-blue-600 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <ShoppingCartIcon className="h-4 w-4" />
            <span>View on Amazon</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
