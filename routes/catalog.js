const express = require("express");
const router = express.Router();

const book_controller = require("../controllers/bookController");
const author_controller = require("../controllers/authorController");
const bookinstance_controller = require("../controllers/bookinstanceController");
const genre_controller = require("../controllers/genreController");

/* Genre routes */


router.get("/", book_controller.index);

// Create book GET
router.get("/book/create", book_controller.book_create_get);

// Create book POST
router.post("/book/create", book_controller.book_create_post);

// del book GET
router.get("/book/:id/delete", book_controller.book_delete_get);

// del book POST
router.post("/book/:id/delete", book_controller.book_delete_post);

// update book GET
router.get("/book/:id/update", book_controller.book_update_get);

// update book POST
router.post("/book/:id/update", book_controller.book_update_post);

// book detail
router.get("/book/:id", book_controller.book_detail);

// book list
router.get("/books", book_controller.book_list);

/* Author routes */

// Create author GET
router.get("/author/create", author_controller.author_create_get);

// Create author POST
router.post("/author/create", author_controller.author_create_post);

// del author GET
router.get("/author/:id/delete", author_controller.author_delete_get);

// del author POST
router.post("/author/:id/delete", author_controller.author_delete_post);

// update author GET
router.get("/author/:id/update", author_controller.author_update_get);

// update author POST
router.post("/author/:id/update", author_controller.author_update_post);

// author detail
router.get("/author/:id", author_controller.author_detail);

// author list
router.get("/authors", author_controller.author_list);

/* BookInstance routes */

// Create bookinstance GET
router.get("/bookinstance/create", bookinstance_controller.bookinstance_create_get);

// Create bookinstance POST
router.post("/bookinstance/create", bookinstance_controller.bookinstance_create_post);

// del bookinstance GET
router.get("/bookinstance/:id/delete", bookinstance_controller.bookinstance_delete_get);

// del bookinstance POST
router.post("/bookinstance/:id/delete", bookinstance_controller.bookinstance_delete_post);

// update bookinstance GET
router.get("/bookinstance/:id/update", bookinstance_controller.bookinstance_update_get);

// update bookinstance POST
router.post("/bookinstance/:id/update", bookinstance_controller.bookinstance_update_post);

// bookinstance detail
router.get("/bookinstance/:id", bookinstance_controller.bookinstance_detail);

// bookinstance list
router.get("/bookinstances", bookinstance_controller.bookinstance_list);

/* Genre routes */

// Create genre GET
router.get("/genre/create", genre_controller.genre_create_get);

// Create genre POST
router.post("/genre/create", genre_controller.genre_create_post);

// del genre GET
router.get("/genre/:id/delete", genre_controller.genre_delete_get);

// del genre POST
router.post("/genre/:id/delete", genre_controller.genre_delete_post);

// update genre GET
router.get("/genre/:id/update", genre_controller.genre_update_get);

// update genre POST
router.post("/genre/:id/update", genre_controller.genre_update_post);

// genre detail
router.get("/genre/:id", genre_controller.genre_detail);

// genre list
router.get("/genres", genre_controller.genre_list);

module.exports = router;
