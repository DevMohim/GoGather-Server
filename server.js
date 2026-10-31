import express from 'express'
import cors from 'cors'
import 'dotenv/config'



const app = express()
const port = process.env.PORT


app.use(cors())
app.use(express.json())




app.get('/', (req,res) => {
   res.send({ message: "Server running successfully"});
})

app.listen(port , ()=> {
   console.log(`Server running in http://localhost:${port}`)
})
