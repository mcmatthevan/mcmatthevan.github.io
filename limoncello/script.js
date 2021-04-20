$(function(){
    $("#signOut").click(function(){
        $.ajax({
            "method": "POST",
            url : IP + "user/signOut",
            "data": sessioned({}),
            "dataType": "json",
            success: function(response){
                if (response === "Bye"){
                    delete sessionStorage["limoncello-sessionId"];
                }
                location.search = "?page=connect";
            }
        });
    });
    $("section").hide();
    let auth = isAuth();
    if (auth === "ERR_NOT_AVAILABLE"){
        $("#error_notavailable").show();
    } else {
        if (auth !== true && locationArgs().page !== "connect"){
            location.search = "?page=connect";
        }
        if (typeof locationArgs().page === "undefined"){
            location.search = "?page=home";
        }
        let args = locationArgs();
        if (args.page === "connect"){
            if (auth === true){
                location.search = "?page=home";
            }
            $("#connection").show();
            $("#signOut").hide();
            $("#button_connect").click(function(e){
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
                    error: function(x){
                        if (x.status === 403){
                            $("#error_connect").text("Le nom d'utilisateur ou le mot de passe est incorrect.");
                        }
                    }
                });
            });
        } else if (args.page === "home"){
            $("#home").show();
            $("#button_tickets,#button_procedures,#button_indictments").click(function(e){
                location.search = "?page=home&show=" + e.currentTarget.id.replace(/button_/,"");
            });
            if (args.show === "tickets"){
                $("#button_tickets").addClass("selected");
                $("#button_procedures").removeClass("selected");
                $("#button_indictments").removeClass("selected");
                $.ajax({
                    type: "GET",
                    url: IP + "ticket/list",
                    data: sessioned({}),
                    dataType: "json",
                    success: function (response) {
                        if (response != []){
                            $("#home_cadre").html("");
                        }
                        for (let i = 0, c = response.length ; i < c ; ++i){
                            $("#home_cadre").append("<div class='summary'><div></div><div><h1>" + response[i].title + 
                            "</h1><p>" + response[i].comment + "</p></div><div><p>Id : " + response[i].id +
                            "</p><p>" + response[i].authorId + "</p><p>" + new Date(response[i].date*1000).toLocaleString("fr-FR",{year: 'numeric', month: 'numeric', day: 'numeric' ,hour:"numeric",minute:"numeric"})
                             + "</p></div></div>")
                        }
                    }
                });
            } else if (args.show === "procedures"){
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
                        
                        if (response != []){
                            $("#home_cadre").html("");
                        }
                        for (let i = 0, c = response.length ; i < c ; ++i){
                            if (response[i].closedConfirm && !response[i].opened){
                                status = ["closed","Clôturée"];
                            } else if (!response[i].opened){
                                status = ["waiting","En attente de clôture"];
                            } else {
                                status = ["opened","En cours"];
                            }
                            $("#home_cadre").append("<div class='summary'><div><p class='" + status[0] + "'>" + status[1] + "</p></div><div><h1>" + response[i].title + 
                            "</h1><p>" + response[i].descr + "</p></div><div><p>Id : " + response[i].id +
                            "</p><p>" + response[i].authorId + "</p><p>" + new Date(response[i].date*1000).toLocaleString("fr-FR",{year: 'numeric', month: 'numeric', day: 'numeric' ,hour:"numeric",minute:"numeric"})
                             + "</p></div></div>")
                        }
                    }
                });
            } else if (args.show === "indictments"){
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
                        if (response != []){
                            $("#home_cadre").html("");
                        }
                        for (let i = 0, c = response.length ; i < c ; ++i){
                            if (response[i].procedureId === null){
                                status = ["opened","Non-traité"];
                            } else {
                                status = ["closed","Traité par <br/>" + (response[i].procedureId.charAt(0) === "t" ? "ticket":"procédure") + "<br/> n° "+response[i].procedureId];
                            }
                            $("#home_cadre").append("<div class='summary'><div><p class='" + status[0] + "'>" + status[1] + "</p></div><div></div><div><h1>" + response[i].title + 
                            "</h1><p>" + response[i].comment + "</p></div><div><p>Id : " + response[i].id +
                            "</p><p>" + response[i].authorId + "</p><p>" + new Date(response[i].date*1000).toLocaleString("fr-FR",{year: 'numeric', month: 'numeric', day: 'numeric' ,hour:"numeric",minute:"numeric"})
                             + "</p></div></div>")
                        }
                    }
                });
            }
        }
    }
});