$(function () {
    let args = locationArgs();
    if (typeof args.confirm === "undefined") {
        $("input[type=submit]").click(function () {
            if (/^[A-Z]+[0-9]{4}\-[0-9]{2}\-[0-9]{2}\-[0-9]+/.test($("#cam_id").val().trim())) {
                $("#cam_id").get(0).setCustomValidity("");
            } else {
                $("#cam_id").get(0).setCustomValidity("Format d'identifiant C.A.M. invalide. L'identifiant des certificats délivrés par le serveur sont de la forme PALGXXXX-XX-XX-XXXX.");
            }
            if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test($("#cam_email").val().trim())) {
                $("#cam_email").get(0).setCustomValidity("");
            } else {
                $("#cam_email").get(0).setCustomValidity("Format d'adresse email invalide.");
            }
        });
        $("#candidate_form").submit(function (e) {
            e.preventDefault();
            $("#loading").show();
            $("#info_tr").hide();
            $("#error_tr").hide();
            $("input[type=submit]").prop("disabled", true);
            $.ajax({
                type: "POST",
                url: IP + "services/candidate",
                data: {
                    pseudo: $("#cam_pseudo").val().trim(),
                    cam_id: $("#cam_id").val().trim(),
                    email: $("#cam_email").val().trim(),
                    text: $("#cam_text").val().trim(),
                    gender: $("input[name=gender]:checked").val()
                },
                dataType: "json",
                success: function (response) {
                    $("#loading").hide();
                    if (response === "OK") {
                        $(".info").html("Votre candidature a bien été enregistrée.<br>Vous devez maintenant confirmer son envoi avec le lien que vous avez reçu par mail.");
                        $("#info_tr").show();
                    } else if (response === "ERR_UNKNOWN_ID") {
                        $("input[type=submit]").prop("disabled", false);
                        $(".error").text("Le numéro d'identifiant du C.A.M. est invalide.");
                        $("#error_tr").show();
                    } else if (response === "ERR_NOMATCH") {
                        $("input[type=submit]").prop("disabled", false);
                        $(".error").text("L'identifiant du C.A.M. spécifié ne correspond pas à votre pseudo.");
                        $("#error_tr").show();
                    }
                },
                error: function (x) {
                    $("input[type=submit]").prop("disabled", false);
                    $("#loading").hide();
                    $(".error").text("Une erreur inattendue est survenue.");
                    $("#error_tr").show();
                }
            });
        });
    } else {
        $("#mainsection").hide();
        $("#sect_confirm").show();
        $.ajax({
            type: "POST",
            url: IP + "services/candidate_confirm",
            data: {
                subm_id: args.confirm
            },
            dataType: "json",
            success: function (response) {
                if (response === "OK"){
                    $("#sect_confirm").html("<h1>Confirmation terminée</h1><br/>Votre candidature a été communiquée aux examinateurs.<br/>Vous recevrez un compte-rendu une fois celle-ci analysée.")
                }
            },
            error: function(x){
                if (x.status === 404){
                    $("#sect_confirm").html("<p class='error'>Erreur : lien de confirmation incorrect</p>");
                } else {
                    $("#sect_confirm").html("<p class='error'>Une erreur inattendue est survenue</p>");
                }
            }
        });
    }

});