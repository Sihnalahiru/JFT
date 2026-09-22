"use strict";

const DATA_PATH = "data/books.json";

const bookList = document.getElementById("book-list");

let booksData = null;

async function loadBooks() {
  try {
    const response = await fetch(DATA_PATH);

    if (!response.ok) {
      throw new Error(
        `Failed to load books.json: ${response.status}`
      );
    }

    booksData = await response.json();

    renderBooks(booksData);
  } catch (error) {
    console.error(error);

    bookList.innerHTML = `
      <div class="book-card">
        <h3>Unable to load learning data</h3>
        <p>
          Please check that data/books.json exists
          and contains valid JSON.
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
          No book records were found in the master data.
        </p>
      </div>
    `;

    return;
  }

  bookList.innerHTML = books
    .map((book, index) => {
      const title =
        book.title ||
        book.name ||
        book.bookName ||
        `Book ${index + 1}`;

      const description =
        book.description ||
        "";

      return `
        <button
          type="button"
          class="book-card book-card-button"
          data-book-index="${index}"
        >
          <h3>${escapeHtml(title)}</h3>
          ${
            description
              ? `<p>${escapeHtml(description)}</p>`
              : ""
          }
        </button>
      `;
    })
    .join("");

  attachBookEvents(books);
}

function attachBookEvents(books) {
  const buttons =
    document.querySelectorAll(
      ".book-card-button"
    );

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const index =
        Number(button.dataset.bookIndex);

      const selectedBook = books[index];

      openBook(selectedBook);
    });
  });
}

function openBook(book) {
  console.log(
    "Selected IRODORI book:",
    book
  );

  /*
   * Lesson navigation will be connected
   * in the next implementation step.
   *
   * Official data is not modified here.
   */
  alert(
    `${book.title || book.name || "Book"} selected.\n\nLesson navigation will be connected next.`
  );
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
