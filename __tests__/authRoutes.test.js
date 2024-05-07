process.env.NODE_ENV === "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

let book;
beforeEach(async function () {
  book = await Book.create({
    isbn: "0691161518",
    amazon_url: "http://a.co/eobPtX2",
    author: "Matthew Lane",
    language: "english",
    pages: 264,
    publisher: "Princeton University Press",
    title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
    year: 2017,
  });
});
describe("GET /books", function () {
  test("Gets a list book", async function () {
    const response = await request(app).get(`/books`);
    const books = response.body.books;
    expect(books).toHaveLength(1);
    expect(books[0]).toHaveProperty("isbn");
    expect(books[0]).toHaveProperty("amazon_url");
  });
});
describe("GET /books/:isbn", function () {
  test("Gets a single book", async function () {
    const response = await request(app).get(`/books/${book.isbn}`);
    expect(response.body.book).toHaveProperty("isbn");
    expect(response.body.book).toEqual(book);
  });

  test("Responds with 404 if can't find book in question", async function () {
    const response = await request(app).get(`/books/${book.isbn + 1}`);
    expect(response.statusCode).toBe(404);
  });
});
describe("POST /books can create new books", function () {
  let testbook = {
    isbn: "0693161520",
    amazon_url: "http://a.co/eobPtX2",
    author: "Matthew Flower",
    language: "english",
    pages: 264,
    publisher: "Princeton University Press",
    title: "Power-Up: Unlocking the Hidden Mathematics in Plants",
    year: 2117,
  };
  test("can create new books", async function () {
    let response = await request(app).post("/books").send(testbook);
    expect(response.statusCode).toEqual(201);
    expect(response.body.book).toEqual(testbook);
    // should have the book we created and the book that was already in database. A total of 2
    const bookQuery = await request(app).get("/books");
    expect(bookQuery.body.books).toHaveLength(2);
    expect(bookQuery.body.books).toEqual([testbook, book]);
  });
  test("returns 400 error when scheme not meet", async function () {
    const response = await request(app).post(`/books`).send({
      isbn: "0691161511",
      amazon_url: "http://a.co/eobPtX2",
      language: "english",
      pages: 264,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      year: 2017,
    });
    expect(response.statusCode).toBe(400);
  });
  test("returns 400 if dup book", async function () {
    let response = await request(app).post("/books").send(book);
    expect(response.statusCode).toEqual(400);
  });
});
describe("PUT /books/:isbn can update books", function () {
  test("can update books", async function () {
    let response = await request(app).put(`/books/${book.isbn}`).send({
      amazon_url: "http://a.co/eobPtX2",
      author: "Lovely Ladybug",
      language: "english",
      pages: 264,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Bugs",
      year: 2017,
    });
    expect(response.statusCode).toEqual(200);

    const bookQuery = await request(app).get("/books/0691161518");
    expect(bookQuery.body).toEqual({
      book: {
        isbn: "0691161518",
        amazon_url: "http://a.co/eobPtX2",
        author: "Lovely Ladybug",
        language: "english",
        pages: 264,
        publisher: "Princeton University Press",
        title: "Power-Up: Unlocking the Hidden Mathematics in Bugs",
        year: 2017,
      },
    });
  });
  test("returns 400 error when scheme not meet", async function () {
    const response = await request(app).put(`/books/${book.isbn}`).send({
      amazon_url: "http://a.co/eobPtX2",
      language: "english",
      pages: 264,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      year: 2017,
    });
    expect(response.statusCode).toBe(400);
  });
  test("returns 400 if isbn is in json", async function () {
    const response = await request(app).put(`/books/${book.isbn}`).send({
      isbn: "0691161518",
      amazon_url: "http://a.co/eobPtX2",
      author: "Lovely Ladybug",
      language: "english",
      pages: 264,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Bugs",
      year: 2017,
    });
    expect(response.statusCode).toBe(400);
  });
});
describe("DELETE /books/:id", function () {
  test("Deletes a single a book", async function () {
    const response = await request(app).delete(`/books/${book.isbn}`);
    expect(response.body).toEqual({ message: "Book deleted" });
  });
  test("return 404 if book can't be found", async function () {
    const response = await request(app).delete(`/books/${book.isbn + 1}`);
    expect(response.statusCode).toBe(404);
  });
});
afterEach(async function () {
  await db.query("DELETE FROM BOOKS");
});
afterAll(async function () {
  await db.end();
});
