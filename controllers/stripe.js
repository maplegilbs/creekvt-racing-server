const express = require("express");
const router = express.Router();
const cors = require("cors");
const db = require("../db");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
router.use(
  cors({
    origin: "http://localhost:3000",
  })
);
router.post("/create-checkout-session/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const checkSQL = `SELECT * FROM registeredAthletes WHERE raceId = ${id} AND LOWER(email) = '${email.toLowerCase()}'`;
    db.query(checkSQL, (error, results, fields) => {
      if (error) {
        throw Error(error);
      }
      if (results.length === 0) {
        const query = `SELECT price, name FROM races WHERE id = ${id}`;
    let price = 0;
    console.log(query);
    db.query(query, (err, results) => {
      if (err) {
        throw err;
      }
      if (results.length === 0) {
        res.status(404).json({ message: "No races found" });
      } else {
        handleCheckoutInfo(results[0].price, results[0].name);
      }
    });
      } else {
        res.status(409).json({ message: "An athlete with this email is already registered for this race!" })
      }
    });
    
    async function handleCheckoutInfo(price, name) {
      const storeItems = new Map([
        [1, { priceInCents: price * 100, name: name }],
      ]);
      const session = await stripe.checkout.sessions.create({
        customer_email: req.body.email,
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
    }
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
});

module.exports = router;
