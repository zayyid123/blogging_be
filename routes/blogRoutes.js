import express from "express";
import {
  createBlog,
  deleteBlog,
  getAllBlog,
  getAllBlogByUser,
  getDetailBlog,
  updateBlog,
} from "../controllers/blogControllers.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllBlog);
router.get("/getBlogByUser", authenticateToken, getAllBlogByUser);
router.get("/:id", getDetailBlog);
router.post("/create", authenticateToken, createBlog);
router.put("/update/:id", authenticateToken, updateBlog);
router.delete("/remove/:id", authenticateToken, deleteBlog);

export default router;
