const BOOKS_PATH = "./data/books.json";
const LESSONS_PATH = "./data/lessons.json";

const CANDO_FILES = {
  starter: "./data/canDos-starter.json",
  "elementary-1": "./data/canDos-e1.json",
  "elementary-2": "./data/canDos-e2.json",
  "pre-intermediate": "./data/canDos-pi.json"
};

let booksData = [];
let lessonsData = [];
let canDosData = [];


/* =========================================
   INITIALIZE
   ========================================= */

document.addEventListener("DOMContentLoaded", init);

async function init() {
  try {
    const [booksResponse, lessonsResponse] =
      await Promise.all([
        fetch(BOOKS_PATH),
        fetch(LESSONS_PATH)
      ]);

    if (!booksResponse.ok) {
      throw new Error("Could not load books.json");
    }

    if (!lessonsResponse.ok) {
      throw new Error("Could not load lessons.json");
    }

    const booksJson =
      await booksResponse.json();

    const lessonsJson =
      await lessonsResponse.json();

    booksData =
      getArray(booksJson, "books");

    lessonsData =
      getArray(lessonsJson, "lessons");

    renderBooks();

  } catch (error) {
    console.error(error);
    showError(error.message);
  }
}


/* =========================================
   ARRAY HELPER
   ========================================= */

function getArray(data, key) {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data[key])) {
    return data[key];
  }

  return [];
}


/* =========================================
   BOOKS
   ========================================= */

function renderBooks() {

  const container =
    document.getElementById("book-list");

  if (!container) {
    return;
  }

  if (!booksData.length) {

    container.innerHTML = `
      <div class="error-card">
        <h2>No books found</h2>
        <p>The books dataset is empty.</p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    booksData.map((book, index) => {

      const title =
        book.title ||
        book.name ||
        book.bookTitle ||
        `Book ${index + 1}`;

      const description =
        book.description ||
        book.subtitle ||
        "";

      return `
        <button
          type="button"
          class="book-card book-card-button"
          data-book-index="${index}"
        >

          <div class="book-card-content">

            <h2>
              ${escapeHtml(title)}
            </h2>

            ${
              description
                ? `
                  <p>
                    ${escapeHtml(description)}
                  </p>
                `
                : ""
            }

            <span class="book-card-arrow">
              →
            </span>

          </div>

        </button>
      `;

    }).join("");


  document
    .querySelectorAll(".book-card-button")
    .forEach(button => {

      button.addEventListener("click", () => {

        const index =
          Number(button.dataset.bookIndex);

        openBook(booksData[index]);

      });

    });
}


/* =========================================
   OPEN BOOK
   ========================================= */

async function openBook(book) {

  if (!book) {
    return;
  }

  const title =
    book.title ||
    book.name ||
    book.bookTitle ||
    "Book";

  canDosData =
    await loadCanDoData(book);

  const lessons =
    findLessonsForBook(book);

  showLessonView(
    title,
    lessons,
    book
  );
}


/* =========================================
   FIND LESSONS
   ========================================= */

function findLessonsForBook(book) {

  if (!book || !lessonsData.length) {
    return [];
  }

  const bookId =
    book.id ||
    book.bookId ||
    book.code ||
    book.slug;

  const bookTitle =
    book.title ||
    book.name ||
    book.bookTitle;


  return lessonsData.filter(lesson => {

    const lessonBookId =
      lesson.bookId ||
      lesson.book ||
      lesson.bookCode ||
      lesson.bookSlug;

    const lessonBookTitle =
      lesson.bookTitle ||
      lesson.bookName;


    if (bookId && lessonBookId) {
      return (
        String(lessonBookId) ===
        String(bookId)
      );
    }


    if (bookTitle && lessonBookTitle) {
      return (
        String(lessonBookTitle) ===
        String(bookTitle)
      );
    }


    return false;

  });
}


/* =========================================
   LOAD CAN-DO DATA
   ========================================= */

async function loadCanDoData(book) {

  const bookKey =
    getBookKey(book);

  const file =
    CANDO_FILES[bookKey];

  if (!file) {
    console.warn(
      "No Can-do dataset mapped:",
      book
    );

    return [];
  }


  try {

    const response =
      await fetch(file);

    if (!response.ok) {
      throw new Error(
        `Could not load ${file}`
      );
    }

    const json =
      await response.json();


    if (Array.isArray(json)) {
      return json;
    }


    if (
      json &&
      Array.isArray(json.canDos)
    ) {
      return json.canDos;
    }


    if (
      json &&
      Array.isArray(json.activities)
    ) {
      return json.activities;
    }


    if (
      json &&
      Array.isArray(json.records)
    ) {
      return json.records;
    }


    return [];

  } catch (error) {

    console.error(
      "Can-do loading error:",
      error
    );

    return [];
  }
}


/* =========================================
   BOOK KEY
   ========================================= */

function getBookKey(book) {

  const value =
    String(
      book.id ||
      book.bookId ||
      book.code ||
      book.slug ||
      book.title ||
      book.name ||
      book.bookTitle ||
      ""
    ).toLowerCase();


  if (value.includes("starter")) {
    return "starter";
  }


  if (
    value.includes("elementary") &&
    (
      value.includes("1") ||
      value.includes("01") ||
      value.includes("one")
    )
  ) {
    return "elementary-1";
  }


  if (
    value.includes("elementary") &&
    (
      value.includes("2") ||
      value.includes("02") ||
      value.includes("two")
    )
  ) {
    return "elementary-2";
  }


  if (
    value.includes("pre") &&
    value.includes("intermediate")
  ) {
    return "pre-intermediate";
  }


  return null;
}


/* =========================================
   LESSON LIST
   ========================================= */

function showLessonView(
  bookTitle,
  lessons,
  book
) {

  const container =
    document.getElementById("book-list");

  if (!container) {
    return;
  }


  const lessonCards =
    lessons.length

      ? lessons.map((lesson, index) => {

          const number =
            lesson.lessonNumber ||
            lesson.number ||
            lesson.lesson ||
            index + 1;

          const title =
            lesson.title ||
            lesson.name ||
            lesson.lessonTitle ||
            `Lesson ${number}`;


          return `
            <button
              type="button"
              class="lesson-card"
              data-lesson-index="${index}"
            >

              <span class="lesson-number">
                L${String(number).padStart(2, "0")}
              </span>

              <span class="lesson-title">
                ${escapeHtml(title)}
              </span>

              <span class="lesson-arrow">
                →
              </span>

            </button>
          `;

        }).join("")

      : `
        <div class="empty-card">
          <h3>Lessons not found</h3>
          <p>
            No lesson records were matched
            with this book.
          </p>
        </div>
      `;


  container.innerHTML = `

    <div class="lesson-header">

      <button
        type="button"
        class="back-button"
        id="back-to-books"
      >
        ← Back to Books
      </button>

      <h2>
        ${escapeHtml(bookTitle)}
      </h2>

      <p>
        ${lessons.length} lesson records found
      </p>

    </div>

    <div class="lesson-list">
      ${lessonCards}
    </div>
  `;


  document
    .getElementById("back-to-books")
    ?.addEventListener("click", renderBooks);


  document
    .querySelectorAll(".lesson-card")
    .forEach(card => {

      card.addEventListener("click", () => {

        const index =
          Number(card.dataset.lessonIndex);

        openLesson(
          lessons[index],
          bookTitle,
          book
        );

      });

    });
}


/* =========================================
   OPEN LESSON
   ========================================= */

function openLesson(
  lesson,
  bookTitle,
  book
) {

  if (!lesson) {
    return;
  }


  const lessonNumber =
    lesson.lessonNumber ||
    lesson.number ||
    lesson.lesson ||
    "";


  const lessonTitle =
    lesson.title ||
    lesson.name ||
    lesson.lessonTitle ||
    `Lesson ${lessonNumber}`;


  const activities =
    findCanDosForLesson(
      lesson
    );


  const container =
    document.getElementById("book-list");

  if (!container) {
    return;
  }


  container.innerHTML = `

    <div class="lesson-detail">

      <button
        type="button"
        class="back-button"
        id="back-to-lessons"
      >
        ← Back to Lessons
      </button>


      <div class="lesson-detail-card">

        <div class="lesson-detail-number">
          L${String(lessonNumber).padStart(2, "0")}
        </div>

        <h2>
          ${escapeHtml(lessonTitle)}
        </h2>

        <p class="lesson-book-name">
          ${escapeHtml(bookTitle)}
        </p>


        <div class="cando-section">

          <div class="cando-section-header">

            <h3>
              Can-do / Activities
            </h3>

            <span>
              ${activities.length}
            </span>

          </div>


          ${
            activities.length
              ? renderCanDos(activities)
              : `
                <div class="empty-card">
                  <p>
                    No Can-do records have been
                    safely matched to this lesson yet.
                  </p>
                </div>
              `
          }

        </div>

      </div>

    </div>
  `;


  document
    .getElementById("back-to-lessons")
    ?.addEventListener("click", () => {

      showLessonView(
        bookTitle,
        findLessonsForBook(book),
        book
      );

    });
}


/* =========================================
   FIND CAN-DO RECORDS
   ========================================= */

function findCanDosForLesson(lesson) {

  if (!lesson || !canDosData.length) {
    return [];
  }


  const lessonId =
    lesson.id ||
    lesson.lessonId ||
    lesson.lessonCode;


  const lessonNumber =
    lesson.lessonNumber ||
    lesson.number ||
    lesson.lesson;


  return canDosData.filter(item => {

    const itemLessonId =
      item.lessonId ||
      item.lessonCode ||
      item.lesson_id;


    const itemLessonNumber =
      item.lessonNumber ||
      item.lesson_number ||
      item.lesson;


    /*
     * Match only when an explicit
     * lesson relationship exists.
     */

    if (
      lessonId &&
      itemLessonId
    ) {

      return (
        String(itemLessonId) ===
        String(lessonId)
      );

    }


    if (
      lessonNumber &&
      itemLessonNumber
    ) {

      return (
        String(itemLessonNumber) ===
        String(lessonNumber)
      );

    }


    return false;

  });
}


/* =========================================
   RENDER CAN-DO RECORDS
   ========================================= */

function renderCanDos(records) {

  return records
    .map((item, index) => {

      const id =
        item.id ||
        item.canDoId ||
        item.activityId ||
        `item-${index + 1}`;


      const title =
        item.canDo ||
        item.canDoTitle ||
        item.title ||
        item.activity ||
        item.activityTitle ||
        item.name ||
        `Activity ${index + 1}`;


      return `
        <div
          class="cando-card"
          data-cando-id="${escapeHtml(id)}"
        >

          <div class="cando-number">
            ${index + 1}
          </div>

          <div class="cando-content">

            <h4>
              ${escapeHtml(title)}
            </h4>

          </div>

        </div>
      `;

    })
    .join("");
}


/* =========================================
   ERROR
   ========================================= */

function showError(message) {

  const container =
    document.getElementById("book-list");

  if (!container) {
    return;
  }


  container.innerHTML = `

    <div class="error-card">

      <h2>
        Unable to load learning data
      </h2>

      <p>
        ${escapeHtml(message)}
      </p>

      <button
        type="button"
        class="retry-button"
        onclick="location.reload()"
      >
        Retry
      </button>

    </div>
  `;
}


/* =========================================
   HTML ESCAPE
   ========================================= */

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
