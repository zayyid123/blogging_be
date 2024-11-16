import express from "express";
import {
  createBlog,
  getAllBlog,
  getAllBlogByUser,
} from "../controllers/blogControllers.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllBlog);
router.get("/getBlogByUser", authenticateToken, getAllBlogByUser);
router.post("/create", authenticateToken, createBlog);

export default router;
