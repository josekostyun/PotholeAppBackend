import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  searchUsers,
  updateUser,
  deleteUser,
  deleteUserByName
} from "../controllers/userController.js";

import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();


// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Admin or protected routes (you can later add middleware for auth)
router.get("/", getAllUsers);
router.get("/search", searchUsers);
router.put("/:userId", updateUser);
router.delete("/name/:name", deleteUserByName);
router.delete("/:userId", deleteUser);

export default router;
