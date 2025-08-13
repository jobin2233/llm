/**
 * Amazon Product Search Service using SerpAPI
 * Fetches product information including images, prices, and ratings from Amazon
 * Also includes YouTube video search functionality
 */

const SERPAPI_KEY = "b60964756387b35317b3ada8b602197faf924e65ae8d3585601b4ce52839eb9a";
const AMAZON_DOMAIN = "amazon.com";

/**
 * Search for products on Amazon using SerpAPI
 * @param {string} query - Search query for products
 * @param {number} num - Number of results to return (default: 12)
 * @returns {Promise<Array>} Array of product objects with image, price, rating, etc.
 */
export const searchAmazonProducts = async (query, num = 12) => {
  try {
    const url = `https://serpapi.com/search.json?engine=amazon&k=${encodeURIComponent(query)}&amazon_domain=${AMAZON_DOMAIN}&api_key=${SERPAPI_KEY}&num=${num}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`SerpAPI request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`SerpAPI error: ${data.error}`);
    }

    // Extract and format product data
    const products = (data.organic_results || []).map(product => ({
      id: product.asin || Math.random().toString(36).substr(2, 9),
      title: product.title || 'Product Title Not Available',
      image: product.image || product.thumbnail || '/placeholder-product.jpg',
      price: formatPrice(product.price),
      originalPrice: product.price,
      rating: product.rating || 0,
      reviewCount: product.reviews_count || 0,
      link: product.link || '#',
      position: product.position || 0,
      delivery: product.delivery || null,
      prime: product.prime || false,
      sponsored: product.sponsored || false,
      brand: extractBrand(product.title),
      category: extractCategory(product.title)
    }));

    const filteredProducts = products.filter(product => product.title !== 'Product Title Not Available');

    return filteredProducts;

  } catch (error) {
    console.error('Error searching Amazon products:', error);
    throw new Error(`Failed to search Amazon products: ${error.message}`);
  }
};

/**
 * Search for skincare products with specific filters
 * @param {string} productType - Type of product (cleanser, moisturizer, serum, etc.)
 * @param {string} skinType - Skin type (dry, oily, combination, sensitive)
 * @param {string} budget - Budget range (drugstore, mid-range, luxury)
 * @param {Array} concerns - Specific skin concerns
 * @returns {Promise<Array>} Filtered and sorted product results
 */
export const searchSkincareProducts = async (productType, skinType, budget = 'mid-range', concerns = []) => {
  try {
    // Build search query based on parameters
    let query = `${productType} ${skinType} skin`;

    // Add concerns to search query
    if (concerns.length > 0) {
      query += ` ${concerns.slice(0, 2).join(' ')}`; // Limit to 2 concerns for better results
    }

    // Add budget-specific terms
    const budgetTerms = {
      'drugstore': 'affordable budget',
      'mid-range': 'dermatologist recommended',
      'luxury': 'premium luxury'
    };

    if (budgetTerms[budget]) {
      query += ` ${budgetTerms[budget]}`;
    }

    console.log('Searching Amazon for:', query);

    const products = await searchAmazonProducts(query, 16);

    // Filter and sort products based on budget and relevance
    let filteredProducts = filterProductsByBudget(products, budget);

    // Sort by relevance (rating, reviews, price)
    filteredProducts = sortProductsByRelevance(filteredProducts);

    const finalProducts = filteredProducts.slice(0, 12); // Return top 12 products

    return finalProducts;

  } catch (error) {
    console.error('Error searching skincare products:', error);
    throw error;
  }
};

/**
 * Search for YouTube videos using SerpAPI
 * @param {string} query - Search query for videos
 * @param {number} num - Number of results to return (default: 8)
 * @returns {Promise<Array>} Array of video objects with thumbnail, title, channel, etc.
 */
export const searchYouTubeVideos = async (query, num = 8) => {
  try {
    const url = `https://serpapi.com/search.json?engine=youtube&search_query=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&num=${num}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`SerpAPI request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`SerpAPI error: ${data.error}`);
    }

    // Extract and format video data
    const videos = (data.video_results || []).map(video => ({
      id: video.video_id || Math.random().toString(36).substr(2, 9),
      title: video.title || 'Video Title Not Available',
      thumbnail: video.thumbnail?.static || video.thumbnail || '/placeholder-video.jpg',
      richThumbnail: video.thumbnail?.rich || video.thumbnail?.static || video.thumbnail,
      channel: {
        name: video.channel?.name || 'Unknown Channel',
        link: video.channel?.link || '#'
      },
      views: video.views || 0,
      length: video.length || 'N/A',
      description: video.description || '',
      link: video.link || `https://www.youtube.com/watch?v=${video.video_id}`,
      publishedDate: video.published_date || null,
      position: video.position || 0
    }));

    const filteredVideos = videos.filter(video => video.title !== 'Video Title Not Available');

    return filteredVideos;

  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    throw new Error(`Failed to search YouTube videos: ${error.message}`);
  }
};

/**
 * Search for skincare educational videos with specific topics
 * @param {string} topic - Topic for educational videos (skincare routine, acne treatment, etc.)
 * @returns {Promise<Array>} Filtered and sorted video results
 */
export const searchSkincareVideos = async (topic) => {
  try {
    // Build search query for skincare education
    let query = `${topic} skincare tutorial dermatologist`;

    console.log('Searching YouTube for skincare videos:', query);

    const videos = await searchYouTubeVideos(query, 12);

    // Filter videos to prioritize educational content
    const educationalVideos = videos.filter(video => {
      const title = video.title.toLowerCase();
      const channel = video.channel.name.toLowerCase();

      // Prioritize dermatologist, skincare expert, or educational channels
      const isEducational =
        title.includes('tutorial') ||
        title.includes('guide') ||
        title.includes('how to') ||
        title.includes('dermatologist') ||
        title.includes('skincare') ||
        channel.includes('derm') ||
        channel.includes('skincare') ||
        channel.includes('beauty') ||
        video.views > 10000; // Popular videos are often more reliable

      return isEducational;
    });

    // Sort by views (higher views first) and then by relevance
    const sortedVideos = educationalVideos.sort((a, b) => {
      // Prioritize videos with "dermatologist" in title or channel
      const aDerm = (a.title.toLowerCase().includes('dermatologist') || a.channel.name.toLowerCase().includes('derm')) ? 1 : 0;
      const bDerm = (b.title.toLowerCase().includes('dermatologist') || b.channel.name.toLowerCase().includes('derm')) ? 1 : 0;

      if (aDerm !== bDerm) return bDerm - aDerm;

      // Then sort by views
      return (b.views || 0) - (a.views || 0);
    });

    return sortedVideos.slice(0, 8); // Return top 8 videos

  } catch (error) {
    console.error('Error searching skincare videos:', error);
    throw error;
  }
};

/**
 * Format price string for display
 * @param {string|object} price - Price from SerpAPI
 * @returns {string} Formatted price string
 */
const formatPrice = (price) => {
  if (!price) return 'Price not available';
  
  if (typeof price === 'string') {
    return price;
  }
  
  if (typeof price === 'object') {
    if (price.current_price) return price.current_price;
    if (price.value) return `$${price.value}`;
  }
  
  return 'Price not available';
};

/**
 * Extract brand name from product title
 * @param {string} title - Product title
 * @returns {string} Brand name
 */
const extractBrand = (title) => {
  if (!title) return 'Unknown Brand';
  
  // Common skincare brands
  const brands = [
    'CeraVe', 'Neutrogena', 'Olay', 'L\'Oreal', 'Garnier', 'Aveeno', 'Eucerin',
    'La Roche-Posay', 'Vichy', 'Cetaphil', 'Dove', 'Nivea', 'Clinique',
    'Estee Lauder', 'Lancome', 'SK-II', 'Shiseido', 'Kiehl\'s', 'Origins',
    'The Ordinary', 'Paula\'s Choice', 'Drunk Elephant', 'Tatcha', 'Fresh',
    'Glossier', 'Youth to the People', 'Fenty Beauty', 'Rare Beauty'
  ];
  
  for (const brand of brands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  // Extract first word as potential brand
  const firstWord = title.split(' ')[0];
  return firstWord.length > 2 ? firstWord : 'Unknown Brand';
};

/**
 * Extract category from product title
 * @param {string} title - Product title
 * @returns {string} Product category
 */
const extractCategory = (title) => {
  if (!title) return 'Skincare';
  
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('cleanser') || lowerTitle.includes('wash')) return 'Cleanser';
  if (lowerTitle.includes('moisturizer') || lowerTitle.includes('cream') || lowerTitle.includes('lotion')) return 'Moisturizer';
  if (lowerTitle.includes('serum')) return 'Serum';
  if (lowerTitle.includes('sunscreen') || lowerTitle.includes('spf')) return 'Sunscreen';
  if (lowerTitle.includes('toner')) return 'Toner';
  if (lowerTitle.includes('mask')) return 'Mask';
  if (lowerTitle.includes('oil')) return 'Oil';
  if (lowerTitle.includes('exfoliant') || lowerTitle.includes('scrub')) return 'Exfoliant';
  
  return 'Skincare';
};

/**
 * Filter products by budget range
 * @param {Array} products - Array of products
 * @param {string} budget - Budget range
 * @returns {Array} Filtered products
 */
const filterProductsByBudget = (products, budget) => {
  return products.filter(product => {
    const price = extractNumericPrice(product.originalPrice);
    
    if (price === null) return true; // Include products without clear pricing
    
    switch (budget) {
      case 'drugstore':
        return price <= 25;
      case 'mid-range':
        return price > 25 && price <= 80;
      case 'luxury':
        return price > 80;
      default:
        return true;
    }
  });
};

/**
 * Extract numeric price from price string
 * @param {string|object} price - Price value
 * @returns {number|null} Numeric price or null if not extractable
 */
const extractNumericPrice = (price) => {
  if (!price) return null;
  
  let priceStr = typeof price === 'object' ? JSON.stringify(price) : price.toString();
  const match = priceStr.match(/\$?(\d+(?:\.\d{2})?)/);
  
  return match ? parseFloat(match[1]) : null;
};

/**
 * Sort products by relevance (rating, reviews, price)
 * @param {Array} products - Array of products
 * @returns {Array} Sorted products
 */
const sortProductsByRelevance = (products) => {
  return products.sort((a, b) => {
    // Prioritize products with ratings and reviews
    const aScore = (a.rating || 0) * Math.log(a.reviewCount + 1);
    const bScore = (b.rating || 0) * Math.log(b.reviewCount + 1);
    
    if (aScore !== bScore) {
      return bScore - aScore; // Higher score first
    }
    
    // Secondary sort by position (Amazon's relevance)
    return (a.position || 999) - (b.position || 999);
  });
};

export default {
  searchAmazonProducts,
  searchSkincareProducts
};
