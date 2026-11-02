import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";
import { createRemoteJWKSet, jwtVerify } from "jose";

const app = express();
const port = process.env.PORT;
const client = new MongoClient(process.env.MONGO_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const connectedClient = await connectToMongoDB();
const db = connectedClient.db("GoGather");
const eventCollection = db.collection("events");
const joinedCollection = db.collection("joined-events");


const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ msg: "Unauthorized!" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).send({ msg: "Unauthorized!" });
  }

  const JWKS = createRemoteJWKSet(
    new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
  );

  try {
    const { payload } = await jwtVerify(token, JWKS);
    console.log(payload);
    next();
  } catch (error) {
    return res.status(500).send({ msg: "Server Error!" });
  }
};


app.use(cors());
app.use(express.json());

// Event Create
app.post("/events", async (req, res) => {
  const newEventData = req.body;
  const result = await eventCollection.insertOne(newEventData);
  res.send(result);
});

// Event Read
app.get("/events" , async (req, res) => {
  const result = await eventCollection.find().toArray();
  res.send(result);
});
//Upcoming Event Read
app.get("/upcoming-events", async (req, res) => {
  const result = await eventCollection.find().limit(6).toArray();
  res.send(result);
});

//Get a single event data for details
app.get("/events/:id", async (req, res) => {
  const { id } = req.params;
  const result = await eventCollection.findOne({ _id: new ObjectId(id) });
  res.send(result);
});

// Get all event which a creator make
app.get("/my-events/:email",  async (req, res) => {
  const { email } = req.params;
  const result = await eventCollection
    .find({ eventCreatorEmail: email })
    .toArray();
  res.send(result);
});

//Delete a event
app.delete("/events/:id", async (req, res) => {
  const { id } = req.params;
  const result = await eventCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});

// Edited event patch api
app.patch("/events/:id", async (req, res) => {
  const updateData = req.body;
  const { id } = req.params;
  const result = await eventCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData },
  );
  res.send(result);
});

//joined events post API
app.post("/joined-events", async (req, res) => {
  const data = req.body;
  const result = await joinedCollection.insertOne(data);
  res.send(result);
});

// Api for find joined data for a specific event
app.get("/joined-events/:id", async (req, res) => {
  const { id } = req.params;
  const result = await joinedCollection.find({ eventId: id }).toArray();
  res.send(result);
});

// Api for find joined data for a specific user
app.get("/my-joined-events", async (req, res) => {
  const result = await joinedCollection.find().toArray();
  res.send(result);
});

// Api for find joined data for a specific user by email
app.get("/my-joined-events/:email", async (req, res) => {
  const { email } = req.params;
  const result = await joinedCollection
    .find({ email: email })
    .toArray();
  res.send(result);
});

// API home page
app.get("/", (req, res) => {
  res.send({ message: "Server running successfully" });
});

app.listen(port, () => {
  console.log(`Server running in http://localhost:${port}`);
});

export default app
