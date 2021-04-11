$(function () {
    var ip = "localhost";
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
                        location.href = "http://" + ip + ":" + response.port + "/index?code=" + response.code;
                    }
                },
                error: function (x, s, e) {
                    $("#error").html("Aucun serveur de permanence ne semble être joignable. Vérifiez vos inscriptions et horaires de passage.<br/>Si vous pensez qu'il s'agit d'une erreur, <a href='https://mcmatthevan.github.io/palgania/contacts.html'>contactez un administrateur</a>.");
                }
            });
        }
    });
});