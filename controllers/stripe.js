const express = require("express");
const router = express.Router();
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  router.use(cors({
    origin: "http://localhost:3000",
  })
);

const storeItems = new Map([
    [1, { priceInCents: 4000, name: "Registration Fee" }],
  ]);
  
  router.post("/create-checkout-session", async (req, res) => {
    try {
      console.log("string")
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        allow_promotion_codes: true,
      
        line_items: req.body.items.map((item) => {
          const storeItem = storeItems.get(item.id);
          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: storeItem.name,
              },
              unit_amount: storeItem.priceInCents,
            },
            quantity: item.quantity,
          };
        }),
        cancel_url: `${"http://localhost:3000/raceRegistration"}`,
        success_url: `${"http://localhost:3000/successPage"}`,
        
      });
      
      res.json({ url: session.url });
    } catch (e) {
      res.status(500).json({
        error: e.message,
      });
    }
  });
  module.exports = router;