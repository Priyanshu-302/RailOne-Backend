const { createComplaint } = require("../models/complaint.model");
const { getComplaintsById, getComplaintsByUserId } = require("../models/complaint.model");
const { getAllComplaints } = require("../models/complaint.model");
const { getPendingComplaints } = require("../models/complaint.model");
const { updateComplaintStatus } = require("../models/complaint.model");

// Create Complaint
exports.createComplaint = async (user_id, train_id, message, status) => {
  try {
    const newComplaint = await createComplaint(
      user_id,
      train_id,
      message,
      status,
    );

    return newComplaint;
  } catch (error) {
    console.log(error);
  }
};

// Get User Complaints
exports.getUserComplaints = async (user_id) => {
  try {
    const complaints = await getComplaintsByUserId(user_id);

    if (!complaints) {
      throw new Error("No complaints found");
    }

    return complaints;
  } catch (error) {
    console.log(error);
  }
};

// Get Complaints By Id
exports.getComplaintsById = async (id) => {
  try {
    const complaints = await getComplaintsById(id);

    if (!complaints) {
      throw new Error("No complaints found");
    }

    return complaints;
  } catch (error) {
    console.log(error);
  }
};

// Get All Complaints(ADMIN)
exports.getAllComplaints = async () => {
  try {
    const allComplaints = await getAllComplaints();

    if (!allComplaints) {
      throw new Error("No complaints found");
    }

    return allComplaints;
  } catch (error) {
    console.log(error);
  }
};

// Get Pending Complaints(ADMIN)
exports.getPendingComplaints = async () => {
  try {
    const pendingComplaints = await getPendingComplaints();

    if (!pendingComplaints) {
      throw new Error("No pending complaints found");
    }

    return pendingComplaints;
  } catch (error) {
    console.log(error);
  }
};

// Update Complaint Status
exports.updateComplaintStatus = async (id, status) => {
  try {
    const updatedComplaint = await updateComplaintStatus(id, status);

    return updatedComplaint;
  } catch (error) {
    console.log(error);
  }
};
