const PROGRESS_STORAGE_KEY =
  "irodori_master_learning_progress_v1";


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
   CURRENT PROGRESS
   ========================================= */

let progress =
  loadProgress();



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


  return Math.min(
    100,
    Math.round(
      (
        completed /
        total
      ) * 100
    )
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
    Overall progress currently uses
    Lessons + Activities + Kanji.

    Books are container-level records,
    therefore they are not added again
    to avoid double counting.
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
   MARK BOOK COMPLETE
   ========================================= */

function markBookComplete(
  bookId
) {

  if (!bookId) {

    return;

  }


  const normalizedId =
    String(bookId);


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
    String(lessonId);


  if (
    !progress.completedLessons.includes(
      normalizedId
    )
  ) {

    progress.completedLessons.push(
      normalizedId
    );


    saveProgress(
      progress
    );


    updateProgressDashboard();

  }

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
    String(activityId);


  if (
    !progress.completedActivities.includes(
      normalizedId
    )
  ) {

    progress.completedActivities.push(
      normalizedId
    );


    saveProgress(
      progress
    );


    updateProgressDashboard();

  }

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
    String(kanjiId);


  if (
    !progress.completedKanji.includes(
      normalizedId
    )
  ) {

    progress.completedKanji.push(
      normalizedId
    );


    saveProgress(
      progress
    );


    updateProgressDashboard();

  }

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
    String(bookId)
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
    String(lessonId)
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
    String(activityId)
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
    String(kanjiId)
  );

}



/* =========================================
   RESET PROGRESS
   ========================================= */

function resetProgress() {

  progress =
    createDefaultProgress();


  saveProgress(
    progress
  );


  updateProgressDashboard();

}



/* =========================================
   UPDATE DASHBOARD
   ========================================= */

function updateProgressDashboard() {

  const summary =
    getProgressSummary();



  /* ---------------------------------------
     OVERALL PERCENTAGE
     --------------------------------------- */

  const overallElement =
    document.querySelector(
      "[data-progress-overall]"
    );


  if (overallElement) {

    overallElement.textContent =
      `${summary.overallPercentage}%`;

  }



  /* ---------------------------------------
     PROGRESS BAR
     --------------------------------------- */

  const progressBar =
    document.querySelector(
      "[data-progress-bar]"
    );


  if (progressBar) {

    progressBar.style.width =
      `${summary.overallPercentage}%`;

  }



  /* ---------------------------------------
     LESSON PROGRESS
     --------------------------------------- */

  const lessonsElement =
    document.querySelector(
      "[data-progress-lessons]"
    );


  if (lessonsElement) {

    lessonsElement.textContent =
      summary.lessons;

  }



  /* ---------------------------------------
     ACTIVITY PROGRESS
     --------------------------------------- */

  const activitiesElement =
    document.querySelector(
      "[data-progress-activities]"
    );


  if (activitiesElement) {

    activitiesElement.textContent =
      summary.activities;

  }



  /* ---------------------------------------
     KANJI PROGRESS
     --------------------------------------- */

  const kanjiElement =
    document.querySelector(
      "[data-progress-kanji]"
    );


  if (kanjiElement) {

    kanjiElement.textContent =
      summary.kanji;

  }



  /* =======================================
     DASHBOARD CARDS
     ======================================= */


  /* ---------------------------------------
     BOOKS
     --------------------------------------- */

  const booksDashboardElement =
    document.querySelector(
      "[data-dashboard-books]"
    );


  if (booksDashboardElement) {

    booksDashboardElement.textContent =
      `${summary.books} / ${MASTER_TOTALS.books}`;

  }



  /* ---------------------------------------
     LESSONS
     --------------------------------------- */

  const lessonsDashboardElement =
    document.querySelector(
      "[data-dashboard-lessons]"
    );


  if (lessonsDashboardElement) {

    lessonsDashboardElement.textContent =
      `${summary.lessons} / ${MASTER_TOTALS.lessons}`;

  }



  /* ---------------------------------------
     ACTIVITIES
     --------------------------------------- */

  const activitiesDashboardElement =
    document.querySelector(
      "[data-dashboard-activities]"
    );


  if (activitiesDashboardElement) {

    activitiesDashboardElement.textContent =
      `${summary.activities} / ${MASTER_TOTALS.activities}`;

  }



  /* ---------------------------------------
     KANJI
     --------------------------------------- */

  const kanjiDashboardElement =
    document.querySelector(
      "[data-dashboard-kanji]"
    );


  if (kanjiDashboardElement) {

    kanjiDashboardElement.textContent =
      `${summary.kanji} / ${MASTER_TOTALS.kanji}`;

  }

}



/* =========================================
   INITIAL DASHBOARD UPDATE
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

  updateProgressDashboard

};
