const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PW}@cluster0.oo5u4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const coffeeCollection = client.db('coffeeDB').collection('coffee');

    app.get('/coffee', async(req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/coffee/:id', async(req,res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    })

    app.post('/coffee', async(req, res) => {
      const newCoffee = req.body;
      console.log(newCoffee);
      const result = await coffeeCollection.insertOne(newCoffee);
      res.send(result);
    });

    app.put('/coffee/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }; // Ensure `ObjectId` is imported from 'mongodb'
      const options = { upsert: false }; // `upsert: true` creates a new document if not found, usually unnecessary for updates
      const updatedCoffee = req.body;
    
      const coffee = {
        $set: {
          name: updatedCoffee.name,
          quantity: updatedCoffee.quantity,
          supplier: updatedCoffee.supplier,
          taste: updatedCoffee.taste,
          category: updatedCoffee.category,
          details: updatedCoffee.details,
          photo: updatedCoffee.photo,
        },
      };
    
      try {
        const result = await coffeeCollection.updateOne(filter, coffee, options); // Ensure `coffeeCollection` is defined
        if (result.modifiedCount > 0) {
          res.status(200).json({ message: "Coffee updated successfully!", modifiedCount: result.modifiedCount });
        } else {
          res.status(404).json({ message: "Coffee not updated or not found!" });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    

    app.delete('/coffee/:id', async(req, res) => {
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    })
    


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Coffee making server is running');
});

app.listen(port, () => {
    console.log(`Coffee server in running on port ${port}`);
})