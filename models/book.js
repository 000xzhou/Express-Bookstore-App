const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Collection of related methods for books. */

class Book {
  /** given an isbn, return book data with that isbn:
   *
   * => {isbn, amazon_url, author, language, pages, publisher, title, year}
   *
   **/

  static async findOne(isbn) {
    const bookRes = await db.query(
      `SELECT isbn,
                amazon_url,
                author,
                language,
                pages,
                publisher,
                title,
                year
            FROM books 
            WHERE isbn = $1`,
      [isbn]
    );

    if (bookRes.rows.length === 0) {
      throw { message: `There is no book with an isbn '${isbn}`, status: 404 };
    }

    return bookRes.rows[0];
  }

  /** Return array of book data:
   *
   * => [ {isbn, amazon_url, author, language,
   *       pages, publisher, title, year}, ... ]
   *
   * */

  static async findAll() {
    const booksRes = await db.query(
      `SELECT isbn,
                amazon_url,
                author,
                language,
                pages,
                publisher,
                title,
                year
            FROM books 
            ORDER BY title`
    );

    return booksRes.rows;
  }

  /** create book in database from data, return book data:
   *
   * {isbn, amazon_url, author, language, pages, publisher, title, year}
   *
   * => {isbn, amazon_url, author, language, pages, publisher, title, year}
   *
   * */

  static async create(data) {
    const result = await db.query(
      `INSERT INTO books (
            isbn,
            amazon_url,
            author,
            language,
            pages,
            publisher,
            title,
            year) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING isbn,
                   amazon_url,
                   author,
                   language,
                   pages,
                   publisher,
                   title,
                   year`,
      [
        data.isbn,
        data.amazon_url,
        data.author,
        data.language,
        data.pages,
        data.publisher,
        data.title,
        data.year,
      ]
    );

    return result.rows[0];
  }

  /** Update data with matching ID to data, return updated book.

   * {isbn, amazon_url, author, language, pages, publisher, title, year}
   *
   * => {isbn, amazon_url, author, language, pages, publisher, title, year}
   *
   * */

  static async update(isbn, data) {
    const result = await db.query(
      `UPDATE books SET 
            amazon_url=($1),
            author=($2),
            language=($3),
            pages=($4),
            publisher=($5),
            title=($6),
            year=($7)
            WHERE isbn=$8
        RETURNING isbn,
                  amazon_url,
                  author,
                  language,
                  pages,
                  publisher,
                  title,
                  year`,
      [
        data.amazon_url,
        data.author,
        data.language,
        data.pages,
        data.publisher,
        data.title,
        data.year,
        isbn,
      ]
    );

    if (result.rows.length === 0) {
      throw { message: `There is no book with an isbn '${isbn}`, status: 404 };
    }

    return result.rows[0];
  }

  /** remove book with matching isbn. Returns undefined. */

  static async remove(isbn) {
    const result = await db.query(
      `DELETE FROM books 
         WHERE isbn = $1 
         RETURNING isbn`,
      [isbn]
    );

    if (result.rows.length === 0) {
      throw { message: `There is no book with an isbn '${isbn}`, status: 404 };
    }
  }

  /** Update data with matching ID to data, return updated book.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {amazon_url, author, language, pages, publisher, title, year}
   *
   * => {isbn, amazon_url, author, language, pages, publisher, title, year}
   *
   * */

  static async updatePatch(isbn, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE books  
              SET ${setCols}
              WHERE isbn=${handleVarIdx}
              RETURNING isbn,
                    amazon_url,
                    author,
                    language,
                    pages,
                    publisher,
                    title,
                    year`;

    const result = await db.query(querySql, [...values, isbn]);

    if (result.rows.length === 0) {
      throw { message: `There is no book with an isbn '${isbn}`, status: 404 };
    }

    return result.rows[0];
  }
}

module.exports = Book;
