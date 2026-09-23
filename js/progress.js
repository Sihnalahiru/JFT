```javascript
const PROGRESS_STORAGE_KEY =
  "irodori_master_learning_progress_v1";

const ATTEMPT_STORAGE_KEY =
  "irodori_master_attempt_history_v1";


const MASTER_TOTALS = {
  books: 4,
  lessons: 72,
  activities: 288,
  kanji: 644
};


/* =========================================
   DEFAULT PROGRESS
   ========================================= */

function createDefaultProgress() {

  return {

    completedBooks: [],

    completedLessons: [],

    completedActivities: [],

    completedKanji: []

  };

}


/* =========================================
   DEFAULT ATTEMPT HISTORY
   ========================================= */

function createDefaultAttemptHistory() {

  return {

    lessons: {},

    activities: {},

    kanji: {}

  };

}


/* =========================================
   SAFE ID VALIDATION
   ========================================= */

function normalizeProgressId(value) {

  if (
    value === undefined ||
    value === null
  ) {

    return null;

  }


  const id =
    String(value).trim();


  if (!id) {

    return null;

  }


  /*
   * Reject generic placeholder IDs.
   *
   * These must never become shared
   * progress/history records.
   */

  const blockedIds = new Set([
    "unknown",
    "unknown-activity",
    "unknown-lesson",
    "unknown-kanji",
    "?",
    "undefined",
    "null",
    "NaN"
  ]);


  if (
    blockedIds.has(
      id.toLowerCase()
    )
  ) {

    return null;

  }


  return id;

}


/* =========================================
   LOAD PROGRESS
   ========================================= */

function loadProgress() {

  try {

    const saved =
      localStorage.getItem(
        PROGRESS_STORAGE_KEY
      );


    if (!saved) {

      return createDefaultProgress();

    }


    const parsed =
      JSON.parse(saved);


    if (
      !parsed ||
      typeof parsed !== "object"
    ) {

      console.warn(
        "Invalid progress data detected. Using safe defaults."
      );

      return createDefaultProgress();

    }


    return {

      completedBooks:
        Array.isArray(
          parsed.completedBooks
        )
          ? parsed.completedBooks
              .map(normalizeProgressId)
              .filter(Boolean)
          : [],


      completedLessons:
        Array.isArray(
          parsed.completedLessons
        )
          ? parsed.completedLessons
              .map(normalizeProgressId)
              .filter(Boolean)
          : [],


      completedActivities:
        Array.isArray(
          parsed.completedActivities
        )
          ? parsed.completedActivities
              .map(normalizeProgressId)
              .filter(Boolean)
          : [],


      completedKanji:
        Array.isArray(
          parsed.completedKanji
        )
          ? parsed.completedKanji
              .map(normalizeProgressId)
              .filter(Boolean)
          : []

    };

  }

  catch (error) {

    console.error(
      "Failed to load learning progress:",
      error
    );


    /*
     * Do not overwrite the user's stored data
     * when parsing fails.
     *
     * The current runtime simply starts with
     * safe empty state.
     */

    return createDefaultProgress();

  }

}


/* =========================================
   LOAD ATTEMPT HISTORY
   ========================================= */

function loadAttemptHistory() {

  try {

    const saved =
      localStorage.getItem(
        ATTEMPT_STORAGE_KEY
      );


    if (!saved) {

      return createDefaultAttemptHistory();

    }


    const parsed =
      JSON.parse(saved);


    if (
      !parsed ||
      typeof parsed !== "object"
    ) {

      console.warn(
        "Invalid attempt history detected. Using safe defaults."
      );

      return createDefaultAttemptHistory();

    }


    return {

      lessons:
        parsed.lessons &&
        typeof parsed.lessons ===
          "object"
          ? parsed.lessons
          : {},


      activities:
        parsed.activities &&
        typeof parsed.activities ===
          "object"
          ? parsed.activities
          : {},


      kanji:
        parsed.kanji &&
        typeof parsed.kanji ===
          "object"
          ? parsed.kanji
          : {}

    };

  }

  catch (error) {

    console.error(
      "Failed to load attempt history:",
      error
    );


    return createDefaultAttemptHistory();

  }

}


/* =========================================
   CURRENT DATA
   ========================================= */

let progress =
  loadProgress();


let attemptHistory =
  loadAttemptHistory();


/* =========================================
   SAVE PROGRESS
   ========================================= */

function saveProgress(
  currentProgress
) {

  try {

    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify(
        currentProgress
      )
    );

  }

  catch (error) {

    console.error(
      "Failed to save learning progress:",
      error
    );

  }

}


/* =========================================
   SAVE ATTEMPT HISTORY
   ========================================= */

function saveAttemptHistory() {

  try {

    localStorage.setItem(
      ATTEMPT_STORAGE_KEY,
      JSON.stringify(
        attemptHistory
      )
    );

  }

  catch (error) {

    console.error(
      "Failed to save attempt history:",
      error
    );

  }

}


/* =========================================
   PERCENTAGE
   ========================================= */

function calculatePercentage(
  completed,
  total
) {

  if (
    !total ||
    total <= 0
  ) {

    return 0;

  }


  const percentage =
    (
      completed /
      total
    ) * 100;


  return Math.min(
    100,
    Math.round(
      percentage * 10
    ) / 10
  );

}


/* =========================================
   PROGRESS SUMMARY
   ========================================= */

function getProgressSummary() {

  const books =
    progress.completedBooks.length;


  const lessons =
    progress.completedLessons.length;


  const activities =
    progress.completedActivities.length;


  const kanji =
    progress.completedKanji.length;


  const lessonPercentage =
    calculatePercentage(
      lessons,
      MASTER_TOTALS.lessons
    );


  const activityPercentage =
    calculatePercentage(
      activities,
      MASTER_TOTALS.activities
    );


  const kanjiPercentage =
    calculatePercentage(
      kanji,
      MASTER_TOTALS.kanji
    );


  /*
   * Overall progress deliberately excludes
   * books because the master learning total
   * is based on:
   *
   * 72 lessons
   * 288 activities
   * 644 kanji
   *
   * = 1004 learning units
   */

  const overallCompleted =
    lessons +
    activities +
    kanji;


  const overallTotal =
    MASTER_TOTALS.lessons +
    MASTER_TOTALS.activities +
    MASTER_TOTALS.kanji;


  const overallPercentage =
    calculatePercentage(
      overallCompleted,
      overallTotal
    );


  return {

    books,

    lessons,

    activities,

    kanji,

    lessonPercentage,

    activityPercentage,

    kanjiPercentage,

    overallPercentage

  };

}


/* =========================================
   RECORD LESSON ATTEMPT
   ========================================= */

function recordLessonAttempt(
  lessonId
) {

  const id =
    normalizeProgressId(
      lessonId
    );


  if (!id) {

    console.warn(
      "Lesson attempt rejected: invalid lesson ID."
    );

    return null;

  }


  if (
    !attemptHistory.lessons[id]
  ) {

    attemptHistory.lessons[id] = [];

  }


  const timestamp =
    new Date().toISOString();


  const attempt = {

    id:
      `${id}-${Date.now()}`,

    itemId:
      id,

    type:
      "lesson",

    startedAt:
      timestamp,

    completedAt:
      timestamp

  };


  attemptHistory
    .lessons[id]
    .push(
      attempt
    );


  saveAttemptHistory();


  return attempt;

}


/* =========================================
   RECORD ACTIVITY ATTEMPT
   ========================================= */

function recordActivityAttempt(
  activityId
) {

  const id =
    normalizeProgressId(
      activityId
    );


  if (!id) {

    console.warn(
      "Activity attempt rejected: invalid activity ID."
    );

    return null;

  }


  if (
    !attemptHistory.activities[id]
  ) {

    attemptHistory.activities[id] = [];

  }


  const timestamp =
    new Date().toISOString();


  const attempt = {

    id:
      `${id}-${Date.now()}`,

    itemId:
      id,

    type:
      "activity",

    startedAt:
      timestamp,

    completedAt:
      timestamp

  };


  attemptHistory
    .activities[id]
    .push(
      attempt
    );


  saveAttemptHistory();


  return attempt;

}


/* =========================================
   RECORD KANJI ATTEMPT
   ========================================= */

function recordKanjiAttempt(
  kanjiId
) {

  const id =
    normalizeProgressId(
      kanjiId
    );


  if (!id) {

    console.warn(
      "Kanji attempt rejected: invalid Kanji ID."
    );

    return null;

  }


  if (
    !attemptHistory.kanji[id]
  ) {

    attemptHistory.kanji[id] = [];

  }


  const timestamp =
    new Date().toISOString();


  const attempt = {

    id:
      `${id}-${Date.now()}`,

    itemId:
      id,

    type:
      "kanji",

    startedAt:
      timestamp,

    completedAt:
      timestamp

  };


  attemptHistory
    .kanji[id]
    .push(
      attempt
    );


  saveAttemptHistory();


  return attempt;

}


/* =========================================
   GET LESSON ATTEMPTS
   ========================================= */

function getLessonAttempts(
  lessonId
) {

  const id =
    normalizeProgressId(
      lessonId
    );


  if (!id) {

    return [];

  }


  return (
    attemptHistory
      .lessons[id] || []
  );

}


/* =========================================
   GET ACTIVITY ATTEMPTS
   ========================================= */

function getActivityAttempts(
  activityId
) {

  const id =
    normalizeProgressId(
      activityId
    );


  if (!id) {

    return [];

  }


  return (
    attemptHistory
      .activities[id] || []
  );

}


/* =========================================
   GET KANJI ATTEMPTS
   ========================================= */

function getKanjiAttempts(
  kanjiId
) {

  const id =
    normalizeProgressId(
      kanjiId
    );


  if (!id) {

    return [];

  }


  return (
    attemptHistory
      .kanji[id] || []
  );

}


/* =========================================
   GET ATTEMPT COUNT
   ========================================= */

function getLessonAttemptCount(
  lessonId
) {

  return getLessonAttempts(
    lessonId
  ).length;

}


function getActivityAttemptCount(
  activityId
) {

  return getActivityAttempts(
    activityId
  ).length;

}


function getKanjiAttemptCount(
  kanjiId
) {

  return getKanjiAttempts(
    kanjiId
  ).length;

}


/* =========================================
   MARK BOOK COMPLETE
   ========================================= */

function markBookComplete(
  bookId
) {

  const id =
    normalizeProgressId(
      bookId
    );


  if (!id) {

    console.warn(
      "Book completion rejected: invalid book ID."
    );

    return;

  }


  if (
    !progress.completedBooks.includes(
      id
    )
  ) {

    progress.completedBooks.push(
      id
    );

    saveProgress(
      progress
    );

    updateProgressDashboard();

  }

}


/* =========================================
   MARK LESSON COMPLETE
   ========================================= */

function markLessonComplete(
  lessonId
) {

  const id =
    normalizeProgressId(
      lessonId
    );


  if (!id) {

    console.warn(
      "Lesson completion rejected: invalid lesson ID."
    );

    return;

  }


  /*
   * Completion is UNIQUE.
   *
   * Repeating a lesson does not increase
   * the unique completion count.
   */

  if (
    !progress.completedLessons.includes(
      id
    )
  ) {

    progress.completedLessons.push(
      id
    );

  }


  /*
   * Every valid completion action is
   * recorded separately.
   */

  recordLessonAttempt(
    id
  );


  saveProgress(
    progress
  );


  updateProgressDashboard();

}


/* =========================================
   MARK ACTIVITY COMPLETE
   ========================================= */

function markActivityComplete(
  activityId
) {

  const id =
    normalizeProgressId(
      activityId
    );


  if (!id) {

    console.warn(
      "Activity completion rejected: invalid activity ID."
    );

    return;

  }


  /*
   * Unique completion count.
   */

  if (
    !progress.completedActivities.includes(
      id
    )
  ) {

    progress.completedActivities.push(
      id
    );

  }


  /*
   * Every valid completion action is
   * stored separately.
   */

  recordActivityAttempt(
    id
  );


  saveProgress(
    progress
  );


  updateProgressDashboard();

}


/* =========================================
   MARK KANJI COMPLETE
   ========================================= */

function markKanjiComplete(
  kanjiId
) {

  const id =
    normalizeProgressId(
      kanjiId
    );


  if (!id) {

    console.warn(
      "Kanji completion rejected: invalid Kanji ID."
    );

    return;

  }


  if (
    !progress.completedKanji.includes(
      id
    )
  ) {

    progress.completedKanji.push(
      id
    );

  }


  recordKanjiAttempt(
    id
  );


  saveProgress(
    progress
  );


  updateProgressDashboard();

}


/* =========================================
   CHECK BOOK
   ========================================= */

function isBookComplete(
  bookId
) {

  const id =
    normalizeProgressId(
      bookId
    );


  if (!id) {

    return false;

  }


  return progress.completedBooks.includes(
    id
  );

}


/* =========================================
   CHECK LESSON
   ========================================= */

function isLessonComplete(
  lessonId
) {

  const id =
    normalizeProgressId(
      lessonId
    );


  if (!id) {

    return false;

  }


  return progress.completedLessons.includes(
    id
  );

}


/* =========================================
   CHECK ACTIVITY
   ========================================= */

function isActivityComplete(
  activityId
) {

  const id =
    normalizeProgressId(
      activityId
    );


  if (!id) {

    return false;

  }


  return progress.completedActivities.includes(
    id
  );

}


/* =========================================
   CHECK KANJI
   ========================================= */

function isKanjiComplete(
  kanjiId
) {

  const id =
    normalizeProgressId(
      kanjiId
    );


  if (!id) {

    return false;

  }


  return progress.completedKanji.includes(
    id
  );

}


/* =========================================
   RESET PROGRESS
   ========================================= */

function resetProgress() {

  progress =
    createDefaultProgress();


  attemptHistory =
    createDefaultAttemptHistory();


  saveProgress(
    progress
  );


  saveAttemptHistory();


  updateProgressDashboard();

}


/* =========================================
   UPDATE DASHBOARD
   ========================================= */

function updateProgressDashboard() {

  const summary =
    getProgressSummary();


  /* OVERALL */

  const overallElement =
    document.querySelector(
      "[data-progress-overall]"
    );


  if (overallElement) {

    overallElement.textContent =
      `${summary.overallPercentage}%`;

  }


  /* PROGRESS BAR */

  const progressBar =
    document.querySelector(
      "[data-progress-bar]"
    );


  if (progressBar) {

    progressBar.style.width =
      `${summary.overallPercentage}%`;

  }


  /* BOOKS */

  const booksElement =
    document.querySelector(
      "[data-dashboard-books]"
    );


  if (booksElement) {

    booksElement.textContent =
      `${summary.books} / ${MASTER_TOTALS.books}`;

  }


  /* LESSONS */

  const lessonsElement =
    document.querySelector(
      "[data-dashboard-lessons]"
    );


  if (lessonsElement) {

    lessonsElement.textContent =
      `${summary.lessons} / ${MASTER_TOTALS.lessons}`;

  }


  /* ACTIVITIES */

  const activitiesElement =
    document.querySelector(
      "[data-dashboard-activities]"
    );


  if (activitiesElement) {

    activitiesElement.textContent =
      `${summary.activities} / ${MASTER_TOTALS.activities}`;

  }


  /* KANJI */

  const kanjiElement =
    document.querySelector(
      "[data-dashboard-kanji]"
    );


  if (kanjiElement) {

    kanjiElement.textContent =
      `${summary.kanji} / ${MASTER_TOTALS.kanji}`;

  }


  /* OPTIONAL DETAILED ELEMENTS */

  const lessonsProgress =
    document.querySelector(
      "[data-progress-lessons]"
    );


  if (lessonsProgress) {

    lessonsProgress.textContent =
      summary.lessons;

  }


  const activitiesProgress =
    document.querySelector(
      "[data-progress-activities]"
    );


  if (activitiesProgress) {

    activitiesProgress.textContent =
      summary.activities;

  }


  const kanjiProgress =
    document.querySelector(
      "[data-progress-kanji]"
    );


  if (kanjiProgress) {

    kanjiProgress.textContent =
      summary.kanji;

  }

}


/* =========================================
   INITIAL UPDATE
   ========================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    updateProgressDashboard();

  }
);


/* =========================================
   PUBLIC API
   ========================================= */

window.IrodoriProgress = {

  MASTER_TOTALS,

  getProgressSummary,

  markBookComplete,

  markLessonComplete,

  markActivityComplete,

  markKanjiComplete,

  isBookComplete,

  isLessonComplete,

  isActivityComplete,

  isKanjiComplete,

  resetProgress,

  updateProgressDashboard,

  /* ID VALIDATION */

  normalizeProgressId,

  /* ATTEMPT HISTORY */

  recordLessonAttempt,

  recordActivityAttempt,

  recordKanjiAttempt,

  getLessonAttempts,

  getActivityAttempts,

  getKanjiAttempts,

  getLessonAttemptCount,

  getActivityAttemptCount,

  getKanjiAttemptCount

};
```
