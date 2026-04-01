(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const targetUrl = params.get("url");

  if (!targetUrl) {
    console.error("Parametre GET 'url' manquant. Impossible de charger quiz_content.");
    window.quiz_content = { content: [] };
    return;
  }

  const request = new XMLHttpRequest();

  try {
    // Requete synchrone pour garantir quiz_content avant le chargement de quiz.js.
    request.open("GET", targetUrl, false);
    request.send();
  } catch (error) {
    console.error("Erreur reseau lors du chargement du quiz:", error);
    window.quiz_content = { content: [] };
    return;
  }

  if (request.status < 200 || request.status >= 300) {
    console.error("Echec HTTP lors du chargement du quiz:", request.status, request.statusText);
    window.quiz_content = { content: [] };
    return;
  }

  try {
    const parsed = JSON.parse(request.responseText);
    window.quiz_content = parsed;
  } catch (error) {
    console.error("Le contenu recu n'est pas un JSON valide:", error);
    window.quiz_content = { content: [] };
  }
})();
