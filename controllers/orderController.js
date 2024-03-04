import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/custom-errors.js";
import checkPermit from "../utils/checkPermit.js";

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });

  if (!order) {
    throw new NotFoundError(`No order with id: ${order}`);
  }

  checkPermit(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

const getCurrUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const createOrder = async (req, res) => {
  const { cartItems } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError("No cart items provided");
  }

  let orderItems = [];
  let subtotal = 0;
  let shippingFee = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item._id });

    if (!dbProduct) {
      throw new NotFoundError(`No product with id: ${item._id}`);
    }

    const { name, price, _id, freeShipping } = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image: item.image,
      _id,
      freeShipping,
      color: item.color,
    };

    if (singleOrderItem.freeShipping) shippingFee = 10000;
    orderItems = [...orderItems, singleOrderItem];
    subtotal += item.amount * price;
  }
  const tax = Math.ceil(subtotal * 0.05);
  const total = tax + shippingFee + subtotal;

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    user: req.user.userId,
  });

  res.status(StatusCodes.CREATED).json({ order });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;
  const order = await Order.findOne({ _id: orderId });

  if (!order) {
    throw new NotFoundError(`No order with id: ${orderId}`);
  }

  checkPermit(req.user, order.user);
  order.paymentIntentId = paymentIntentId;
  order.status = "paid";
  await order.save();
  res.status(StatusCodes.OK).json({ order });
};

export { getAllOrders, getSingleOrder, getCurrUserOrders, createOrder, updateOrder };
