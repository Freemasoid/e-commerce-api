import Review from "../models/Review.js";
import Product from "../models/Product.js";
import { StatusCodes } from "http-status-codes";
import checkPermit from "../utils/checkPermit.js";
import { BadRequestError, NotFoundError } from "../errors/custom-errors.js";

const createReview = async (req, res) => {
  const { product: productId } = req.body;
  const isValidProd = await Product.findOne({ _id: productId });

  if (!isValidProd) {
    throw new NotFoundError(`No product with id: ${productId}`);
  }

  const hasReview = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });

  if (hasReview) {
    throw new BadRequestError("Review has been already submitted for this product");
  }

  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({
    path: "product",
    select: "name company price",
  });

  res.status(StatusCodes.OK).json({ reviews });
};

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new NotFoundError(`No review with id ${reviewId}`);
  }

  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;
  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new NotFoundError(`No review with id ${reviewId}`);
  }

  checkPermit(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new NotFoundError(`No review with id ${reviewId}`);
  }

  checkPermit(req.user, review.user);
  await review.deleteOne();
  res.status(StatusCodes.OK).json({ msg: "Review removed." });
};

const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ reviews });
};

export {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
