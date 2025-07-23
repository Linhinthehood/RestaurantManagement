import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  type: {
    type: String,
    enum: ["Normal", "VIP"],
    default: "Normal",
  },
});

const tableModel = mongoose.model("Table", tableSchema);

export default tableModel;
