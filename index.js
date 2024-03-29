const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mh2ii.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("Motors");
    const productsCollection = database.collection("products");
    const ordersCollection = database.collection("orders");
    const usersCollection = database.collection("users");
    const reviewsCollection = database.collection("reviews");

    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.json(products);
    });

    // products for home page
    app.get("/homeProducts", async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.limit(6).toArray();
      res.json(products);
    });

    app.post("/products", async (req, res) => {
      const product = req.body;
      // console.log('hit api', product);
      const result = await productsCollection.insertOne(product);
      // console.log(result);
      res.json(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      // console.log('loaded user', id);
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.send(product);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);

      // console.log('deleting', result);

      res.json(result);
    });

    app.get("/orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const products = await cursor.toArray();
      res.json(products);
    });

    app.get("/userOrders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      console.log(query);
      const cursor = ordersCollection.find(query);
      const products = await cursor.toArray();
      res.json(products);
    });

    app.post("/orders", async (req, res) => {
      const order = req.body;
      // console.log('hit api');
      const result = await ordersCollection.insertOne(order);
      // console.log(result);
      res.json(result);
    });

    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);

      // console.log('deleting', result);

      res.json(result);
    });

    // start review section

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      // console.log('hit api', product);
      const result = await reviewsCollection.insertOne(review);
      // console.log(result);
      res.json(result);
    });

    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const products = await cursor.toArray();
      res.json(products);
    });

    // start users section

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      // console.log(result);
      res.json(result);
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Motors!");
});

app.listen(port, () => {
  console.log(`Listening at Port:${port}`);
});
