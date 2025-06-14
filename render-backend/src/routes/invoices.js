
import express from 'express';
import { body, validationResult } from 'express-validator';
import { Invoice } from '../models/Invoice.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all invoices
router.get('/', auth, async (req, res) => {
  try {
    const { status, clientId, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (clientId) filter.clientId = clientId;

    const invoices = await Invoice.find(filter)
      .populate('clientId', 'name contactPerson email')
      .populate('caseId', 'title caseNumber')
      .populate('createdBy', 'firstName lastName')
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Invoice.countDocuments(filter);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new invoice
router.post('/', auth, [
  body('clientId').isMongoId(),
  body('amount').isNumeric().custom(value => value > 0),
  body('dueDate').isISO8601(),
  body('currency').optional().isIn(['KES', 'USD', 'EUR'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Generate unique invoice number
    const year = new Date().getFullYear();
    const lastInvoice = await Invoice.findOne({}, {}, { sort: { 'createdAt': -1 } });
    let invoiceNumber;
    
    if (lastInvoice && lastInvoice.invoiceNumber.startsWith(`INV-${year}`)) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
      invoiceNumber = `INV-${year}-${String(lastNumber + 1).padStart(3, '0')}`;
    } else {
      invoiceNumber = `INV-${year}-001`;
    }

    const invoiceData = {
      ...req.body,
      invoiceNumber,
      createdBy: req.user.userId
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();
    await invoice.populate(['clientId', 'caseId', 'createdBy']);

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update invoice
router.put('/:id', auth, [
  body('amount').optional().isNumeric().custom(value => value > 0),
  body('status').optional().isIn(['Draft', 'Pending', 'Paid', 'Overdue']),
  body('dueDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updates = req.body;
    
    // Set paid date if status is changed to Paid
    if (updates.status === 'Paid' && !updates.paidDate) {
      updates.paidDate = new Date();
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate(['clientId', 'caseId', 'createdBy']);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete invoice
router.delete('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
