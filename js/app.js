const BOOKS_FILE = "./data/books.json";
const LESSONS_FILE = "./data/lessons.json";

const CANDO_FILES = {
  starter: "./data/canDos-starter.json",
  "elementary-1": "./data/canDos-e1.json",
  "elementary-2": "./data/canDos-e2.json",
  "pre-intermediate": "./data/canDos-pi.json"
};

let booksData = [];
let lessonsData = [];
let canDosData = {};

let currentBook = null;
let currentLesson = null;


document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);


async function initializeApp() {

  try {

    await loadBooks();
    await loadLessons();
    await loadAllCanDos();

    renderBooks();

    if (
      window.IrodoriProgress &&
      typeof window.IrodoriProgress.updateProgressDashboard === "function"
    ) {

      window.IrodoriProgress.updateProgressDashboard();

    }

  } catch (error) {

    console.error(
      "IRODORI Master initialization failed:",
      error
    );

    showError(
      "Learning data could not be loaded."
    );

  }

}


async function loadBooks() {

  const response =
    await fetch(BOOKS_FILE);

  if (!response.ok) {

    throw new Error(
      `Failed to load books.json: ${response.status}`
    );

  }

  const data =
    await response.json();

  booksData =
    getArray(data, "books");

}


async function loadLessons() {

  const response =
    await fetch(LESSONS_FILE);

  if (!response.ok) {

    throw new Error(
      `Failed to load lessons.json: ${response.status}`
    );

  }

  const data =
    await response.json();

  lessonsData =
    getArray(data, "lessons");

}


async function loadAllCanDos() {

  for (
    const [bookKey, file] of Object.entries(CANDO_FILES)
  ) {

    try {

      const response =
        await fetch(file);

      if (!response.ok) {

        console.warn(
          `Can-do file unavailable: ${file}`
        );

        canDosData[bookKey] = [];

        continue;

      }

      const data =
        await response.json();

      canDosData[bookKey] =
        getArray(data, "canDos");

    } catch (error) {

      console.warn(
        `Can-do loading failed: ${file}`,
        error
      );

      canDosData[bookKey] = [];

    }

  }

}


function getArray(
  data,
  preferredKey
) {

  if (Array.isArray(data)) {
    return data;
  }

  if (
    data &&
    Array.isArray(data[preferredKey])
  ) {

    return data[preferredKey];

  }

  if (
    data &&
    Array.isArray(data.records)
  ) {

    return data.records;

  }

  if (
    data &&
    Array.isArray(data.items)
  ) {

    return data.items;

  }

  return [];

}


function renderBooks() {

  const container =
    document.getElementById(
      "book-list"
    );

  if (!container) {
    return;
  }

  if (!booksData.length) {

    container.innerHTML =
      `<div class="pending-card">
        No book records available.
      </div>`;

    return;

  }


  container.innerHTML =
    booksData
      .map(
        (book, index) => {

          const title =
            book.title ||
            book.name ||
            `Book ${index + 1}`;

          const description =
            book.description ||
            "";

          const bookKey =
            getBookKey(book);


          const completed =
            window.IrodoriProgress &&
            window.IrodoriProgress.isBookComplete
              ? window.IrodoriProgress.isBookComplete(
                  bookKey
                )
              : false;


          return `
            <button
              type="button"
              class="book-card book-card-button"
              data-book-index="${index}"
            >

              <div class="book-card-content">

                <div class="book-card-title">
                  ${escapeHtml(title)}
                </div>

                ${
                  description
                    ? `
                      <div class="book-card-description">
                        ${escapeHtml(description)}
                      </div>
                    `
                    : ""
                }

                ${
                  completed
                    ? `
                      <div class="completion-badge">
                        ✓ Completed
                      </div>
                    `
                    : ""
                }

              </div>

            </button>
          `;

        }
      )
      .join("");


  container
    .querySelectorAll(
      "[data-book-index]"
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


function openBook(book) {

  if (!book) {
    return;
  }

  currentBook = book;

  const lessons =
    findLessonsForBook(book);


  const main =
    document.querySelector(
      ".app-main"
    );

  if (!main) {
    return;
  }


  main.innerHTML = `

    <section class="lesson-view">

      <button
        type="button"
        class="back-button"
        data-back-books
      >
        ← Back to Books
      </button>


      <div class="section-heading">

        <div>

          <h2>
            ${escapeHtml(
              book.title ||
              book.name ||
              "IRODORI Book"
            )}
          </h2>

          <p>
            ${lessons.length}
            lesson records found
          </p>

        </div>

      </div>


      <div class="lesson-grid">

        ${
          lessons.length
            ? lessons
                .map(
                  (
                    lesson,
                    index
                  ) =>
                    renderLessonCard(
                      lesson,
                      index
                    )
                )
                .join("")
            : `
              <div class="pending-card">
                No lesson records matched
                this book.
              </div>
            `
        }

      </div>

    </section>

  `;


  const backButton =
    main.querySelector(
      "[data-back-books]"
    );

  if (backButton) {

    backButton.addEventListener(
      "click",
      () => {

        restoreDashboard();

      }
    );

  }


  main
    .querySelectorAll(
      "[data-lesson-index]"
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
              lessons[index]
            );

          }
        );

      }
    );

}


function renderLessonCard(
  lesson,
  index
) {

  const lessonNumber =
    getLessonNumber(
      lesson,
      index
    );

  const title =
    lesson.title ||
    lesson.name ||
    `Lesson ${lessonNumber}`;


  const lessonId =
    getLessonId(
      lesson,
      index
    );


  const completed =
    window.IrodoriProgress &&
    window.IrodoriProgress.isLessonComplete
      ? window.IrodoriProgress.isLessonComplete(
          lessonId
        )
      : false;


  return `

    <button
      type="button"
      class="lesson-card lesson-card-button"
      data-lesson-index="${index}"
    >

      <div class="lesson-number">
        ${escapeHtml(
          String(lessonNumber)
        )}
      </div>

      <div class="lesson-card-content">

        <div class="lesson-title">
          ${escapeHtml(title)}
        </div>

        ${
          completed
            ? `
              <div class="completion-badge">
                ✓ Completed
              </div>
            `
            : ""
        }

      </div>

    </button>

  `;

}


function openLesson(lesson) {

  if (!lesson) {
    return;
  }

  currentLesson = lesson;


  const main =
    document.querySelector(
      ".app-main"
    );

  if (!main) {
    return;
  }


  const lessonNumber =
    getLessonNumber(
      lesson,
      0
    );

  const lessonId =
    getLessonId(
      lesson,
      0
    );


  const matchedCanDos =
    findCanDosForLesson(
      currentBook,
      lesson
    );


  main.innerHTML = `

    <section class="lesson-detail">

      <button
        type="button"
        class="back-button"
        data-back-lessons
      >
        ← Back to Lessons
      </button>


      <div class="section-heading">

        <div>

          <h2>
            ${
              escapeHtml(
                currentBook?.title ||
                currentBook?.name ||
                "IRODORI"
              )
            }
          </h2>

          <p>
            Lesson ${escapeHtml(
              String(lessonNumber)
            )}
          </p>

        </div>

      </div>


      <div class="learning-module-grid">


        <!-- CAN-DO / ACTIVITIES -->

        <article
          class="learning-module can-do-module"
        >

          <div class="module-icon">
            🎯
          </div>

          <div class="module-content">

            <h3>
              Can-do / Activities
            </h3>

            ${
              matchedCanDos.length
                ? `
                  <div class="can-do-list">

                    ${matchedCanDos
                      .map(
                        (
                          canDo,
                          index
                        ) =>
                          renderCanDoCard(
                            canDo,
                            index
                          )
                      )
                      .join("")}

                  </div>
                `
                : `
                  <p class="pending-text">
                    No verified Can-do
                    relationship available
                    for this lesson.
                  </p>
                `
            }

          </div>

        </article>


        <!-- VOCABULARY -->

        <article
          class="learning-module"
        >

          <div class="module-icon">
            📝
          </div>

          <div class="module-content">

            <h3>
              Vocabulary
            </h3>

            <p class="pending-text">
              Vocabulary dataset connection
              pending source verification.
            </p>

          </div>

        </article>


        <!-- MAIN LESSON AUDIO -->

        <article
          class="learning-module"
        >

          <div class="module-icon">
            🔊
          </div>

          <div class="module-content">

            <h3>
              Main Lesson Audio
            </h3>

            <p class="pending-text">
              Official main lesson audio
              records are pending dataset
              connection.
            </p>

          </div>

        </article>


        <!-- GRAMMAR WORKSHEET AUDIO -->

        <article
          class="learning-module"
        >

          <div class="module-icon">
            📚
          </div>

          <div class="module-content">

            <h3>
              Grammar Worksheet Audio
            </h3>

            <p class="pending-text">
              Official grammar worksheet
              audio records are pending
              dataset connection.
            </p>

          </div>

        </article>


        <!-- PRACTICE -->

        <article
          class="learning-module"
        >

          <div class="module-icon">
            🎤
          </div>

          <div class="module-content">

            <h3>
              Practice
            </h3>

            <p class="pending-text">
              Adaptive practice layer will
              be connected in a later step.
            </p>

          </div>

        </article>


      </div>


      <!-- LESSON COMPLETION -->

      <div class="lesson-completion-card">

        <div>

          <h3>
            Lesson Progress
          </h3>

          <p>
            Mark this lesson complete
            after you finish your study.
          </p>

        </div>


        <button
          type="button"
          class="completion-button"
          data-complete-lesson
          ${
            window.IrodoriProgress &&
            window.IrodoriProgress.isLessonComplete &&
            window.IrodoriProgress.isLessonComplete(
              lessonId
            )
              ? "disabled"
              : ""
          }
        >

          ${
            window.IrodoriProgress &&
            window.IrodoriProgress.isLessonComplete &&
            window.IrodoriProgress.isLessonComplete(
              lessonId
            )
              ? "✓ Lesson Completed"
              : "Mark Lesson Complete"
          }

        </button>

      </div>

    </section>

  `;


  const backButton =
    main.querySelector(
      "[data-back-lessons]"
    );

  if (backButton) {

    backButton.addEventListener(
      "click",
      () => {

        openBook(
          currentBook
        );

      }
    );

  }


  const completeButton =
    main.querySelector(
      "[data-complete-lesson]"
    );

  if (completeButton) {

    completeButton.addEventListener(
      "click",
      () => {

        if (
          window.IrodoriProgress &&
          typeof window.IrodoriProgress.markLessonComplete ===
            "function"
        ) {

          window.IrodoriProgress.markLessonComplete(
            lessonId
          );

          completeButton.disabled =
            true;

          completeButton.textContent =
            "✓ Lesson Completed";

        }

      }
    );

  }


  main
    .querySelectorAll(
      "[data-can-do-index]"
    )
    .forEach(
      (card) => {

        card.addEventListener(
          "click",
          () => {

            const index =
              Number(
                card.dataset.canDoIndex
              );

            openActivity(
              matchedCanDos[index]
            );

          }
        );

      }
    );

}


function renderCanDoCard(
  canDo,
  index
) {

  const title =
    canDo.title ||
    canDo.name ||
    canDo.canDo ||
    `Activity ${index + 1}`;


  const activityId =
    getActivityId(
      canDo,
      index
    );


  const completed =
    window.IrodoriProgress &&
    window.IrodoriProgress.isActivityComplete
      ? window.IrodoriProgress.isActivityComplete(
          activityId
        )
      : false;


  return `

    <button
      type="button"
      class="can-do-card can-do-card-button"
      data-can-do-index="${index}"
    >

      <div class="can-do-card-title">
        ${escapeHtml(title)}
      </div>

      ${
        completed
          ? `
            <div class="completion-badge">
              ✓ Completed
            </div>
          `
          : ""
      }

    </button>

  `;

}


function openActivity(
  activity
) {

  if (!activity) {
    return;
  }


  const main =
    document.querySelector(
      ".app-main"
    );

  if (!main) {
    return;
  }


  const activityId =
    getActivityId(
      activity,
      0
    );


  main.innerHTML = `

    <section class="activity-detail">

      <button
        type="button"
        class="back-button"
        data-back-lesson
      >
        ← Back to Lesson
      </button>


      <div class="activity-detail-card">

        <div class="module-icon">
          🎯
        </div>

        <h2>
          ${
            escapeHtml(
              activity.title ||
              activity.name ||
              activity.canDo ||
              "Can-do Activity"
            )
          }
        </h2>

        ${
          activity.description
            ? `
              <p>
                ${escapeHtml(
                  activity.description
                )}
              </p>
            `
            : ""
        }


        <div class="lesson-completion-card">

          <div>

            <h3>
              Activity Progress
            </h3>

            <p>
              Mark this activity complete
              after finishing it.
            </p>

          </div>


          <button
            type="button"
            class="completion-button"
            data-complete-activity
            ${
              window.IrodoriProgress &&
              window.IrodoriProgress.isActivityComplete &&
              window.IrodoriProgress.isActivityComplete(
                activityId
              )
                ? "disabled"
                : ""
            }
          >

            ${
              window.IrodoriProgress &&
              window.IrodoriProgress.isActivityComplete &&
              window.IrodoriProgress.isActivityComplete(
                activityId
              )
                ? "✓ Activity Completed"
                : "Mark Activity Complete"
            }

          </button>

        </div>

      </div>

    </section>

  `;


  const backButton =
    main.querySelector(
      "[data-back-lesson]"
    );

  if (backButton) {

    backButton.addEventListener(
      "click",
      () => {

        openLesson(
          currentLesson
        );

      }
    );

  }


  const completeButton =
    main.querySelector(
      "[data-complete-activity]"
    );

  if (completeButton) {

    completeButton.addEventListener(
      "click",
      () => {

        if (
          window.IrodoriProgress &&
          typeof window.IrodoriProgress.markActivityComplete ===
            "function"
        ) {

          window.IrodoriProgress.markActivityComplete(
            activityId
          );

          completeButton.disabled =
            true;

          completeButton.textContent =
            "✓ Activity Completed";

        }

      }
    );

  }

}


function restoreDashboard() {

  const main =
    document.querySelector(
      ".app-main"
    );

  if (!main) {
    return;
  }

  location.reload();

}


function findLessonsForBook(
  book
) {

  if (!book) {
    return [];
  }


  const bookId =
    book.id ??
    book.bookId ??
    null;


  const bookTitle =
    book.title ||
    book.name ||
    "";


  const bookCode =
    book.code ||
    book.bookCode ||
    "";


  const bookSlug =
    book.slug ||
    book.bookSlug ||
    "";


  const matched =
    lessonsData.filter(
      (lesson) => {

        if (
          bookId !== null &&
          lesson.bookId !== undefined
        ) {

          return (
            String(
              lesson.bookId
            ) ===
            String(bookId)
          );

        }


        if (
          lesson.bookCode &&
          bookCode
        ) {

          return (
            String(
              lesson.bookCode
            ).toLowerCase() ===
            String(bookCode).toLowerCase()
          );

        }


        if (
          lesson.bookSlug &&
          bookSlug
        ) {

          return (
            String(
              lesson.bookSlug
            ).toLowerCase() ===
            String(bookSlug).toLowerCase()
          );

        }


        if (
          lesson.book &&
          bookTitle
        ) {

          return (
            String(
              lesson.book
            ).toLowerCase() ===
            String(bookTitle).toLowerCase()
          );

        }


        if (
          lesson.bookTitle &&
          bookTitle
        ) {

          return (
            String(
              lesson.bookTitle
            ).toLowerCase() ===
            String(bookTitle).toLowerCase()
          );

        }


        return false;

      }
    );


  return matched.sort(
    compareLessons
  );

}


function findCanDosForLesson(
  book,
  lesson
) {

  const bookKey =
    getBookKey(book);


  const records =
    canDosData[bookKey] || [];


  const lessonId =
    getLessonId(
      lesson,
      0
    );


  const lessonNumber =
    getLessonNumber(
      lesson,
      0
    );


  return records.filter(
    (record) => {

      if (
        record.lessonId !== undefined
      ) {

        return (
          String(
            record.lessonId
          ) ===
          String(lessonId)
        );

      }


      if (
        record.lessonNumber !== undefined
      ) {

        return (
          String(
            record.lessonNumber
          ) ===
          String(lessonNumber)
        );

      }


      return false;

    }
  );

}


function getBookKey(
  book
) {

  if (!book) {
    return "";
  }


  const value =
    book.slug ||
    book.bookSlug ||
    book.code ||
    book.bookCode ||
    book.id ||
    book.bookId ||
    book.title ||
    book.name ||
    "";


  const normalized =
    String(value)
      .toLowerCase()
      .trim();


  if (
    normalized.includes(
      "starter"
    )
  ) {

    return "starter";

  }


  if (
    normalized.includes(
      "elementary 1"
    ) ||
    normalized.includes(
      "elementary-1"
    ) ||
    normalized.includes(
      "elementary01"
    )
  ) {

    return "elementary-1";

  }


  if (
    normalized.includes(
      "elementary 2"
    ) ||
    normalized.includes(
      "elementary-2"
    ) ||
    normalized.includes(
      "elementary02"
    )
  ) {

    return "elementary-2";

  }


  if (
    normalized.includes(
      "pre-intermediate"
    ) ||
    normalized.includes(
      "pre intermediate"
    )
  ) {

    return "pre-intermediate";

  }


  return normalized;

}


function getLessonNumber(
  lesson,
  fallback
) {

  if (!lesson) {
    return fallback + 1;
  }


  return (
    lesson.lessonNumber ??
    lesson.number ??
    lesson.lessonNo ??
    lesson.order ??
    fallback + 1
  );

}


function getLessonId(
  lesson,
  fallback
) {

  if (!lesson) {
    return `lesson-${fallback + 1}`;
  }


  return String(
    lesson.id ??
    lesson.lessonId ??
    lesson.lessonCode ??
    lesson.code ??
    `lesson-${getLessonNumber(
      lesson,
      fallback
    )}`
  );

}


function getActivityId(
  activity,
  fallback
) {

  if (!activity) {
    return `activity-${fallback + 1}`;
  }


  return String(
    activity.id ??
    activity.activityId ??
    activity.canDoId ??
    activity.code ??
    `activity-${fallback + 1}`
  );

}


function compareLessons(
  a,
  b
) {

  const numberA =
    Number(
      getLessonNumber(
        a,
        0
      )
    );

  const numberB =
    Number(
      getLessonNumber(
        b,
        0
      )
    );


  return numberA - numberB;

}


function showError(
  message
) {

  const container =
    document.getElementById(
      "book-list"
    );

  if (!container) {
    return;
  }


  container.innerHTML = `
    <div class="pending-card">
      ${escapeHtml(message)}
    </div>
  `;

}


function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}
