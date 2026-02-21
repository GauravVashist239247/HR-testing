import express from "express";
import {
  registerInterviewer,
  loginInterviewer,
  logoutInterviewer,
  getProfile,
  updateProfile,
} from "../controllers/interviewer.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerInterviewer);
router.post("/login", loginInterviewer);
router.post("/logout", logoutInterviewer);

router.get("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);

export default router;
