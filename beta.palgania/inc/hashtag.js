const regexp = /#[a-z_A-Z0-9]+/g;
var str = document.getElementById('main-articles-view').textContent;

while ((matches = regexp.exec(str)) !== null) {
    console.log(`${matches[0]} trouvé. Prochaine recherche à partir de ${regexp.lastIndex}.`);
}