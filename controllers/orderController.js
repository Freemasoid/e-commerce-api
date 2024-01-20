import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/custom-errors.js";
import checkPermit from "../utils/checkPermit.js";
import Stripe from "stripe";

const stripeInst = Stripe(process.env.STRIPE_TEST_KEY);

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
  const { items: cartItems } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError("No cart items provided");
  }

  let orderItems = [];
  let subtotal = 0;
  let shippingFee = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });

    if (!dbProduct) {
      throw new NotFoundError(`No product with id: ${item.product}`);
    }

    const { name, price, image, _id, freeShipping } = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
      freeShipping,
    };

    if (singleOrderItem.freeShipping) shippingFee = 10000;
    orderItems = [...orderItems, singleOrderItem];
    subtotal += item.amount * price;
  }
  const tax = Math.ceil(subtotal * 0.05);
  const total = tax + shippingFee + subtotal;

  const paymentIntent = await stripeInst.paymentIntents.create({
    amount: total,
    currency: "eur",
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res.status(StatusCodes.CREATED).json({ order, clientSecret: order.clientSecret });
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
