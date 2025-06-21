const express = require('express');
const app = express();
const stripe = require('stripe')('sk_test_51RcTWABDLsp0C0GfvxX5uOy5izkzb8yUZ2y14HP0LfabkTSyzqgCQPlxwuv8DOK3TFK1TnQr0G6QWeIgYuSST7k5008F2Dm68Q');
const cors = require('cors');

app.use(cors());
app.use(express.json());

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
          unit_amount: item.price * 100, // Stripe expects amount in cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: 'http://localhost:5500/success.html',
      cancel_url: 'http://localhost:5500/cancel.html',
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(4242, () => {
  console.log('✅ Server running on http://localhost:4242');
});


