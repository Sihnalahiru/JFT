const PROGRESS_STORAGE_KEY =
  "irodori_master_learning_progress_v1";

const MASTER_TOTALS = {
  books: 4,
  lessons: 72,
  activities: 288,
  kanji: 644
};


function createDefaultProgress() {

  return {
    completedBooks: [],
    completedLessons: [],
    completedActivities: [],
    completedKanji: []
  };

}


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
        Array.isArray(parsed.completedBooks)
          ? parsed.completedBooks
          : [],

      completedLessons:
        Array.isArray(parsed.completedLessons)
          ? parsed.completedLessons
          : [],

      completedActivities:
        Array.isArray(parsed.completedActivities)
          ? parsed.completedActivities
          : [],

      completedKanji:
        Array.isArray(parsed.completedKanji)
          ? parsed.completedKanji
          : []
    };

  } catch (error) {

    console.error(
      "Failed to load learning progress:",
      error
    );

    return createDefaultProgress();

  }

}


function saveProgress(progress) {

  localStorage.setItem(
    PROGRESS_STORAGE_KEY,
    JSON.stringify(progress)
  );

}


let progress =
  loadProgress();


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


function getProgressSummary() {

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

    books:
      progress.completedBooks.length,

    lessons,

    activities,

    kanji,

    lessonPercentage,

    activityPercentage,

    kanjiPercentage,

    overallPercentage

  };

}


function markLessonComplete(
  lessonId
) {

  if (!lessonId) {
    return;
  }

  if (
    !progress.completedLessons.includes(
      lessonId
    )
  ) {

    progress.completedLessons.push(
      lessonId
    );

    saveProgress(progress);
    updateProgressDashboard();

  }

}


function markActivityComplete(
  activityId
) {

  if (!activityId) {
    return;
  }

  if (
    !progress.completedActivities.includes(
      activityId
    )
  ) {

    progress.completedActivities.push(
      activityId
    );

    saveProgress(progress);
    updateProgressDashboard();

  }

}


function markKanjiComplete(
  kanjiId
) {

  if (!kanjiId) {
    return;
  }

  if (
    !progress.completedKanji.includes(
      kanjiId
    )
  ) {

    progress.completedKanji.push(
      kanjiId
    );

    saveProgress(progress);
    updateProgressDashboard();

  }

}


function markBookComplete(
  bookId
) {

  if (!bookId) {
    return;
  }

  if (
    !progress.completedBooks.includes(
      bookId
    )
  ) {

    progress.completedBooks.push(
      bookId
    );

    saveProgress(progress);
    updateProgressDashboard();

  }

}


function isLessonComplete(
  lessonId
) {

  return progress.completedLessons.includes(
    lessonId
  );

}


function isActivityComplete(
  activityId
) {

  return progress.completedActivities.includes(
    activityId
  );

}


function isKanjiComplete(
  kanjiId
) {

  return progress.completedKanji.includes(
    kanjiId
  );

}


function isBookComplete(
  bookId
) {

  return progress.completedBooks.includes(
    bookId
  );

}


function resetProgress() {

  progress =
    createDefaultProgress();

  saveProgress(progress);

  updateProgressDashboard();

}


function updateProgressDashboard() {

  const summary =
    getProgressSummary();


  const overallElement =
    document.querySelector(
      "[data-progress-overall]"
    );

  const progressBar =
    document.querySelector(
      "[data-progress-bar]"
    );


  if (overallElement) {

    overallElement.textContent =
      `${summary.overallPercentage}%`;

  }


  if (progressBar) {

    progressBar.style.width =
      `${summary.overallPercentage}%`;

  }


  const lessonsElement =
    document.querySelector(
      "[data-progress-lessons]"
    );

  const activitiesElement =
    document.querySelector(
      "[data-progress-activities]"
    );

  const kanjiElement =
    document.querySelector(
      "[data-progress-kanji]"
    );


  if (lessonsElement) {

    lessonsElement.textContent =
      summary.lessons;

  }


  if (activitiesElement) {

    activitiesElement.textContent =
      summary.activities;

  }


  if (kanjiElement) {

    kanjiElement.textContent =
      summary.kanji;

  }

}


document.addEventListener(
  "DOMContentLoaded",
  () => {

    updateProgressDashboard();

  }
);


window.IrodoriProgress = {

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

  MASTER_TOTALS

};
