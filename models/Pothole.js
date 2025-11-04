import mongoose from "mongoose";

const potholeSchema = new mongoose.Schema({
  //Location
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },

  //Physical dimensions
  width: { type: Number },
  depth: { type: Number },
  area: { type: Number },

  //Severity & Status
  severity: {
    type: String,
    enum: ["fixed","minor", "moderate", "severe"],
    default: "minor"
  },
  status: {
    type: String,
    enum: ["new", "pending_review", "confirmed", "fixed"],
    default: "new"
  },

  //User tracking (who created / last updated)
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reporterName: { type: String },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedByName: { type: String },

  //Optional fields
  notes: { type: String },
  imageUrl: { type: String },

  //Timestamps
  timestamp: { type: Date, default: Date.now }
}, { versionKey: false });


//Hide internal fields (ObjectIds) from API responses
potholeSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.reporterId;
    delete ret.updatedBy;
    return ret;
  }
});

const Pothole = mongoose.model("Pothole", potholeSchema);
export default Pothole;
