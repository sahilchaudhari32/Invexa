const express = require('express');
const mongoose = require('mongoose');
const ReorderRule = require('../models/ReorderRule');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/reorder-rules
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const rules = await ReorderRule.find({}).sort({ createdAt: -1 }).lean();
    return res.json({
      data: rules,
      count: rules.length,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/reorder-rules
 */
router.post('/', requireAuth, requireRole('manager'), async (req, res, next) => {
  try {
    const { productId, minStock, maxStock, reorderQty, warehouseId, autoPO = true } = req.body;
    if (!productId) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'productId is required.' },
      });
    }

    const prod = await Product.findById(productId).lean();
    if (!prod) {
      return res.status(404).json({
        error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' },
      });
    }

    let whName = '';
    let whId = null;
    if (warehouseId && mongoose.Types.ObjectId.isValid(warehouseId)) {
      whId = new mongoose.Types.ObjectId(warehouseId);
      const wh = await Warehouse.findById(whId).lean();
      if (wh) whName = wh.name;
    }

    const rule = await ReorderRule.create({
      productId: prod._id,
      productName: prod.name,
      sku: prod.sku,
      minStock: Number(minStock) || 10,
      maxStock: Number(maxStock) || 500,
      reorderQty: Number(reorderQty) || 50,
      warehouseId: whId,
      warehouseName: whName,
      unit: prod.unit || prod.unitOfMeasure || 'pcs',
      status: 'Active',
      autoPO: Boolean(autoPO),
    });

    return res.status(201).json(rule);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/reorder-rules/:id
 */
router.delete('/:id', requireAuth, requireRole('manager'), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Reorder rule not found.' },
      });
    }

    await ReorderRule.findByIdAndDelete(id);
    return res.json({ message: 'Reorder rule deleted successfully.', id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
