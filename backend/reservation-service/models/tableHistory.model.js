import mongoose from "mongoose";

const tableHistorySchema = new mongoose.Schema({
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
    required: true,
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Table",
    required: true,
  },
  assignedTime: {
    type: Date,
    default: Date.now,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  checkInTime: {
    type: Date,
    required: true,
  },
  expectedCheckOutTime: {
    type: Date,
  },
  tableStatus: {
    type: String,
    enum: ["Available", "Pending", "Occupied", "Unavailable"],
    default: "Available",
  },
  note: {
    type: String,
    default: "",
  },
});

tableHistorySchema.pre("save", function (next) {
  if (this.checkInTime && !this.expectedCheckOutTime) {
    this.expectedCheckOutTime = new Date(
      this.checkInTime.getTime() + 2 * 60 * 60 * 1000
    );
  }
  next();
});

const tableHistoryModel = mongoose.model("TableHistory", tableHistorySchema);
export default tableHistoryModel;
