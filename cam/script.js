$(function () {
    let ip = location.search.replace(/^[\s\S]*[\?&]ip=([\S\s]*?)(?:&[\S\s]*)?$/,"$1");
    if (ip == ""){
        ip = "51.77.148.210";
    }
    function ping(port,code){
        $.ajax({
            type: "GET",
            url: "http://" + ip + ":" + port + "/apps/ping?code=" + code,
            success: function(){
                location.href = "http://" + ip + ":" + port + "/index?code=" + code;
            },
            error: function(){
                setTimeout(function(){
                    return ping(port,code);
                },1000)
            }
        })
    }
    $("#ok").click(function (e) {
        var id = $("#id").val().trim(),
            mdp = $("#mdp").val().trim();

        if (id.length != 8 || mdp.length != 12 || /(?:[0-9]|[A-Z])/.test(id) || /(?:[0-9]|[A-Z])/.test(mdp)) {
            $("#error").text("L'identifiant ou le mot de passe est incorrect.");
        } else {
            $("#error").html("&nbsp;");
            $.ajax({
                type: "POST",
                url: "http://" + ip + ":6488/index?code=9090",
                data: {
                    "id": id,
                    "mdp": mdp
                },
                success: function (response) {
                    if (response == "INCORRECT") {
                        $("#error").text("L'identifiant ou le mot de passe est incorrect.");
                    } else {
                        response = JSON.parse(response);
                        $("#info").text("Veuillez patienter, vous serez bientôt redirigé vers le serveur d'examen...");
                        ping(response.port,response.code);
                    }
                },
                error: function (x, s, e) {
                    $("#error").html("Aucun serveur de permanence ne semble être joignable. Vérifiez vos inscriptions et horaires de passage.<br/>Si vous pensez qu'il s'agit d'une erreur, <a href='https://mcmatthevan.github.io/palgania/contacts.html'>contactez un administrateur</a>.");
                }
            });
        }
    });
});