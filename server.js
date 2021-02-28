require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const Pusher = require("pusher");

const mongoPosts = require("./postModel");

// APP CONFIG
const app = express();
const port = process.env.PORT;

const pusher = new Pusher({
  appId: process.env.appId,
  key: process.env.key,
  secret: process.env.secret,
  cluster: "ap2",
  useTLS: true
});

// MIDDLEWARES
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "client", "build")))

// DB CONFIG
const mongoURI = process.env.DB;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})
  .then(() => {
    console.log("Connected to MongoDB");
    const changeStream = mongoose.connection.collection('posts').watch();
    changeStream.on('change', (change) => {
      if (change.operationType === 'insert') {
        console.log("Triggering pusher");
        pusher.trigger('posts', 'inserted', {
          change: change

        })
      }
      else {
        console.log("Error Triggering pusher");
      }
    })

  })
  .catch(err => {
    console.log(err);
  })


// API ROUTES
app.get("/", (req, res) => {
  res.status(200).send("Hello World");
});

app.post("/upload/post", (req, res) => {
  const { user, imgName, text, avatar, timestamp } = req.body;
  const post = new mongoPosts({
    user,
    imgName,
    text,
    avatar,
    timestamp
  });
  post
    .save()
    .then((result) => {
      res.json({ post: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/retrieve/posts", (req, res) => {
  mongoPosts
    .find()
    .sort("-timestamp")
    .then((posts) => {
      res.json({ posts });
    })
    .catch((err) => {
      console.log(err);
    });
});

if (process.env.NODE_ENV == "production") {
  app.use(express.static("client/build"));
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// LISTEN
app.listen(port, () => console.log(`Listening on localhost:${port}`));
