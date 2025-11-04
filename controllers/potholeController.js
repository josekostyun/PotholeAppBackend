import Pothole from "../models/Pothole.js";

//Get all potholes
export const getAllPotholes = async (req, res) => {
  try {
    const potholes = await Pothole.find().sort({ timestamp: -1 });
    res.json(potholes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Get pothole by ID
export const getPotholeById = async (req, res) => {
  try {
    const pothole = await Pothole.findById(req.params.id);
    if (!pothole) return res.status(404).json({ error: "Pothole not found" });
    res.json(pothole);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
};

//Create pothole (auto severity)
export const createPothole = async (req, res) => {
  try {
    const {
      lat,lng,width,depth,area,status,notes,reporterId,reporterName,updatedBy,updatedByName,imageUrl} = req.body;

    // Auto-severity logic
    let severity = "minor";
    if (depth >= 2 && depth < 4) severity = "moderate";
    else if (depth >= 4) severity = "severe";

    const newPothole = new Pothole({
      lat,lng,width,depth,area,severity,status: status || "new",notes,reporterId,reporterName,
      updatedBy,updatedByName,imageUrl});

    await newPothole.save();
    res.status(201).json(newPothole);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Update pothole
export const updatePothole = async (req, res) => {
  try {
    const {width,depth,area,status,notes,reporterId,imageUrl,updatedBy,updatedByName} = req.body;

    // Recalculate severity if depth changes
    let severity;
    if (depth !== undefined) {
      if (depth < 2) severity = "minor";
      else if (depth < 4) severity = "moderate";
      else severity = "severe";
    }
	
	//Override severity if pothole is marked as fixed
	if (status && status.toLowerCase() === "fixed") severity = "fixed";

    const updated = await Pothole.findByIdAndUpdate(
      req.params.id,{width,depth,area,status,notes,reporterId,imageUrl,updatedBy,updatedByName,
        ...(severity && { severity })},{ new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "Pothole not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


//Delete pothole
export const deletePothole = async (req, res) => {
  try {
    const deleted = await Pothole.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Pothole not found" });
    res.json({ message: "Pothole deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
