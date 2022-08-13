(function(){
    var dark_bt = document.querySelector("#dark"),
        light_bt = document.querySelector("#light"),
        firstel = document.querySelector(".firstelement");
    light_bt.addEventListener("click",function(){
        var configdiv = document.querySelector("#darklightdiv");
        if (configdiv != null){
            configdiv.parentNode.removeChild(configdiv);
        }
    });
    dark_bt.addEventListener("click",function(){
        var configdiv = document.querySelector("#darklightdiv");
        if (configdiv == null){
            var configdiv = document.createElement("div");
            configdiv.id = "darklightdiv";
            document.body.insertBefore(configdiv,firstel);
        }
    });
})();