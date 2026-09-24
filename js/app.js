const BOOKS_FILE = "./data/books.json";
const LESSONS_FILE = "./data/lessons.json";
const AUDIO_MAIN_FILE = "./data/audio-main.json";
const AUDIO_WORDLIST_FILE = "./data/audio-wordlist.json";
const AUDIO_GRAMMAR_FILE = "./data/audio-grammar.json";

const CANDO_FILES = {
  starter: "./data/canDos-starter.json",
  "elementary-1": "./data/canDos-e1.json",
  "elementary-2": "./data/canDos-e2.json",
  "pre-intermediate": "./data/canDos-pi.json"
};

const BOOK_KEY_ALIASES = {
  starter: "starter",
  s: "starter",

  elementary01: "elementary-1",
  "elementary-01": "elementary-1",
  elementary1: "elementary-1",
  "elementary-1": "elementary-1",
  e1: "elementary-1",

  elementary02: "elementary-2",
  "elementary-02": "elementary-2",
  elementary2: "elementary-2",
  "elementary-2": "elementary-2",
  e2: "elementary-2",

  "pre-intermediate": "pre-intermediate",
  preintermediate: "pre-intermediate",
  pre_intermediate: "pre-intermediate"
};


let books = [];
let lessons = [];
let canDos = {};
let mainAudioRecords = [];
let wordlistAudioRecords = [];
let wordlistAudioMetadata = {};
let grammarAudioRecords = [];
let grammarAudioMetadata = {};


document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);


/* =========================================================
   INITIALIZATION
========================================================= */

async function initializeApp() {

  try {

    await loadAllData();

    renderDashboard();

  } catch (error) {

    console.error(
      "IRODORI Master initialization error:",
      error
    );

    showError(
      "Unable to load IRODORI Master data."
    );

  }

}


/* =========================================================
   DATA LOADING
========================================================= */

async function loadAllData() {

  const booksResponse =
    await fetch(
      BOOKS_FILE,
      {
        cache: "no-store"
      }
    );

  const lessonsResponse =
    await fetch(
      LESSONS_FILE,
      {
        cache: "no-store"
      }
    );


  if (!booksResponse.ok) {

    throw new Error(
      "Unable to load books.json"
    );

  }


  if (!lessonsResponse.ok) {

    throw new Error(
      "Unable to load lessons.json"
    );

  }


  const booksData =
    await booksResponse.json();

  const lessonsData =
    await lessonsResponse.json();


  /* -------------------------------------------------------
     MAIN AUDIO DATA
  ------------------------------------------------------- */

  try {

    const audioResponse =
      await fetch(
        AUDIO_MAIN_FILE,
        {
          cache: "no-store"
        }
      );


    if (audioResponse.ok) {

      const audioData =
        await audioResponse.json();


      if (
        Array.isArray(
          audioData
        )
      ) {

        mainAudioRecords =
          audioData;

      } else if (
        Array.isArray(
          audioData.records
        )
      ) {

        mainAudioRecords =
          audioData.records;

      } else {

        mainAudioRecords =
          [];

      }

    } else {

      mainAudioRecords =
        [];

    }

  } catch (error) {

    console.warn(
      `Unable to load main audio file: ${AUDIO_MAIN_FILE}`,
      error
    );

    mainAudioRecords =
      [];

  }


  /* -------------------------------------------------------
     WORD-LIST AUDIO DATA
  ------------------------------------------------------- */

  try {

    const wordlistResponse =
      await fetch(
        AUDIO_WORDLIST_FILE,
        {
          cache: "no-store"
        }
      );

    if (wordlistResponse.ok) {

      const wordlistData =
        await wordlistResponse.json();

      wordlistAudioMetadata =
        wordlistData?.metadata || {};

      wordlistAudioRecords =
        flattenAudioBooks(
          wordlistData
        );

    } else {

      wordlistAudioRecords = [];

    }

  } catch (error) {

    console.warn(
      `Unable to load word-list audio file: ${AUDIO_WORDLIST_FILE}`,
      error
    );

    wordlistAudioRecords = [];

  }


  /* -------------------------------------------------------
     GRAMMAR WORKSHEET AUDIO DATA
  ------------------------------------------------------- */

  try {

    const grammarResponse =
      await fetch(
        AUDIO_GRAMMAR_FILE,
        {
          cache: "no-store"
        }
      );

    if (grammarResponse.ok) {

      const grammarData =
        await grammarResponse.json();

      grammarAudioMetadata =
        grammarData?.metadata || {};

      grammarAudioRecords =
        flattenAudioBooks(
          grammarData
        );

    } else {

      grammarAudioRecords = [];

    }

  } catch (error) {

    console.warn(
      `Unable to load grammar worksheet audio file: ${AUDIO_GRAMMAR_FILE}`,
      error
    );

    grammarAudioRecords = [];

  }


  /* -------------------------------------------------------
     AUDIO DATASET VALIDATION
  ------------------------------------------------------- */

  validateMainAudioDataset();
  validateWordlistAudioDataset();
  validateGrammarAudioDataset();

  /* -------------------------------------------------------
     BOOKS
  ------------------------------------------------------- */

  books =
    Array.isArray(
      booksData
    )
      ? booksData
      : Array.isArray(
          booksData.books
        )
        ? booksData.books
        : [];


  /* -------------------------------------------------------
     LESSONS
  ------------------------------------------------------- */

  lessons =
    Array.isArray(
      lessonsData
    )
      ? lessonsData
      : Array.isArray(
          lessonsData.lessons
        )
        ? lessonsData.lessons
        : [];


  /* -------------------------------------------------------
     CAN-DO DATA
  ------------------------------------------------------- */

  await Promise.all(

    Object.entries(
      CANDO_FILES
    ).map(
      async (
        [key, file]
      ) => {

        try {

          const response =
            await fetch(
              file,
              {
                cache: "no-store"
              }
            );


          if (!response.ok) {

            canDos[key] =
              [];

            return;

          }


          const data =
            await response.json();


          if (
            Array.isArray(
              data
            )
          ) {

            canDos[key] =
              data;

          } else if (
            Array.isArray(
              data.canDos
            )
          ) {

            canDos[key] =
              data.canDos;

          } else if (
            Array.isArray(
              data.activities
            )
          ) {

            canDos[key] =
              data.activities;

          } else {

            canDos[key] =
              [];

          }

        } catch (error) {

          console.warn(
            `Unable to load Can-do file: ${file}`,
            error
          );

          canDos[key] =
            [];

        }

      }
    )

  );

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

  const main =
    document.querySelector(
      ".app-main"
    );


  if (!main) {

    return;

  }


  main.innerHTML = `

    <section class="dashboard-section">

      <div class="welcome-card">

        <div class="welcome-content">

          <h2>
            IRODORI Master
          </h2>

          <p>
            Japanese learning platform based on
            the official IRODORI curriculum.
          </p>

        </div>

      </div>


      <div class="dashboard-grid">

        <div class="dashboard-card">

          <div class="dashboard-icon">
            📚
          </div>

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

          <div class="dashboard-icon">
            📖
          </div>

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

          <div class="dashboard-icon">
            🎯
          </div>

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

          <div class="dashboard-icon">
            漢
          </div>

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

            <h3>
              Overall Progress
            </h3>

            <p>
              Your unique learning completion progress.
            </p>

          </div>

          <strong
            data-progress-overall
          >
            0%
          </strong>

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

          <h2>
            IRODORI Books
          </h2>

          <p>
            Select a book to continue learning.
          </p>

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
   PROGRESS UI
========================================================= */

function updateProgressUI() {

  if (
    !window.IrodoriProgress
  ) {

    return;

  }


  let summary =
    null;


  if (
    typeof window.IrodoriProgress.getSummary ===
    "function"
  ) {

    summary =
      window.IrodoriProgress.getSummary();

  } else if (
    typeof window.IrodoriProgress.getProgressSummary ===
    "function"
  ) {

    summary =
      window.IrodoriProgress.getProgressSummary();

  }


  if (!summary) {

    return;

  }


  const completedBooks =
    summary.completedBooks ??
    summary.books ??
    0;


  const completedLessons =
    summary.completedLessons ??
    summary.lessons ??
    0;


  const completedActivities =
    summary.completedActivities ??
    summary.activities ??
    0;


  const completedKanji =
    summary.completedKanji ??
    summary.kanji ??
    0;


  const totalBooks =
    summary.totalBooks ??
    4;


  const totalLessons =
    summary.totalLessons ??
    72;


  const totalActivities =
    summary.totalActivities ??
    288;


  const totalKanji =
    summary.totalKanji ??
    644;


  const overallPercentage =
    summary.overallPercentage ??
    0;


  const booksElement =
    document.querySelector(
      "[data-dashboard-books]"
    );


  const lessonsElement =
    document.querySelector(
      "[data-dashboard-lessons]"
    );


  const activitiesElement =
    document.querySelector(
      "[data-dashboard-activities]"
    );


  const kanjiElement =
    document.querySelector(
      "[data-dashboard-kanji]"
    );


  const overallElement =
    document.querySelector(
      "[data-progress-overall]"
    );


  const progressBar =
    document.querySelector(
      "[data-progress-bar]"
    );


  if (booksElement) {

    booksElement.textContent =
      `${completedBooks} / ${totalBooks}`;

  }


  if (lessonsElement) {

    lessonsElement.textContent =
      `${completedLessons} / ${totalLessons}`;

  }


  if (activitiesElement) {

    activitiesElement.textContent =
      `${completedActivities} / ${totalActivities}`;

  }


  if (kanjiElement) {

    kanjiElement.textContent =
      `${completedKanji} / ${totalKanji}`;

  }


  if (overallElement) {

    overallElement.textContent =
      `${overallPercentage}%`;

  }


  if (progressBar) {

    progressBar.style.width =
      `${overallPercentage}%`;

  }

}


/* =========================================================
   BOOKS
========================================================= */

function renderBooks() {

  const container =
    document.querySelector(
      "#book-list"
    );


  if (!container) {

    return;

  }


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


  container.innerHTML =
    books
      .map(
        (
          book,
          index
        ) =>
          renderBookCard(
            book,
            index
          )
      )
      .join("");


  container
    .querySelectorAll(
      "[data-book-index]"
    )
    .forEach(
      (
        button
      ) => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button.dataset.bookIndex
              );


            if (
              Number.isNaN(
                index
              )
            ) {

              return;

            }


            const book =
              books[index];


            if (book) {

              openBook(
                book
              );

            }

          }
        );

      }
    );

}


/* =========================================================
   BOOK CARD
========================================================= */

function renderBookCard(
  book,
  index
) {

  const title =
    book.title ||
    book.name ||
    book.bookTitle ||
    `Book ${index + 1}`;


  const description =
    book.description ||
    book.subtitle ||
    book.level ||
    "";


  const lessonCount =
    findLessonsForBook(
      book
    ).length;


  return `

    <button
      type="button"
      class="book-card-button"
      data-book-index="${index}"
    >

      <div class="book-card">

        <div class="book-card-icon">
          📘
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

          <div class="book-card-meta">

            <span>
              📖 ${lessonCount} lessons
            </span>

          </div>

        </div>

      </div>

    </button>

  `;

}


/* =========================================================
   BOOK DETAIL
========================================================= */

function openBook(
  book
) {

  const main =
    document.querySelector(
      ".app-main"
    );


  if (!main) {

    return;

  }


  const title =
    book.title ||
    book.name ||
    book.bookTitle ||
    "IRODORI Book";


  const bookLessons =
    findLessonsForBook(
      book
    ).sort(
      compareLessons
    );


  main.innerHTML = `

    <section class="book-view">

      <div class="book-detail">

        <button
          type="button"
          class="back-button"
          id="back-to-dashboard"
        >
          ← Back to Books
        </button>


        <div class="book-detail-card">

          <div class="book-detail-icon">
            📘
          </div>

          <div>

            <h2>
              ${escapeHtml(title)}
            </h2>

            <p>
              ${bookLessons.length}
              lessons
            </p>

          </div>

        </div>


        <div class="section-heading">

          <h2>
            Lessons
          </h2>

          <p>
            Select a lesson to continue.
          </p>

        </div>


        ${
          bookLessons.length
            ? `
              <div class="lesson-grid">

                ${bookLessons
                  .map(
                    (
                      lesson,
                      index
                    ) =>
                      renderLessonCard(
                        lesson,
                        book,
                        index
                      )
                  )
                  .join("")}

              </div>
            `
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

    </section>

  `;


  document
    .querySelector(
      "#back-to-dashboard"
    )
    ?.addEventListener(
      "click",
      () =>
        renderDashboard()
    );


  main
    .querySelectorAll(
      "[data-lesson-index]"
    )
    .forEach(
      (
        button
      ) => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button.dataset.lessonIndex
              );


            if (
              Number.isNaN(
                index
              )
            ) {

              return;

            }


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

      }
    );

}


/* =========================================================
   LESSON CARD
========================================================= */

function renderLessonCard(
  lesson,
  book,
  index
) {

  const lessonNumber =
    getLessonNumber(
      lesson
    );


  const lessonId =
    getLessonId(
      lesson
    );


  const title =
    lesson.title ||
    lesson.name ||
    lesson.lessonTitle ||
    `Lesson ${lessonNumber}`;


  const lessonCanDos =
    findCanDosForLesson(
      lesson,
      book
    );


  const audioCount =
    getMainAudioRecordsForLesson(
      lesson,
      book
    ).length;


  const completed =
    isLessonComplete(
      lessonId
    );


  return `

    <button
      type="button"
      class="lesson-card-button"
      data-lesson-index="${index}"
    >

      <article class="lesson-card">

        <div class="lesson-card-number">
          ${escapeHtml(
            String(
              lessonNumber
            )
          )}
        </div>

        <div class="lesson-card-content">

          <h3>
            ${escapeHtml(title)}
          </h3>

          <div class="lesson-card-meta">

            <span>
              🎯 ${lessonCanDos.length}
              activities
            </span>

            <span>
              🔊 ${audioCount}
              audio
            </span>

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

      </article>

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
    document.querySelector(
      ".app-main"
    );


  if (!main) {

    return;

  }


  const lessonNumber =
    getLessonNumber(
      lesson
    );


  const lessonId =
    getLessonId(
      lesson
    );


  const title =
    lesson.title ||
    lesson.name ||
    lesson.lessonTitle ||
    `Lesson ${lessonNumber}`;


  const lessonCanDos =
    findCanDosForLesson(
      lesson,
      book
    );


  const audioRecords =
    getMainAudioRecordsForLesson(
      lesson,
      book
    );


  const completed =
    isLessonComplete(
      lessonId
    );


  const attemptCount =
    getLessonAttemptCount(
      lessonId
    );


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
            Lesson
            ${escapeHtml(
              String(
                lessonNumber
              )
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
                ${lessonCanDos.length}
                verified activity
                ${
                  lessonCanDos.length === 1
                    ? ""
                    : " records"
                }
              </p>

            </div>

          </button>


          <div class="learning-module pending-card">

            <div class="module-icon">
              📚
            </div>

            <div class="module-content">

              <h3>
                Vocabulary
              </h3>

              <p>
                Pending — source integration
              </p>

            </div>

          </div>


          <button
            type="button"
            class="learning-module"
            id="module-main-audio"
          >

            <div class="module-icon">
              🔊
            </div>

            <div class="module-content">

              <h3>
                Main Lesson Audio
              </h3>

              <p>
                ${
                  audioRecords.length
                }
                verified audio record
                ${
                  audioRecords.length === 1
                    ? ""
                    : "s"
                }
              </p>

            </div>

          </button>


          <button
            type="button"
            class="learning-module"
            id="module-wordlist-audio"
          >

            <div class="module-icon">
              📖
            </div>

            <div class="module-content">

              <h3>
                Word-list Audio
              </h3>

              <p>
                ${
                  getWordlistAudioRecordsForLesson(
                    lesson,
                    book
                  ).length
                }
                verified audio record
                ${
                  getWordlistAudioRecordsForLesson(
                    lesson,
                    book
                  ).length === 1
                    ? ""
                    : "s"
                }
              </p>

            </div>

          </button>


          <button
            type="button"
            class="learning-module"
            id="module-grammar-audio"
          >

            <div class="module-icon">
              🎧
            </div>

            <div class="module-content">

              <h3>
                Grammar Worksheet Audio
              </h3>

              <p>
                ${
                  getGrammarAudioRecordsForLesson(
                    lesson,
                    book
                  ).length
                }
                verified audio record
                ${
                  getGrammarAudioRecordsForLesson(
                    lesson,
                    book
                  ).length === 1
                    ? ""
                    : "s"
                }
              </p>

            </div>

          </button>


          <div class="learning-module pending-card">

            <div class="module-icon">
              ✍️
            </div>

            <div class="module-content">

              <h3>
                Practice
              </h3>

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
            ${
              lessonId
                ? ""
                : "disabled"
            }
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

                  <h2>
                    Can-do / Activities
                  </h2>

                </div>


                <div class="can-do-list">

                  ${lessonCanDos
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
    .querySelector(
      "#back-to-book"
    )
    ?.addEventListener(
      "click",
      () =>
        openBook(book)
    );


  document
    .querySelector(
      "#module-can-do"
    )
    ?.addEventListener(
      "click",
      () => {

        if (
          lessonCanDos.length
        ) {

          openActivity(
            lessonCanDos[0],
            lesson,
            book
          );

        }

      }
    );


  document
    .querySelector(
      "#module-main-audio"
    )
    ?.addEventListener(
      "click",
      () =>
        openMainLessonAudio(
          lesson,
          book
        )
    );

  document
    .querySelector(
      "#module-wordlist-audio"
    )
    ?.addEventListener(
      "click",
      () =>
        openWordlistLessonAudio(
          lesson,
          book
        )
    );


  document
    .querySelector(
      "#module-grammar-audio"
    )
    ?.addEventListener(
      "click",
      () =>
        openGrammarLessonAudio(
          lesson,
          book
        )
    );


  document
    .querySelector(
      "#lesson-complete-button"
    )
    ?.addEventListener(
      "click",
      () => {

        if (
          lessonId &&
          window.IrodoriProgress
        ) {

          if (
            typeof window.IrodoriProgress
              .markLessonComplete ===
            "function"
          ) {

            window.IrodoriProgress
              .markLessonComplete(
                lessonId
              );

          }

        }


        openLesson(
          lesson,
          book
        );

      }
    );


  main
    .querySelectorAll(
      "[data-activity-id]"
    )
    .forEach(
      (
        button
      ) => {

        button.addEventListener(
          "click",
          () => {

            const activityId =
              button.dataset.activityId;


            const activity =
              lessonCanDos.find(
                (
                  item
                ) =>
                  String(
                    getActivityId(
                      item
                    )
                  ) ===
                  String(
                    activityId
                  )
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

      }
    );

}


/* =========================================================
   AUDIO DATA HELPERS
========================================================= */

function flattenAudioBooks(
  data
) {

  if (
    Array.isArray(data)
  ) {

    return data;

  }

  if (
    Array.isArray(data?.records)
  ) {

    return data.records;

  }

  if (
    Array.isArray(data?.books)
  ) {

    return data.books.flatMap(
      (book) =>
        Array.isArray(
          book?.records
        )
          ? book.records.map(
              (record) => ({
                ...record,
                book:
                  record?.book ||
                  book?.book,
                book_code:
                  record?.book_code ||
                  book?.book_code
              })
            )
          : []
    );

  }

  return [];

}


function getBookCodeForKey(
  bookKey
) {

  const codes = {
    starter: "X",
    "elementary-1": "Y",
    "elementary-2": "Z",
    "pre-intermediate": "ZZ"
  };

  return codes[bookKey] || "";

}


function getAudioRecordsForLesson(
  records,
  lesson,
  book
) {

  const lessonNumber =
    getLessonNumber(
      lesson
    );

  const bookKey =
    getBookKey(
      book
    );

  const bookCode =
    getBookCodeForKey(
      bookKey
    );

  if (
    !bookCode
  ) {

    return [];

  }

  return records
    .filter(
      (record) => {

        if (
          !record ||
          !record.audio_url
        ) {

          return false;

        }

        const recordCode =
          String(
            record.book_code ||
            ""
          ).trim().toUpperCase();

        if (
          recordCode !==
          bookCode
        ) {

          return false;

        }

        const recordLesson =
          Number(
            record.lesson
          );

        return (
          Number.isFinite(
            recordLesson
          ) &&
          recordLesson ===
            Number(
              lessonNumber
            )
        );

      }
    )
    .sort(
      (a, b) =>
        Number(
          a.audio_index ??
          0
        ) -
        Number(
          b.audio_index ??
          0
        )
    );

}


function getWordlistAudioRecordsForLesson(
  lesson,
  book
) {

  return getAudioRecordsForLesson(
    wordlistAudioRecords,
    lesson,
    book
  );

}


function getGrammarAudioRecordsForLesson(
  lesson,
  book
) {

  return getAudioRecordsForLesson(
    grammarAudioRecords,
    lesson,
    book
  );

}


function renderAudioRecordCard(
  record,
  index,
  familyLabel
) {

  const filename =
    record?.filename ||
    `Audio ${index + 1}`;

  const audioUrl =
    record?.audio_url ||
    "";

  const sourcePage =
    record?.source_page ||
    "";

  return `
    <article class="can-do-card">

      <div class="can-do-card-header">

        <div>

          <span class="can-do-number">
            ${escapeHtml(
              String(
                index + 1
              )
            )}
          </span>

          <strong>
            ${escapeHtml(
              filename
            )}
          </strong>

        </div>

        <span class="status-badge">
          ${escapeHtml(
            record?.status ||
            "VERIFIED"
          )}
        </span>

      </div>

      <p>
        ${escapeHtml(
          familyLabel
        )}
        — official audio
      </p>

      ${
        audioUrl
          ? `
            <audio
              controls
              preload="none"
              src="${escapeHtml(
                audioUrl
              )}"
            >
              Your browser does not support
              HTML audio playback.
            </audio>
          `
          : `
            <p class="pending-text">
              Direct MP3 URL not verified.
            </p>
          `
      }

      ${
        sourcePage
          ? `
            <p>
              <a
                href="${escapeHtml(
                  sourcePage
                )}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Official IRODORI Source ↗
              </a>
            </p>
          `
          : ""
      }

    </article>
  `;

}


function renderPendingAudioCard(
  familyLabel,
  metadata
) {

  return `
    <article class="can-do-card pending-card">

      <div class="can-do-card-header">

        <strong>
          ${escapeHtml(
            familyLabel
          )}
        </strong>

      </div>

      <p class="pending-text">
        ${escapeHtml(
          metadata?.pre_intermediate_status ||
          "PENDING — SOURCE VERIFICATION REQUIRED"
        )}
      </p>

    </article>
  `;

}


/* =========================================================
   OPEN WORD-LIST AUDIO
========================================================= */

function openWordlistLessonAudio(
  lesson,
  book
) {

  const main =
    document.querySelector(
      ".app-main"
    );

  if (!main) {

    return;

  }

  const records =
    getWordlistAudioRecordsForLesson(
      lesson,
      book
    );

  const lessonNumber =
    getLessonNumber(
      lesson
    );

  const title =
    lesson.title ||
    lesson.name ||
    lesson.lessonTitle ||
    `Lesson ${lessonNumber}`;

  const bookKey =
    getBookKey(
      book
    );

  const pending =
    bookKey ===
    "pre-intermediate";

  main.innerHTML = `

    <section class="lesson-view">

      <div class="lesson-detail">

        <button
          type="button"
          class="back-button"
          id="back-to-lesson-from-wordlist-audio"
        >
          ← Back to Lesson
        </button>

        <div class="lesson-detail-card">

          <h2>
            📖 Word-list Audio
          </h2>

          <p>
            ${escapeHtml(title)}
            —
            Lesson
            ${escapeHtml(
              String(
                lessonNumber
              )
            )}
          </p>

        </div>

        <div class="can-do-section">

          <div class="section-heading">

            <h2>
              Word-list Audio Files
            </h2>

            <p>
              ${
                pending
                  ? "Pre-Intermediate source verification is pending."
                  : `${records.length} verified official audio record${records.length === 1 ? "" : "s"}`
              }
            </p>

          </div>

          ${
            pending
              ? renderPendingAudioCard(
                  "Pre-Intermediate Word-list Audio",
                  wordlistAudioMetadata
                )
              : records.length
                ? `
                  <div class="can-do-list">
                    ${records
                      .map(
                        (
                          record,
                          index
                        ) =>
                          renderAudioRecordCard(
                            record,
                            index,
                            "Word-list Audio"
                          )
                      )
                      .join("")}
                  </div>
                `
                : `
                  <article class="can-do-card pending-card">

                    <p class="pending-text">
                      No verified Word-list Audio records
                      were found for this lesson.
                    </p>

                  </article>
                `
          }

        </div>

      </div>

    </section>

  `;

  document
    .querySelector(
      "#back-to-lesson-from-wordlist-audio"
    )
    ?.addEventListener(
      "click",
      () =>
        openLesson(
          lesson,
          book
        )
    );

}


/* =========================================================
   OPEN GRAMMAR WORKSHEET AUDIO
========================================================= */

function openGrammarLessonAudio(
  lesson,
  book
) {

  const main =
    document.querySelector(
      ".app-main"
    );

  if (!main) {

    return;

  }

  const records =
    getGrammarAudioRecordsForLesson(
      lesson,
      book
    );

  const lessonNumber =
    getLessonNumber(
      lesson
    );

  const title =
    lesson.title ||
    lesson.name ||
    lesson.lessonTitle ||
    `Lesson ${lessonNumber}`;

  const bookKey =
    getBookKey(
      book
    );

  const pending =
    bookKey ===
    "pre-intermediate";

  main.innerHTML = `

    <section class="lesson-view">

      <div class="lesson-detail">

        <button
          type="button"
          class="back-button"
          id="back-to-lesson-from-grammar-audio"
        >
          ← Back to Lesson
        </button>

        <div class="lesson-detail-card">

          <h2>
            🎧 Grammar Worksheet Audio
          </h2>

          <p>
            ${escapeHtml(title)}
            —
            Lesson
            ${escapeHtml(
              String(
                lessonNumber
              )
            )}
          </p>

        </div>

        <div class="can-do-section">

          <div class="section-heading">

            <h2>
              Grammar Worksheet Audio Files
            </h2>

            <p>
              ${
                pending
                  ? "Pre-Intermediate source verification is pending."
                  : `${records.length} verified official audio record${records.length === 1 ? "" : "s"}`
              }
            </p>

          </div>

          ${
            pending
              ? renderPendingAudioCard(
                  "Pre-Intermediate Grammar Worksheet Audio",
                  grammarAudioMetadata
                )
              : records.length
                ? `
                  <div class="can-do-list">
                    ${records
                      .map(
                        (
                          record,
                          index
                        ) =>
                          renderAudioRecordCard(
                            record,
                            index,
                            "Grammar Worksheet Audio"
                          )
                      )
                      .join("")}
                  </div>
                `
                : `
                  <article class="can-do-card pending-card">

                    <p class="pending-text">
                      No verified Grammar Worksheet Audio
                      records were found for this lesson.
                    </p>

                  </article>
                `
          }

        </div>

      </div>

    </section>

  `;

  document
    .querySelector(
      "#back-to-lesson-from-grammar-audio"
    )
    ?.addEventListener(
      "click",
      () =>
        openLesson(
          lesson,
          book
        )
    );

}


/* =========================================================
   MAIN LESSON AUDIO
========================================================= */

function getMainAudioRecordsForLesson(
  lesson,
  book
) {

  const lessonNumber =
    getLessonNumber(lesson);

  const lessonId =
    getLessonId(lesson);

  const bookKey =
    getBookKey(book);

  return mainAudioRecords
    .filter((record) => {

      if (
        !record ||
        !record.url
      ) {
        return false;
      }

      const recordBookId =
        record.bookId == null
          ? ""
          : String(record.bookId).trim();

      const recordBookKey =
        getBookKey({
          bookId: recordBookId
        });

      if (
        !recordBookId ||
        !bookKey ||
        recordBookKey !== bookKey
      ) {
        return false;
      }

      const normalizedRecordLessonId =
        normalizeLessonId(
          record.lessonId
        );

      const normalizedLessonId =
        normalizeLessonId(
          lessonId
        );

      const lessonIdMatches =
        Boolean(
          normalizedRecordLessonId &&
          normalizedLessonId &&
          normalizedRecordLessonId ===
            normalizedLessonId
        );

      const recordLessonNumber =
        record.lessonNumber == null
          ? ""
          : String(record.lessonNumber).trim();

      const lessonNumberMatches =
        Boolean(
          recordLessonNumber &&
          String(lessonNumber) !== "?" &&
          recordLessonNumber ===
            String(lessonNumber)
        );

      return (
        lessonIdMatches ||
        lessonNumberMatches
      );

    })
    .sort(
      (a, b) =>
        Number(
          a.index ??
          a.order ??
          0
        ) -
        Number(
          b.index ??
          b.order ??
          0
        )
    );

}


/* =========================================================
   OPEN MAIN LESSON AUDIO
========================================================= */

function openMainLessonAudio(
  lesson,
  book
) {

  const main =
    document.querySelector(
      ".app-main"
    );


  if (!main) {

    return;

  }


  const records =
    getMainAudioRecordsForLesson(
      lesson,
      book
    );


  const lessonNumber =
    getLessonNumber(
      lesson
    );


  const title =
    lesson.title ||
    lesson.name ||
    lesson.lessonTitle ||
    `Lesson ${lessonNumber}`;


  main.innerHTML = `

    <section class="lesson-view">

      <div class="lesson-detail">

        <button
          type="button"
          class="back-button"
          id="back-to-lesson-from-audio"
        >
          ← Back to Lesson
        </button>


        <div class="lesson-detail-card">

          <h2>
            🎧 Main Lesson Audio
          </h2>

          <p>
            ${escapeHtml(title)}
            —
            Lesson
            ${escapeHtml(
              String(
                lessonNumber
              )
            )}
          </p>

        </div>


        <div class="can-do-section">

          <div class="section-heading">

            <h2>
              Audio Files
            </h2>

            <p>
              Verified official audio records
            </p>

          </div>


          ${
            records.length
              ? `

                <div
                  class="can-do-list"
                >

                  ${records
                    .map(
                      (
                        record,
                        index
                      ) =>
                        renderAudioRecord(
                          record,
                          index
                        )
                    )
                    .join("")}

                </div>

              `
              : `

                <div class="pending-card">

                  <h3>
                    No verified audio records available
                  </h3>

                  <p class="pending-text">

                    This lesson has no direct MP3
                    records in audio-main.json yet.

                  </p>

                </div>

              `
          }

        </div>

      </div>

    </section>

  `;


  document
    .querySelector(
      "#back-to-lesson-from-audio"
    )
    ?.addEventListener(
      "click",
      () =>
        openLesson(
          lesson,
          book
        )
    );

}


/* =========================================================
   AUDIO RECORD CARD
========================================================= */

function renderAudioRecord(
  record,
  index
) {

  const filename =
    record.filename ||
    record.name ||
    `Audio ${index + 1}`;


  const url =
    String(
      record.url ||
      ""
    );


  const sourcePage =
    record.sourcePage ||
    "";


  const number =
    String(
      record.index ||
      record.order ||
      index + 1
    ).padStart(
      2,
      "0"
    );


  return `

    <article
      class="can-do-card audio-record-card"
    >

      <div class="can-do-card-content">

        <h3>

          ${escapeHtml(number)}.

          ${escapeHtml(filename)}

        </h3>


        <audio
          class="irodori-audio-player"
          controls
          preload="none"
          src="${escapeHtml(url)}"
        >

          Your browser does not support
          the audio element.

        </audio>


        ${
          sourcePage
            ? `

              <p
                class="audio-source-note"
              >
                Official source verified.
              </p>

            `
            : ""
        }

      </div>

    </article>

  `;

}


/* =========================================================
   CAN-DO CARD
========================================================= */

function renderCanDoCard(
  activity
) {

  const activityId =
    getActivityId(
      activity
    );


  const title =
    activity.title ||
    activity.name ||
    activity.canDo ||
    activity.label ||
    "Activity";


  const completed =
    isActivityComplete(
      activityId
    );


  return `

    <button
      type="button"
      class="can-do-card-button"
      data-activity-id="${
        activityId
          ? escapeHtml(
              activityId
            )
          : ""
      }"
      ${
        activityId
          ? ""
          : "disabled"
      }
    >

      <article class="can-do-card">

        <div class="can-do-card-content">

          <div
            class="can-do-status"
          >
            ${
              completed
                ? "✓ Completed"
                : "○ Not completed"
            }
          </div>

          <h3>
            ${escapeHtml(title)}
          </h3>


          ${
            activity.description ||
            activity.details ||
            activity.content
              ? `
                <p>
                  ${escapeHtml(
                    activity.description ||
                    activity.details ||
                    activity.content
                  )}
                </p>
              `
              : ""
          }

        </div>

      </article>

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
    document.querySelector(
      ".app-main"
    );


  if (!main) {

    return;

  }


  const activityId =
    getActivityId(
      activity
    );


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


  const lessonId =
    activity.lessonId ||
    "";


  const lessonNumber =
    activity.lessonNumber ??
    "";


  const completed =
    isActivityComplete(
      activityId
    );


  const attempts =
    getActivityAttempts(
      activityId
    );


  main.innerHTML = `

    <section class="lesson-view">

      <div class="lesson-detail">

        <button
          type="button"
          class="back-button"
          id="back-to-lesson-from-activity"
        >
          ← Back to Lesson
        </button>


        <div class="lesson-detail-card">

          <h2>
            ${escapeHtml(title)}
          </h2>

          <p>
            Activity
          </p>

        </div>


        <div class="can-do-section">

          ${
            description
              ? `
                <div class="can-do-card">

                  <div class="can-do-card-content">

                    <h3>
                      Description
                    </h3>

                    <p>
                      ${escapeHtml(
                        description
                      )}
                    </p>

                  </div>

                </div>
              `
              : ""
          }


          ${
            japanese
              ? `
                <div class="can-do-card">

                  <div class="can-do-card-content">

                    <h3>
                      Japanese
                    </h3>

                    <p>
                      ${escapeHtml(
                        japanese
                      )}
                    </p>

                  </div>

                </div>
              `
              : ""
          }


          ${
            english
              ? `
                <div class="can-do-card">

                  <div class="can-do-card-content">

                    <h3>
                      English
                    </h3>

                    <p>
                      ${escapeHtml(
                        english
                      )}
                    </p>

                  </div>

                </div>
              `
              : ""
          }


          ${
            sinhala
              ? `
                <div class="can-do-card">

                  <div class="can-do-card-content">

                    <h3>
                      Sinhala
                    </h3>

                    <p>
                      ${escapeHtml(
                        sinhala
                      )}
                    </p>

                  </div>

                </div>
              `
              : ""
          }


          ${
            lessonId ||
            lessonNumber
              ? `
                <div class="can-do-card">

                  <div class="can-do-card-content">

                    <h3>
                      Source Relationship
                    </h3>

                    ${
                      lessonId
                        ? `
                          <p>
                            Lesson ID:
                            ${escapeHtml(
                              lessonId
                            )}
                          </p>
                        `
                        : ""
                    }

                    ${
                      lessonNumber
                        ? `
                          <p>
                            Lesson Number:
                            ${escapeHtml(
                              String(
                                lessonNumber
                              )
                            )}
                          </p>
                        `
                        : ""
                    }

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
                    ? "Activity Completed"
                    : "Activity Practice"
                }
              </h3>

              <p>

                ${
                  completed
                    ? "You can practice this activity again at any time."
                    : "Complete this activity when you finish practicing."
                }

              </p>


              ${
                attempts.length
                  ? `
                    <p>

                      <strong>
                        Practice attempts:
                      </strong>

                      ${attempts.length}

                    </p>
                  `
                  : ""
              }

            </div>


            <button
              type="button"
              class="completion-button"
              id="activity-complete-button"
              ${
                activityId
                  ? ""
                  : "disabled"
              }
            >

              ${
                completed
                  ? "✓ Completed — Practice Again"
                  : "Mark Activity Complete"
              }

            </button>

          </div>


          ${
            attempts.length
              ? `

                <div class="attempt-history">

                  <div class="section-heading">

                    <h3>
                      Practice History
                    </h3>

                  </div>


                  <div class="attempt-history-list">

                    ${attempts
                      .map(
                        (
                          attempt,
                          index
                        ) => `

                          <div
                            class="attempt-history-item"
                          >

                            <strong>
                              Attempt
                              ${index + 1}
                            </strong>

                            <span>
                              ${formatAttemptDate(
                                attempt.timestamp ||
                                attempt.date ||
                                attempt.createdAt
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

        </div>

      </div>

    </section>

  `;


  document
    .querySelector(
      "#back-to-lesson-from-activity"
    )
    ?.addEventListener(
      "click",
      () =>
        openLesson(
          lesson,
          book
        )
    );


  document
    .querySelector(
      "#activity-complete-button"
    )
    ?.addEventListener(
      "click",
      () => {

        if (
          activityId &&
          window.IrodoriProgress
        ) {

          if (
            typeof window.IrodoriProgress
              .markActivityComplete ===
            "function"
          ) {

            window.IrodoriProgress
              .markActivityComplete(
                activityId
              );

          }

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
   MAIN AUDIO VALIDATION
========================================================= */

function validateMainAudioDataset() {

  const expectedByBook = {
    starter: 465,
    "elementary-1": 326,
    "elementary-2": 338,
    "pre-intermediate": 251
  };

  const actualByBook = {
    starter: 0,
    "elementary-1": 0,
    "elementary-2": 0,
    "pre-intermediate": 0
  };

  mainAudioRecords.forEach((record) => {

    const key =
      getBookKey({
        bookId:
          record?.bookId
      });

    if (
      Object.prototype.hasOwnProperty.call(
        actualByBook,
        key
      )
    ) {
      actualByBook[key] += 1;
    }

  });

  const total =
    mainAudioRecords.length;

  const expectedTotal =
    Object.values(
      expectedByBook
    ).reduce(
      (sum, value) =>
        sum + value,
      0
    );

  const mismatches =
    Object.keys(
      expectedByBook
    ).filter(
      (key) =>
        actualByBook[key] !==
        expectedByBook[key]
    );

  if (
    total !== expectedTotal ||
    mismatches.length
  ) {

    console.warn(
      "IRODORI Main Audio validation mismatch.",
      {
        expectedTotal,
        actualTotal: total,
        expectedByBook,
        actualByBook
      }
    );

  } else {

    console.info(
      "IRODORI Main Audio validation passed.",
      {
        total,
        byBook: actualByBook
      }
    );

  }

}


/* =========================================================
   WORD-LIST AUDIO VALIDATION
========================================================= */

function validateWordlistAudioDataset() {

  const expectedByBook = {
    starter: 79,
    "elementary-1": 67,
    "elementary-2": 77,
    "pre-intermediate": 0
  };

  const actualByBook = {
    starter: 0,
    "elementary-1": 0,
    "elementary-2": 0,
    "pre-intermediate": 0
  };

  wordlistAudioRecords.forEach(
    (record) => {

      const key =
        getBookKey({
          bookId:
            record?.book ||
            record?.book_code
        });

      if (
        Object.prototype.hasOwnProperty.call(
          actualByBook,
          key
        )
      ) {

        actualByBook[key] += 1;

      }

    }
  );

  const total =
    wordlistAudioRecords.length;

  const expectedTotal =
    223;

  const mismatches =
    Object.keys(
      expectedByBook
    ).filter(
      (key) =>
        actualByBook[key] !==
        expectedByBook[key]
    );

  if (
    total !== expectedTotal ||
    mismatches.length
  ) {

    console.warn(
      "IRODORI Word-list Audio validation mismatch.",
      {
        expectedTotal,
        actualTotal: total,
        expectedByBook,
        actualByBook
      }
    );

  } else {

    console.info(
      "IRODORI Word-list Audio validation passed.",
      {
        total,
        byBook: actualByBook
      }
    );

  }

}


/* =========================================================
   GRAMMAR WORKSHEET AUDIO VALIDATION
========================================================= */

function validateGrammarAudioDataset() {

  const expectedByBook = {
    starter: 79,
    "elementary-1": 90,
    "elementary-2": 89,
    "pre-intermediate": 0
  };

  const actualByBook = {
    starter: 0,
    "elementary-1": 0,
    "elementary-2": 0,
    "pre-intermediate": 0
  };

  grammarAudioRecords.forEach(
    (record) => {

      const key =
        getBookKey({
          bookId:
            record?.book ||
            record?.book_code
        });

      if (
        Object.prototype.hasOwnProperty.call(
          actualByBook,
          key
        )
      ) {

        actualByBook[key] += 1;

      }

    }
  );

  const total =
    grammarAudioRecords.length;

  const expectedTotal =
    258;

  const mismatches =
    Object.keys(
      expectedByBook
    ).filter(
      (key) =>
        actualByBook[key] !==
        expectedByBook[key]
    );

  if (
    total !== expectedTotal ||
    mismatches.length
  ) {

    console.warn(
      "IRODORI Grammar Worksheet Audio validation mismatch.",
      {
        expectedTotal,
        actualTotal: total,
        expectedByBook,
        actualByBook
      }
    );

  } else {

    console.info(
      "IRODORI Grammar Worksheet Audio validation passed.",
      {
        total,
        byBook: actualByBook
      }
    );

  }

}


/* =========================================================
   NORMALIZE LESSON ID
========================================================= */

function normalizeLessonId(
  value
) {

  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return "";
  }

  const raw =
    String(value)
      .trim()
      .toLowerCase()
      .replace(
        /_/g,
        "-"
      );

  const match =
    raw.match(
      /^(starter|s|elementary-?0?1|elementary-?1|e1|elementary-?0?2|elementary-?2|e2|pre-?intermediate|pi)[- ]?l?(\d{1,2})$/
    );

  if (!match) {
    return raw;
  }

  const bookToken =
    match[1];

  const number =
    String(
      Number(
        match[2]
      )
    ).padStart(
      2,
      "0"
    );

  let bookKey = "";

  if (
    bookToken === "starter" ||
    bookToken === "s"
  ) {
    bookKey = "starter";
  } else if (
    bookToken === "e1" ||
    bookToken.includes("1")
  ) {
    bookKey = "elementary-1";
  } else if (
    bookToken === "e2" ||
    bookToken.includes("2")
  ) {
    bookKey = "elementary-2";
  } else if (
    bookToken === "pi" ||
    bookToken.startsWith("pre")
  ) {
    bookKey = "pre-intermediate";
  }

  return bookKey
    ? `${bookKey}-L${number}`
    : raw;
}


/* =========================================================
   BOOK KEY
========================================================= */

function getBookKey(
  book
) {

  if (
    !book ||
    typeof book !==
      "object"
  ) {

    return "";

  }


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


  for (
    const candidate
    of candidates
  ) {

    if (
      candidate ===
        undefined ||
      candidate ===
        null
    ) {

      continue;

    }


    const normalized =
      normalizeBookKey(
        candidate
      );


    if (
      BOOK_KEY_ALIASES[
        normalized
      ]
    ) {

      return BOOK_KEY_ALIASES[
        normalized
      ];

    }


    const compact =
      normalized.replace(
        /[-_]/g,
        ""
      );


    if (
      BOOK_KEY_ALIASES[
        compact
      ]
    ) {

      return BOOK_KEY_ALIASES[
        compact
      ];

    }

  }


  return "";

}


/* =========================================================
   NORMALIZE BOOK KEY
========================================================= */

function normalizeBookKey(
  value
) {

  return String(
    value
  )
    .trim()
    .toLowerCase()
    .replace(
      /[\s_]+/g,
      "-"
    );

}


/* =========================================================
   LESSON MATCHING
========================================================= */

function findLessonsForBook(
  book
) {

  const rawBookId =
    book?.bookId ??
    book?.id ??
    "";


  const normalizedBookKey =
    getBookKey(
      book
    );


  return lessons.filter(
    (
      lesson
    ) => {

      const lessonBookId =
        lesson?.bookId ??
        lesson?.book ??
        lesson?.bookCode ??
        "";


      if (!lessonBookId) {

        return false;

      }


      /*
       * PRIMARY MATCH:
       * exact official book ID.
       */

      if (
        String(
          lessonBookId
        ).trim() ===
        String(
          rawBookId
        ).trim()
      ) {

        return true;

      }


      /*
       * SECONDARY MATCH:
       * normalized master key.
       */

      const lessonKey =
        getBookKey(
          {
            bookId:
              lessonBookId
          }
        );


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
    getBookKey(
      book
    );


  const records =
    canDos[
      bookKey
    ] || [];


  const lessonId =
    getLessonId(
      lesson
    );


  const lessonNumber =
    getLessonNumber(
      lesson
    );


  return records.filter(
    (
      record
    ) => {

      /*
       * Explicit lesson ID match.
       */

      if (
        record.lessonId !==
          undefined &&
        lessonId !==
          null &&
        String(
          record.lessonId
        ) ===
        String(
          lessonId
        )
      ) {

        return true;

      }


      /*
       * Explicit lesson number match.
       */

      if (
        record.lessonNumber !==
          undefined &&
        lessonNumber !==
          undefined &&
        String(
          record.lessonNumber
        ) ===
        String(
          lessonNumber
        )
      ) {

        return true;

      }


      return false;

    }
  );

}


/* =========================================================
   LESSON ID
========================================================= */

function getLessonId(
  lesson
) {

  if (
    !lesson ||
    typeof lesson !==
      "object"
  ) {

    return null;

  }


  /*
   * Official dataset uses lessonId.
   */

  if (
    lesson.lessonId !==
      undefined &&
    lesson.lessonId !==
      null &&
    String(
      lesson.lessonId
    ).trim()
  ) {

    return String(
      lesson.lessonId
    ).trim();

  }


  /*
   * Safe fallback only when
   * enough identity exists.
   */

  const bookId =
    lesson.bookId;


  const lessonNumber =
    lesson.lessonNumber ??
    lesson.number ??
    lesson.lessonNo;


  if (
    !bookId ||
    lessonNumber ===
      undefined ||
    lessonNumber ===
      null
  ) {

    return null;

  }


  return `${String(
    bookId
  ).trim()}-L${String(
    lessonNumber
  ).padStart(
    2,
    "0"
  )}`;

}


/* =========================================================
   LESSON NUMBER
========================================================= */

function getLessonNumber(
  lesson
) {

  if (!lesson) {

    return "?";

  }


  return (
    lesson.lessonNumber ??
    lesson.number ??
    lesson.lesson ??
    lesson.lessonNo ??
    "?"
  );

}


/* =========================================================
   ACTIVITY ID
========================================================= */

function getActivityId(
  activity
) {

  if (
    !activity ||
    typeof activity !==
      "object"
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


  for (
    const candidate
    of candidates
  ) {

    if (
      candidate !==
        undefined &&
      candidate !==
        null &&
      String(
        candidate
      ).trim() !== ""
    ) {

      const id =
        String(
          candidate
        ).trim();


      if (
        !isUnsafePlaceholderId(
          id
        )
      ) {

        return id;

      }

    }

  }


  /*
   * Never use "unknown-activity".
   */

  return null;

}


/* =========================================================
   UNSAFE ID CHECK
========================================================= */

function isUnsafePlaceholderId(
  id
) {

  const blocked =
    new Set(
      [

        "unknown",
        "unknown-activity",
        "unknown-lesson",
        "unknown-kanji",
        "?",
        "undefined",
        "null",
        "nan"

      ]
    );


  return blocked.has(
    String(
      id
    )
      .trim()
      .toLowerCase()
  );

}


/* =========================================================
   PROGRESS HELPERS
========================================================= */

function isLessonComplete(
  lessonId
) {

  if (
    !lessonId ||
    !window.IrodoriProgress
  ) {

    return false;

  }


  if (
    typeof window.IrodoriProgress
      .isLessonComplete ===
    "function"
  ) {

    return window.IrodoriProgress
      .isLessonComplete(
        lessonId
      );

  }


  if (
    typeof window.IrodoriProgress
      .isComplete ===
    "function"
  ) {

    return window.IrodoriProgress
      .isComplete(
        "lesson",
        lessonId
      );

  }


  return false;

}


function isActivityComplete(
  activityId
) {

  if (
    !activityId ||
    !window.IrodoriProgress
  ) {

    return false;

  }


  if (
    typeof window.IrodoriProgress
      .isActivityComplete ===
    "function"
  ) {

    return window.IrodoriProgress
      .isActivityComplete(
        activityId
      );

  }


  if (
    typeof window.IrodoriProgress
      .isComplete ===
    "function"
  ) {

    return window.IrodoriProgress
      .isComplete(
        "activity",
        activityId
      );

  }


  return false;

}


/* =========================================================
   ATTEMPT HELPERS
========================================================= */

function getLessonAttemptCount(
  lessonId
) {

  if (
    !lessonId ||
    !window.IrodoriProgress
  ) {

    return 0;

  }


  if (
    typeof window.IrodoriProgress
      .getLessonAttemptCount ===
    "function"
  ) {

    return window.IrodoriProgress
      .getLessonAttemptCount(
        lessonId
      );

  }


  if (
    typeof window.IrodoriProgress
      .getLessonAttempts ===
    "function"
  ) {

    const attempts =
      window.IrodoriProgress
        .getLessonAttempts(
          lessonId
        );


    return Array.isArray(
      attempts
    )
      ? attempts.length
      : 0;

  }


  return 0;

}


function getActivityAttempts(
  activityId
) {

  if (
    !activityId ||
    !window.IrodoriProgress
  ) {

    return [];

  }


  if (
    typeof window.IrodoriProgress
      .getActivityAttempts ===
    "function"
  ) {

    return (
      window.IrodoriProgress
        .getActivityAttempts(
          activityId
        ) || []
    );

  }


  return [];

}


/* =========================================================
   ATTEMPT DATE
========================================================= */

function formatAttemptDate(
  value
) {

  if (!value) {

    return "Unknown date";

  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return escapeHtml(
      String(
        value
      )
    );

  }


  return escapeHtml(
    date.toLocaleString()
  );

}


/* =========================================================
   LESSON INDEX
========================================================= */

function getLessonIndex(
  book,
  lesson
) {

  const list =
    findLessonsForBook(
      book
    );


  return list.indexOf(
    lesson
  );

}


/* =========================================================
   SORT LESSONS
========================================================= */

function compareLessons(
  a,
  b
) {

  const aNumber =
    Number(
      getLessonNumber(
        a
      )
    );


  const bNumber =
    Number(
      getLessonNumber(
        b
      )
    );


  if (
    Number.isNaN(
      aNumber
    )
  ) {

    return 1;

  }


  if (
    Number.isNaN(
      bNumber
    )
  ) {

    return -1;

  }


  return (
    aNumber -
    bNumber
  );

}


/* =========================================================
   ERROR DISPLAY
========================================================= */

function showError(
  message
) {

  const main =
    document.querySelector(
      ".app-main"
    );


  if (!main) {

    return;

  }


  main.innerHTML = `

    <section class="pending-card">

      <p class="pending-text">

        ${escapeHtml(
          message
        )}

      </p>

    </section>

  `;

}


/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHtml(
  value
) {

  return String(
    value
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


/* =========================================================
   WORD-LIST AUDIO DEBUG API
========================================================= */

window.IrodoriWordlistAudio = {

  getAll: () =>
    [
      ...wordlistAudioRecords
    ],

  getForLesson:
    (
      lesson,
      book
    ) =>
      getWordlistAudioRecordsForLesson(
        lesson,
        book
      ),

  getCountForLesson:
    (
      lesson,
      book
    ) =>
      getWordlistAudioRecordsForLesson(
        lesson,
        book
      ).length,

  getTotalCount:
    () =>
      wordlistAudioRecords.length,

  getBookCounts:
    () => {

      const counts = {};

      wordlistAudioRecords.forEach(
        (record) => {

          const key =
            getBookKey({
              bookId:
                record?.book ||
                record?.book_code
            });

          counts[key] =
            (counts[key] || 0) + 1;

        }
      );

      return counts;

    },

  validate:
    () => {

      validateWordlistAudioDataset();

      return {
        total:
          wordlistAudioRecords.length,
        bookCounts:
          window.IrodoriWordlistAudio
            .getBookCounts()
      };

    }

};


/* =========================================================
   GRAMMAR WORKSHEET AUDIO DEBUG API
========================================================= */

window.IrodoriGrammarAudio = {

  getAll: () =>
    [
      ...grammarAudioRecords
    ],

  getForLesson:
    (
      lesson,
      book
    ) =>
      getGrammarAudioRecordsForLesson(
        lesson,
        book
      ),

  getCountForLesson:
    (
      lesson,
      book
    ) =>
      getGrammarAudioRecordsForLesson(
        lesson,
        book
      ).length,

  getTotalCount:
    () =>
      grammarAudioRecords.length,

  getBookCounts:
    () => {

      const counts = {};

      grammarAudioRecords.forEach(
        (record) => {

          const key =
            getBookKey({
              bookId:
                record?.book ||
                record?.book_code
            });

          counts[key] =
            (counts[key] || 0) + 1;

        }
      );

      return counts;

    },

  validate:
    () => {

      validateGrammarAudioDataset();

      return {
        total:
          grammarAudioRecords.length,
        bookCounts:
          window.IrodoriGrammarAudio
            .getBookCounts()
      };

    }

};


/* =========================================================
   MAIN AUDIO DEBUG API
========================================================= */

window.IrodoriMainAudio = {

  getAll: () =>
    [
      ...mainAudioRecords
    ],

  getForLesson:
    (
      lesson,
      book
    ) =>
      getMainAudioRecordsForLesson(
        lesson,
        book
      ),

  getCountForLesson:
    (
      lesson,
      book
    ) =>
      getMainAudioRecordsForLesson(
        lesson,
        book
      ).length,

  getTotalCount:
    () =>
      mainAudioRecords.length,

  getBookCounts:
    () => {

      const counts = {};

      mainAudioRecords.forEach(
        (record) => {

          const key =
            getBookKey({
              bookId:
                record?.bookId
            });

          counts[key] =
            (counts[key] || 0) + 1;

        }
      );

      return counts;

    },

  validate:
    () => {

      validateMainAudioDataset();

      return {
        total:
          mainAudioRecords.length,
        bookCounts:
          window.IrodoriMainAudio
            .getBookCounts()
      };

    }

};
