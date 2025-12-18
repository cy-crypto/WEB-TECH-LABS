const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Admin Dashboard
router.get('/', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const products = await Product.find().limit(5).sort({ createdAt: -1 });
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard | Play Cards',
      totalProducts,
      recentProducts: products
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(500).render('admin/error', {
      title: 'Error | Admin',
      message: 'Failed to load dashboard'
    });
  }
});

// Product List (Read - All Products)
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.render('admin/products', {
      title: 'Manage Products | Admin',
      products
    });
  } catch (error) {
    console.error('Error loading products:', error);
    res.status(500).render('admin/error', {
      title: 'Error | Admin',
      message: 'Failed to load products'
    });
  }
});

// Add Product Form (Create - GET)
router.get('/products/add', (req, res) => {
  res.render('admin/product-form', {
    title: 'Add New Product | Admin',
    product: null,
    formAction: '/admin/products',
    formMethod: 'POST',
    submitText: 'Add Product',
    editMode: false
  });
});

// Create Product (Create - POST)
router.post('/products', async (req, res) => {
  try {
    const { name, price, rarity, category, image, description } = req.body;
    
    const product = new Product({
      name,
      price: parseFloat(price),
      rarity,
      category: category || '',
      image,
      description
    });
    
    await product.save();
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).render('admin/error', {
      title: 'Error | Admin',
      message: 'Failed to create product'
    });
  }
});

// Edit Product Form (Update - GET)
router.get('/products/:id/edit', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).render('admin/error', {
        title: 'Not Found | Admin',
        message: 'Product not found'
      });
    }
    
    res.render('admin/product-form', {
      title: 'Edit Product | Admin',
      product,
      formAction: `/admin/products/${product._id}`,
      formMethod: 'POST',
      submitText: 'Update Product',
      editMode: true
    });
  } catch (error) {
    console.error('Error loading product for edit:', error);
    res.status(500).render('admin/error', {
      title: 'Error | Admin',
      message: 'Failed to load product'
    });
  }
});

// Update Product (Update - POST/PUT)
router.post('/products/:id', async (req, res) => {
  try {
    const { name, price, rarity, category, image, description } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price: parseFloat(price),
        rarity,
        category: category || '',
        image,
        description
      },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).render('admin/error', {
        title: 'Not Found | Admin',
        message: 'Product not found'
      });
    }
    
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).render('admin/error', {
      title: 'Error | Admin',
      message: 'Failed to update product'
    });
  }
});

// Delete Product (Delete)
router.post('/products/:id/delete', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).render('admin/error', {
        title: 'Not Found | Admin',
        message: 'Product not found'
      });
    }
    
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).render('admin/error', {
      title: 'Error | Admin',
      message: 'Failed to delete product'
    });
  }
});

module.exports = router;

