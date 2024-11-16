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

// get detail blog
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

// update blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { slug, title, content } = req.body;
    const { userId } = req.user;

    // check is user can update this data
    const blog = await Blog.findOne({ where: { id } });
    if (blog.userId !== userId) {
      throw new CustomError("User can't update this blog", 400);
    }

    const updatedCount = await Blog.update(
      { slug, title, content, updatedAt: new Date() },
      { where: { id, userId } }
    );

    if (updatedCount > 0) {
      const updatedBlog = await Blog.findByPk(id);
      return res.json({ data: updatedBlog, message: "Success update Blog" });
    } else {
      throw new CustomError("Blog not Found", 400);
    }
  } catch (error) {
    errorHandler(error, res);
  }
};

// delete blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    // check is user can delete this data
    const blog = await Blog.findOne({ where: { id } });
    if (blog.userId !== userId) {
      throw new CustomError("User can't remove this blog", 400);
    }

    const deletedCount = await Blog.destroy({ where: { id, userId } });

    if (deletedCount > 0) {
      return res.json({ message: "Success delete Blog" });
    } else {
      throw new CustomError("Blog not Found", 400);
    }
  } catch (error) {
    errorHandler(error, res);
  }
};
