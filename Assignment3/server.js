const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/playcards_assignment3';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Reuse existing assets from WEBTECHMIDLAB for images/logos
app.use(
  '/assets',
  express.static(path.join(__dirname, '../WEBTECHMIDLAB/assets'))
);

// Parse URL-encoded bodies (for simple forms if needed)
app.use(express.urlencoded({ extended: true }));

// Session for cart
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'playcards-assignment3-secret',
    resave: false,
    saveUninitialized: true,
  })
);

// Expose cart info to all views
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  const cartCount = req.session.cart.reduce(
    (total, item) => total + item.quantity,
    0
  );
  res.locals.cartCount = cartCount;
  next();
});

// Routes
const mainRoutes = require('./routes/index');
app.use('/', mainRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found | Play Cards',
  });
});

app.listen(PORT, () => {
  console.log(
    `Assignment 3 Play Cards store running at http://localhost:${PORT}`
  );
});

