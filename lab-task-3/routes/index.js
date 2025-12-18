const express = require('express');
const router = express.Router();

// Fake in-memory products for gaming cards
const products = [
  {
    id: 1,
    name: 'Legendary Dragon Card',
    price: 29.99,
    rarity: 'Legendary',
    image: '/assets/home_play_prizes.png',
    description: 'A flaming dragon card with maxed-out attack stats for serious duelists.',
  },
  {
    id: 2,
    name: 'Cyber Mage Card',
    price: 19.99,
    rarity: 'Epic',
    image: '/assets/home_play_prizes.png',
    description: 'A futuristic mage card that boosts your entire deck with bonus power.',
  },
  {
    id: 3,
    name: 'Shadow Assassin Card',
    price: 24.99,
    rarity: 'Epic',
    image: '/assets/home_play_prizes.png',
    description: 'Strike from the shadows with high-speed, high-damage combos.',
  },
];

router.get('/', (req, res) => {
  res.render('home', {
    title: 'Play Cards - Gaming Card Store',
    products,
  });
});

router.get('/products', (req, res) => {
  res.render('products', {
    title: 'All Cards | Play Cards',
    products,
  });
});

router.get('/products/:id', (req, res) => {
  const productId = Number(req.params.id);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).render('404', { title: 'Card Not Found | Play Cards' });
  }

  res.render('product-detail', {
    title: `${product.name} | Play Cards`,
    product,
  });
});

router.get('/cart', (req, res) => {
  res.render('cart', {
    title: 'Your Cart | Play Cards',
  });
});

router.get('/checkout', (req, res) => {
  res.render('checkout', {
    title: 'Checkout | Play Cards',
  });
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

module.exports = router;


