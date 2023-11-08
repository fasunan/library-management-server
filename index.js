const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

//  middleware for 

app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iq8f5fm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const booksCollection = client.db("booksCategory").collection("categories");
    const bookDBCollection = client.db("booksDB").collection("books");
    const BorrowedCollection = client.db('borrowDB').collection('borrow');

    // book category at home
    app.get("/categories", async (req, res) => {
      const cursor = booksCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // find book by category name
    app.get("/books/:category", async (req, res) => {
      const name = req.params.category;
      const query = { category: name };
      const cursor = bookDBCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get book by id
    app.get("/booksId/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await bookDBCollection.findOne(query);
      res.send(result);
    });

    // update book 
    app.put('/booksId/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateBook = req.body;
      const bookData = {
        $set: {
          name: updateBook.name,
          image: updateBook.image,
          authorName: updateBook.authorName,
          category: updateBook.category,
          price: updateBook.price,
          details: updateBook.details,
          rating: updateBook.rating,

        }
      }
      const result = await bookDBCollection.updateOne(filter, bookData, options);
      res.send(result);

    });

    // add books by category from add book
    app.post("/books", async (req, res) => {
      const allBooks = req.body;
      // console.log(allBooks);
      const result = await bookDBCollection.insertOne(allBooks);
      res.send(result);
    });

    // get book for UI which i added
    app.get("/books", async (req, res) => {
      const cursor = bookDBCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // borrowed books related

    // // update quantity after borrowed
    // app.put('/booksId/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) };
    //   const updatedQuantity = req.body.quantity;

    //   const bookData = {
    //     $set: {
    //       quantity: updatedQuantity,
    //     },
    //   };

    //   const result = await bookDBCollection.updateOne(filter, bookData);

    //   if (result.modifiedCount > 0) {
    //     res.send("Book quantity updated successfully");
    //   } else {
    //     res.status(404).send("Book not found");
    //   }
    // });

    app.post('/seeDetails', async (req, res) => {
      const borrowBook = req.body;
      console.log(borrowBook)
      const result = await BorrowedCollection.insertOne(borrowBook);
      res.send(result);
    });

    app.get('/seeDetails', async (req, res) => {
      const cursor = BorrowedCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.delete('/seeDetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await BorrowedCollection.deleteOne(query);
      res.send(result);
      // console.log(result)

    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("a-11 project is running");
});

app.listen(port, () => {
  console.log(`a-11 server is running on port ${port}`);
});
