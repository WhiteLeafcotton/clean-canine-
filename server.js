const express = require('express');
const app = express();
const stripe = require('stripe')('sk_test_51RcTWABDLsp0C0GfvxX5uOy5izkzb8yUZ2y14HP0LfabkTSyzqgCQPlxwuv8DOK3TFK1TnQr0G6QWeIgYuSST7k5008F2Dm68Q');
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from 'public' folder

// --- Existing endpoint for ONE-TIME payments (products) ---
app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: req.body.items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title,
          },
          unit_amount: Math.round(item.price * 100), // Stripe expects amount in cents, rounded
        },
        quantity: item.quantity,
      })),
      mode: 'payment',  // One-time payment
      success_url: 'https://clean-canine-1.onrender.com/success.html',
      cancel_url: 'https://clean-canine-1.onrender.com/cancel.html',
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- NEW endpoint for SUBSCRIPTION payments (memberships) ---
app.post('/create-subscription-session', async (req, res) => {
  try {
    // quantity: number of memberships (pets)
    const quantity = req.body.quantity && Number(req.body.quantity) > 0 ? Number(req.body.quantity) : 1;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1RcrraBDLsp0C0GfLDUaNm0w', // Your subscription price ID from Stripe dashboard
          quantity: quantity,
        },
      ],
      mode: 'subscription',  // Recurring payment
      success_url: 'https://clean-canine-1.onrender.com/success.html',
      cancel_url: 'https://clean-canine-1.onrender.com/cancel.html',
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating subscription session:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4242;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
});

