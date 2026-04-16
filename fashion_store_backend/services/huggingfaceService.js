const { Client, handle_file } = require("@gradio/client");
const axios = require('axios');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

const TRYON_SUPPORTED_SUBCATEGORIES = [
    'shirts', 'shirt', 't-shirts', 't-shirt', 'tshirts', 'tshirt', 'pants', 'pant', 'tops', 'top', 'jeans', 'jean', 'dresses', 'dress',
    'jackets', 'jacket', 'hoodies', 'hoodie', 'sweaters', 'sweater', 'kurtas', 'kurta', 'leggings', 'skirts', 'skirt',
];

const isTryOnSupported = (subcategory) => {
    if (!subcategory) return false;
    const cleanSubcat = subcategory.trim().toLowerCase();
    const isSupported = TRYON_SUPPORTED_SUBCATEGORIES.includes(cleanSubcat);
    if (!isSupported) {
        console.log(`🔍 Checking subcategory: "${cleanSubcat}" vs supported list.`);
    }
    return isSupported;
};

/**
 * Hugging Face AI Try-On Service
 * Uses yisol/IDM-VTON Space via Gradio API.
 */

const HF_SPACE = "yisol/IDM-VTON";

/**
 * Fetch image as Blob from URL
 */
const fetchImageAsBlob = async (url) => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        // Use standard Node.js Buffer and convert to File/Blob for Gradio
        return response.data;
    } catch (err) {
        console.error(`❌ Failed to fetch image from URL: ${url}`);
        throw err;
    }
};


const uploadBufferToCloudinary = (buffer, folder = 'tryon-results') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        streamifier.createReadStream(buffer).pipe(stream);
    });
};

/**
 * Generate virtual try-on images using IDM-VTON
 * @param {string} userPhotoUrl - URL of user's body photo
 * @param {object} product - Product details
 * @returns {object[]} Array of image results
 */
const generateTryOnImages = async (userPhotoUrl, product) => {
    try {
        const hfToken = process.env.HF_TOKEN;
        console.log(`Connecting to HF Space: ${HF_SPACE}...`);

        const client = await Client.connect(HF_SPACE, hfToken ? { hf_token: hfToken } : {});

        const productImageUrl = product.images?.[0]?.url;
        if (!productImageUrl) throw new Error('Product has no image');

        console.log("Fetching images for processing...");
        const [userBuffer, productBuffer] = await Promise.all([
            fetchImageAsBlob(userPhotoUrl),
            fetchImageAsBlob(productImageUrl)
        ]);

        const userBlob = new Blob([userBuffer]);
        const productBlob = new Blob([productBuffer]);

        const genderLabel = product.gender === 'men' ? 'male' : product.gender === 'women' ? 'female' : 'person';

        // Detailed prompt for IDM-VTON
        const prompt = `A professional fashion catalog shot. A ${genderLabel} model is wearing this ${product.name} (${product.subcategory}). 
High-resolution, detailed fabric texture, professional studio lighting, realistic fit. 
Close-up fashion photography style, sharp focus on the garment, clean background.`;

        console.log("Calling tryon endpoint...");
        // Endpoint #2: tryon
        // 0: Human (imageeditor dict)
        // 1: Garment (image)
        // 2: prompt (textbox)
        // 3: auto-mask (checkbox)
        // 4: use_mask (checkbox)
        // 5: steps (number)
        // 6: seed (number)
        const result = await client.predict("tryon", [
            {
                background: handle_file(userBlob),
                layers: [],
                composite: null
            },
            handle_file(productBlob),
            prompt,
            true, // auto-mask
            true, // use_mask
            30,   // steps
            42    // seed
        ]);

        console.log("HF API Result received.");

        // result.data[0] is the result image object { url, orig_name, etc. }
        const outputImage = result.data[0];

       if (outputImage && outputImage.url) {
    console.log("Downloading generated image from Hugging Face...");

    const generatedImageResponse = await axios.get(outputImage.url, {
        responseType: 'arraybuffer'
    });

    const generatedBuffer = Buffer.from(generatedImageResponse.data);

    console.log("Uploading generated image to Cloudinary...");
    const uploadedResult = await uploadBufferToCloudinary(generatedBuffer, 'tryon-results');

    return [{
        url: uploadedResult.secure_url,
        pose: 'Professional Studio Fit',
        publicId: uploadedResult.public_id
    }];
}

        // Handle errors in data (like the limit message user saw)
        const possibleError = result.data.find(d => typeof d === 'string' && (d.includes('limit') || d.includes('error')));
        if (possibleError) {
            throw new Error(`AI Provider Message: ${possibleError}`);
        }

        throw new Error('Could not extract image from AI result');

    } catch (err) {
        console.error("Hugging Face Try-On Error:", err.message);
        throw err;
    }
};

module.exports = { generateTryOnImages, isTryOnSupported };
