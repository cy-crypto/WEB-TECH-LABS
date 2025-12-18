const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// Home - show a few featured products
router.get('/', async (req, res) => {
  try {
    const featuredProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(3);

    res.render('home', {
      title: 'Play Cards - Gaming Card Store',
      products: featuredProducts,
    });
  } catch (err) {
    console.error('Error loading home page:', err.message);
    res.status(500).send('Server error');
  }
});

// Products list with pagination and filtering
router.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const filter = {};

    // Category filter
    const category = req.query.category;
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Price range filter
    const minPrice = parseFloat(req.query.minPrice);
    const maxPrice = parseFloat(req.query.maxPrice);

    if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
      filter.price = {};
      if (!Number.isNaN(minPrice)) {
        filter.price.$gte = minPrice;
      }
      if (!Number.isNaN(maxPrice)) {
        filter.price.$lte = maxPrice;
      }
    }

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(totalProducts / limit), 1);
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const skip = (currentPage - 1) * limit;

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const categories = await Product.distinct('category');

    res.render('products', {
      title: 'All Cards | Play Cards',
      products,
      categories,
      selectedCategory: category || 'all',
      minPrice: req.query.minPrice || '',
      maxPrice: req.query.maxPrice || '',
      currentPage,
      totalPages,
      totalProducts,
    });
  } catch (err) {
    console.error('Error loading products:', err.message);
    res.status(500).send('Server error');
  }
});

// Single product detail
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .render('404', { title: 'Card Not Found | Play Cards' });
    }

    res.render('product-detail', {
      title: `${product.name} | Play Cards`,
      product,
    });
  } catch (err) {
    console.error('Error loading product detail:', err.message);
    res.status(500).send('Server error');
  }
});

// Cart - view cart with items from session
router.get('/cart', (req, res) => {
  const cart = req.session.cart || [];

  const totalQuantity = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  res.render('cart', {
    title: 'Your Cart | Play Cards',
    cart,
    totalQuantity,
    totalPrice,
  });
});

// Add to cart
router.post('/cart/add', async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.redirect('back');
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .render('404', { title: 'Card Not Found | Play Cards' });
    }

    if (!req.session.cart) {
      req.session.cart = [];
    }

    const existing = req.session.cart.find(
      (item) => item.productId === String(product._id)
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      req.session.cart.push({
        productId: String(product._id),
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    }

    res.redirect('/cart');
  } catch (err) {
    console.error('Error adding to cart:', err.message);
    res.status(500).send('Server error');
  }
});

// Remove from cart
router.post('/cart/remove', (req, res) => {
  const { productId } = req.body;

  if (!req.session.cart) {
    return res.redirect('/cart');
  }

  req.session.cart = req.session.cart.filter(
    (item) => item.productId !== productId
  );

  res.redirect('/cart');
});

// Checkout
router.get('/checkout', (req, res) => {
  res.render('checkout', {
    title: 'Checkout | Play Cards',
  });
});

// About
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'About | Play Cards',
  });
});

// Contact
router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact | Play Cards',
  });
});

// Seed route to insert sample products (run once for demo)
router.get('/seed-products', async (req, res) => {
  try {
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      return res.send('Products already seeded.');
    }

    const sampleProducts = [
      {
        name: 'Legendary Dragon Card',
        price: 29.99,
        category: 'Legendary',
        rarity: 'Legendary',
        image: '/assets/home_play_prizes.png',
        description:
          'A flaming dragon card with maxed-out attack stats for serious duelists.',
      },
      {
        name: 'Cyber Mage Card',
        price: 19.99,
        category: 'Mage',
        rarity: 'Epic',
        image: '/assets/home_play_prizes.png',
        description:
          'A futuristic mage card that boosts your entire deck with bonus power.',
      },
      {
        name: 'Shadow Assassin Card',
        price: 24.99,
        category: 'Assassin',
        rarity: 'Epic',
        image: '/assets/home_play_prizes.png',
        description:
          'Strike from the shadows with high-speed, high-damage combos.',
      },
      {
        name: 'Crystal Guardian Card',
        price: 14.99,
        category: 'Tank',
        rarity: 'Rare',
        image: '/assets/home_play_prizes.png',
        description:
          'A defensive wall that protects your hero and redirects damage.',
      },
      {
        name: 'Arcane Archer Card',
        price: 17.5,
        category: 'Ranger',
        rarity: 'Rare',
        image: '/assets/home_play_prizes.png',
        description:
          'Long‑range precision attacks with bonus damage against flying units.',
      },
      {
        name: 'Nebula Phoenix Card',
        price: 39.99,
        category: 'Legendary',
        rarity: 'Legendary',
        image: '/assets/home_play_prizes.png',
        description:
          'Revives once per match with an explosive entry that wipes the board.',
      },
    ];

    await Product.insertMany(sampleProducts);
    res.send('Sample products seeded successfully.');
  } catch (err) {
    console.error('Error seeding products:', err.message);
    res.status(500).send('Error seeding products');
  }
});

module.exports = router;


