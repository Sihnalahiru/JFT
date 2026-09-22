/* =========================================
   IRODORI MASTER
   LEARNER PROGRESS ENGINE
   ========================================= */

const PROGRESS_STORAGE_KEY =
  "irodori_master_learning_progress_v1";


const MASTER_TOTALS = {
  books: 4,
  lessons: 72,
  activities: 288,
  kanji: 644
};


/* =========================================
   DEFAULT STATE
   ========================================= */

const DEFAULT_PROGRESS = {
  completedLessons: [],
  completedActivities: [],
  completedKanji: [],
  lastUpdated: null
};


/* =========================================
   LOAD STATE
   ========================================= */

function loadProgressState() {

  try {

    const saved =
      localStorage.getItem(
        PROGRESS_STORAGE_KEY
      );


    if (!saved) {

      return {
        ...DEFAULT_PROGRESS
      };

    }


    const parsed =
      JSON.parse(saved);


    return {

      ...DEFAULT_PROGRESS,

      ...parsed,

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

  } catch (error) {

    console.error(
      "Progress loading error:",
      error
    );


    return {
      ...DEFAULT_PROGRESS
    };

  }

}


/* =========================================
   SAVE STATE
   ========================================= */

function saveProgressState(state) {

  state.lastUpdated =
    new Date().toISOString();


  localStorage.setItem(
    PROGRESS_STORAGE_KEY,
    JSON.stringify(state)
  );


  updateProgressDashboard();
}


/* =========================================
   GET CURRENT STATE
   ========================================= */

function getProgressState() {

  return loadProgressState();

}


/* =========================================
   CALCULATE PERCENTAGE
   ========================================= */

function calculatePercentage(
  completed,
  total
) {

  if (!total || total <= 0) {
    return 0;
  }


  return Math.min(
    100,
    Math.round(
      (completed / total) * 100
    )
  );

}


/* =========================================
   GET PROGRESS SUMMARY
   ========================================= */

function getProgressSummary() {

  const state =
    loadProgressState();


  const lessons =
    state.completedLessons.length;


  const activities =
    state.completedActivities.length;


  const kanji =
    state.completedKanji.length;


  const lessonPercent =
    calculatePercentage(
      lessons,
      MASTER_TOTALS.lessons
    );


  const activityPercent =
    calculatePercentage(
      activities,
      MASTER_TOTALS.activities
    );


  const kanjiPercent =
    calculatePercentage(
      kanji,
      MASTER_TOTALS.kanji
    );


  /*
   * Overall learning progress is based
   * on the three learner-tracked areas.
   */

  const overall =
    Math.round(
      (
        lessonPercent +
        activityPercent +
        kanjiPercent
      ) / 3
    );


  return {

    books: MASTER_TOTALS.books,

    lessons: {
      completed: lessons,
      total: MASTER_TOTALS.lessons,
      percentage: lessonPercent
    },

    activities: {
      completed: activities,
      total: MASTER_TOTALS.activities,
      percentage: activityPercent
    },

    kanji: {
      completed: kanji,
      total: MASTER_TOTALS.kanji,
      percentage: kanjiPercent
    },

    overall

  };

}


/* =========================================
   MARK LESSON COMPLETE
   ========================================= */

function markLessonComplete(
  lessonId
) {

  if (
    lessonId ===
    undefined ||
    lessonId ===
    null
  ) {

    return;

  }


  const state =
    loadProgressState();


  const id =
    String(lessonId);


  if (
    !state.completedLessons.includes(id)
  ) {

    state.completedLessons.push(id);

    saveProgressState(state);

  }

}


/* =========================================
   MARK ACTIVITY COMPLETE
   ========================================= */

function markActivityComplete(
  activityId
) {

  if (
    activityId ===
    undefined ||
    activityId ===
    null
  ) {

    return;

  }


  const state =
    loadProgressState();


  const id =
    String(activityId);


  if (
    !state.completedActivities.includes(id)
  ) {

    state.completedActivities.push(id);

    saveProgressState(state);

  }

}


/* =========================================
   MARK KANJI COMPLETE
   ========================================= */

function markKanjiComplete(
  kanjiId
) {

  if (
    kanjiId ===
    undefined ||
    kanjiId ===
    null
  ) {

    return;

  }


  const state =
    loadProgressState();


  const id =
    String(kanjiId);


  if (
    !state.completedKanji.includes(id)
  ) {

    state.completedKanji.push(id);

    saveProgressState(state);

  }

}


/* =========================================
   CHECK LESSON
   ========================================= */

function isLessonComplete(
  lessonId
) {

  const state =
    loadProgressState();


  return state.completedLessons.includes(
    String(lessonId)
  );

}


/* =========================================
   CHECK ACTIVITY
   ========================================= */

function isActivityComplete(
  activityId
) {

  const state =
    loadProgressState();


  return state.completedActivities.includes(
    String(activityId)
  );

}


/* =========================================
   CHECK KANJI
   ========================================= */

function isKanjiComplete(
  kanjiId
) {

  const state =
    loadProgressState();


  return state.completedKanji.includes(
    String(kanjiId)
  );

}


/* =========================================
   RESET ALL PROGRESS
   ========================================= */

function resetLearningProgress() {

  const confirmed =
    window.confirm(
      "Reset all IRODORI learning progress?"
    );


  if (!confirmed) {
    return;
  }


  localStorage.removeItem(
    PROGRESS_STORAGE_KEY
  );


  updateProgressDashboard();


  window.dispatchEvent(
    new CustomEvent(
      "irodori-progress-reset"
    )
  );

}


/* =========================================
   DASHBOARD UPDATE
   ========================================= */

function updateProgressDashboard() {

  const summary =
    getProgressSummary();


  /*
   * Overall percentage
   */

  const percentageElements =
    document.querySelectorAll(
      "[data-progress-overall]"
    );


  percentageElements.forEach(
    element => {

      element.textContent =
        `${summary.overall}%`;

    }
  );


  /*
   * Progress bar
   */

  const bars =
    document.querySelectorAll(
      "[data-progress-bar]"
    );


  bars.forEach(
    bar => {

      bar.style.width =
        `${summary.overall}%`;

    }
  );


  /*
   * Lesson count
   */

  const lessonElements =
    document.querySelectorAll(
      "[data-progress-lessons]"
    );


  lessonElements.forEach(
    element => {

      element.textContent =
        `${summary.lessons.completed}/${summary.lessons.total}`;

    }
  );


  /*
   * Activity count
   */

  const activityElements =
    document.querySelectorAll(
      "[data-progress-activities]"
    );


  activityElements.forEach(
    element => {

      element.textContent =
        `${summary.activities.completed}/${summary.activities.total}`;

    }
  );


  /*
   * Kanji count
   */

  const kanjiElements =
    document.querySelectorAll(
      "[data-progress-kanji]"
    );


  kanjiElements.forEach(
    element => {

      element.textContent =
        `${summary.kanji.completed}/${summary.kanji.total}`;

    }
  );

}


/* =========================================
   INITIALIZE
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

  getState:
    getProgressState,

  getSummary:
    getProgressSummary,

  markLessonComplete:
    markLessonComplete,

  markActivityComplete:
    markActivityComplete,

  markKanjiComplete:
    markKanjiComplete,

  isLessonComplete:
    isLessonComplete,

  isActivityComplete:
    isActivityComplete,

  isKanjiComplete:
    isKanjiComplete,

  reset:
    resetLearningProgress

};
