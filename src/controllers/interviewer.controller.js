import { Interviewer } from "../models/interviewer.model.js";
import { generateToken } from "../utils/generateToken.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export const registerInterviewer = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await Interviewer.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const interviewer = await Interviewer.create({
      name,
      email,
      password,
    });

    generateToken(res, interviewer);

    res.status(201).json({
      success: true,
      message: "Registered successfully",
      data: {
        id: interviewer._id,
        name: interviewer.name,
        email: interviewer.email,
        role: interviewer.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
export const loginInterviewer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const interviewer = await Interviewer.findOne({ email }).select(
      "+password",
    );

    if (!interviewer) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await interviewer.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // generate JWT token in cookie
    const token = jwt.sign({ id: interviewer._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: "none",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: interviewer._id,
        name: interviewer.name,
        email: interviewer.email,
        role: interviewer.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGOUT
export const logoutInterviewer = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// GET PROFILE
export const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

// UPDATE PROFILE

export const updateProfile = async (req, res) => {
  try {
    const interviewer = await Interviewer.findById(req.user._id).select(
      "+password",
    );

    if (!interviewer) {
      return res.status(404).json({
        success: false,
        message: "Interviewer not found",
      });
    }

    const { name, email, currentPassword, newPassword } = req.body;

    // ✅ Update name & email if provided
    if (name) interviewer.name = name;
    if (email) interviewer.email = email;

    // ✅ Change password logic
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(
        currentPassword,
        interviewer.password,
      );

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // hash new password
      const salt = await bcrypt.genSalt(10);
      // console.log(newPassword);
      interviewer.password = await bcrypt.hash(newPassword, salt);
    }

    const updated = await interviewer.save();

    // Remove password before sending response
    const userObj = updated.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
