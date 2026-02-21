import { Candidate } from "../models/candidate.models.js";
import mongoose from "mongoose";

/*
========================================
CREATE CANDIDATE
========================================
*/
export const createCandidate = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      position,
      interviewDate,
      interviewField,
      interviewRound,
    } = req.body;

    if (
      !fullName ||
      !position ||
      !interviewDate ||
      !interviewField ||
      !interviewRound
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    // Create candidate
    const candidate = await Candidate.create({
      interviewer: req.user._id, // from protect middleware
      fullName,
      email,
      phone,
      position,
      interviewDate,
      interviewField,
      interviewRound,
    });

    // Aggregation: get updated counts by status for this interviewer
    const statusAggregation = await Candidate.aggregate([
      { $match: { interviewer: new mongoose.Types.ObjectId(req.user._id) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.status(201).json({
      success: true,
      message: "Candidate added successfully",
      data: candidate,
      stats: statusAggregation, // 🔥 aggregated info
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
========================================
GET ALL MY CANDIDATES
========================================



/*
========================================
GET ALL MY CANDIDATES WITH INTERVIEWER INFO
========================================
*/
export const getMyCandidates = async (req, res) => {
  try {
    // Aggregation pipeline: get all candidates with interviewer info
    const candidates = await Candidate.aggregate([
      // Match candidates for the current interviewer
      { $match: { interviewer: new mongoose.Types.ObjectId(req.user._id) } },

      // Sort by interview date ascending
      { $sort: { interviewDate: 1 } },

      // Lookup interviewer details
      {
        $lookup: {
          from: "interviewers", // Mongo collection name
          localField: "interviewer",
          foreignField: "_id",
          as: "interviewerInfo",
        },
      },

      // Flatten the interviewerInfo array
      { $unwind: "$interviewerInfo" },

      // Select fields to return
      {
        $project: {
          fullName: 1,
          email: 1,
          phone: 1,
          position: 1,
          interviewDate: 1,
          interviewField: 1,
          interviewRound: 1,
          status: 1,
          score: 1,
          feedback: 1,
          interviewerName: "$interviewerInfo.name",
          interviewerEmail: "$interviewerInfo.email",
        },
      },
    ]);

    // Aggregation: count candidates per status
    const statusAggregation = await Candidate.aggregate([
      { $match: { interviewer: new mongoose.Types.ObjectId(req.user._id) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Send response
    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates,
      stats: statusAggregation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
========================================
GET SINGLE CANDIDATE
========================================
*/
export const getSingleCandidate = async (req, res) => {
  try {
    // Use aggregation to fetch candidate with interviewer info
    const candidate = await Candidate.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
          interviewer: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "interviewers", // Mongo collection name
          localField: "interviewer",
          foreignField: "_id",
          as: "interviewerInfo",
        },
      },
      { $unwind: "$interviewerInfo" },
      {
        $project: {
          fullName: 1,
          email: 1,
          phone: 1,
          position: 1,
          interviewDate: 1,
          interviewField: 1,
          interviewRound: 1,
          status: 1,
          feedback: 1,
          score: 1,
          interviewerName: "$interviewerInfo.name",
          interviewerEmail: "$interviewerInfo.email",
        },
      },
    ]);

    if (!candidate.length) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json({ success: true, data: candidate[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
========================================
UPDATE CANDIDATE
========================================
*/
export const updateCandidate = async (req, res) => {
  try {
    // 1️⃣ Find the candidate for this interviewer
    const candidate = await Candidate.findOne({
      _id: req.params.id,
      interviewer: req.user._id,
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found or not authorized",
      });
    }

    // 2️⃣ Apply only fields sent in the request body
    Object.keys(req.body).forEach((key) => {
      candidate[key] = req.body[key];
    });

    // 3️⃣ Save updates
    await candidate.save();

    // 4️⃣ Fetch updated candidate with interviewer info
    const updatedCandidate = await Candidate.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(candidate._id) } },
      {
        $lookup: {
          from: "interviewers",
          localField: "interviewer",
          foreignField: "_id",
          as: "interviewerInfo",
        },
      },
      { $unwind: "$interviewerInfo" },
      {
        $project: {
          fullName: 1,
          email: 1,
          phone: 1,
          position: 1,
          interviewDate: 1,
          interviewField: 1,
          interviewRound: 1,
          status: 1,
          score: 1,
          feedback: 1,
          interviewerName: "$interviewerInfo.name",
          interviewerEmail: "$interviewerInfo.email",
        },
      },
    ]);

    // 5️⃣ Aggregation: get updated status counts
    const statusAggregation = await Candidate.aggregate([
      { $match: { interviewer: new mongoose.Types.ObjectId(req.user._id) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // 6️⃣ Send response
    res.status(200).json({
      success: true,
      message: "Candidate updated successfully",
      data: updatedCandidate[0],
      stats: statusAggregation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/*
========================================
DELETE CANDIDATE
========================================
*/
export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({
      _id: req.params.id,
      interviewer: req.user._id,
    });

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found or not authorized",
      });
    }

    await candidate.deleteOne();

    // Aggregation: get status counts after deletion
    const statusAggregation = await Candidate.aggregate([
      { $match: { interviewer: new mongoose.Types.ObjectId(req.user._id) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      message: "Candidate deleted successfully",
      stats: statusAggregation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllCandidates = async (req, res) => {
  try {
    // Aggregation pipeline: get all candidates with interviewer info
    const candidates = await Candidate.aggregate([
      // Match candidates for the current interviewer

      // Sort by interview date ascending
      { $sort: { interviewDate: 1 } },

      // Lookup interviewer details
      {
        $lookup: {
          from: "interviewers", // Mongo collection name
          localField: "interviewer",
          foreignField: "_id",
          as: "interviewerInfo",
        },
      },

      // Flatten the interviewerInfo array
      { $unwind: "$interviewerInfo" },

      // Select fields to return
      {
        $project: {
          fullName: 1,
          email: 1,
          phone: 1,
          position: 1,
          interviewDate: 1,
          interviewField: 1,
          interviewRound: 1,
          status: 1,
          score: 1,
          feedback: 1,
          interviewerName: "$interviewerInfo.name",
          interviewerEmail: "$interviewerInfo.email",
        },
      },
    ]);

    // Aggregation: count candidates per status
    const statusAggregation = await Candidate.aggregate([
      { $match: { interviewer: new mongoose.Types.ObjectId(req.user._id) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Send response
    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates,
      stats: statusAggregation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
