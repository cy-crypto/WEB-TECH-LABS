const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');

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

// Order Management Routes

// List all orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.render('admin/orders', {
      title: 'Manage Orders | Admin',
      orders
    });
  } catch (error) {
    console.error('Error loading orders:', error);
    res.status(500).render('admin/error', {
      title: 'Error | Admin',
      message: 'Failed to load orders'
    });
  }
});

// Update order status
router.post('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).render('admin/error', {
        title: 'Not Found | Admin',
        message: 'Order not found'
      });
    }

    // Validate status transition - prevent skipping states
    const validStatuses = ['Placed', 'Processing', 'Delivered'];
    const statusOrder = { 'Placed': 0, 'Processing': 1, 'Delivered': 2 };
    
    if (!validStatuses.includes(status)) {
      return res.status(400).render('admin/error', {
        title: 'Invalid Status | Admin',
        message: 'Invalid order status'
      });
    }

    const currentStatusIndex = statusOrder[order.status];
    const newStatusIndex = statusOrder[status];

    // Prevent skipping states - can only move forward one step at a time
    if (newStatusIndex - currentStatusIndex > 1) {
      return res.status(400).render('admin/error', {
        title: 'Invalid Status Transition | Admin',
        message: `Cannot skip status. Current status is "${order.status}". You can only move to "${getNextStatus(order.status)}".`
      });
    }

    // Prevent moving backwards
    if (newStatusIndex < currentStatusIndex) {
      return res.status(400).render('admin/error', {
        title: 'Invalid Status Transition | Admin',
        message: `Cannot move order status backwards. Current status is "${order.status}".`
      });
    }

    order.status = status;
    await order.save();

    res.redirect('/admin/orders');
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).render('admin/error', {
      title: 'Error | Admin',
      message: 'Failed to update order status'
    });
  }
});

// Helper function to get next valid status
function getNextStatus(currentStatus) {
  const statusMap = {
    'Placed': 'Processing',
    'Processing': 'Delivered',
    'Delivered': null
  };
  return statusMap[currentStatus] || null;
}

module.exports = router;

