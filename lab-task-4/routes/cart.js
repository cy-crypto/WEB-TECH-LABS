const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get cart items
router.get('/', async (req, res) => {
  try {
    const cart = req.session.cart || [];
    const cartItems = [];
    let total = 0;

    for (const item of cart) {
      const product = await Product.findById(item.productId);
      if (product) {
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        cartItems.push({
          product,
          quantity: item.quantity,
          itemTotal
        });
      }
    }

    res.render('cart', {
      title: 'Your Cart | Play Cards',
      cartItems,
      subtotal: total,
      tax: total * 0.08, // 8% tax
      shipping: total > 0 ? 5.99 : 0,
      total: total + (total * 0.08) + (total > 0 ? 5.99 : 0)
    });
  } catch (error) {
    console.error('Error loading cart:', error);
    res.status(500).render('404', {
      title: 'Error | Play Cards',
    });
  }
});

// Add to cart
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const cart = req.session.cart || [];
    const existingItemIndex = cart.findIndex(item => item.productId.toString() === productId);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += parseInt(quantity);
    } else {
      cart.push({
        productId: productId,
        quantity: parseInt(quantity)
      });
    }

    req.session.cart = cart;
    
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    res.json({ success: true, cartCount });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
router.post('/update', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    const cart = req.session.cart || [];
    const itemIndex = cart.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      if (parseInt(quantity) <= 0) {
        cart.splice(itemIndex, 1);
      } else {
        cart[itemIndex].quantity = parseInt(quantity);
      }
    }

    req.session.cart = cart;
    
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    res.json({ success: true, cartCount });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove from cart
router.post('/remove', async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const cart = req.session.cart || [];
    req.session.cart = cart.filter(item => item.productId.toString() !== productId);
    
    const cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
    res.json({ success: true, cartCount });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear cart
router.post('/clear', (req, res) => {
  req.session.cart = [];
  res.json({ success: true, cartCount: 0 });
});

module.exports = router;

