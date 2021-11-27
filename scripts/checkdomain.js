(function(){
    if (location.host == "mcmatthevan.github.io"){
        let req = new XMLHttpRequest();
        req.open("GET","https://palgania.ovh");
        req.addEventListener("loadend",function(e){
            if (e.currentTarget.status == 200){
                location.host = "palgania.ovh";
            }
        });
        req.send();
    } else if (location.host == "palgania.ovh"){
        window.onload = function(e){
            console.log("loaded");
            let links = document.querySelectorAll("a");
            for (let i = 0, c = links.length ; i < c ; i++){
                links[i].href = links[i].href.replace(/mcmatthevan\.github\.io/g,"palgania.ovh");
            }
        };
    }

})();
