const BOOKS_FILE = "./data/books.json";
const LESSONS_FILE = "./data/lessons.json";


const CANDO_FILES = {

  starter:
    "./data/canDos-starter.json",

  "elementary-1":
    "./data/canDos-e1.json",

  "elementary-2":
    "./data/canDos-e2.json",

  "pre-intermediate":
    "./data/canDos-pi.json"

};



/* =========================================
   APPLICATION STATE
   ========================================= */

let booksData = [];

let lessonsData = [];

let canDosData = {};

let currentBook = null;

let currentLesson = null;

let currentActivity = null;



/* =========================================
   START APPLICATION
   ========================================= */

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);



async function initializeApp() {

  try {

    await loadBooks();

    await loadLessons();

    await loadAllCanDos();

    renderDashboard();

  }

  catch (error) {

    console.error(
      "IRODORI Master initialization failed:",
      error
    );

    showError(
      "Learning data could not be loaded."
    );

  }

}



/* =========================================
   LOAD BOOKS
   ========================================= */

async function loadBooks() {

  const response =
    await fetch(
      BOOKS_FILE
    );


  if (!response.ok) {

    throw new Error(
      `Failed to load books.json: ${response.status}`
    );

  }


  const data =
    await response.json();


  booksData =
    getArray(
      data,
      "books"
    );

}



/* =========================================
   LOAD LESSONS
   ========================================= */

async function loadLessons() {

  const response =
    await fetch(
      LESSONS_FILE
    );


  if (!response.ok) {

    throw new Error(
      `Failed to load lessons.json: ${response.status}`
    );

  }


  const data =
    await response.json();


  lessonsData =
    getArray(
      data,
      "lessons"
    );

}



/* =========================================
   LOAD ALL CAN-DO DATA
   ========================================= */

async function loadAllCanDos() {

  for (
    const [bookKey, file]
    of Object.entries(
      CANDO_FILES
    )
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
        getArray(
          data,
          "canDos"
        );

    }

    catch (error) {

      console.warn(
        `Can-do loading failed: ${file}`,
        error
      );


      canDosData[bookKey] = [];

    }

  }

}



/* =========================================
   GENERIC ARRAY READER
   ========================================= */

function getArray(
  data,
  preferredKey
) {

  if (
    Array.isArray(data)
  ) {

    return data;

  }


  if (
    data &&
    Array.isArray(
      data[preferredKey]
    )
  ) {

    return data[preferredKey];

  }


  if (
    data &&
    Array.isArray(
      data.records
    )
  ) {

    return data.records;

  }


  if (
    data &&
    Array.isArray(
      data.items
    )
  ) {

    return data.items;

  }


  return [];

}



/* =========================================
   RENDER DASHBOARD
   ========================================= */

function renderDashboard() {

  const main =
    document.querySelector(
      ".app-main"
    );


  if (!main) {

    return;

  }


  main.innerHTML = `

    <section class="welcome-card">

      <h2>
        Welcome to IRODORI Master
      </h2>

      <p>
        Learn Japanese through the official
        IRODORI learning materials.
      </p>

    </section>



    <section
      class="dashboard-section"
      aria-labelledby="dashboard-title"
    >

      <div class="section-heading">

        <div>

          <h2 id="dashboard-title">
            Dashboard
          </h2>

          <p>
            Your IRODORI learning overview
          </p>

        </div>

      </div>



      <div class="dashboard-grid">


        <!-- BOOKS -->

        <article class="dashboard-card">

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

        </article>



        <!-- LESSONS -->

        <article class="dashboard-card">

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

        </article>



        <!-- ACTIVITIES -->

        <article class="dashboard-card">

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

        </article>



        <!-- KANJI -->

        <article class="dashboard-card">

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

        </article>


      </div>



      <!-- LEARNING PROGRESS -->

      <div class="progress-card">

        <div class="progress-card-header">

          <div>

            <h3>
              Learning Progress
            </h3>

            <p>
              Your study progress will appear here.
            </p>

          </div>


          <strong data-progress-overall>
            0%
          </strong>

        </div>


        <div
          class="progress-track"
          aria-label="Learning progress"
        >

          <div
            class="progress-bar"
            data-progress-bar
            style="width: 0%;"
          ></div>

        </div>

      </div>

    </section>



    <!-- BOOKS -->

    <section
      class="books-section"
      aria-labelledby="books-title"
    >

      <div class="section-heading">

        <div>

          <h2 id="books-title">
            IRODORI Books
          </h2>

          <p>
            Select a book to continue learning.
          </p>

        </div>

      </div>


      <div id="book-list">

        Loading learning data...

      </div>

    </section>

  `;


  renderBooks();

  updateProgressUI();

}



/* =========================================
   UPDATE PROGRESS UI
   ========================================= */

function updateProgressUI() {

  if (
    window.IrodoriProgress &&
    typeof
      window.IrodoriProgress
        .updateProgressDashboard ===
      "function"
  ) {

    window.IrodoriProgress
      .updateProgressDashboard();

  }

}



/* =========================================
   RENDER BOOKS
   ========================================= */

function renderBooks() {

  const container =
    document.getElementById(
      "book-list"
    );


  if (!container) {

    return;

  }


  if (
    !booksData.length
  ) {

    container.innerHTML = `

      <div class="pending-card">

        No book records available.

      </div>

    `;

    return;

  }



  container.innerHTML =

    booksData
      .map(
        (
          book,
          index
        ) => {

          const title =
            book.title ||
            book.name ||
            `Book ${index + 1}`;


          const description =
            book.description ||
            "";


          const bookKey =
            getBookKey(
              book
            );


          const completed =
            window.IrodoriProgress &&
            typeof
              window.IrodoriProgress
                .isBookComplete ===
              "function"
              ? window.IrodoriProgress
                  .isBookComplete(
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

                  ${escapeHtml(
                    title
                  )}

                </div>


                ${
                  description
                    ? `

                      <div class="book-card-description">

                        ${escapeHtml(
                          description
                        )}

                      </div>

                    `
                    : ""
                }


                ${
                  completed
                    ? `

                      <div class="completion-badge">

                        ✓ Progress Saved

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



/* =========================================
   OPEN BOOK
   ========================================= */

function openBook(
  book
) {

  if (!book) {

    return;

  }


  currentBook =
    book;


  const lessons =
    findLessonsForBook(
      book
    );


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

        renderDashboard();

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



/* =========================================
   LESSON CARD
   ========================================= */

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
    typeof
      window.IrodoriProgress
        .isLessonComplete ===
      "function"
      ? window.IrodoriProgress
          .isLessonComplete(
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
          String(
            lessonNumber
          )
        )}

      </div>


      <div class="lesson-card-content">

        <div class="lesson-title">

          ${escapeHtml(
            title
          )}

        </div>


        ${
          completed

            ? `

              <div class="completion-badge">

                ✓ Completed

              </div>


              <div class="study-again-label">

                Study Again

              </div>

            `

            : ""

        }

      </div>

    </button>

  `;

}



/* =========================================
   OPEN LESSON
   ========================================= */

function openLesson(
  lesson
) {

  if (!lesson) {

    return;

  }


  currentLesson =
    lesson;


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


  const lessonCompleted =
    window.IrodoriProgress &&
    typeof
      window.IrodoriProgress
        .isLessonComplete ===
      "function"
      ? window.IrodoriProgress
          .isLessonComplete(
            lessonId
          )
      : false;


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

            ${escapeHtml(
              currentBook?.title ||
              currentBook?.name ||
              "IRODORI"
            )}

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

      </div>



      ${
        lessonCompleted

          ? `

            <div class="completion-badge">

              ✓ Previously Completed —
              You can study this lesson again.

            </div>

          `

          : ""

      }



      <div class="learning-module-grid">


        <!-- CAN-DO -->

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

            ${
              lessonCompleted

                ? `

                  This lesson is already recorded
                  as completed.

                  <br>

                  You can study it again anytime.

                `

                : `

                  Mark this lesson complete
                  after you finish your study.

                `
            }

          </p>

        </div>



        <button
          type="button"
          class="completion-button"
          data-complete-lesson
        >

          ${
            lessonCompleted

              ? "✓ Completed — Study Again"

              : "Mark Lesson Complete"

          }

        </button>

      </div>


    </section>

  `;



  /* BACK */

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



  /* LESSON COMPLETE */

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
          typeof
            window.IrodoriProgress
              .markLessonComplete ===
            "function"
        ) {

          window.IrodoriProgress
            .markLessonComplete(
              lessonId
            );


          completeButton.textContent =
            "✓ Completed — Study Again";


          updateProgressUI();

        }

      }
    );

  }



  /* CAN-DO */

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



/* =========================================
   CAN-DO CARD
   ========================================= */

function renderCanDoCard(
  canDo,
  index
) {

  const title =
    canDo.title ||
    canDo.name ||
    canDo.canDo ||
    canDo.label ||
    `Activity ${index + 1}`;


  const activityId =
    getActivityId(
      canDo,
      index
    );


  const completed =
    window.IrodoriProgress &&
    typeof
      window.IrodoriProgress
        .isActivityComplete ===
      "function"
      ? window.IrodoriProgress
          .isActivityComplete(
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

        ${escapeHtml(
          title
        )}

      </div>


      ${
        completed

          ? `

            <div class="completion-badge">

              ✓ Completed

            </div>


            <div class="study-again-label">

              Practice Again

            </div>

          `

          : ""

      }

    </button>

  `;

}



/* =========================================
   OPEN ACTIVITY
   ========================================= */

function openActivity(
  activity
) {

  if (!activity) {

    return;

  }


  currentActivity =
    activity;


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


  const activityCompleted =
    window.IrodoriProgress &&
    typeof
      window.IrodoriProgress
        .isActivityComplete ===
      "function"

      ? window.IrodoriProgress
          .isActivityComplete(
            activityId
          )

      : false;



  /*
   * Only use data fields that are
   * actually present in the dataset.
   */

  const title =
    activity.title ||
    activity.name ||
    activity.canDo ||
    activity.label ||
    "Can-do Activity";


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
    activity.lessonNumber ||
    "";


  const activityCode =
    activity.code ||
    activity.activityId ||
    activity.id ||
    "";



  main.innerHTML = `

    <section
      class="activity-detail"
    >


      <!-- BACK -->

      <button
        type="button"
        class="back-button"
        data-back-lesson
      >

        ← Back to Lesson

      </button>



      <!-- ACTIVITY CARD -->

      <div
        class="activity-detail-card"
      >


        <div
          class="module-icon"
        >
          🎯
        </div>



        <!-- STATUS -->

        <div
          class="activity-status"
        >

          ${
            activityCompleted

              ? `

                <span
                  class="completion-badge"
                >

                  ✓ Completed

                </span>

              `

              : `

                <span
                  class="activity-status-pending"
                >

                  Not Completed

                </span>

              `
          }

        </div>



        <!-- TITLE -->

        <h2>

          ${escapeHtml(
            title
          )}

        </h2>



        <!-- ACTIVITY ID -->

        ${
          activityCode

            ? `

              <div
                class="activity-meta"
              >

                Activity ID:
                ${escapeHtml(
                  String(
                    activityCode
                  )
                )}

              </div>

            `

            : ""

        }



        <!-- LESSON -->

        ${
          lessonId

            ? `

              <div
                class="activity-meta"
              >

                Lesson:
                ${escapeHtml(
                  String(
                    lessonId
                  )
                )}

              </div>

            `

            : ""

        }



        <!-- DESCRIPTION -->

        ${
          description

            ? `

              <div
                class="activity-information"
              >

                <h3>
                  Activity Information
                </h3>

                <p>

                  ${escapeHtml(
                    description
                  )}

                </p>

              </div>

            `

            : ""

        }



        <!-- JAPANESE -->

        ${
          japanese

            ? `

              <div
                class="activity-language-card"
              >

                <h3>
                  日本語
                </h3>

                <p
                  class="japanese-text"
                >

                  ${escapeHtml(
                    japanese
                  )}

                </p>

              </div>

            `

            : ""

        }



        <!-- ENGLISH -->

        ${
          english

            ? `

              <div
                class="activity-language-card"
              >

                <h3>
                  English
                </h3>

                <p>

                  ${escapeHtml(
                    english
                  )}

                </p>

              </div>

            `

            : ""

        }



        <!-- SINHALA -->

        ${
          sinhala

            ? `

              <div
                class="activity-language-card"
              >

                <h3>
                  සිංහල
                </h3>

                <p>

                  ${escapeHtml(
                    sinhala
                  )}

                </p>

              </div>

            `

            : ""

        }



        <!-- STUDY AREA -->

        <div
          class="activity-study-area"
        >

          <h3>
            Activity Study
          </h3>

          <p>

            Study this Can-do activity
            and practice it again whenever
            you need.

          </p>

        </div>



        <!-- ACTIVITY PROGRESS -->

        <div
          class="lesson-completion-card"
        >

          <div>

            <h3>
              Activity Progress
            </h3>


            <p>

              ${
                activityCompleted

                  ? `

                    This activity is already
                    recorded as completed.

                    <br>

                    You can practice it again
                    without losing your saved
                    progress.

                  `

                  : `

                    Complete this activity
                    after finishing your study.

                  `
              }

            </p>

          </div>



          <button
            type="button"
            class="completion-button"
            data-complete-activity
          >

            ${
              activityCompleted

                ? "✓ Completed — Practice Again"

                : "Mark Activity Complete"

            }

          </button>

        </div>


      </div>

    </section>

  `;



  /* =======================================
     BACK TO LESSON
     ======================================= */

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



  /* =======================================
     COMPLETE ACTIVITY
     ======================================= */

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
          typeof
            window.IrodoriProgress
              .markActivityComplete ===
            "function"
        ) {

          window.IrodoriProgress
            .markActivityComplete(
              activityId
            );


          completeButton.textContent =
            "✓ Completed — Practice Again";


          updateProgressUI();

        }

      }
    );

  }

}



/* =========================================
   FIND LESSONS FOR BOOK
   ========================================= */

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
            String(
              bookId
            )
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
            String(
              bookCode
            ).toLowerCase()
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
            String(
              bookSlug
            ).toLowerCase()
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
            String(
              bookTitle
            ).toLowerCase()
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
            String(
              bookTitle
            ).toLowerCase()
          );

        }


        return false;

      }
    );


  return matched.sort(
    compareLessons
  );

}



/* =========================================
   FIND CAN-DO FOR LESSON
   ========================================= */

function findCanDosForLesson(
  book,
  lesson
) {

  const bookKey =
    getBookKey(
      book
    );


  const records =
    canDosData[
      bookKey
    ] || [];


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

      /*
       * Only explicit relationship.
       */

      if (
        record.lessonId !==
        undefined
      ) {

        return (
          String(
            record.lessonId
          ) ===
          String(
            lessonId
          )
        );

      }


      /*
       * Only explicit lesson number.
       */

      if (
        record.lessonNumber !==
        undefined
      ) {

        return (
          String(
            record.lessonNumber
          ) ===
          String(
            lessonNumber
          )
        );

      }


      return false;

    }
  );

}



/* =========================================
   GET BOOK KEY
   ========================================= */

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
    String(
      value
    )
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



/* =========================================
   GET LESSON NUMBER
   ========================================= */

function getLessonNumber(
  lesson,
  fallback
) {

  if (!lesson) {

    return (
      fallback + 1
    );

  }


  return (
    lesson.lessonNumber ??
    lesson.number ??
    lesson.lessonNo ??
    lesson.order ??
    fallback + 1
  );

}



/* =========================================
   GET LESSON ID
   ========================================= */

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



/* =========================================
   GET ACTIVITY ID
   ========================================= */

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



/* =========================================
   SORT LESSONS
   ========================================= */

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


  return (
    numberA -
    numberB
  );

}



/* =========================================
   ERROR DISPLAY
   ========================================= */

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

      ${escapeHtml(
        message
      )}

    </div>

  `;

}



/* =========================================
   HTML ESCAPE
   ========================================= */

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
