const express = require('express');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const Product = require('../models/Product');
const Quant = require('../models/Quant');
const { requireAuth } = require('../middleware/auth');
const { toDecimal } = require('../utils/decimalHelper');
const Decimal = require('decimal.js');

const router = express.Router();

/**
 * GET /api/notifications
 * Returns all active system notifications, auto-generating low-stock alerts if needed.
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { unreadOnly } = req.query;
    const filter = {};
    if (unreadOnly === 'true') {
      filter.read = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // If notifications collection is empty, generate initial high-value alerts based on real DB stock
    if (notifications.length === 0) {
      const products = await Product.find({ active: true }).lean();
      const quants = await Quant.find({}).lean();

      const prodStock = new Map();
      quants.forEach((q) => {
        const pId = q.productId.toString();
        const current = prodStock.get(pId) || new Decimal(0);
        prodStock.set(pId, current.plus(toDecimal(q.quantity)));
      });

      const seedNotifs = [];
      for (const p of products) {
        const stock = (prodStock.get(p._id.toString()) || new Decimal(0)).toNumber();
        const reorderPt = p.reorderPoint !== undefined ? p.reorderPoint : 10;

        if (stock === 0) {
          seedNotifs.push({
            title: 'Out of Stock Alert',
            message: `${p.name} (SKU: ${p.sku}) is completely out of stock in storage bays!`,
            type: 'danger',
            icon: 'AlertOctagon',
            time: 'Just now',
            read: false,
            link: 'products',
            category: 'Inventory',
          });
        } else if (stock <= reorderPt) {
          seedNotifs.push({
            title: 'Low Stock Replenishment Alert',
            message: `${p.name} (SKU: ${p.sku}) is low in stock: ${stock} remaining (Reorder threshold: ${reorderPt}).`,
            type: 'warning',
            icon: 'AlertTriangle',
            time: '10 min ago',
            read: false,
            link: 'products',
            category: 'Reorder',
          });
        }
      }

      if (seedNotifs.length > 0) {
        const created = await Notification.insertMany(seedNotifs.slice(0, 10));
        return res.json({
          data: created,
          unreadCount: created.filter((n) => !n.read).length,
        });
      }
    }

    return res.json({
      data: notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/notifications
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { title, message, type = 'info', icon = 'Bell', link = 'products', category = 'General' } = req.body;
    if (!title || !message) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Title and message are required.' },
      });
    }

    const notif = await Notification.create({
      title: title.trim(),
      message: message.trim(),
      type,
      icon,
      link,
      category,
      time: 'Just now',
      read: false,
      userId: req.user._id,
    });

    return res.status(201).json(notif);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/notifications/:id/read
 */
router.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Notification not found.' },
      });
    }

    const notif = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    return res.json(notif);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/notifications/read-all
 */
router.patch('/read-all', requireAuth, async (req, res, next) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    return res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
