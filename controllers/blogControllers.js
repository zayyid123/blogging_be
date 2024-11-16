import Blog from "../models/blogModel.js";
import CustomError from "../utils/customError.js";
import errorHandler from "../utils/errorHandling.js";

// get all blog
export const getAllBlog = async (req, res) => {
  try {
    const blog = await Blog.findAll();

    return res.json(blog);
  } catch (error) {
    errorHandler(error, res);
  }
};

// get all blog
export const getAllBlogByUser = async (req, res) => {
  try {
    const { userId } = req.user;

    const blog = await Blog.findAll({
      where: { userId: userId },
    });

    return res.json(blog);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const getDetailBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findOne({ where: { id } });

    // is blog exist
    if (!blog) {
      throw new CustomError("Blog doesn't exist", 400);
    }

    return res.json(blog);
  } catch (error) {
    errorHandler(error, res);
  }
};

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
