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
   APP INITIALIZATION
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
      getArray(
        booksJson,
        "books"
      );

    lessonsData =
      getArray(
        lessonsJson,
        "lessons"
      );

    renderBooks();

  } catch (error) {

    console.error(error);

    showError(
      error.message
    );
  }
}


/* =========================================
   GENERIC ARRAY READER
   ========================================= */

function getArray(data, key) {

  if (Array.isArray(data)) {
    return data;
  }

  if (
    data &&
    Array.isArray(data[key])
  ) {
    return data[key];
  }

  return [];
}


/* =========================================
   BOOK SCREEN
   ========================================= */

function renderBooks() {

  const container =
    document.getElementById(
      "book-list"
    );

  if (!container) {
    return;
  }

  if (!booksData.length) {

    container.innerHTML = `
      <div class="error-card">
        <h2>No books found</h2>
        <p>
          The books dataset is empty.
        </p>
      </div>
    `;

    return;
  }


  container.innerHTML =
    booksData
      .map(
        (book, index) => {

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
                        ${escapeHtml(
                          description
                        )}
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
        }
      )
      .join("");


  document
    .querySelectorAll(
      ".book-card-button"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button.dataset.bookIndex
              );

            openBook(
              booksData[index]
            );

          }
        );

      }
    );
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

  const relatedLessons =
    findLessonsForBook(
      book
    );


  /*
   * Load the correct Can-do dataset
   * for this book.
   */

  canDosData =
    await loadCanDoData(
      book
    );


  showLessonView(
    title,
    relatedLessons,
    book
  );
}


/* =========================================
   FIND LESSONS FOR BOOK
   ========================================= */

function findLessonsForBook(book) {

  if (!book) {
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


  if (!lessonsData.length) {
    return [];
  }


  return lessonsData.filter(
    (lesson) => {

      const lessonBookId =
        lesson.bookId ||
        lesson.book ||
        lesson.bookCode ||
        lesson.bookSlug;

      const lessonBookTitle =
        lesson.bookTitle ||
        lesson.bookName;


      if (
        bookId &&
        lessonBookId
      ) {

        return (
          String(
            lessonBookId
          ) ===
          String(
            bookId
          )
        );

      }


      if (
        bookTitle &&
        lessonBookTitle
      ) {

        return (
          String(
            lessonBookTitle
          ) ===
          String(
            bookTitle
          )
        );

      }


      return false;
    }
  );
}


/* =========================================
   CAN-DO DATA LOADER
   ========================================= */

async function loadCanDoData(book) {

  const key =
    getBookKey(book);

  const file =
    CANDO_FILES[key];


  if (!file) {

    console.warn(
      "No Can-do file mapped for:",
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


    /*
     * Support common verified
     * JSON container structures.
     */

    if (
      Array.isArray(json)
    ) {

      return json;

    }


    if (
      json &&
      Array.isArray(
        json.canDos
      )
    ) {

      return json.canDos;

    }


    if (
      json &&
      Array.isArray(
        json.activities
      )
    ) {

      return json.activities;

    }


    if (
      json &&
      Array.isArray(
        json.records
      )
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
   BOOK KEY DETECTION
   ========================================= */

function getBookKey(book) {

  const raw =
    String(
      book.id ||
      book.bookId ||
      book.code ||
      book.slug ||
      book.title ||
      book.name ||
      book.bookTitle ||
      ""
    )
      .toLowerCase()
      .trim();


  if (
    raw.includes("starter")
  ) {

    return "starter";

  }


  if (
    raw.includes("elementary") &&
    (
      raw.includes("1") ||
      raw.includes("01") ||
      raw.includes("one")
    )
  ) {

    return "elementary-1";

  }


  if (
    raw.includes("elementary") &&
    (
      raw.includes("2") ||
      raw.includes("02") ||
      raw.includes("two")
    )
  ) {

    return "elementary-2";

  }


  if (
    raw.includes("pre") &&
    raw.includes("intermediate")
  ) {

    return "pre-intermediate";

  }


  return null;
}


/* =========================================
   LESSON LIST SCREEN
   ========================================= */

function showLessonView(
  bookTitle,
  lessons,
  book
) {

  const container =
    document.getElementById(
      "book-list"
    );

  if (!container) {
    return;
  }


  const lessonCards =
    lessons.length

      ? lessons
          .map(
            (lesson, index) => {

              const lessonNumber =
                lesson.lessonNumber ||
                lesson.number ||
                lesson.lesson ||
                index + 1;


              const lessonTitle =
                lesson.title ||
                lesson.name ||
                lesson.lessonTitle ||
                `Lesson ${lessonNumber}`;


              return `
                <button
                  type="button"
                  class="lesson-card"
                  data-lesson-index="${index}"
                >

                  <span class="lesson-number">
                    L${String(
                      lessonNumber
                    ).padStart(2, "0")}
                  </span>

                  <span class="lesson-title">
                    ${escapeHtml(
                      lessonTitle
                    )}
                  </span>

                  <span class="lesson-arrow">
                    →
                  </span>

                </button>
              `;

            }
          )
          .join("")

      : `
          <div class="empty-card">

            <h3>
              Lessons not found
            </h3>

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
        ${escapeHtml(
          bookTitle
        )}
      </h2>

      <p>
        ${lessons.length}
        lesson records found
      </p>

    </div>


    <div class="lesson-list">

      ${lessonCards}

    </div>
  `;


  const backButton =
    document.getElementById(
      "back-to-books"
    );


  if (backButton) {

    backButton.addEventListener(
      "click",
      () => {
        renderBooks();
      }
    );

  }


  document
    .querySelectorAll(
      ".lesson-card"
    )
    .forEach(
      (card) => {

        card.addEventListener(
          "click",
          () => {

            const index =
              Number(
                card.dataset.lessonIndex
              );

            openLesson(
              lessons[index],
              bookTitle,
              book
            );

          }
        );

      }
    );
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


  const container =
    document.getElementById(
      "book-list"
    );


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

          L${String(
            lessonNumber
          ).padStart(2, "0")}

        </div>


        <h2>
          ${escapeHtml(
            lessonTitle
          )}
        </h2>


        <p class="lesson-book-name">

          ${escapeHtml(
            bookTitle
          )}

        </p>


        <div class="lesson-placeholder">

          <h3>
            Lesson content
          </h3>

          <p>
            Can-do activities and
            official learning content
            will be connected here.
          </p>

        </div>

      </div>

    </div>
  `;


  const backButton =
    document.getElementById(
      "back-to-lessons"
    );


  if (backButton) {

    backButton.addEventListener(
      "click",
      () => {

        showLessonView(
          bookTitle,
          findLessonsForBook(
            book
          ),
          book
        );

      }
    );

  }
}


/* =========================================
   ERROR SCREEN
   ========================================= */

function showError(message) {

  const container =
    document.getElementById(
      "book-list"
    );

  if (!container) {
    return;
  }


  container.innerHTML = `

    <div class="error-card">

      <h2>
        Unable to load learning data
      </h2>

      <p>
        ${escapeHtml(
          message
        )}
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

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}
