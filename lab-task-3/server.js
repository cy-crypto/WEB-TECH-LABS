const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

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
  console.log(`Play Cards store running at http://localhost:${PORT}`);
});


