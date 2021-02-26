require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const bodyParser = require('body-parser');
const path = require('path');
const Pusher = require('pusher');

const mongoPosts = require('./postModel');

Grid.mongo = mongoose.mongo;

// APP CONFIG
const app = express();
const port = process.env.PORT;


// MIDDLEWARES
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());

// DB CONFIG
const mongoURI = process.env.DB;
const conn = mongoose.createConnection(mongoURI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let gfs;

conn.once('open', () => {
    console.log("Database Connected");
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('images');
})

const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = `image-${Date.now()}${path.extname(file.originalname)}`;
            const fileInfo = {
                filename: filename,
                bucketName: 'images'
            };
            resolve(fileInfo);
        });
    }
});

const upload = multer({ storage });


// API ROUTES
app.get('/', (req, res) => {
    res.status(200).send("Hello World");
});

app.post('/upload/image', upload.single('file'), (req, res) => {
    res.status(201).send(req.file);
});

app.post('/upload/post', (req, res) => {
    const dbPost = req.body;

    mongoPosts.create(dbPost, (err, data) => {
        if (err)
            res.status(500).send(err);
        else
            res.status(201).send(data);
    })
});

app.get('/retrieve/posts', (req, res) => {
    mongoPosts.find((err, data) => {
        if (err)
            res.status(500).send(err);
        else {
            data.sort((b, a) => {
                return a.timestamp - b.timestamp;
            });
        }
        res.status(200).send(data);

    })
});

app.get('/retrieve/images/single', (req, res) => {
    gfs.files.findOne({ filename: req.query.name }, (err, file) => {
        if (err)
            res.status(500).send(err);
        else {
            if (!file || file.length === 0) {
                res.status(404).json({ err: 'file not found' });
            }
            else {
                const readstream = gfs.createReadStream(file.filename);
                readstream.pipe(res);
            }
        }
    })
});


// LISTEN
app.listen(port, () => console.log(`Listening on localhost:${port}`));