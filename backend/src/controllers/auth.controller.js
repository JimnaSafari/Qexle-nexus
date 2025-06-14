import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Team } from '../models/index.js';
import { logger } from '../utils/logger.js';
import { validationResult } from 'express-validator';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register a new team member
// @route   POST /api/auth/register
// @access  Private/Admin
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { firstName, lastName, email, password, role, department, phone } = req.body;

  try {
    // Check if team member exists
    let teamMember = await Team.findOne({ where: { email } });

    if (teamMember) {
      return res
        .status(400)
        .json({ message: 'Team member already exists with that email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create team member
    teamMember = await Team.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      department,
      phone,
    });

    logger.info(`New team member registered: ${email}`);

    // Generate token
    const token = generateToken(teamMember.id);

    res.status(201).json({
      id: teamMember.id,
      firstName: teamMember.firstName,
      lastName: teamMember.lastName,
      email: teamMember.email,
      role: teamMember.role,
      department: teamMember.department,
      phone: teamMember.phone,
      token,
    });
  } catch (error) {
    logger.error('Error in register:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate team member & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password, role } = req.body;

    // Check for team member
    const teamMember = await Team.findOne({ where: { email } });

    if (!teamMember) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, teamMember.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Optional: Check if the selected role matches the database role
    // Only validate role if it's provided and different from stored role
    if (role && role !== teamMember.role) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await teamMember.update({ lastLogin: new Date() });

    // Generate token
    const token = generateToken(teamMember.id);

    // Return response in the format expected by frontend
    res.json({
      token,
      user: {
        id: teamMember.id,
        email: teamMember.email,
        name: `${teamMember.firstName} ${teamMember.lastName}`,
        role: teamMember.role
      }
    });
  } catch (error) {
    logger.error('Error in login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current team member
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const teamMember = await Team.findByPk(req.teamMember.id, {
      attributes: { exclude: ['password'] },
    });
    res.json(teamMember);
  } catch (error) {
    logger.error('Error in getMe:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update team member details
// @route   PUT /api/auth/update
// @access  Private
export const updateTeamMember = async (req, res) => {
  const { firstName, lastName, email, role, department, phone } = req.body;

  try {
    const teamMember = await Team.findByPk(req.teamMember.id);

    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    // Update fields
    teamMember.firstName = firstName || teamMember.firstName;
    teamMember.lastName = lastName || teamMember.lastName;
    teamMember.email = email || teamMember.email;
    teamMember.role = role || teamMember.role;
    teamMember.department = department || teamMember.department;
    teamMember.phone = phone || teamMember.phone;

    await teamMember.save();

    logger.info(`Team member updated: ${teamMember.email}`);

    res.json({
      id: teamMember.id,
      firstName: teamMember.firstName,
      lastName: teamMember.lastName,
      email: teamMember.email,
      role: teamMember.role,
      department: teamMember.department,
      phone: teamMember.phone,
    });
  } catch (error) {
    logger.error('Error in updateTeamMember:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const teamMember = await Team.findByPk(req.teamMember.id);

    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, teamMember.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid old password' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    teamMember.password = hashedPassword;
    await teamMember.save();

    logger.info(`Password changed for team member: ${teamMember.email}`);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Error in changePassword:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
