"use strict";

const DATA_PATH = "data/books.json";

const bookList = document.getElementById("book-list");

async function loadBooks() {
  try {
    const response = await fetch(DATA_PATH);

    if (!response.ok) {
      throw new Error(
        `Failed to load books.json: ${response.status}`
      );
    }

    const data = await response.json();

    renderBooks(data);
  } catch (error) {
    console.error(error);

    bookList.innerHTML = `
      <div class="book-card">
        <h3>Unable to load learning data</h3>
        <p>
          Please check that data/books.json exists
          and is valid JSON.
        </p>
      </div>
    `;
  }
}

function getBooks(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.books)) {
    return data.books;
  }

  return [];
}

function renderBooks(data) {
  const books = getBooks(data);

  if (books.length === 0) {
    bookList.innerHTML = `
      <div class="book-card">
        <h3>No books found</h3>
        <p>
          The master book data does not contain
          any book records.
        </p>
      </div>
    `;

    return;
  }

  bookList.innerHTML = books
    .map((book) => {
      const title =
        book.title ||
        book.name ||
        book.bookName ||
        "Untitled Book";

      const description =
        book.description ||
        "";

      return `
        <article class="book-card">
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(description)}</p>
        </article>
      `;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadBooks();
