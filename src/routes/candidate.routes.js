import express from "express";
import {
  createCandidate,
  getMyCandidates,
  getSingleCandidate,
  updateCandidate,
  deleteCandidate,
  getAllCandidates,
} from "../controllers/candidate.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createCandidate);
router.get("/", protect, getMyCandidates);
router.get("/all", protect, getAllCandidates);
router.get("/:id", protect, getSingleCandidate);
router.patch("/:id", protect, updateCandidate);
router.delete("/:id", protect, deleteCandidate);

export default router;
