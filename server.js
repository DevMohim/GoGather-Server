import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";

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

app.use(cors());
app.use(express.json());

// Event Create
app.post("/events", async (req, res) => {
  const newEventData = req.body;
  const result = await eventCollection.insertOne(newEventData);
  res.send(result);
});


// Event Read
app.get("/events", async (req, res) => {
  const result = await eventCollection.find().toArray();
  res.send(result);
});
//Upcoming Event Read
app.get("/upcoming-events", async (req, res) => {
  const result = await eventCollection.find().limit(6).toArray();
  res.send(result);
});

//Get a single event data for details
app.get('/events/:id' , async(req,res) =>{
   const {id} = req.params
   const result = await eventCollection.findOne({_id : new ObjectId(id)})
   res.send(result)
})
// API home page
app.get("/", (req, res) => {
  res.send({ message: "Server running successfully" });
});

app.listen(port, () => {
  console.log(`Server running in http://localhost:${port}`);
});
