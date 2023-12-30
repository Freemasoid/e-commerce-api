import Product from "../ models/Product.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/custom-errors.js";
import path from "path";
import url from "url";

//__dirname and __filename are not used in ESM, this is a workaround
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.OK).json({ product });
};

const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products });
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId }).populate("reviews");

  if (!product) {
    throw new NotFoundError(`No product with id: ${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new NotFoundError(`No product with id: ${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new NotFoundError(`No product with id: ${productId}`);
  }

  await product.deleteOne();
  res.status(StatusCodes.OK).json({ msg: "Product Removed" });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new BadRequestError("No File Uploaded");
  }

  const productImg = req.files.image;

  if (!product.mimetype.startsWith("image")) {
    throw new BadRequestError("Please Upload Image");
  }

  const maxSize = 1024 * 1024;

  if (productImg.size > maxSize) {
    throw new BadRequestError("Please upload image smaller than 1MB");
  }

  const imagePath = path.join(__dirname, "../public/uploads/" + `${productImg.name}`);

  await productImg.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImg.name}` });
};

export {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
