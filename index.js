const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uhu2y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// client
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function run() {
    try {
        await client.connect();

        const database = client.db("travel_one");
        const travel_packages = database.collection("travel_packages");
        const bookings = database.collection("bookings");

        // Spot Add POST
        app.post("/add-package", async (req, res) => {
            const newSpot = req.body;
            const result = await travel_packages.insertOne(newSpot);
            res.send("spot added");
        });
        app.post("/bookings", async (req, res) => {
            const booking = req.body;
            const result = await bookings.insertOne(booking);
            res.send("booked");
        });

        // All Package GET
        app.get("/packages", async (req, res) => {
            const cursor = travel_packages.find({});
            const allPackages = await cursor.toArray();
            res.json(allPackages);
        });

        app.get("/packages/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const singlePackage = await travel_packages.findOne(query);
            res.json(singlePackage);
        });

        // My Booking GET
        app.get("/my-bookings/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const myBookings = bookings.find(query);
            const myBookingsArray = await myBookings.toArray();
            res.json(myBookingsArray);
        });

        //Get All bookings
        app.get("/all-bookings", async (req, res) => {
            const cursor = bookings.find({});
            const allBookings = await cursor.toArray();
            res.json(allBookings);
        });

        // DELETE a booking
        app.delete("/delete-booking/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookings.deleteOne(query);
            res.json(result);
        });

        app.put("/status-update/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const update = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: update.status,
                },
            };
            const result = await bookings.updateOne(query, updateDoc, options);
            res.json(result);
        });
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("server running");
});

app.listen(port, () => {
    console.log("server opened at port ", port);
});
