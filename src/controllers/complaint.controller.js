const {
  createComplaint,
  getUserComplaints,
  getComplaintsById,
  getAllComplaints,
  getPendingComplaints,
  updateComplaintStatus,
} = require("../services/complaint.service");

// Create Complaint
exports.createComplaint = async (req, res, next) => {
  try {
    const { user_id, train_id, message, status } = req.body;

    if (!user_id || !train_id || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newComplaint = await createComplaint(
      user_id,
      train_id,
      message,
      status,
    );

    return res
      .status(201)
      .json({ message: "Complaint created successfully", newComplaint });
  } catch (error) {
    next(error);
  }
};

// Get User Complaints
exports.getUserComplaints = async (req, res, next) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "All fields required" });
    }

    const complaints = await getUserComplaints(user_id);

    if (!complaints) {
      return res.status(400).json({ error: "No complaints found" });
    }

    return res
      .status(200)
      .json({ message: "Complaints fetched successfully", complaints });
  } catch (error) {
    next(error);
  }
};

// Get All Complaints(ADMIN)
exports.getAllComplaints = async (req, res, next) => {
  try {
    const complaints = await getAllComplaints();

    if (!complaints) {
      return res.status(400).json({ error: "No complaints found" });
    }

    return res.status(200).json(complaints);
  } catch (error) {
    next(error);
  }
};

// Get All Pending Complaints(ADMIN)
exports.getPendingComplaints = async (req, res, next) => {
  try {
    const pending = await getPendingComplaints();

    if (!pending) {
      return res.status(400).json({ error: "No pending complaints found" });
    }

    return res.status(200).json(pending);
  } catch (error) {
    next(error);
  }
};

// Update the status of complaints
exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "All fields required" });
    }

    const complaint = await getComplaintsById(id);

    if (!complaint) {
      return res.status(400).json({ error: "No complaint found" });
    }

    if (complaint.status === "PENDING") {
      await updateComplaintStatus(id, "RESOLVED");
    }

    return res.status(200).json({ message: "Complaint Resolved", complaint });
  } catch (error) {
    next(error);
  }
};
