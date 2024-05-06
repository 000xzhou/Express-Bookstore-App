\c bookstore

CREATE TABLE books (
  isbn TEXT PRIMARY KEY,
  amazon_url TEXT,
  author TEXT,
  language TEXT, 
  pages INTEGER,
  publisher TEXT,
  title TEXT, 
  year INTEGER
);
INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
VALUES ('1234567890', 'https://www.amazon.com/book', 'John Doe', 'English', 200, 'Publisher', 'Sample Book', 2024);
