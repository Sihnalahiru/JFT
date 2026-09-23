/* =========================================================
   IRODORI MASTER PWA
   Main Application
========================================================= */

const BOOKS_FILE = "./data/books.json";
const LESSONS_FILE = "./data/lessons.json";
const AUDIO_MAIN_FILE = "./data/audio-main.json";

const CANDO_FILES = {
  starter: "./data/canDos-starter.json",
  "elementary-1": "./data/canDos-e1.json",
  "elementary-2": "./data/canDos-e2.json",
  "pre-intermediate": "./data/canDos-pi.json"
};

const BOOK_KEY_ALIASES = {
  starter: "starter",

  elementary01: "elementary-1",
  "elementary-01": "elementary-1",
  elementary1: "elementary-1",
  "elementary-1": "elementary-1",

  elementary02: "elementary-2",
  "elementary-02": "elementary-2",
  elementary2: "elementary-2",
  "elementary-2": "elementary-2",

  "pre-intermediate": "pre-intermediate",
  preintermediate: "pre-intermediate",
  pre_intermediate: "pre-intermediate"
};

let books = [];
let lessons = [];
let canDos = {};
let mainAudioRecords = [];


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", initializeApp);

async function initializeApp() {
  try {
    await loadAllData();
    renderDashboard();
  } catch (error) {
    console.error("IRODORI Master initialization error:", error);
    showError("Unable to load IRODORI Master data.");
  }
}


/* =========================================================
   DATA LOADING
========================================================= */

async function loadAllData() {
  const options = {
    cache: "no-store"
  };

  const [booksResponse, lessonsResponse] = await Promise.all([
    fetch(BOOKS_FILE, options),
    fetch(LESSONS_FILE, options)
  ]);

  if (!booksResponse.ok) {
    throw new Error("Unable to load books.json");
  }

  if (!lessonsResponse.ok) {
    throw new Error("Unable to load lessons.json");
  }

  const booksData = await booksResponse.json();
  const lessonsData = await lessonsResponse.json();

  books = Array.isArray(booksData)
    ? booksData
    : Array.isArray(booksData.books)
      ? booksData.books
      : [];

  lessons = Array.isArray(lessonsData)
    ? lessonsData
    : Array.isArray(lessonsData.lessons)
      ? lessonsData.lessons
      : [];

  await Promise.all(
    Object.entries(CANDO_FILES).map(
      async ([key, file]) => {
        try {
          const response = await fetch(file, options);

          if (!response.ok) {
            canDos[key] = [];
            return;
          }

          const data = await response.json();

          if (Array.isArray(data)) {
            canDos[key] = data;
          } else if (Array.isArray(data.canDos)) {
            canDos[key] = data.canDos;
          } else if (Array.isArray(data.activities)) {
            canDos[key] = data.activities;
          } else {
            canDos[key] = [];
          }
        } catch (error) {
          console.warn("Unable to load:", file, error);
          canDos[key] = [];
        }
      }
    )
  );

  /* Main Lesson Audio dataset */
  try {
    const response = await fetch(
      AUDIO_MAIN_FILE,
      options
    );

    if (response.ok) {
      const data = await response.json();

      if (Array.isArray(data)) {
        mainAudioRecords = data;
      } else if (Array.isArray(data.records)) {
        mainAudioRecords = data.records;
      } else {
        mainAudioRecords = [];
      }
    } else {
      mainAudioRecords = [];
    }
  } catch (error) {
    console.warn(
      "Unable to load audio-main.json",
      error
    );

    mainAudioRecords = [];
  }
}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {
  const main = document.querySelector(".app-main");

  if (!main) return;

  main.innerHTML = `
    <section class="dashboard-section">

      <div class="welcome-card">
        <div class="welcome-content">
          <h2>IRODORI Master</h2>
          <p>
            Japanese learning platform based on
            the official IRODORI curriculum.
          </p>
        </div>
      </div>

      <div class="dashboard-grid">

        <div class="dashboard-card">
          <div class="dashboard-icon">📚</div>
          <div
            class="dashboard-value"
            data-dashboard-books
          >
            0 / 4
          </div>
          <div class="dashboard-label">
            Books
          </div>
        </div>

        <div class="dashboard-card">
          <div class="dashboard-icon">📖</div>
          <div
            class="dashboard-value"
            data-dashboard-lessons
          >
            0 / 72
          </div>
          <div class="dashboard-label">
            Lessons
          </div>
        </div>

        <div class="dashboard-card">
          <div class="dashboard-icon">🎯</div>
          <div
            class="dashboard-value"
            data-dashboard-activities
          >
            0 / 288
          </div>
          <div class="dashboard-label">
            Can-do / Activities
          </div>
        </div>

        <div class="dashboard-card">
          <div class="dashboard-icon">漢</div>
          <div
            class="dashboard-value"
            data-dashboard-kanji
          >
            0 / 644
          </div>
          <div class="dashboard-label">
            Kanji
          </div>
        </div>

      </div>

      <div class="progress-card">

        <div class="progress-card-header">
          <div>
            <h3>Overall Progress</h3>
            <p>
              Your unique learning completion progress.
            </p>
          </div>

          <strong data-progress-overall>
            0%
          </strong>
        </div>

        <div class="progress-track">
          <div
            class="progress-bar"
            data-progress-bar
            style="width:0%"
          ></div>
        </div>

      </div>

      <section class="books-section">

        <div class="section-heading">
          <h2>IRODORI Books</h2>
          <p>Select a book to continue learning.</p>
        </div>

        <div
          id="book-list"
          class="book-grid"
        ></div>

      </section>

    </section>
  `;

  renderBooks();
  updateProgressUI();
}


/* =========================================================
   PROGRESS
========================================================= */

function getProgressSummary() {
  if (!window.IrodoriProgress) {
    return null;
  }

  if (
    typeof window.IrodoriProgress.getSummary ===
    "function"
  ) {
    return window.IrodoriProgress.getSummary();
  }

  if (
    typeof window.IrodoriProgress.getProgressSummary ===
    "function"
  ) {
    return window.IrodoriProgress.getProgressSummary();
  }

  return null;
}


function updateProgressUI() {
  const summary = getProgressSummary();

  if (!summary) return;

  const booksCompleted =
    summary.completedBooks ??
    summary.books ??
    0;

  const lessonsCompleted =
    summary.completedLessons ??
    summary.lessons ??
    0;

  const activitiesCompleted =
    summary.completedActivities ??
    summary.activities ??
    0;

  const kanjiCompleted =
    summary.completedKanji ??
    summary.kanji ??
    0;

  const overall =
    summary.overallPercentage ??
    0;

  const books = document.querySelector(
    "[data-dashboard-books]"
  );

  const lessonElement = document.querySelector(
    "[data-dashboard-lessons]"
  );

  const activities = document.querySelector(
    "[data-dashboard-activities]"
  );

  const kanji = document.querySelector(
    "[data-dashboard-kanji]"
  );

  const percentage = document.querySelector(
    "[data-progress-overall]"
  );

  const bar = document.querySelector(
    "[data-progress-bar]"
  );

  if (books) {
    books.textContent =
      `${booksCompleted} / 4`;
  }

  if (lessonElement) {
    lessonElement.textContent =
      `${lessonsCompleted} / 72`;
  }

  if (activities) {
    activities.textContent =
      `${activitiesCompleted} / 288`;
  }

  if (kanji) {
    kanji.textContent =
      `${kanjiCompleted} / 644`;
  }

  if (percentage) {
    percentage.textContent =
      `${overall}%`;
  }

  if (bar) {
    bar.style.width =
      `${overall}%`;
  }
}


/* =========================================================
   BOOKS
========================================================= */

function renderBooks() {
  const container =
    document.querySelector("#book-list");

  if (!container) return;

  if (!books.length) {
    container.innerHTML = `
      <div class="pending-card">
        <p class="pending-text">
          No book data available.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML = books
    .map(
      (book, index) =>
        renderBookCard(book, index)
    )
    .join("");

  container
    .querySelectorAll("[data-book-index]")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const index =
            Number(
              button.dataset.bookIndex
            );

          if (books[index]) {
            openBook(books[index]);
          }
        }
      );
    });
}


function renderBookCard(book, index) {
  const title =
    book.title ||
    book.name ||
    book.bookTitle ||
    `Book ${index + 1}`;

  const description =
    book.description ||
    book.subtitle ||
    "";

  const lessonCount =
    findLessonsForBook(book).length;

  return `
    <button
      type="button"
      class="book-card-button"
      data-book-index="${index}"
    >

      <div class="book-card">

        <div class="book-card-number">
          ${index + 1}
        </div>

        <div class="book-card-content">

          <h3>
            ${escapeHtml(title)}
          </h3>

          ${
            description
              ? `
                <p>
                  ${escapeHtml(description)}
                </p>
              `
              : ""
          }

          <small>
            ${lessonCount} lessons
          </small>

        </div>

      </div>

    </button>
  `;
}


/* =========================================================
   BOOK DETAIL
========================================================= */

function openBook(book) {
  const main =
    document.querySelector(".app-main");

  if (!main) return;

  const title =
    book.title ||
    book.name ||
    book.bookTitle ||
    "IRODORI Book";

  const bookLessons =
    findLessonsForBook(book)
      .slice()
      .sort(compareLessons);

  main.innerHTML = `
    <section class="lesson-view">

      <div class="lesson-detail">

        <button
          type="button"
          class="back-button"
          id="back-to-dashboard"
        >
          ← Back to Books
        </button>

        <div class="lesson-detail-card">

          <h2>
            ${escapeHtml(title)}
          </h2>

          <p>
            ${bookLessons.length}
            lesson${bookLessons.length === 1 ? "" : "s"}
          </p>

        </div>

        <div class="lesson-grid">

          ${
            bookLessons.length
              ? bookLessons
                  .map(
                    (lesson, index) =>
                      renderLessonCard(
                        lesson,
                        index
                      )
                  )
                  .join("")
              : `
                <div class="pending-card">
                  <p class="pending-text">
                    No verified lesson relationship
                    found for this book.
                  </p>
                </div>
              `
          }

        </div>

      </div>

    </section>
  `;

  document
    .querySelector("#back-to-dashboard")
    ?.addEventListener(
      "click",
      renderDashboard
    );

  document
    .querySelectorAll("[data-lesson-index]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset.lessonIndex
            );

          const lesson =
            bookLessons[index];

          if (lesson) {
            openLesson(
              lesson,
              book
            );
          }
        }
      );
    });
}


/* =========================================================
   LESSON CARD
========================================================= */

function renderLessonCard(
  lesson,
  index
) {
  const number =
    getLessonNumber(lesson);

  const title =
    lesson.title ||
    lesson.name ||
    lesson.lessonTitle ||
    `Lesson ${number}`;

  const lessonId =
    getLessonId(lesson);

  const completed =
    isLessonComplete(lessonId);

  return `
    <button
      type="button"
      class="lesson-card-button"
      data-lesson-index="${index}"
    >

      <div class="lesson-card">

        <div class="lesson-number">
          ${escapeHtml(String(number))}
        </div>

        <div class="lesson-card-content">

          <h3 class="lesson-title">
            ${escapeHtml(title)}
          </h3>

          ${
            completed
              ? `
                <span class="completion-badge">
                  ✓ Completed
                </span>
              `
              : ""
          }

        </div>

      </div>

    </button>
  `;
}


/* =========================================================
   LESSON DETAIL
========================================================= */

function openLesson(
  lesson,
  book
) {
  const main =
    document.querySelector(".app-main");

  if (!main) return;

  const lessonNumber =
    getLessonNumber(lesson);

  const lessonId =
    getLessonId(lesson);

  const title =
    lesson.title ||
    lesson.name ||
    lesson.lessonTitle ||
    `Lesson ${lessonNumber}`;

  const activities =
    findCanDosForLesson(
      lesson,
      book
    );

  const completed =
    isLessonComplete(lessonId);

  const attempts =
    getLessonAttemptCount(lessonId);

  main.innerHTML = `
    <section class="lesson-view">

      <div class="lesson-detail">

        <button
          type="button"
          class="back-button"
          id="back-to-book"
        >
          ← Back to Book
        </button>

        <div class="lesson-detail-card">

          <h2>
            ${escapeHtml(title)}
          </h2>

          <p>
            Lesson ${escapeHtml(
              String(lessonNumber)
            )}
          </p>

        </div>

        <div class="learning-module-grid">

          <button
            type="button"
            class="learning-module"
            id="module-can-do"
          >

            <div class="module-icon">
              🎯
            </div>

            <div class="module-content">

              <h3>
                Can-do / Activities
              </h3>

              <p>
                ${activities.length}
                verified activit${
                  activities.length === 1
                    ? "y"
                    : "ies"
                }
              </p>

            </div>

          </button>

          <div class="learning-module pending-card">

            <div class="module-icon">
              📚
            </div>

            <div class="module-content">

              <h3>Vocabulary</h3>

              <p>
                Pending — source integration
              </p>

            </div>

          </div>

          ${renderMainAudioModule(
            lesson,
            book
          )}

          <div class="learning-module pending-card">

            <div class="module-icon">
              🎧
            </div>

            <div class="module-content">

              <h3>
                Grammar Worksheet Audio
              </h3>

              <p>
                Verified audio dataset
                integration pending
              </p>

            </div>

          </div>

          <div class="learning-module pending-card">

            <div class="module-icon">
              ✍️
            </div>

            <div class="module-content">

              <h3>Practice</h3>

              <p>
                Practice engine pending
              </p>

            </div>

          </div>

        </div>

        <div class="lesson-completion-card">

          <div>

            <h3>
              ${
                completed
                  ? "Lesson Completed"
                  : "Lesson Progress"
              }
            </h3>

            <p>
              ${
                completed
                  ? "You can study this lesson again at any time."
                  : "Mark this lesson as completed when you finish studying."
              }
            </p>

            ${
              attempts
                ? `
                  <p>
                    <strong>
                      Study attempts:
                    </strong>
                    ${attempts}
                  </p>
                `
                : ""
            }

          </div>

          <button
            type="button"
            class="completion-button"
            id="lesson-complete-button"
            ${lessonId ? "" : "disabled"}
          >
            ${
              completed
                ? "✓ Completed — Study Again"
                : "Mark Lesson Complete"
            }
          </button>

        </div>

        ${
          activities.length
            ? `
              <div class="can-do-section">

                <div class="section-heading">
                  <h2>
                    Can-do / Activities
                  </h2>
                </div>

                <div class="can-do-list">

                  ${activities
                    .map(
                      renderCanDoCard
                    )
                    .join("")}

                </div>

              </div>
            `
            : ""
        }

      </div>

    </section>
  `;

  document
    .querySelector("#back-to-book")
    ?.addEventListener(
      "click",
      () => openBook(book)
    );

  document
    .querySelector("#module-can-do")
    ?.addEventListener(
      "click",
      () => {

        if (activities.length) {
          openActivity(
            activities[0],
            lesson,
            book
          );
        }

      }
    );

  document
    .querySelector("#lesson-complete-button")
    ?.addEventListener(
      "click",
      () => {

        if (
          lessonId &&
          window.IrodoriProgress &&
          typeof
            window.IrodoriProgress.markLessonComplete ===
            "function"
        ) {
          window.IrodoriProgress.markLessonComplete(
            lessonId
          );
        }

        openLesson(
          lesson,
          book
        );
      }
    );

  document
    .querySelectorAll("[data-activity-id]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            button.dataset.activityId;

          const activity =
            activities.find(
              item =>
                String(
                  getActivityId(item)
                ) === String(id)
            );

          if (activity) {
            openActivity(
              activity,
              lesson,
              book
            );
          }

        }
      );
    });
}


/* =========================================================
   CAN-DO
========================================================= */

function renderCanDoCard(activity) {
  const activityId =
    getActivityId(activity);

  const title =
    activity.title ||
    activity.name ||
    activity.canDo ||
    activity.label ||
    "Activity";

  const completed =
    isActivityComplete(activityId);

  return `
    <button
      type="button"
      class="can-do-card-button"
      data-activity-id="${
        activityId
          ? escapeHtml(
              String(activityId)
            )
          : ""
      }"
      ${activityId ? "" : "disabled"}
    >

      <div class="can-do-card">

        <div class="can-do-card-title">
          ${escapeHtml(title)}
        </div>

        ${
          completed
            ? `
              <span class="completion-badge">
                ✓ Completed
              </span>
            `
            : ""
        }

      </div>

    </button>
  `;
}


/* =========================================================
   ACTIVITY DETAIL
========================================================= */

function openActivity(
  activity,
  lesson,
  book
) {
  const main =
    document.querySelector(".app-main");

  if (!main) return;

  const activityId =
    getActivityId(activity);

  const title =
    activity.title ||
    activity.name ||
    activity.canDo ||
    activity.label ||
    "Activity";

  const description =
    activity.description ||
    activity.details ||
    activity.content ||
    "";

  const japanese =
    activity.japanese ||
    activity.jp ||
    activity.ja ||
    "";

  const english =
    activity.english ||
    activity.en ||
    "";

  const sinhala =
    activity.sinhala ||
    activity.si ||
    "";

  const completed =
    isActivityComplete(activityId);

  const attempts =
    getActivityAttempts(activityId);

  main.innerHTML = `
    <section class="lesson-view">

      <div class="activity-detail">

        <button
          type="button"
          class="back-button"
          id="back-to-lesson"
        >
          ← Back to Lesson
        </button>

        <div class="activity-detail-card">

          <h2>
            ${escapeHtml(title)}
          </h2>

          ${
            description
              ? `
                <div class="activity-field">

                  <h3>Description</h3>

                  <p>
                    ${escapeHtml(description)}
                  </p>

                </div>
              `
              : ""
          }

          ${
            japanese
              ? `
                <div class="activity-field">

                  <h3>Japanese</h3>

                  <p>
                    ${escapeHtml(japanese)}
                  </p>

                </div>
              `
              : ""
          }

          ${
            english
              ? `
                <div class="activity-field">

                  <h3>English</h3>

                  <p>
                    ${escapeHtml(english)}
                  </p>

                </div>
              `
              : ""
          }

          ${
            sinhala
              ? `
                <div class="activity-field">

                  <h3>Sinhala</h3>

                  <p>
                    ${escapeHtml(sinhala)}
                  </p>

                </div>
              `
              : ""
          }

        </div>

        <div class="activity-attempt-card">

          <div class="activity-attempt-header">

            <div>

              <h3>Practice History</h3>

              <p>
                ${
                  attempts.length
                    ? `${attempts.length} practice attempt${
                        attempts.length === 1
                          ? ""
                          : "s"
                      } recorded`
                    : "No practice attempts recorded yet"
                }
              </p>

            </div>

            <div class="activity-attempt-count">
              ${attempts.length}
            </div>

          </div>

        </div>

        <div class="lesson-completion-card">

          <div>

            <h3>
              ${
                completed
                  ? "Completed"
                  : "Ready to Practice"
              }
            </h3>

            <p>
              ${
                completed
                  ? "You can practice this activity again at any time."
                  : "Complete this activity when you finish practicing."
              }
            </p>

          </div>

          <button
            type="button"
            class="completion-button"
            id="activity-complete-button"
            ${activityId ? "" : "disabled"}
          >
            ${
              completed
                ? "✓ Completed — Practice Again"
                : "Mark Activity Complete"
            }
          </button>

        </div>

      </div>

    </section>
  `;

  document
    .querySelector("#back-to-lesson")
    ?.addEventListener(
      "click",
      () => openLesson(
        lesson,
        book
      )
    );

  document
    .querySelector("#activity-complete-button")
    ?.addEventListener(
      "click",
      () => {

        if (
          activityId &&
          window.IrodoriProgress &&
          typeof
            window.IrodoriProgress.markActivityComplete ===
            "function"
        ) {
          window.IrodoriProgress.markActivityComplete(
            activityId
          );
        }

        openActivity(
          activity,
          lesson,
          book
        );
      }
    );
}


/* =========================================================
   MAIN LESSON AUDIO
========================================================= */

function getOfficialMainAudioPage(
  lesson,
  book
) {
  const bookKey =
    getBookKey(book);

  const lessonNumber =
    Number(
      getLessonNumber(lesson)
    );

  if (
    !bookKey ||
    !Number.isInteger(lessonNumber) ||
    lessonNumber < 1 ||
    lessonNumber > 18
  ) {
    return "";
  }

  const basePaths = {
    starter:
      "https://www.irodori.jpf.go.jp/en/starter/audio/lesson",

    "elementary-1":
      "https://www.irodori.jpf.go.jp/en/elementary01/audio/lesson",

    "elementary-2":
      "https://www.irodori.jpf.go.jp/en/elementary02/audio/lesson",

    "pre-intermediate":
      "https://www.irodori.jpf.go.jp/en/pre-intermediate/audio/lesson"
  };

  const base =
    basePaths[bookKey];

  if (!base) return "";

  return (
    base +
    String(lessonNumber).padStart(2, "0") +
    ".html"
  );
}


function getMainAudioRecordsForLesson(
  lesson,
  book
) {
  if (!Array.isArray(mainAudioRecords)) {
    return [];
  }

  const lessonId =
    getLessonId(lesson);

  const lessonNumber =
    getLessonNumber(lesson);

  const bookKey =
    getBookKey(book);

  return mainAudioRecords.filter(
    record => {

      if (!record || typeof record !== "object") {
        return false;
      }

      if (
        record.lessonId !== undefined &&
        lessonId &&
        String(record.lessonId) ===
          String(lessonId)
      ) {
        return true;
      }

      if (
        record.lessonNumber !== undefined &&
        lessonNumber !== undefined
      ) {
        if (
          record.bookId !== undefined
        ) {
          return (
            getBookKey({
              bookId: record.bookId
            }) === bookKey &&
            String(record.lessonNumber) ===
              String(lessonNumber)
          );
        }
      }

      return false;
    }
  );
}


function renderMainAudioModule(
  lesson,
  book
) {
  const records =
    getMainAudioRecordsForLesson(
      lesson,
      book
    );

  const officialPage =
    getOfficialMainAudioPage(
      lesson,
      book
    );

  return `
    <div class="learning-module audio-module">

      <div class="module-icon">
        🔊
      </div>

      <div class="module-content">

        <h3>
          Main Lesson Audio
        </h3>

        <p>
          ${
            records.length
              ? `${records.length} verified audio records`
              : "Official MP3 playback page available"
          }
        </p>

        ${
          officialPage
            ? `
              <a
                class="completion-button"
                href="${escapeHtml(officialPage)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                ▶ Open Official Audio
              </a>
            `
            : `
              <small>
                PENDING — SOURCE VERIFICATION REQUIRED
              </small>
            `
        }

      </div>

    </div>
  `;
}


/* =========================================================
   BOOK KEY
========================================================= */

function getBookKey(book) {
  if (!book) return "";

  const candidates = [
    book.bookId,
    book.id,
    book.code,
    book.slug,
    book.bookCode,
    book.bookSlug,
    book.bookTitle,
    book.title,
    book.name
  ];

  for (const candidate of candidates) {

    if (
      candidate === undefined ||
      candidate === null
    ) {
      continue;
    }

    const key =
      normalizeBookKey(candidate);

    if (
      BOOK_KEY_ALIASES[key]
    ) {
      return BOOK_KEY_ALIASES[key];
    }

    const compact =
      key.replace(/[-_]/g, "");

    if (
      BOOK_KEY_ALIASES[compact]
    ) {
      return BOOK_KEY_ALIASES[compact];
    }
  }

  return "";
}


function normalizeBookKey(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}


/* =========================================================
   LESSON MATCHING
========================================================= */

function findLessonsForBook(book) {
  const rawBookId =
    book?.bookId ??
    book?.id ??
    "";

  const normalizedBookKey =
    getBookKey(book);

  return lessons.filter(
    lesson => {

      const lessonBookId =
        lesson?.bookId ??
        lesson?.book ??
        lesson?.bookCode ??
        "";

      if (!lessonBookId) {
        return false;
      }

      if (
        String(lessonBookId).trim() ===
        String(rawBookId).trim()
      ) {
        return true;
      }

      const lessonKey =
        getBookKey({
          bookId: lessonBookId
        });

      return (
        lessonKey &&
        lessonKey ===
          normalizedBookKey
      );
    }
  );
}


/* =========================================================
   CAN-DO MATCHING
========================================================= */

function findCanDosForLesson(
  lesson,
  book
) {
  const bookKey =
    getBookKey(book);

  const records =
    canDos[bookKey] || [];

  const lessonId =
    getLessonId(lesson);

  const lessonNumber =
    getLessonNumber(lesson);

  return records.filter(
    record => {

      if (
        record.lessonId !== undefined &&
        lessonId !== null &&
        String(record.lessonId) ===
          String(lessonId)
      ) {
        return true;
      }

      if (
        record.lessonNumber !== undefined &&
        lessonNumber !== undefined &&
        String(record.lessonNumber) ===
          String(lessonNumber)
      ) {
        return true;
      }

      return false;
    }
  );
}


/* =========================================================
   IDs
========================================================= */

function getLessonId(lesson) {
  if (
    !lesson ||
    typeof lesson !== "object"
  ) {
    return null;
  }

  if (
    lesson.lessonId !== undefined &&
    lesson.lessonId !== null &&
    String(
      lesson.lessonId
    ).trim()
  ) {
    return String(
      lesson.lessonId
    ).trim();
  }

  const bookId =
    lesson.bookId;

  const number =
    lesson.lessonNumber ??
    lesson.number ??
    lesson.lessonNo;

  if (
    !bookId ||
    number === undefined ||
    number === null
  ) {
    return null;
  }

  return (
    `${String(bookId).trim()}-L` +
    `${String(number).padStart(2, "0")}`
  );
}


function getLessonNumber(lesson) {
  if (!lesson) return "?";

  return (
    lesson.lessonNumber ??
    lesson.number ??
    lesson.lesson ??
    lesson.lessonNo ??
    "?"
  );
}


function getActivityId(activity) {
  if (
    !activity ||
    typeof activity !== "object"
  ) {
    return null;
  }

  const candidates = [
    activity.activityId,
    activity.id,
    activity.code,
    activity.canDoId,
    activity.slug
  ];

  for (const candidate of candidates) {

    if (
      candidate !== undefined &&
      candidate !== null &&
      String(candidate).trim() !== ""
    ) {

      const id =
        String(candidate).trim();

      if (
        !isUnsafePlaceholderId(id)
      ) {
        return id;
      }
    }
  }

  return null;
}


function isUnsafePlaceholderId(id) {
  const blocked = new Set([
    "unknown",
    "unknown-activity",
    "unknown-lesson",
    "unknown-kanji",
    "?",
    "undefined",
    "null",
    "nan"
  ]);

  return blocked.has(
    String(id)
      .trim()
      .toLowerCase()
  );
}


/* =========================================================
   PROGRESS HELPERS
========================================================= */

function isLessonComplete(id) {
  if (
    !id ||
    !window.IrodoriProgress
  ) {
    return false;
  }

  if (
    typeof
      window.IrodoriProgress.isLessonComplete ===
      "function"
  ) {
    return window.IrodoriProgress.isLessonComplete(
      id
    );
  }

  if (
    typeof
      window.IrodoriProgress.isComplete ===
      "function"
  ) {
    return window.IrodoriProgress.isComplete(
      "lesson",
      id
    );
  }

  return false;
}


function isActivityComplete(id) {
  if (
    !id ||
    !window.IrodoriProgress
  ) {
    return false;
  }

  if (
    typeof
      window.IrodoriProgress.isActivityComplete ===
      "function"
  ) {
    return window.IrodoriProgress.isActivityComplete(
      id
    );
  }

  if (
    typeof
      window.IrodoriProgress.isComplete ===
      "function"
  ) {
    return window.IrodoriProgress.isComplete(
      "activity",
      id
    );
  }

  return false;
}


/* =========================================================
   ATTEMPTS
========================================================= */

function getLessonAttemptCount(id) {
  if (
    !id ||
    !window.IrodoriProgress
  ) {
    return 0;
  }

  if (
    typeof
      window.IrodoriProgress.getLessonAttemptCount ===
      "function"
  ) {
    return window.IrodoriProgress.getLessonAttemptCount(
      id
    );
  }

  if (
    typeof
      window.IrodoriProgress.getLessonAttempts ===
      "function"
  ) {
    const attempts =
      window.IrodoriProgress.getLessonAttempts(
        id
      );

    return Array.isArray(attempts)
      ? attempts.length
      : 0;
  }

  return 0;
}


function getActivityAttempts(id) {
  if (
    !id ||
    !window.IrodoriProgress
  ) {
    return [];
  }

  if (
    typeof
      window.IrodoriProgress.getActivityAttempts ===
      "function"
  ) {
    return (
      window.IrodoriProgress.getActivityAttempts(
        id
      ) || []
    );
  }

  return [];
}


/* =========================================================
   SORT
========================================================= */

function compareLessons(a, b) {
  const aNumber =
    Number(
      getLessonNumber(a)
    );

  const bNumber =
    Number(
      getLessonNumber(b)
    );

  if (Number.isNaN(aNumber)) {
    return 1;
  }

  if (Number.isNaN(bNumber)) {
    return -1;
  }

  return aNumber - bNumber;
}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {
  const main =
    document.querySelector(".app-main");

  if (!main) return;

  main.innerHTML = `
    <section class="pending-card">

      <p class="pending-text">
        ${escapeHtml(message)}
      </p>

    </section>
  `;
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   OPTIONAL DEBUG API
========================================================= */

window.IrodoriMainAudio = {
  getRecordsForLesson:
    getMainAudioRecordsForLesson,

  getOfficialPage:
    getOfficialMainAudioPage,

  getRecordCountForLesson:
    (lesson, book) =>
      getMainAudioRecordsForLesson(
        lesson,
        book
      ).length
};
