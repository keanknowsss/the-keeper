import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 8000;

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// routes

app.get("/book/:id", (req, res) => {
    res.render("book.ejs");
})

app.get("/", (req, res) => {
    res.render("menu.ejs");
});


app.listen(port, () => {
    console.log("Server is successfully running on " + port);
});