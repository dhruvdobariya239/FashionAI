const Cart = require('../models/Cart');
const Order = require('../models/Order');

const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const { items } = req.body;

    const line_items = items.map(item => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.product?.name || item.name || "Fashion Item",
        },
        unit_amount: item.price * 100, // ₹ → paise
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/cancel",
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error("STRIPE ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};
exports.handlePaymentSuccess = async (req, res) => {
  try {

    const { sessionId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // ✅ get cart
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart empty" });
    }

    // ✅ create items
    const items = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images?.[0]?.url || "",
      price: item.price,
      size: item.size,
      quantity: item.quantity,
    }));

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingCost = subtotal > 999 ? 0 : 99;

    // ✅ CREATE ORDER WITH PAID STATUS
    const order = await Order.create({
      user: req.user._id,
      items,
      paymentMethod: "online",
      paymentStatus: "paid",   // 🔥 important
      orderStatus: "confirmed", // optional better UX
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
    });

    // ✅ CLEAR CART (IMPORTANT FIX)
    const carts = await Cart.findOne({ user: req.user._id });

if (carts) {
  carts.items = [];
  await carts.save();
}

    res.json({ success: true, order });

  } catch (err) {
    console.error("PAYMENT SUCCESS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};