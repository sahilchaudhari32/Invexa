const mongoose = require('mongoose');

const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'danger'],
      default: 'info',
    },
    icon: {
      type: String,
      default: 'Bell',
    },
    time: {
      type: String,
      default: 'Just now',
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: 'products',
    },
    saved: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      default: 'General',
    },
    date: {
      type: String,
      default: () => new Date().toISOString(),
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
