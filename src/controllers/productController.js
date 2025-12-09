const Product = require('../models/Product');

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ name: 1 });
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get available products (with stock)
exports.getAvailableProducts = async (req, res) => {
    try {
        const products = await Product.find({ availableQuantity: { $gt: 0 } }).sort({ name: 1 });
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single product
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create product
exports.createProduct = async (req, res) => {
    try {
        const { name, totalQuantity, perDayRent, category, description } = req.body;

        const product = await Product.create({
            name,
            totalQuantity,
            availableQuantity: totalQuantity, // Initially all items are available
            perDayRent,
            category,
            description
        });

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const { name, totalQuantity, perDayRent, category, description } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // If total quantity is being updated, adjust available quantity proportionally
        if (totalQuantity !== undefined && totalQuantity !== product.totalQuantity) {
            const difference = totalQuantity - product.totalQuantity;
            product.availableQuantity = Math.max(0, product.availableQuantity + difference);
            product.totalQuantity = totalQuantity;
        }

        if (name !== undefined) product.name = name;
        if (perDayRent !== undefined) product.perDayRent = perDayRent;
        if (category !== undefined) product.category = category;
        if (description !== undefined) product.description = description;

        await product.save();
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Check if product is currently rented
        if (product.availableQuantity < product.totalQuantity) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete product with active rentals'
            });
        }

        await product.deleteOne();
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
