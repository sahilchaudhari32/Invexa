const mongoose = require('mongoose');

const { Schema } = mongoose;

const ReorderRuleSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      default: '',
    },
    sku: {
      type: String,
      default: '',
    },
    minStock: {
      type: Number,
      required: true,
      default: 10,
    },
    maxStock: {
      type: Number,
      required: true,
      default: 500,
    },
    reorderQty: {
      type: Number,
      required: true,
      default: 50,
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null,
    },
    warehouseName: {
      type: String,
      default: '',
    },
    unit: {
      type: String,
      default: 'pcs',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    autoPO: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReorderRule', ReorderRuleSchema);
