  }


  return `

    <button
      type="button"
      class="lesson-card-button"
      data-lesson-index="${index}"
    >

      <div class="lesson-card">

        <div class="lesson-number">
          ${escapeHtml(
            String(number)
          )}
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
    document.querySelector(
      ".app-main"
    );


  if (!main) return;


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


          ${
            renderMainAudioModule(
              lesson,
              book
            )
          }


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
      () => {

        openMainLessonAudio(
          lesson,
          book
        );

      }
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
            typeof window.IrodoriProgress.markLessonComplete ===
              "function"
          ) {

            window.IrodoriProgress.markLessonComplete(
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
      (button) => {

        button.addEventListener(
          "click",
          () => {

            const activityId =
              button.dataset.activityId;


            const activity =
              lessonCanDos.find(
                (item) =>
                  String(
                    getActivityId(item)
                  ) ===
                  String(activityId)
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
              String(activityId)
            )
          : ""
      }"
      ${
        activityId
          ? ""
          : "disabled"
      }
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
    document.querySelector(
      ".app-main"
    );


  if (!main) return;


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


  const completed =
    isActivityComplete(
      activityId
    );


  const attempts =
    getActivityAttempts(
      activityId
    );


  const attemptCount =
    attempts.length;


  const lastAttempt =
    attemptCount
      ? attempts[
          attemptCount - 1
        ]
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

                  <h3>
                    Description
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


          ${
            japanese
              ? `
                <div class="activity-field">

                  <h3>
                    Japanese
                  </h3>

                  <p>
                    ${escapeHtml(
                      japanese
                    )}
                  </p>

                </div>
              `
              : ""
          }


          ${
            english
              ? `
                <div class="activity-field">

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


          ${
            sinhala
              ? `
                <div class="activity-field">

                  <h3>
                    Sinhala
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

        </div>


        <div class="activity-attempt-card">

          <div class="activity-attempt-header">

            <div>

              <h3>
                Practice History
              </h3>

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

                <h3>
                  Attempt History
                </h3>


                <div class="attempt-history-items">

                  ${attempts
                    .slice()
                    .reverse()
                    .map(
                      (
                        attempt,
                        index
                      ) => `

                        <div
                          class="attempt-history-item"
                        >

                          <span
                            class="attempt-number"
                          >
                            #${
                              attempts.length -
                              index
                            }
                          </span>


                          <span
                            class="attempt-date"
                          >
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

      </div>

    </section>

  `;


  document
    .querySelector(
      "#back-to-lesson"
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
          window.IrodoriProgress &&
          typeof window.IrodoriProgress.markActivityComplete ===
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

function getMainAudioRecordsForLesson(
  lesson,
  book
) {

  const lessonId =
    getLessonId(
      lesson
    );


  const lessonNumber =
    getLessonNumber(
      lesson
    );


  const bookKey =
    getBookKey(
      book
    );


  if (!Array.isArray(mainAudioRecords)) {

    return [];

  }


  return mainAudioRecords.filter(
    (record) => {

      if (
        !record ||
        typeof record !== "object"
      ) {

        return false;

      }


      /*
       * Explicit lesson ID is the strongest
       * supported relationship.
       */

      if (
        record.lessonId !== undefined &&
        lessonId !== null &&
        String(
          record.lessonId
        ).trim() ===
        String(
          lessonId
        ).trim()
      ) {

        return true;

      }


      /*
       * Explicit lesson number + book relationship.
       * No relationship is inferred from array order.
       */

      if (
        record.lessonNumber !== undefined &&
        lessonNumber !== undefined &&
        String(
          record.lessonNumber
        ) ===
        String(
          lessonNumber
        )
      ) {

        if (
          record.bookId !== undefined &&
          record.bookId !== null
        ) {

          const recordBookKey =
            getBookKey(
              {
                bookId:
                  record.bookId
              }
            );


          return (
            recordBookKey !== "" &&
            recordBookKey ===
              bookKey
          );

        }


        /*
         * A record with lessonNumber only
         * is not enough to identify the book safely.
         */

        return false;

      }


      return false;

    }
  );

}


function getAudioRecordLabel(
  record,
  index
) {

  return (
    record.title ||
    record.name ||
    record.filename ||
    record.fileName ||
    record.label ||
    `Audio ${index + 1}`
  );

}


function getAudioSource(
  record
) {

  return (
    record.url ||
    record.audioUrl ||
    record.src ||
    record.href ||
    record.file ||
    record.fileUrl ||
    ""
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


  if (!records.length) {

    return `
      <div class="learning-module pending-card">

        <div class="module-icon">
          🔊
        </div>

        <div class="module-content">

          <h3>
            Main Lesson Audio
          </h3>

          <p>
            0 verified audio records
          </p>

          <small>
            PENDING — SOURCE VERIFICATION REQUIRED
          </small>

        </div>

      </div>
    `;

  }


  return `
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
          ${records.length}
          verified audio record${
            records.length === 1
              ? ""
              : "s"
          }
        </p>

      </div>

    </button>
  `;

}


function openMainLessonAudio(
  lesson,
  book
) {

  const main =
    document.querySelector(
      ".app-main"
    );


  if (!main) return;


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

      <div class="activity-detail">

        <button
          type="button"
          class="back-button"
          id="back-to-lesson-audio"
        >
          ← Back to Lesson
        </button>


        <div class="activity-detail-card">

          <h2>
            Main Lesson Audio
          </h2>

          <p>
            ${escapeHtml(title)}
          </p>


          ${
            records.length
              ? `
                <div class="audio-record-list">

                  ${records
                    .map(
                      (
                        record,
                        index
                      ) => {

                        const label =
                          getAudioRecordLabel(
                            record,
                            index
                          );


                        const source =
                          getAudioSource(
                            record
                          );


                        return `
                          <div class="audio-record-card">

                            <div class="audio-record-header">

                              <strong>
                                ${escapeHtml(label)}
                              </strong>

                              <span>
                                #${index + 1}
                              </span>

                            </div>


                            ${
                              source
                                ? `
                                  <audio
                                    controls
                                    preload="none"
                                    src="${escapeHtml(source)}"
                                  ></audio>
                                `
                                : `
                                  <p class="pending-text">
                                    Audio source URL not verified.
                                    PENDING — SOURCE VERIFICATION REQUIRED
                                  </p>
                                `
                            }

                          </div>
                        `;

                      }
                    )
                    .join("")}

                </div>
              `
              : `
                <div class="pending-card">

                  <p class="pending-text">
                    No verified Main Lesson Audio
                    records are currently available
                    for this lesson.
                  </p>

                  <p>
                    PENDING — SOURCE VERIFICATION REQUIRED
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
      "#back-to-lesson-audio"
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

  if (!main) return;

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


          ${
            renderMainAudioModule(
              lesson,
              book
            )
          }


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
      () => {

        openMainLessonAudio(
          lesson,
          book
        );

      }
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
            typeof window.IrodoriProgress.markLessonComplete ===
              "function"
          ) {

            window.IrodoriProgress.markLessonComplete(
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
      (button) => {

        button.addEventListener(
          "click",
          () => {

            const activityId =
              button.dataset.activityId;

            const activity =
              lessonCanDos.find(
                (item) =>
                  String(
                    getActivityId(item)
                  ) ===
                  String(activityId)
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
              String(activityId)
            )
          : ""
      }"
      ${
        activityId
          ? ""
          : "disabled"
      }
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
    document.querySelector(
      ".app-main"
    );

  if (!main) return;

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

  const completed =
    isActivityComplete(
      activityId
    );

  const attempts =
    getActivityAttempts(
      activityId
    );

  const attemptCount =
    attempts.length;

  const lastAttempt =
    attemptCount
      ? attempts[
          attemptCount - 1
        ]
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

                  <h3>
                    Description
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

          ${
            japanese
              ? `
                <div class="activity-field">

                  <h3>
                    Japanese
                  </h3>

                  <p>
                    ${escapeHtml(
                      japanese
                    )}
                  </p>

                </div>
              `
              : ""
          }

          ${
            english
              ? `
                <div class="activity-field">

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

          ${
            sinhala
              ? `
                <div class="activity-field">

                  <h3>
                    Sinhala
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

        </div>


        <div class="activity-attempt-card">

          <div class="activity-attempt-header">

            <div>

              <h3>
                Practice History
              </h3>

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

                <h3>
                  Attempt History
                </h3>

                <div class="attempt-history-items">

                  ${attempts
                    .slice()
                    .reverse()
                    .map(
                      (
                        attempt,
                        index
                      ) => `

                        <div
                          class="attempt-history-item"
                        >

                          <span
                            class="attempt-number"
                          >
                            #${
                              attempts.length -
                              index
                            }
                          </span>

                          <span
                            class="attempt-date"
                          >
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

      </div>

    </section>

  `;


  document
    .querySelector(
      "#back-to-lesson"
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
          window.IrodoriProgress &&
          typeof window.IrodoriProgress.markActivityComplete ===
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

function getMainAudioRecordsForLesson(
  lesson,
  book
) {

  const lessonId =
    getLessonId(
      lesson
    );

  const lessonNumber =
    getLessonNumber(
      lesson
    );

  const bookKey =
    getBookKey(
      book
    );

  if (
    !Array.isArray(
      mainAudioRecords
    )
  ) {

    return [];

  }

  return mainAudioRecords.filter(
    (record) => {

      if (
        !record ||
        typeof record !== "object"
      ) {

        return false;

      }

      /*
       * Explicit lesson ID is the strongest
       * supported relationship.
       */

      if (
        record.lessonId !== undefined &&
        lessonId !== null &&
        String(
          record.lessonId
        ).trim() ===
        String(
          lessonId
        ).trim()
      ) {

        return true;

      }

      /*
       * Explicit lesson number + book relationship.
       * No relationship is inferred from array order.
       */

      if (
        record.lessonNumber !== undefined &&
        lessonNumber !== undefined &&
        String(
          record.lessonNumber
        ) ===
        String(
          lessonNumber
        )
      ) {

        if (
          record.bookId !== undefined &&
          record.bookId !== null
        ) {

          const recordBookKey =
            getBookKey(
              {
                bookId:
                  record.bookId
              }
            );

          return (
            recordBookKey !== "" &&
            recordBookKey ===
              bookKey
          );

        }

        return false;

      }

      return false;

    }
  );

}


function getAudioRecordLabel(
  record,
  index
) {

  return (
    record.title ||
    record.name ||
    record.filename ||
    record.fileName ||
    record.label ||
    `Audio ${index + 1}`
  );

}


function getAudioSource(
  record
) {

  return (
    record.url ||
    record.audioUrl ||
    record.src ||
    record.href ||
    record.file ||
    record.fileUrl ||
    ""
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

  if (!records.length) {

    return `
      <div class="learning-module pending-card">

        <div class="module-icon">
          🔊
        </div>

        <div class="module-content">

          <h3>
            Main Lesson Audio
          </h3>

          <p>
            0 verified audio records
          </p>

          <small>
            PENDING — SOURCE VERIFICATION REQUIRED
          </small>

        </div>

      </div>
    `;

  }

  return `
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
          ${records.length}
          verified audio record${
            records.length === 1
              ? ""
              : "s"
          }
        </p>

      </div>

    </button>
  `;

}


function openMainLessonAudio(
  lesson,
  book
) {

  const main =
    document.querySelector(
      ".app-main"
    );

  if (!main) return;

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

      <div class="activity-detail">

        <button
          type="button"
          class="back-button"
          id="back-to-lesson-audio"
        >
          ← Back to Lesson
        </button>


        <div class="activity-detail-card">

          <h2>
            Main Lesson Audio
          </h2>

          <p>
            ${escapeHtml(title)}
          </p>


          ${
            records.length
              ? `
                <div class="audio-record-list">

                  ${records
                    .map(
                      (
                        record,
                        index
                      ) => {

                        const label =
                          getAudioRecordLabel(
                            record,
                            index
                          );

                        const source =
                          getAudioSource(
                            record
                          );

                        return `
                          <div class="audio-record-card">

                            <div class="audio-record-header">

                              <strong>
                                ${escapeHtml(label)}
                              </strong>

                              <span>
                                #${index + 1}
                              </span>

                            </div>


                            ${
                              source
                                ? `
                                  <audio
                                    controls
                                    preload="none"
                                    src="${escapeHtml(source)}"
                                  ></audio>
                                `
                                : `
                                  <p class="pending-text">
                                    Audio source URL not verified.
                                    PENDING — SOURCE VERIFICATION REQUIRED
                                  </p>
                                `
                            }

                          </div>
                        `;

                      }
                    )
                    .join("")}

                </div>
              `
              : `
                <div class="pending-card">

                  <p class="pending-text">
                    No verified Main Lesson Audio
                    records are currently available
                    for this lesson.
                  </p>

                  <p>
                    PENDING — SOURCE VERIFICATION REQUIRED
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
      "#back-to-lesson-audio"
    )
    ?.addEventListener(
      "click",
      () =>
        openLesson(
          lesson,
          book
        )
    );

}/* =========================================================
   BOOK KEY RESOLUTION
========================================================= */

function getBookKey(
  book
) {

  if (!book) {

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
      candidate === undefined ||
      candidate === null
    ) {

      continue;

    }


    const key =
      normalizeBookKey(
        candidate
      );


    if (
      BOOK_KEY_ALIASES[key]
    ) {

      return BOOK_KEY_ALIASES[key];

    }


    const compact =
      key.replace(
        /[-_]/g,
        ""
      );


    if (
      BOOK_KEY_ALIASES[compact]
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


  const matches =
    lessons.filter(
      (lesson) => {

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


  return matches;

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
    (record) => {

      /*
       * Explicit lesson ID match.
       */

      if (
        record.lessonId !==
          undefined &&
        lessonId !== null &&
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
   * Fallback only when enough
   * verified identity exists.
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
    new Set([

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
    typeof window.IrodoriProgress.isLessonComplete ===
      "function"
  ) {

    return window.IrodoriProgress.isLessonComplete(
      lessonId
    );

  }


  if (
    typeof window.IrodoriProgress.isComplete ===
      "function"
  ) {

    return window.IrodoriProgress.isComplete(
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
    typeof window.IrodoriProgress.isActivityComplete ===
      "function"
  ) {

    return window.IrodoriProgress.isActivityComplete(
      activityId
    );

  }


  if (
    typeof window.IrodoriProgress.isComplete ===
      "function"
  ) {

    return window.IrodoriProgress.isComplete(
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
    typeof window.IrodoriProgress.getLessonAttemptCount ===
      "function"
  ) {

    return window.IrodoriProgress.getLessonAttemptCount(
      lessonId
    );

  }


  if (
    typeof window.IrodoriProgress.getLessonAttempts ===
      "function"
  ) {

    return window.IrodoriProgress.getLessonAttempts(
      lessonId
    ).length;

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
    typeof window.IrodoriProgress.getActivityAttempts ===
      "function"
  ) {

    return (
      window.IrodoriProgress.getActivityAttempts(
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
      String(value)
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


  if (!main) return;


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
   MAIN AUDIO DEBUG API
========================================================= */

window.IrodoriMainAudio = {

  getRecordsForLesson:
    getMainAudioRecordsForLesson,

  getRecordCountForLesson:
    (
      lesson,
      book
    ) =>
      getMainAudioRecordsForLesson(
        lesson,
        book
      ).length

};
