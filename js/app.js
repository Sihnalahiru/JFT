const BOOKS_FILE = "./data/books.json";
const LESSONS_FILE = "./data/lessons.json";

const CANDO_FILES = {
  starter: "./data/canDos-starter.json",
  "elementary-1": "./data/canDos-e1.json",
  "elementary-2": "./data/canDos-e2.json",
  "pre-intermediate": "./data/canDos-pi.json"
};

let books = [];
let lessons = [];
let canDos = {};

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
  const booksResponse = await fetch(BOOKS_FILE);
  const lessonsResponse = await fetch(LESSONS_FILE);

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
    Object.entries(CANDO_FILES).map(async ([key, file]) => {
      try {
        const response = await fetch(file);

        if (!response.ok) {
          canDos[key] = [];
          return;
        }

        const data = await response.json();

        canDos[key] = Array.isArray(data)
          ? data
          : Array.isArray(data.canDos)
            ? data.canDos
            : Array.isArray(data.activities)
              ? data.activities
              : [];
      } catch (error) {
        console.warn(`Unable to load Can-do file: ${file}`, error);
        canDos[key] = [];
      }
    })
  );
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
            Japanese learning platform based on the official IRODORI curriculum.
          </p>
        </div>
      </div>

      <div class="dashboard-grid">

        <div class="dashboard-card">
          <div class="dashboard-icon">📚</div>
          <div class="dashboard-value" data-dashboard-books>0 / 4</div>
          <div class="dashboard-label">Books</div>
        </div>

        <div class="dashboard-card">
          <div class="dashboard-icon">📖</div>
          <div class="dashboard-value" data-dashboard-lessons>0 / 72</div>
          <div class="dashboard-label">Lessons</div>
        </div>

        <div class="dashboard-card">
          <div class="dashboard-icon">🎯</div>
          <div class="dashboard-value" data-dashboard-activities>0 / 288</div>
          <div class="dashboard-label">Can-do / Activities</div>
        </div>

        <div class="dashboard-card">
          <div class="dashboard-icon">漢</div>
          <div class="dashboard-value" data-dashboard-kanji>0 / 644</div>
          <div class="dashboard-label">Kanji</div>
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

          <strong data-progress-overall>0%</strong>
        </div>

        <div class="progress-track">
          <div
            class="progress-bar"
            data-progress-bar
            style="width: 0%;"
          ></div>
        </div>

      </div>

      <section class="books-section">

        <div class="section-heading">
          <h2>IRODORI Books</h2>
          <p>Select a book to continue learning.</p>
        </div>

        <div id="book-list" class="book-grid"></div>

      </section>

    </section>
  `;

  renderBooks();
  updateProgressUI();
}

/* =========================================================
   PROGRESS UI
========================================================= */

function updateProgressUI() {
  if (
    !window.IrodoriProgress ||
    typeof window.IrodoriProgress.getSummary !== "function"
  ) {
    return;
  }

  const summary = window.IrodoriProgress.getSummary();

  const booksElement = document.querySelector(
    "[data-dashboard-books]"
  );

  const lessonsElement = document.querySelector(
    "[data-dashboard-lessons]"
  );

  const activitiesElement = document.querySelector(
    "[data-dashboard-activities]"
  );

  const kanjiElement = document.querySelector(
    "[data-dashboard-kanji]"
  );

  const overallElement = document.querySelector(
    "[data-progress-overall]"
  );

  const progressBar = document.querySelector(
    "[data-progress-bar]"
  );

  if (booksElement) {
    booksElement.textContent =
      `${summary.completedBooks} / ${summary.totalBooks}`;
  }

  if (lessonsElement) {
    lessonsElement.textContent =
      `${summary.completedLessons} / ${summary.totalLessons}`;
  }

  if (activitiesElement) {
    activitiesElement.textContent =
      `${summary.completedActivities} / ${summary.totalActivities}`;
  }

  if (kanjiElement) {
    kanjiElement.textContent =
      `${summary.completedKanji} / ${summary.totalKanji}`;
  }

  if (overallElement) {
    overallElement.textContent =
      `${summary.overallPercentage}%`;
  }

  if (progressBar) {
    progressBar.style.width =
      `${summary.overallPercentage}%`;
  }
}

/* =========================================================
   BOOKS
========================================================= */

function renderBooks() {
  const container = document.querySelector("#book-list");

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
    .map((book, index) => renderBookCard(book, index))
    .join("");

  container.querySelectorAll("[data-book-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.bookIndex);
      openBook(books[index]);
    });
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

  return `
    <button
      class="book-card-button"
      type="button"
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
              ? `<p>${escapeHtml(description)}</p>`
              : ""
          }

        </div>

      </div>
    </button>
  `;
}

/* =========================================================
   BOOK DETAIL
========================================================= */

function openBook(book) {
  const main = document.querySelector(".app-main");

  if (!main) return;

  const title =
    book.title ||
    book.name ||
    book.bookTitle ||
    "IRODORI Book";

  const bookKey = getBookKey(book);

  const bookLessons = findLessonsForBook(book);

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
                  .map((lesson) =>
                    renderLessonCard(lesson, book)
                  )
                  .join("")
              : `
                <div class="pending-card">
                  <p class="pending-text">
                    No verified lesson relationship found for this book.
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
    ?.addEventListener("click", renderDashboard);

  main
    .querySelectorAll("[data-lesson-index]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const lessonIndex = Number(button.dataset.lessonIndex);
        const lesson = bookLessons[lessonIndex];

        openLesson(lesson, book);
      });
    });
}

function renderLessonCard(lesson, book) {
  const number = getLessonNumber(lesson);

  const title =
    lesson.title ||
    lesson.name ||
    lesson.lessonTitle ||
    `Lesson ${number}`;

  const lessonId = getLessonId(lesson);

  let completed = false;

  if (
    window.IrodoriProgress &&
    lessonId
  ) {
    completed =
      window.IrodoriProgress.isComplete(
        "lesson",
        lessonId
      );
  }

  return `
    <button
      type="button"
      class="lesson-card-button"
      data-lesson-index="${getLessonIndex(book, lesson)}"
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

function openLesson(lesson, book) {
  const main = document.querySelector(".app-main");

  if (!main) return;

  const lessonNumber = getLessonNumber(lesson);

  const lessonId = getLessonId(lesson);

  const title =
    lesson.title ||
    lesson.name ||
    lesson.lessonTitle ||
    `Lesson ${lessonNumber}`;

  const lessonCanDos = findCanDosForLesson(
    lesson,
    book
  );

  const completed =
    lessonId &&
    window.IrodoriProgress
      ? window.IrodoriProgress.isComplete(
          "lesson",
          lessonId
        )
      : false;

  const attemptCount =
    lessonId &&
    window.IrodoriProgress &&
    typeof window.IrodoriProgress.getLessonAttemptCount ===
      "function"
      ? window.IrodoriProgress.getLessonAttemptCount(
          lessonId
        )
      : 0;

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
            Lesson ${escapeHtml(String(lessonNumber))}
          </p>

        </div>

        <div class="learning-module-grid">

          <button
            type="button"
            class="learning-module"
            id="module-can-do"
          >
            <div class="module-icon">🎯</div>
            <div class="module-content">
              <h3>Can-do / Activities</h3>
              <p>
                ${lessonCanDos.length}
                verified activity record${
                  lessonCanDos.length === 1
                    ? ""
                    : "s"
                }
              </p>
            </div>
          </button>

          <div class="learning-module pending-card">
            <div class="module-icon">📚</div>
            <div class="module-content">
              <h3>Vocabulary</h3>
              <p>Pending — source integration</p>
            </div>
          </div>

          <div class="learning-module pending-card">
            <div class="module-icon">🔊</div>
            <div class="module-content">
              <h3>Main Lesson Audio</h3>
              <p>Verified audio dataset integration pending</p>
            </div>
          </div>

          <div class="learning-module pending-card">
            <div class="module-icon">🎧</div>
            <div class="module-content">
              <h3>Grammar Worksheet Audio</h3>
              <p>Verified audio dataset integration pending</p>
            </div>
          </div>

          <div class="learning-module pending-card">
            <div class="module-icon">✍️</div>
            <div class="module-content">
              <h3>Practice</h3>
              <p>Practice engine pending</p>
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
              attemptCount > 0
                ? `
                  <p>
                    <strong>
                      Study attempts:
                    </strong>
                    ${attemptCount}
                  </p>
                `
                : ""
            }

          </div>

          <button
            type="button"
            class="completion-button"
            id="lesson-complete-button"
          >
            ${
              completed
                ? "✓ Completed — Study Again"
                : "Mark Lesson Complete"
            }
          </button>

        </div>

        ${
          lessonCanDos.length
            ? `
              <div class="can-do-section">

                <div class="section-heading">
                  <h2>Can-do / Activities</h2>
                </div>

                <div class="can-do-list">

                  ${lessonCanDos
                    .map((activity) =>
                      renderCanDoCard(activity)
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
    ?.addEventListener("click", () =>
      openBook(book)
    );

  document
    .querySelector("#module-can-do")
    ?.addEventListener("click", () => {
      if (lessonCanDos.length) {
        const firstActivity = lessonCanDos[0];
        openActivity(firstActivity, lesson, book);
      }
    });

  main
    .querySelector("#lesson-complete-button")
    ?.addEventListener("click", () => {

      if (
        window.IrodoriProgress &&
        lessonId
      ) {
        window.IrodoriProgress.markLessonComplete(
          lessonId
        );
      }

      openLesson(lesson, book);
    });

  main
    .querySelectorAll("[data-activity-id]")
    .forEach((button) => {
      button.addEventListener("click", () => {

        const activityId =
          button.dataset.activityId;

        const activity =
          lessonCanDos.find(
            (item) =>
              String(getActivityId(item)) ===
              String(activityId)
          );

        if (activity) {
          openActivity(
            activity,
            lesson,
            book
          );
        }
      });
    });
}

/* =========================================================
   CAN-DO CARD
========================================================= */

function renderCanDoCard(activity) {
  const activityId =
    getActivityId(activity);

  const title =
    activity.title ||
    activity.name ||
    activity.canDo ||
    activity.label ||
    `Activity ${activityId}`;

  const completed =
    activityId &&
    window.IrodoriProgress
      ? window.IrodoriProgress.isComplete(
          "activity",
          activityId
        )
      : false;

  return `
    <button
      type="button"
      class="can-do-card-button"
      data-activity-id="${escapeHtml(String(activityId))}"
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
   ACTIVITY DETAIL + ATTEMPT HISTORY
========================================================= */

function openActivity(activity, lesson, book) {
  const main = document.querySelector(".app-main");

  if (!main) return;

  const activityId =
    getActivityId(activity);

  const title =
    activity.title ||
    activity.name ||
    activity.canDo ||
    activity.label ||
    `Activity ${activityId}`;

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

  const lessonId =
    getLessonId(lesson);

  const completed =
    activityId &&
    window.IrodoriProgress
      ? window.IrodoriProgress.isComplete(
          "activity",
          activityId
        )
      : false;

  const attemptCount =
    activityId &&
    window.IrodoriProgress &&
    typeof window.IrodoriProgress.getActivityAttemptCount ===
      "function"
      ? window.IrodoriProgress.getActivityAttemptCount(
          activityId
        )
      : 0;

  const attempts =
    activityId &&
    window.IrodoriProgress &&
    typeof window.IrodoriProgress.getActivityAttempts ===
      "function"
      ? window.IrodoriProgress.getActivityAttempts(
          activityId
        )
      : [];

  const lastAttempt =
    attempts.length
      ? attempts[attempts.length - 1]
      : null;

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

        <!-- ATTEMPT HISTORY -->

        <div class="activity-attempt-card">

          <div class="activity-attempt-header">

            <div>
              <h3>Practice History</h3>

              <p>
                ${
                  attemptCount
                    ? `${attemptCount} practice attempt${
                        attemptCount === 1
                          ? ""
                          : "s"
                      } recorded`
                    : "No practice attempts recorded yet"
                }
              </p>
            </div>

            <div class="activity-attempt-count">
              ${attemptCount}
            </div>

          </div>

          ${
            lastAttempt
              ? `
                <div class="activity-last-attempt">

                  <strong>
                    Last practiced
                  </strong>

                  <span>
                    ${formatAttemptDate(
                      lastAttempt.completedAt
                    )}
                  </span>

                </div>
              `
              : ""
          }

        </div>

        ${
          attempts.length
            ? `
              <div class="activity-history-list">

                <h3>Attempt History</h3>

                <div class="attempt-history-items">

                  ${attempts
                    .slice()
                    .reverse()
                    .map(
                      (attempt, index) => `
                        <div class="attempt-history-item">

                          <span class="attempt-number">
                            #${attempts.length - index}
                          </span>

                          <span class="attempt-date">
                            ${formatAttemptDate(
                              attempt.completedAt
                            )}
                          </span>

                        </div>
                      `
                    )
                    .join("")}

                </div>

              </div>
            `
            : ""
        }

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
    ?.addEventListener("click", () =>
      openLesson(lesson, book)
    );

  document
    .querySelector("#activity-complete-button")
    ?.addEventListener("click", () => {

      if (
        window.IrodoriProgress &&
        activityId
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
    });
}

/* =========================================================
   ATTEMPT DATE
========================================================= */

function formatAttemptDate(value) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return escapeHtml(String(value));
  }

  return escapeHtml(
    date.toLocaleString()
  );
}

/* =========================================================
   LESSON / ACTIVITY RELATIONSHIPS
========================================================= */

function findLessonsForBook(book) {
  const bookKey = getBookKey(book);

  return lessons
    .map((lesson, index) => ({
      lesson,
      index
    }))
    .filter(({ lesson }) => {

      const candidates = [
        lesson.bookId,
        lesson.book,
        lesson.bookCode,
        lesson.bookSlug,
        lesson.bookTitle
      ]
        .filter(Boolean)
        .map((value) =>
          normalizeKey(value)
        );

      return candidates.includes(
        normalizeKey(bookKey)
      );
    })
    .map(({ lesson }) => lesson);
}

function findCanDosForLesson(lesson, book) {
  const bookKey = getBookKey(book);

  const records =
    canDos[bookKey] || [];

  const lessonId =
    getLessonId(lesson);

  const lessonNumber =
    getLessonNumber(lesson);

  return records.filter((record) => {

    if (
      record.lessonId !== undefined &&
      lessonId !== undefined &&
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
  });
}

/* =========================================================
   HELPERS
========================================================= */

function getBookKey(book) {
  const raw =
    book.id ||
    book.code ||
    book.slug ||
    book.bookId ||
    book.bookCode ||
    book.title ||
    book.name ||
    "";

  const normalized =
    normalizeKey(raw);

  if (
    normalized.includes("starter")
  ) {
    return "starter";
  }

  if (
    normalized.includes("elementary-1") ||
    normalized.includes("elementary1")
  ) {
    return "elementary-1";
  }

  if (
    normalized.includes("elementary-2") ||
    normalized.includes("elementary2")
  ) {
    return "elementary-2";
  }

  if (
    normalized.includes("pre-intermediate") ||
    normalized.includes("preintermediate")
  ) {
    return "pre-intermediate";
  }

  return normalized;
}

function getLessonNumber(lesson) {
  return (
    lesson.lessonNumber ??
    lesson.number ??
    lesson.lesson ??
    lesson.lessonNo ??
    "?"
  );
}

function getLessonId(lesson) {
  return (
    lesson.id ??
    lesson.lessonId ??
    lesson.code ??
    lesson.slug ??
    `${getBookKey(lesson)}-lesson-${getLessonNumber(lesson)}`
  );
}

function getActivityId(activity) {
  return (
    activity.id ??
    activity.activityId ??
    activity.code ??
    activity.canDoId ??
    activity.slug ??
    "unknown-activity"
  );
}

function getLessonIndex(book, lesson) {
  const list =
    findLessonsForBook(book);

  return list.indexOf(lesson);
}

function normalizeKey(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");
}

function compareLessons(a, b) {
  return Number(
    getLessonNumber(a)
  ) -
    Number(
      getLessonNumber(b)
    );
}

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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
