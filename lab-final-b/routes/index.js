const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');

router.get('/', async (req, res) => {
  try {
    const products = await Product.find().limit(6).sort({ createdAt: -1 });
    res.render('home', {
      title: 'Play Cards - Gaming Card Store',
      products,
    });
  } catch (error) {
    console.error('Error loading products:', error);
    res.status(500).render('404', {
      title: 'Error | Play Cards',
    });
  }
});

router.get('/products', async (req, res) => {
  try {
    // Get query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category || '';
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
    const rarity = req.query.rarity || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build filter object
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (rarity) {
      filter.rarity = rarity;
    }
    
    if (minPrice !== null || maxPrice !== null) {
      filter.price = {};
      if (minPrice !== null) {
        filter.price.$gte = minPrice;
      }
      if (maxPrice !== null) {
        filter.price.$lte = maxPrice;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder;

    // Fetch products with filters, pagination, and sorting
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get unique categories and rarities for filter dropdowns
    const categories = await Product.distinct('category');
    const rarities = await Product.distinct('rarity');

    res.render('products', {
      title: 'All Cards | Play Cards',
      products,
      currentPage: page,
      totalPages,
      totalProducts,
      limit,
      category,
      rarity,
      minPrice: minPrice || '',
      maxPrice: maxPrice || '',
      sortBy,
      sortOrder: sortOrder === 1 ? 'asc' : 'desc',
      categories: categories.filter(c => c), // Filter out null/undefined
      rarities: rarities.filter(r => r), // Filter out null/undefined
      hasFilters: !!(category || rarity || minPrice !== null || maxPrice !== null)
    });
  } catch (error) {
    console.error('Error loading products:', error);
    res.status(500).render('404', {
      title: 'Error | Play Cards',
    });
  }
});

// Customer Order History - placed before dynamic routes
router.get('/my-orders', (req, res) => {
  const email = req.query.email || '';
  res.render('my-orders', {
    title: 'My Orders | Play Cards',
    email,
    orders: []
  });
});

router.post('/my-orders', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.trim()) {
      return res.render('my-orders', {
        title: 'My Orders | Play Cards',
        email: '',
        orders: [],
        error: 'Please enter an email address'
      });
    }

    const orders = await Order.find({ 'customer.email': email.trim() })
      .sort({ createdAt: -1 });

    res.render('my-orders', {
      title: 'My Orders | Play Cards',
      email: email.trim(),
      orders
    });
  } catch (error) {
    console.error('Error loading orders:', error);
    res.status(500).render('404', {
      title: 'Error | Play Cards'
    });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).render('404', { title: 'Card Not Found | Play Cards' });
    }

    res.render('product-detail', {
      title: `${product.name} | Play Cards`,
      product,
    });
  } catch (error) {
    console.error('Error loading product:', error);
    res.status(404).render('404', { title: 'Card Not Found | Play Cards' });
  }
});

router.get('/checkout', async (req, res) => {
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

    if (cartItems.length === 0) {
      return res.redirect('/cart');
    }

    const subtotal = total;
    const tax = total * 0.08;
    const shipping = total > 0 ? 5.99 : 0;
    const grandTotal = subtotal + tax + shipping;

    res.render('checkout', {
      title: 'Checkout | Play Cards',
      cartItems,
      subtotal,
      tax,
      shipping,
      total: grandTotal
    });
  } catch (error) {
    console.error('Error loading checkout:', error);
    res.status(500).render('404', {
      title: 'Error | Play Cards',
    });
  }
});

router.get('/about', (req, res) => {
  res.render('about', {
    title: 'About | Play Cards',
  });
});

router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact | Play Cards',
  });
});

router.get('/thankyou', (req, res) => {
  res.render('thankyou', {
    title: 'Thank You | Play Cards',
  });
});

module.exports = router;


