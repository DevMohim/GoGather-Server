import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { MongoClient } from "mongodb";


const app = express()
const port = process.env.PORT
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
const connectedClient = await connectToMongoDB()
const db = connectedClient.db('GoGather')
const eventCollection = db.collection('events')

app.use(cors())
app.use(express.json())

app.post('/events' , async(req,res) => {
   const newEventData = req.body
   const result = await eventCollection.insertOne()
   res.send(result)
})

app.get('/', (req,res) => {
   res.send({ message: "Server running successfully"});
})

app.listen(port , ()=> {
   console.log(`Server running in http://localhost:${port}`)
})
