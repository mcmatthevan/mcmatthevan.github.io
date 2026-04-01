(function () {
  "use strict";

  if (!window.quiz_content || typeof window.quiz_content !== "object") {
    throw new Error("quiz_content doit etre un objet JSON contenant au minimum le champ 'content'");
  }

  const quizData = window.quiz_content;
  if (!Array.isArray(quizData.content)) {
    throw new Error("quiz_content.content doit etre un tableau de questions");
  }

  const quizQuestions = quizData.content;

  const form = document.getElementById("quiz-form");
  const resultPanel = document.getElementById("result-panel");
  const scoreValue = document.getElementById("score-value");

  const state = {
    total: quizQuestions.length,
    scored: new Set(),
    submitted: false
  };
  const quizTitle = typeof quizData.title === "string" && quizData.title.trim() !== ""
    ? quizData.title.trim()
    : "Quiz";

  applyQuizTitle(quizTitle);

  renderQuiz(quizQuestions);
  updateScoreDisplay();

  function applyQuizTitle(title) {
    const heading = document.querySelector(".quiz-header h1");
    if (heading) {
      heading.textContent = title;
    }

    document.title = title;
  }

  function renderQuiz(questions) {
    form.innerHTML = "";

    questions.forEach(function (q, index) {
      const card = document.createElement("article");
      card.className = "question-card";
      card.dataset.index = String(index);

      const title = document.createElement("h2");
      title.className = "question-title";
      title.textContent = (index + 1) + ". " + q.question;
      card.appendChild(title);

      const optionsWrapper = document.createElement("div");
      optionsWrapper.className = "options";

      if (q.type === "radio") {
        renderRadio(q, index, optionsWrapper);
      } else if (q.type === "checkbox") {
        renderCheckbox(q, index, optionsWrapper);
      } else if (q.type === "text") {
        renderText(index, optionsWrapper);
      } else {
        throw new Error("Type de question inconnu: " + q.type);
      }

      card.appendChild(optionsWrapper);

      const feedback = document.createElement("div");
      feedback.className = "feedback hidden";
      feedback.id = "feedback-" + index;
      card.appendChild(feedback);

      const actions = document.createElement("div");
      actions.className = "actions hidden";
      actions.id = "actions-" + index;

      const retryBtn = document.createElement("button");
      retryBtn.type = "button";
      retryBtn.className = "secondary-btn";
      retryBtn.textContent = "Valider cette correction";
      retryBtn.addEventListener("click", function () {
        evaluateQuestion(index, true);
      });

      const revealBtn = document.createElement("button");
      revealBtn.type = "button";
      revealBtn.className = "secondary-btn";
      revealBtn.textContent = "Afficher la solution";
      revealBtn.addEventListener("click", function () {
        revealSolution(index);
      });

      actions.appendChild(retryBtn);
      actions.appendChild(revealBtn);
      card.appendChild(actions);

      form.appendChild(card);
    });

    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.className = "submit-btn";
    submitBtn.textContent = "Soumettre le quiz";
    form.appendChild(submitBtn);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      state.submitted = true;

      quizQuestions.forEach(function (_, index) {
        evaluateQuestion(index, false);
      });

      updateFinalMessage();
    });
  }

  function renderRadio(question, index, container) {
    question.options.forEach(function (option, optIndex) {
      const line = document.createElement("label");
      line.className = "option-line";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "q-" + index;
      input.value = String(optIndex);

      const text = document.createElement("span");
      text.textContent = option;

      line.appendChild(input);
      line.appendChild(text);
      container.appendChild(line);
    });
  }

  function renderCheckbox(question, index, container) {
    question.options.forEach(function (option, optIndex) {
      const line = document.createElement("label");
      line.className = "option-line";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "q-" + index;
      input.value = String(optIndex);

      const text = document.createElement("span");
      text.textContent = option;

      line.appendChild(input);
      line.appendChild(text);
      container.appendChild(line);
    });
  }

  function renderText(index, container) {
    const input = document.createElement("input");
    input.type = "text";
    input.name = "q-" + index;
    input.className = "text-answer";
    input.autocomplete = "off";
    container.appendChild(input);
  }

  function evaluateQuestion(index, fromCorrectionButton) {
    const question = quizQuestions[index];
    const card = findCard(index);
    const feedback = document.getElementById("feedback-" + index);
    const actions = document.getElementById("actions-" + index);

    const isCorrect = isAnswerCorrect(question, index);

    card.classList.remove("correct", "incorrect");
    feedback.classList.remove("hidden", "correct", "incorrect");

    if (isCorrect) {
      card.classList.add("correct");
      feedback.classList.add("correct");
      feedback.innerHTML = '<span class="icon">&#10003;</span> Reponse correcte. ' + escapeHtml(question.explain || "");

      state.scored.add(index);
      actions.classList.add("hidden");
      lockQuestion(index);
    } else {
      card.classList.add("incorrect");
      feedback.classList.add("incorrect");

      if (fromCorrectionButton) {
        feedback.innerHTML = '<span class="icon">&#10007;</span> Toujours incorrect. Corrigez encore, ou affichez la solution.';
      } else {
        feedback.innerHTML = '<span class="icon">&#10007;</span> Reponse incorrecte. Corrigez votre reponse ou affichez la solution.';
      }

      actions.classList.remove("hidden");
    }

    updateScoreDisplay();
    if (state.submitted) {
      updateFinalMessage();
    }
  }

  function revealSolution(index) {
    const question = quizQuestions[index];
    const feedback = document.getElementById("feedback-" + index);
    const actions = document.getElementById("actions-" + index);

    feedback.classList.remove("hidden", "correct");
    feedback.classList.add("incorrect");
    feedback.innerHTML =
      '<span class="icon">&#10007;</span> Solution: ' +
      escapeHtml(solutionToText(question)) +
      (question.explain ? ' | ' + escapeHtml(question.explain) : "");

    actions.classList.add("hidden");
    lockQuestion(index);

    if (state.submitted) {
      updateFinalMessage();
    }
  }

  function isAnswerCorrect(question, index) {
    if (question.type === "radio") {
      const selected = form.querySelector('input[name="q-' + index + '"]:checked');
      return !!selected && Number(selected.value) === question.answer;
    }

    if (question.type === "checkbox") {
      const nodes = form.querySelectorAll('input[name="q-' + index + '"]:checked');
      const picked = Array.prototype.slice.call(nodes).map(function (node) {
        return Number(node.value);
      }).sort();

      const expected = question.answer.slice().sort();
      if (picked.length !== expected.length) {
        return false;
      }

      return picked.every(function (value, i) {
        return value === expected[i];
      });
    }

    if (question.type === "text") {
      const input = form.querySelector('input[name="q-' + index + '"]');
      const value = (input && input.value ? input.value : "").trim();

      if (Array.isArray(question.check) && question.check.length >= 1) {
        const pattern = question.check[0];
        const flags = question.check[1] || "";
        const regex = new RegExp(pattern, flags);
        return regex.test(value);
      }

      return normalizeText(value) === normalizeText(String(question.answer || ""));
    }

    return false;
  }

  function updateScoreDisplay() {
    scoreValue.textContent = state.scored.size + "/" + state.total;
  }

  function updateFinalMessage() {
    const remaining = state.total - state.scored.size;
    if (remaining === 0) {
      resultPanel.textContent = "Parfait: toutes les reponses sont correctes.";
      return;
    }

    resultPanel.textContent =
      "Score actuel: " + state.scored.size + "/" + state.total +
      ". Vous pouvez encore corriger les questions en rouge.";
  }

  function solutionToText(question) {
    if (question.type === "radio") {
      return question.options[question.answer];
    }

    if (question.type === "checkbox") {
      return question.answer.map(function (idx) {
        return question.options[idx];
      }).join(", ");
    }

    return String(question.answer || "");
  }

  function findCard(index) {
    return form.querySelector('.question-card[data-index="' + index + '"]');
  }

  function lockQuestion(index) {
    const nodes = form.querySelectorAll('[name="q-' + index + '"]');
    nodes.forEach(function (node) {
      node.disabled = true;
    });
  }

  function normalizeText(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
