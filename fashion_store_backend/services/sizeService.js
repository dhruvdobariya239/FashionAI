/**
 * Smart Size Recommendation Service
 * Calculates clothing size based on height, weight, gender, and body type.
 */

const SIZE_CHARTS = {
    men: [
        { size: 'XS', minHeight: 0, maxHeight: 164, minWeight: 0, maxWeight: 54 },
        { size: 'S', minHeight: 165, maxHeight: 169, minWeight: 55, maxWeight: 64 },
        { size: 'M', minHeight: 170, maxHeight: 174, minWeight: 65, maxWeight: 74 },
        { size: 'L', minHeight: 175, maxHeight: 179, minWeight: 75, maxWeight: 84 },
        { size: 'XL', minHeight: 180, maxHeight: 184, minWeight: 85, maxWeight: 94 },
        { size: 'XXL', minHeight: 185, maxHeight: 999, minWeight: 95, maxWeight: 999 },
    ],
    women: [
        { size: 'XS', minHeight: 0, maxHeight: 154, minWeight: 0, maxWeight: 44 },
        { size: 'S', minHeight: 155, maxHeight: 159, minWeight: 45, maxWeight: 54 },
        { size: 'M', minHeight: 160, maxHeight: 164, minWeight: 55, maxWeight: 64 },
        { size: 'L', minHeight: 165, maxHeight: 169, minWeight: 65, maxWeight: 74 },
        { size: 'XL', minHeight: 170, maxHeight: 174, minWeight: 75, maxWeight: 84 },
        { size: 'XXL', minHeight: 175, maxHeight: 999, minWeight: 85, maxWeight: 999 },
    ],
    children: [
        { size: '2-3Y', minHeight: 0, maxHeight: 99, minWeight: 0, maxWeight: 14 },
        { size: '4-5Y', minHeight: 100, maxHeight: 109, minWeight: 15, maxWeight: 18 },
        { size: '6-7Y', minHeight: 110, maxHeight: 119, minWeight: 19, maxWeight: 22 },
        { size: '8-9Y', minHeight: 120, maxHeight: 129, minWeight: 23, maxWeight: 27 },
        { size: '10-11Y', minHeight: 130, maxHeight: 139, minWeight: 28, maxWeight: 33 },
        { size: '12-13Y', minHeight: 140, maxHeight: 999, minWeight: 34, maxWeight: 999 },
    ],
};

const BODY_TYPE_ADJUSTMENTS = {
    slim: -1,
    petite: -1,
    athletic: 0,
    regular: 0,
    plus: 1,
};

/**
 * @param {object} profile - { height, weight, gender, bodyType }
 * @returns {object} - { size, confidence, message, sizeIndex }
 */
const recommendSize = (profile) => {
    const { height, weight, gender, bodyType } = profile;

    if (!height || !weight || !gender) {
        return { size: null, confidence: 'low', message: 'Please complete your profile with height, weight, and gender.' };
    }

    const chart = SIZE_CHARTS[gender];
    if (!chart) {
        return { size: null, confidence: 'low', message: 'Gender not supported for size recommendation.' };
    }

    // Find size by height first, then weight as tiebreaker
    let sizeIndex = chart.findIndex(
        (s) => height >= s.minHeight && height <= s.maxHeight
    );
    if (sizeIndex === -1) sizeIndex = chart.length - 1;

    // Adjust for body type
    const adjustment = BODY_TYPE_ADJUSTMENTS[bodyType] || 0;
    sizeIndex = Math.min(Math.max(sizeIndex + adjustment, 0), chart.length - 1);

    // Also verify with weight
    const byWeight = chart.findIndex(
        (s) => weight >= s.minWeight && weight <= s.maxWeight
    );
    const confidence = byWeight === sizeIndex ? 'high' : 'medium';

    const size = chart[sizeIndex].size;

    return {
        size,
        confidence,
        sizeIndex,
        message:
            confidence === 'high'
                ? `Based on your body profile, we recommend size **${size}**. This should fit you well!`
                : `Based on your height, we recommend size **${size}**. You may want to check weight-based sizing too.`,
    };
};

module.exports = { recommendSize };
