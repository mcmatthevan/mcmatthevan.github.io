document.querySelector("header").innerHTML = `<nav>
<ul>
    <li id="banner_index"><a href="`+ BANNER_PREFIX + `index.html">Accueil</a></li>
    <li id="banner_regles"><a href="`+ BANNER_PREFIX + `regles.html">Règlement</a></li>
    <li id="banner_actus"><a href="`+ BANNER_PREFIX + `actus/">Actualités</a></li>
    <li id="banner_contacts"><a href="`+ BANNER_PREFIX + `contacts.html">Contacts</a></li>
    <li id="banner_wikip"><a href="`+ BANNER_PREFIX + `wiki/player.html">Wiki Joueurs</a></li>
</ul>
</nav>`;

document.querySelector("footer").innerHTML = `Palgania™<br>
<a href="` + BANNER_PREFIX + `vote">Voter pour Palgania</a> dans le top <a
    href="http://www.serveurs-minecraft.org/">Serveurs Minecraft</a><br>
<span style='font-size: 0.7em;'>Icons made by <a href="https://www.flaticon.com/authors/freepik"
        title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">
        www.flaticon.com</a><br>Serveur répertorié sur <a href="http://www.serveur-minecraft.eu/">Serveur
        Minecraft EU</a></span><br>
`;

if (BANNER !== null){
    document.getElementById(BANNER).className = "selected";

}

var banniere = document.querySelectorAll(".firstelement"),
    menu = document.querySelector("header");

for (let i = 0, c = banniere.length; i < c; ++i) {
    banniere[i].style.marginTop = menu.offsetHeight + 20 + "px";
}