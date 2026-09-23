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


    return {

      completedBooks:
        Array.isArray(
          parsed.completedBooks
        )
          ? parsed.completedBooks
          : [],


      completedLessons:
        Array.isArray(
          parsed.completedLessons
        )
          ? parsed.completedLessons
          : [],


      completedActivities:
        Array.isArray(
          parsed.completedActivities
        )
          ? parsed.completedActivities
          : [],


      completedKanji:
        Array.isArray(
          parsed.completedKanji
        )
          ? parsed.completedKanji
          : []

    };

  }

  catch (error) {

    console.error(
      "Failed to load learning progress:",
      error
    );


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


    return {

      lessons:
        parsed &&
        typeof parsed.lessons ===
          "object"
          ? parsed.lessons
          : {},


      activities:
        parsed &&
        typeof parsed.activities ===
          "object"
          ? parsed.activities
          : {},


      kanji:
        parsed &&
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

  if (!lessonId) {

    return null;

  }


  const id =
    String(
      lessonId
    );


  if (
    !attemptHistory.lessons[id]
  ) {

    attemptHistory.lessons[id] = [];

  }


  const attempt = {

    id:
      `${id}-${Date.now()}`,

    itemId:
      id,

    type:
      "lesson",

    startedAt:
      new Date().toISOString(),

    completedAt:
      new Date().toISOString()

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

  if (!activityId) {

    return null;

  }


  const id =
    String(
      activityId
    );


  if (
    !attemptHistory.activities[id]
  ) {

    attemptHistory.activities[id] = [];

  }


  const attempt = {

    id:
      `${id}-${Date.now()}`,

    itemId:
      id,

    type:
      "activity",

    startedAt:
      new Date().toISOString(),

    completedAt:
      new Date().toISOString()

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

  if (!kanjiId) {

    return null;

  }


  const id =
    String(
      kanjiId
    );


  if (
    !attemptHistory.kanji[id]
  ) {

    attemptHistory.kanji[id] = [];

  }


  const attempt = {

    id:
      `${id}-${Date.now()}`,

    itemId:
      id,

    type:
      "kanji",

    startedAt:
      new Date().toISOString(),

    completedAt:
      new Date().toISOString()

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

  if (!lessonId) {

    return [];

  }


  return (
    attemptHistory
      .lessons[
        String(
          lessonId
        )
      ] || []
  );

}



/* =========================================
   GET ACTIVITY ATTEMPTS
   ========================================= */

function getActivityAttempts(
  activityId
) {

  if (!activityId) {

    return [];

  }


  return (
    attemptHistory
      .activities[
        String(
          activityId
        )
      ] || []
  );

}



/* =========================================
   GET KANJI ATTEMPTS
   ========================================= */

function getKanjiAttempts(
  kanjiId
) {

  if (!kanjiId) {

    return [];

  }


  return (
    attemptHistory
      .kanji[
        String(
          kanjiId
        )
      ] || []
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

  if (!bookId) {

    return;

  }


  const normalizedId =
    String(
      bookId
    );


  if (
    !progress.completedBooks.includes(
      normalizedId
    )
  ) {

    progress.completedBooks.push(
      normalizedId
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

  if (!lessonId) {

    return;

  }


  const normalizedId =
    String(
      lessonId
    );


  /*
   * Completion is unique.
   *
   * Repeating the lesson does NOT
   * increase the completion count.
   */

  if (
    !progress.completedLessons.includes(
      normalizedId
    )
  ) {

    progress.completedLessons.push(
      normalizedId
    );

  }


  /*
   * Every completion action creates
   * a separate attempt history record.
   */

  recordLessonAttempt(
    normalizedId
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

  if (!activityId) {

    return;

  }


  const normalizedId =
    String(
      activityId
    );


  /*
   * Unique completion count.
   */

  if (
    !progress.completedActivities.includes(
      normalizedId
    )
  ) {

    progress.completedActivities.push(
      normalizedId
    );

  }


  /*
   * Every completion action is
   * stored as a separate attempt.
   */

  recordActivityAttempt(
    normalizedId
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

  if (!kanjiId) {

    return;

  }


  const normalizedId =
    String(
      kanjiId
    );


  if (
    !progress.completedKanji.includes(
      normalizedId
    )
  ) {

    progress.completedKanji.push(
      normalizedId
    );

  }


  recordKanjiAttempt(
    normalizedId
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

  if (!bookId) {

    return false;

  }


  return progress.completedBooks.includes(
    String(
      bookId
    )
  );

}



/* =========================================
   CHECK LESSON
   ========================================= */

function isLessonComplete(
  lessonId
) {

  if (!lessonId) {

    return false;

  }


  return progress.completedLessons.includes(
    String(
      lessonId
    )
  );

}



/* =========================================
   CHECK ACTIVITY
   ========================================= */

function isActivityComplete(
  activityId
) {

  if (!activityId) {

    return false;

  }


  return progress.completedActivities.includes(
    String(
      activityId
    )
  );

}



/* =========================================
   CHECK KANJI
   ========================================= */

function isKanjiComplete(
  kanjiId
) {

  if (!kanjiId) {

    return false;

  }


  return progress.completedKanji.includes(
    String(
      kanjiId
    )
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
