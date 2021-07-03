var banniere = document.querySelectorAll(".firstelement"),
            menu = document.querySelector("header");

            for (let i = 0, c = banniere.length ; i < c ; ++i){
                banniere[i].style.marginTop = menu.offsetHeight + 20 + "px";
            }