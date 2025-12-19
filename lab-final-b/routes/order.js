const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const applyDiscount = require('../middleware/applyDiscount');

const router = express.Router();

// Helper middleware to build order context from current cart + form data
async function buildOrderContext(req, res, next) {
  try {
    const cart = req.session.cart || [];
    const cartItems = [];
    let subtotal = 0;

    for (const item of cart) {
      const product = await Product.findById(item.productId);
      if (product) {
        const lineTotal = product.price * item.quantity;
        subtotal += lineTotal;
        cartItems.push({
          product,
          quantity: item.quantity,
          lineTotal
        });
      }
    }

    if (cartItems.length === 0) {
      return res.redirect('/cart');
    }

    const tax = subtotal * 0.08;
    const shipping = subtotal > 0 ? 5.99 : 0;
    const baseTotal = subtotal + tax + shipping;

    req.order = {
      cartItems,
      customer: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address
      }
    };

    req.orderTotals = {
      subtotal,
      tax,
      shipping,
      baseTotal
    };

    next();
  } catch (error) {
    console.error('Error building order context:', error);
    res.status(500).render('404', {
      title: 'Error | Play Cards'
    });
  }
}

// Order preview
router.post('/preview', buildOrderContext, applyDiscount, (req, res) => {
  // Persist pending order data in session for confirmation step
  req.session.pendingOrder = {
    customer: req.order.customer,
    cartItems: req.order.cartItems.map(item => ({
      productId: item.product._id.toString(),
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      image: item.product.image
    })),
    totals: req.orderTotals,
    coupon: req.appliedCoupon || null
  };

  res.render('order-preview', {
    title: 'Order Preview | Play Cards',
    cartItems: req.order.cartItems,
    customer: req.order.customer,
    subtotal: req.orderTotals.subtotal,
    tax: req.orderTotals.tax,
    shipping: req.orderTotals.shipping,
    discount: req.orderTotals.discount,
    total: req.orderTotals.finalTotal,
    coupon: req.appliedCoupon || null
  });
});

// Confirm and place order
router.post('/confirm', async (req, res) => {
  try {
    const pending = req.session.pendingOrder;

    if (!pending || !pending.cartItems || pending.cartItems.length === 0) {
      return res.redirect('/cart');
    }

    const items = pending.cartItems.map(item => ({
      product: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      lineTotal: item.lineTotal
    }));

    const order = new Order({
      customer: pending.customer,
      items,
      subtotal: pending.totals.subtotal,
      tax: pending.totals.tax,
      shipping: pending.totals.shipping,
      discount: pending.totals.discount || 0,
      total: pending.totals.finalTotal,
      couponCode: pending.coupon || null,
      status: 'Placed'
    });

    await order.save();

    // Clear cart and pending order
    req.session.cart = [];
    req.session.pendingOrder = null;

    res.redirect(`/order/success/${order._id}`);
  } catch (error) {
    console.error('Error confirming order:', error);
    res.status(500).render('404', {
      title: 'Error | Play Cards'
    });
  }
});

// Success page with order summary
router.get('/success/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).render('404', {
        title: 'Order Not Found | Play Cards'
      });
    }

    res.render('order-success', {
      title: 'Order Placed | Play Cards',
      order
    });
  } catch (error) {
    console.error('Error loading order success page:', error);
    res.status(500).render('404', {
      title: 'Error | Play Cards'
    });
  }
});

module.exports = router;


