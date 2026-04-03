const Product = require('../models/Product');

/**
 * Recommendation Service
 * Suggests complementary clothing items based on a given product.
 */

// Complementary subcategory map
const COMPLEMENTARY_MAP = {
    shirts: ['pants', 'shoes', 'accessories'],
    't-shirts': ['pants', 'jeans', 'shoes'],
    pants: ['shirts', 't-shirts', 'shoes', 'accessories'],
    jeans: ['tops', 't-shirts', 'shirts', 'shoes'],
    tops: ['jeans', 'pants', 'shoes', 'accessories'],
    dresses: ['shoes', 'accessories'],
    shoes: ['pants', 'shirts', 'tops', 'jeans'],
    accessories: ['shirts', 'tops', 'dresses'],
    hoodies: ['jeans', 'pants', 'shoes'],
    jackets: ['shirts', 't-shirts', 'pants', 'jeans'],
    sweaters: ['pants', 'jeans', 'shoes'],
    skirts: ['tops', 'shoes', 'accessories'],
    leggings: ['tops', 'hoodies', 'shoes'],
};

/**
 * Get recommended products complementary to a given product
 * @param {object} product - The product to find complements for
 * @param {number} limit - Max items to return
 * @returns {Product[]} Array of recommended products
 */
const getMatchingItems = async (product, limit = 6) => {
    const complementary = COMPLEMENTARY_MAP[product.subcategory?.toLowerCase()] || [];

    if (complementary.length === 0) return [];

    const recommendations = await Product.find({
        gender: { $in: [product.gender, 'unisex'] },
        subcategory: { $in: complementary },
        _id: { $ne: product._id },
        isActive: true,
    })
        .select('name price images subcategory gender rating')
        .limit(limit)
        .sort({ rating: -1 });

    return recommendations;
};

module.exports = { getMatchingItems };
