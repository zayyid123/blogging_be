import Blog from "../models/blogModel.js";
import errorHandler from "../utils/errorHandling.js";

// create Blog
export const createBlog = async (req, res) => {
  try {
    const { slug, title, content } = req.body;
    const { userId } = req.user;
    // Membuat blog baru
    const newBlog = await Blog.create({
      title,
      slug,
      content,
      userId, // Menghubungkan blog ke user yang sedang login
    });

    return res
      .status(201)
      .json({ message: "Blog created successfully", blog: newBlog });
  } catch (error) {
    errorHandler(error, res);
  }
};

// get all blog
export const getAllBlog = async (req, res) => {
  try {
    const blog = await Blog.findAll();

    return res.json(blog);
  } catch (error) {
    errorHandler(error, res);
  }
};
