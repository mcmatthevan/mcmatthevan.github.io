$(function () {
    $("#signOut").click(function () {
        $.ajax({
            "method": "POST",
            url: IP + "user/signOut",
            "data": sessioned({}),
            "dataType": "json",
            success: function (response) {
                if (response === "Bye") {
                    delete sessionStorage["limoncello-sessionId"];
                }
                location.search = "?page=connect";
            }
        });
    });
    $("section").hide();
    let auth = isAuth();
    if (auth === "ERR_NOT_AVAILABLE") {
        $("#error_notavailable").show();
        $("#userbloc").hide();
    } else {
        if (auth !== true && locationArgs().page !== "connect") {
            location.search = "?page=connect";
        }
        if (typeof locationArgs().page === "undefined") {
            location.search = "?page=home";
        }
        let args = locationArgs(),
            needpchange = needPassword();
        if (auth === true && needpchange && args.page != "changepassword") {
            location.search = "?page=changepassword";

        }
        if (args.page === "connect") {
            if (auth === true) {
                location.search = "?page=home";
            }
            $("#connection").css("display","flex");
            $("#userbloc").hide();
            $("#connect_form").submit(function (e) {
                e.preventDefault();
                $.ajax({
                    type: "POST",
                    url: IP + "user/auth",
                    data: {
                        "username": $("#user_input").val().trim(),
                        "password": $("#password_input").val()
                    },
                    dataType: "json",
                    success: function (response) {
                        sessionStorage["limoncello-sessionId"] = response;
                        location.search = "?page=home";
                    },
                    error: function (x) {
                        if (x.status === 403) {
                            $("#error_connect").text("Le nom d'utilisateur ou le mot de passe est incorrect.");
                        }
                    }
                });
            });
        } else {
            let userinfos = getUserInfo();
            $("#titlename").text(userinfos[0]);
            $("#titlerole").text(userinfos[1]);
            if (args.page === "home") {
                $("#home").show();
                $("#button_tickets,#button_procedures,#button_indictments").click(function (e) {
                    location.search = "?page=home&show=" + e.currentTarget.id.replace(/button_/, "");
                });
                if (args.show === "tickets") {
                    $("#button_tickets").addClass("selected");
                    $("#button_procedures").removeClass("selected");
                    $("#button_indictments").removeClass("selected");
                    $.ajax({
                        type: "GET",
                        url: IP + "ticket/list",
                        data: sessioned({}),
                        dataType: "json",
                        success: function (response) {
                            if (response != []) {
                                $("#nothing_to_see").html("");
                            }
                            for (let i = 0, c = response.length; i < c; ++i) {
                                let status;
                                if (response[i].closedConfirm === false) {
                                    status = ["waiting", "En attente de clôture"];
                                } else {
                                    status = ["closed", "Clôturé"];
                                }
                                let toappend = "<div class='summary'><div><p class='" + status[0] + "'>" + status[1] + "</p></div><div><h1>" + response[i].title +
                                "</h1><p>" + response[i].comment + "</p></div><div><p>Id : " + response[i].id +
                                "</p><p>" + response[i].authorId + "</p><p>" + new Date(response[i].date * 1000).toLocaleString("fr-FR", { year: 'numeric', month: 'numeric', day: 'numeric', hour: "numeric", minute: "numeric" })
                                + "</p></div></div>";
                                if (status[0] === "waiting"){
                                    $("#home_opened").append(toappend);
                                } else {
                                    $("#home_closed").append(toappend);
                                }
                            }
                        }
                    });
                } else if (args.show === "procedures") {
                    $("#button_tickets").removeClass("selected");
                    $("#button_procedures").addClass("selected");
                    $("#button_indictments").removeClass("selected");

                    $.ajax({
                        type: "GET",
                        url: IP + "procedure/list",
                        data: sessioned({}),
                        dataType: "json",
                        success: function (response) {
                            let status;

                            if (response != []) {
                                $("#nothing_to_see").html("");
                            }
                            for (let i = 0, c = response.length; i < c; ++i) {
                                if (response[i].closedConfirm && !response[i].opened) {
                                    status = ["closed", "Clôturée"];
                                } else if (!response[i].opened) {
                                    status = ["waiting", "En attente de clôture"];
                                } else {
                                    status = ["opened", "En cours"];
                                }
                                let toappend = "<div class='summary'><div><p class='" + status[0] + "'>" + status[1] + "</p></div><div><h1>" + response[i].title +
                                "</h1><p>" + response[i].descr + "</p></div><div><p>Id : " + response[i].id +
                                "</p><p>" + response[i].authorId + "</p><p>" + new Date(response[i].date * 1000).toLocaleString("fr-FR", { year: 'numeric', month: 'numeric', day: 'numeric', hour: "numeric", minute: "numeric" })
                                + "</p></div></div>"
                                if (status[0] === "waiting" || status[0] === "opened"){
                                    $("#home_opened").append(toappend);
                                } else {
                                    $("#home_closed").append(toappend);
                                }
                            }
                        }
                    });
                } else if (args.show === "indictments") {
                    $("#button_tickets").removeClass("selected");
                    $("#button_procedures").removeClass("selected");
                    $("#button_indictments").addClass("selected");
                    $.ajax({
                        type: "GET",
                        url: IP + "indictment/list",
                        data: sessioned({}),
                        dataType: "json",
                        success: function (response) {
                            let status;
                            if (response != []) {
                                $("#nothing_to_see").html("");
                            }
                            for (let i = 0, c = response.length; i < c; ++i) {
                                let status;
                                if (typeof response[i].procedureId === "undefined") {
                                    status = ["opened", "Non-traité"];
                                } else {
                                    status = ["closed", "Traité par<br/>" + response[i].procedureId];
                                }
                                let toappend = "<div class='summary'><div><p class='" + status[0] + "'>" + status[1] + "</p></div><div></div><div><h1>" + response[i].title +
                                "</h1><p>" + response[i].comment + "</p></div><div><p>Id : " + response[i].id +
                                "</p><p>" + response[i].authorId + "</p><p>" + new Date(response[i].date * 1000).toLocaleString("fr-FR", { year: 'numeric', month: 'numeric', day: 'numeric', hour: "numeric", minute: "numeric" })
                                + "</p></div></div>";
                                if (status[0] === "opened"){
                                    $("#home_opened").append(toappend);
                                } else {
                                    $("#home_closed").append(toappend);
                                }
                                
                            }
                        }
                    });
                }
            } else if (args.page === "changepassword") {
                $("#changepassword").show();
                if (needpchange) {
                    $("#group_old").hide();
                    $("#group_old").prop("required", false);
                }
                $("#changepassword_form").submit(function (e) {
                    e.preventDefault();
                    $.ajax({
                        type: "POST",
                        url: IP + "user/changePassword",
                        data: sessioned({
                            old: $("#input_old").val(),
                            new: $("#input_new").val(),
                            confirm: $("#input_confirm").val()
                        }),
                        dataType: "json",
                        success: function (response) {
                            if (response === "OK") {
                                $("#error_changepassword").text("");
                                $("#success_changepassword").text("Le changement a été effectué avec succès.");
                                $("#success_changepassword").append("<br/><a href='?page=home'>Retourner à l'accueil</a>")
                            } else if (response === "ERR_CONFIRM") {
                                $("#success_changepassword").html("");
                                $("#error_changepassword").text("Les mots de passe ne correspondent pas.");
                            } else if (response === "ERR_OLD_PASSWORD_INCORRECT") {
                                $("#success_changepassword").html("");
                                $("#error_changepassword").text("Le mot de passe actuel est incorrect.");
                            }
                        }
                    });
                });
            } else {
                $("#error_404").show();
            }
        }

    }
});