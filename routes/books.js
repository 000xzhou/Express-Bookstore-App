const express = require("express");
const Book = require("../models/book");
const ExpressError = require("../expressError");
const router = new express.Router();
const jsonschema = require("jsonschema");
const bookSchema = require("../schemas/bookSchema.json");
const bookSchema_update = require("../schemas/bookSchema_update.json");
const bookSchema_update_patch = require("../schemas/bookSchema_update_patch.json");
const { error } = require("locus/src/print");

/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, bookSchema);
    if (!result.valid) {
      let listOfErrors = result.errors.map((error) => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    const book = await Book.create(req.body);
    return res.status(201).json({ book });
  } catch (err) {
    if (err.code == 23505) {
      return next(new ExpressError(`${err.detail}`, 400));
    }
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {
    if ("isbn" in req.body) {
      return next({
        status: 400,
        message: "Not allowed",
      });
    }
    const result = jsonschema.validate(req.body, bookSchema_update);

    if (!result.valid) {
      let listOfErrors = result.errors.map((error) => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    const book = await Book.update(req.params.isbn, req.body);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[isbn]   bookData => {book: updatedBook}  */

router.patch("/:isbn", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, bookSchema_update_patch);

    if (!result.valid) {
      let listOfErrors = result.errors.map((error) => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    const book = await Book.updatePatch(req.params.isbn, req.body);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
