const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.hgznyse.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const bookCollection = client.db("bookDB").collection('books')

        // send data to the database
        app.post('/books', async (req, res) => {
            const bookList = req.body;
            const result = await bookCollection.insertOne(bookList);
            res.send(result);
        });

        // get data from database
        app.get("/books", async (req, res) => {
            const result = await bookCollection.find().toArray();
            res.send(result);
        });

        // delete data 
        app.delete("/books/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id), };
            const result = await bookCollection.deleteOne(query);
            res.send(result);
        });

        // update data 
        app.get("/books/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id), };
            const result = await bookCollection.findOne(query);
            res.send(result);
        });

        app.put("/books/:id", async (req, res) => {
            const id = req.params.id;
            const updatedBooks = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const book = {
                $set: {
                    book: updatedBooks.book,
                    writer: updatedBooks.writer,
                    publication: updatedBooks.publication,
                    price: updatedBooks.price,
                    quantity: updatedBooks.quantity,
                    address: updatedBooks.address,
                    photo: updatedBooks.photo
                },
            };
            const result = await bookCollection.updateOne(
                filter,
                book,
                options
            );
            res.send(result);
        });

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Your server is ready !')
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})