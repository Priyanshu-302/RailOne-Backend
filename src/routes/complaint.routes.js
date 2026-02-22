const complaintController = require("../controllers/complaint.controller");
const { authHandler } = require("../middlewares/auth.middleware");
const { roleHandler } = require("../middlewares/role.middleware");

const router = require("express").Router();
router.use(authHandler);

// Create Complaint
router.post("/create-complaint", complaintController.createComplaint);

// Get User Complaints
router.get("/user-complaints", complaintController.getUserComplaints);

// Get All Complaints(ADMIN)
router.get(
  "/all-user-complaints",
  roleHandler("ADMIN"),
  complaintController.getAllComplaints,
);

// Get All Pending Complaints(ADMIN)
router.get(
  "/all-pending-complaints",
  roleHandler("ADMIN"),
  complaintController.getPendingComplaints,
);

// Update the status of complaints
router.patch(
  "/update-complaint-status",
  complaintController.updateComplaintStatus,
);

module.exports = router;
