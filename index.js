const express = require("express");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const bodyParser = require("body-parser");
const { ObjectID } = require("bson");
const e = require("express");
require("dotenv").config();

const app = express();
const port = process.env.port || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

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

  const adminCollection = client.db("detectiveDb").collection("admins");

  const commentCollection = client.db("detectiveDb").collection("reviews");

  const caseCollection = client.db("detectiveDb").collection("cases");

  app.get("/services", (req, res) => {
    detectiveCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  app.get("/cases", (req, res) => {
    caseCollection.find({ email: req.query.email }).toArray((err, document) => {
      res.send(document);
    });
  });

  app.get("/allCases", (req, res) => {
    caseCollection.find().toArray((err, document) => {
      res.send(document);
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

  app.post("/addAdmin", (req, res) => {
    const newAdmin = req.body;
    console.log("new admin", newAdmin);

    adminCollection.insertOne(newAdmin).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/addService", (req, res) => {
    const newService = req.body;

    detectiveCollection.insertOne(newService).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.delete("/delete/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    caseCollection
      .findOneAndDelete({ _id: id })
      .then((deletedDocument) => {
        if (deletedDocument) {
          console.log("deleted");
        } else console.log("not deleted");

        return deletedDocument;
      })
      .catch((err) => console.log("failed to find"));
  });

  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;

    adminCollection.find({ email: email }).toArray((err, admins) => {
      res.send(admins.length > 0);
    });
  });
});

app.listen(process.env.PORT || port, () => {
  console.log(`listening at http://localhost:${port}`);
});
