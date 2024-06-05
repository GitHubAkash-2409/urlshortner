const express = require("express");
const path = require("path");
const { connectToMongoDB } = require("./connection");
const urlRoute = require("./routes/url");
const URL = require("./models/url");

const app = express();

const PORT = 5001;

connectToMongoDB("mongodb://localhost:27017/short-url").then(() =>
  console.log("Moongodb Connected")
);

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json()); 

app.get("/test", async (req, res) => {
    const allUsers = await URL.find({});
    return res.render("home", {
        urls: allUsers,
    });
});




app.use("/url", urlRoute);

// app.get('/:shortId', async (req, res) => {
//     const shortId = req.params.shortId;
//    const entry =  await URL.findOneAndUpdate({
//         shortId
//     }, { $push: {
//         visitHistory: { 
//             timestamp: Date.now(),
//          }
//     }});
//     res.redirect(entry.redirectURL);
// })

app.get('/:shortId', async (req, res) => {
    const shortId = req.params.shortId;
    try {
        console.log(`Received request for shortId: ${shortId}`);
        const entry = await URL.findOneAndUpdate(
            { shortId },
            { $push: { visitHistory: { timestamp: Date.now() } } },
            { new: true }
        );

        if (!entry) {
            console.log(`No entry found for shortId: ${shortId}`);
            return res.status(404).send('Short URL not found');
        }

        console.log(`Redirecting to URL: ${entry.redirectURL}`);
        res.redirect(entry.redirectURL);
    } catch (error) {
        console.error('Error processing short URL:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(PORT, () => console.log(`Server Started at Port: ${PORT}`));
