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
    }

})();
