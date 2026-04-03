const Category = require('../models/Category');

const getCategories = async (req, res, next) => {
    try {
        const { gender } = req.query;
        const filter = { isActive: true };
        if (gender) filter.gender = gender;
        const categories = await Category.find(filter).populate('parent', 'name slug');
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

const createCategory = async (req, res, next) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
};

module.exports = { getCategories, createCategory };
