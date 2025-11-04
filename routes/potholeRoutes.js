import express from "express";
import {
  getAllPotholes,
  getPotholeById,
  createPothole,
  updatePothole,
  deletePothole
} from "../controllers/potholeController.js";

const router = express.Router();

// Base route: /api/potholes
router.get("/", getAllPotholes);
router.get("/:id", getPotholeById);
router.post("/", createPothole);
router.put("/:id", updatePothole);
router.delete("/:id", deletePothole);

export default router;
