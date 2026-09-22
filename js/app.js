function showLessonView(bookTitle, lessons) {
  const container = document.getElementById("book-list");

  if (!container) {
    return;
  }

  const lessonCards = lessons.length
    ? lessons
        .map((lesson, index) => {
          const lessonNumber =
            lesson.lessonNumber ||
            lesson.number ||
            lesson.lesson ||
            index + 1;

          const lessonTitle =
            lesson.title ||
            lesson.name ||
            lesson.lessonTitle ||
            `Lesson ${lessonNumber}`;

          return `
            <button
              type="button"
              class="lesson-card"
              data-lesson-index="${index}"
            >
              <span class="lesson-number">
                L${String(lessonNumber).padStart(2, "0")}
              </span>

              <span class="lesson-title">
                ${escapeHtml(lessonTitle)}
              </span>

              <span class="lesson-arrow">→</span>
            </button>
          `;
        })
        .join("")
    : `
        <div class="empty-card">
          <h3>Lessons not found</h3>
          <p>
            No lesson records were matched with this book.
          </p>
        </div>
      `;

  container.innerHTML = `
    <div class="lesson-header">
      <button
        type="button"
        class="back-button"
        id="back-to-books"
      >
        ← Back to Books
      </button>

      <h2>${escapeHtml(bookTitle)}</h2>
      <p>${lessons.length} lesson records found</p>
    </div>

    <div class="lesson-list">
      ${lessonCards}
    </div>
  `;

  const backButton = document.getElementById("back-to-books");

  if (backButton) {
    backButton.addEventListener("click", () => {
      renderBooks();
    });
  }

  document
    .querySelectorAll(".lesson-card")
    .forEach((card) => {
      card.addEventListener("click", () => {
        const index = Number(card.dataset.lessonIndex);

        openLesson(lessons[index], bookTitle);
      });
    });
}
function openLesson(lesson, bookTitle) {
  if (!lesson) {
    return;
  }

  const lessonNumber =
    lesson.lessonNumber ||
    lesson.number ||
    lesson.lesson ||
    "";

  const lessonTitle =
    lesson.title ||
    lesson.name ||
    lesson.lessonTitle ||
    `Lesson ${lessonNumber}`;

  const container = document.getElementById("book-list");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="lesson-detail">
      <button
        type="button"
        class="back-button"
        id="back-to-lessons"
      >
        ← Back to Lessons
      </button>

      <div class="lesson-detail-card">
        <div class="lesson-detail-number">
          L${String(lessonNumber).padStart(2, "0")}
        </div>

        <h2>${escapeHtml(lessonTitle)}</h2>

        <p class="lesson-book-name">
          ${escapeHtml(bookTitle)}
        </p>

        <div class="lesson-placeholder">
          <h3>Lesson content</h3>

          <p>
            Activities, Can-do items, vocabulary,
            audio and study content will be connected
            in the next stages.
          </p>
        </div>
      </div>
    </div>
  `;

  const backButton = document.getElementById("back-to-lessons");

  if (backButton) {
    backButton.addEventListener("click", () => {
      showLessonView(bookTitle, findLessonsForBook(
        booksData.find((book) => {
          const bookName =
            book.title ||
            book.name ||
            book.bookTitle;

          return bookName === bookTitle;
        }) || {}
      ));
    });
  }
}
