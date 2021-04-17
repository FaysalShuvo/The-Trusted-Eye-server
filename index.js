const express = require("express");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = process.env.port || 5000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello Detectives!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tbqng.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const detectiveCollection = client.db("detectiveDb").collection("detectives");

  const commentCollection = client.db("detectiveDb").collection("reviews");

  const caseCollection = client.db("detectiveDb").collection("cases");

  app.get("/services", (req, res) => {
    detectiveCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  app.get("/reviews", (req, res) => {
    commentCollection.find().toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/addCase", (req, res) => {
    const newCase = req.body;
    console.log(newCase);
    caseCollection.insertOne(newCase).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/addComment", (req, res) => {
    const newReview = req.body;
    console.log("rev", newReview);

    commentCollection.insertOne(newReview).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/addService", (req, res) => {
    const newService = req.body;
    console.log("new Service", newService);

    detectiveCollection.insertOne(newService).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
