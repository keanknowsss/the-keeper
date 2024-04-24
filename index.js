import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { config } from "dotenv";
import pg from "pg";
import session from "express-session";

const app = express();
const port = 8000;

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
	secret: 'my-secret',  // a secret string used to sign the session ID cookie
	resave: false,  // don't save session if unmodified
	saveUninitialized: false  // don't create session until something stored
  }));

// VARIABLES AND DB
config();

const { OPEN_LIBRARY_SEARCH, OPEN_LIBRARY_COVER, PG_USER, PG_PASSWORD, PG_HOST, PG_DB, PG_PORT } =
	process.env;

const db = new pg.Client({
	user: PG_USER,
	password: PG_PASSWORD,
	host: PG_HOST,
	database: PG_DB,
	port: PG_PORT,
});
db.connect();

// routes
app.post("/add/notes/:book_id", async (req, res) => {
	const { note } = req.body;
	const { book_id } = req.params
	const date = new Date();
	const dateNow = date.toLocaleDateString();

	try {
		await db.query("INSERT INTO notes (book_id, note, date_created) VALUES ($1, $2, $3)", [
			book_id, note, dateNow
		]);
	} catch (error) {
		req.session.error = error;
	}

	return res.redirect("/book/" + book_id);	
});

app.get("/book/:id", async (req, res) => {
	const id = req.params.id;

	delete req.session.error; // deletes the session after loading it, so it shows this once

	try {
		const book_query = await db.query("SELECT * FROM books WHERE id = $1", [id]);	
		const book = book_query.rows[0];

		const notes_query = await db.query("SELECT * FROM notes WHERE book_id = $1 ORDER BY id DESC", [id]);
		const notes = notes_query.rows;

		if (book)
			return res.render("book.ejs", { book, notes, errors: req.session.errors });
		else {
			req.session.error = "Book not found, try adding it first";
			return res.redirect("/");
		}

	} catch (error) {
		req.session.error = error;
		console.log(error);
		res.redirect("/");
	}
});

app.get("/add/book", (req, res) => {
	res.render("add.ejs");
});

app.post("/add/book", async (req, res) => {
	const title = req.body.title;
	const description = req.body.description;

	try {
		const response = await axios({
			url: OPEN_LIBRARY_SEARCH,
			method: "GET",
			params: {
				q: title,
				lang: "eng",
			},
		});

		const book_data = response.data.docs[0];

		if (book_data) {
			const title = book_data.title;
			const author = book_data.author_name[0];
			const cover_id = book_data.cover_i;
			const year_published = book_data.first_publish_year;
			const book_key = book_data.key;

			const cover_image = `${OPEN_LIBRARY_COVER}/${cover_id}-L.jpg`;

			await db.query(
				"INSERT INTO books (title, description, author, year_published, cover, book_key) VALUES ($1, $2, $3, $4, $5, $6)",
				[title, description, author, year_published, cover_image, book_key]
			);

			res.redirect("/");
		} else throw new Error("Book data not found");
	} catch (error) {
		res.status(500).json({ message: "Error fetching book", error: error });
	}
});

app.get("/", async (req, res) => {
	const result = await db.query("SELECT * FROM books");
	const books = result ? result.rows : [];

	delete req.session.error; // deletes the session after loading it, so it shows this once

	res.render("menu.ejs", {
		books,
		errors: req.session.errors
	});
});

app.listen(port, () => {
	console.log("Server is successfully running on " + port);
});
