require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { Sequelize } = require("sequelize");
const app = express();
const MySQL = require("mysql");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);


// Controllers
const usersController = require("./controllers/users");
const racesController = require("./controllers/races");
const photosController = require("./controllers/photos");
const resultsController = require("./controllers/results");

const PORT = 3307;

// Connecting to the DB (defined in db.js)
app.use(cors());
app.use(express.json());
const db = require("./db");

db.once("open", () => console.log("connected to the DB: " + db.host));
// Routes

app.use("/users", usersController);
app.use("/races", racesController);
app.use("/photos", photosController);
app.use("/race-results", resultsController);


// stripe 
const storeItems = new Map([
  [1, { priceInCents: 4000, name: "Registration Fee" }],
]);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      // automatic_tax: {enabled: true},                   Waiting for Scott's response on whether or not he needs tax to be collected. 
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
      // success_url: `${"http://127.0.0.1:5500/success.html"}`,
      success_url: `${"http://localhost:3000/successPage"}`,
      
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
});
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
