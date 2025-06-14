
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { body, validationResult } from 'express-validator';
import { File } from '../models/File.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Get all files
router.get('/', auth, async (req, res) => {
  try {
    const { type, caseNumber, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (type) filter.type = type;
    if (caseNumber) filter.caseNumber = { $regex: caseNumber, $options: 'i' };

    const files = await File.find(filter)
      .populate('uploadedBy', 'firstName lastName')
      .populate('caseId', 'title caseNumber')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await File.countDocuments(filter);

    res.json({
      success: true,
      data: files,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Upload file
router.post('/upload', auth, upload.single('file'), [
  body('type').isIn(['Contract', 'Court Filing', 'Statement', 'Evidence', 'Correspondence', 'Other']),
  body('caseNumber').trim().isLength({ min: 1 })
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { type, caseNumber, caseId } = req.body;

    const fileData = {
      name: req.file.filename,
      originalName: req.file.originalname,
      type,
      size: req.file.size,
      mimeType: req.file.mimetype,
      filePath: req.file.path,
      caseNumber,
      caseId,
      uploadedBy: req.user.userId
    };

    const file = new File(fileData);
    await file.save();
    await file.populate(['uploadedBy', 'caseId']);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: file
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Download file
router.get('/download/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    if (!fs.existsSync(file.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Physical file not found'
      });
    }

    res.download(file.filePath, file.originalName);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete file
router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if user has permission to delete (only Senior Associate or file uploader)
    if (req.user.role !== 'Senior Associate' && req.user.role !== 'Legal Counsel' && file.uploadedBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this file'
      });
    }

    // Delete physical file
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    await File.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
