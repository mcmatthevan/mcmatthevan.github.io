$(function(){
    let args = locationArgs();
    if (isAuth() && checkPerm("admin.access")){
        if (typeof args.page === "undefined"){
            location.search = "?page=usermanage";
        }
        if (args.page === "usermanage" && checkPerm("user.manage.list")){
            $("#usermanage").show();
            $.ajax({
                type: "GET",
                url: IP + "user/list",
                data: sessioned({}),
                dataType: "json",
                success: function (response) {
                    for (let i = 0, c = response.length ; i < c ; ++i){
                        $("#userlist").append("<tr><td>" + response[i].title[0] + "</td><td><a href='mailto:" + response[i].email + "'>" + response[i].email + "</a></td><td>" + response[i].title[1] + "</td></tr>");
                    }
                    if (checkPerm("user.manage.new")){
                        $("#userlist").append("<tr><td colspan='3'><a href='?page=newuser' id='newuser'>⊕</a></td></tr>");
                    }
                }
            });
        } else if (args.page === "newuser" && checkPerm("user.manage.new")){
            $("#usernew").show();
            $("#form_newuser").submit(function(e){
                e.preventDefault();
                if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test($("#nwu_email").val().trim())){
                    $("#p_error").html("");
                    $("#p_info").html("Veuillez patienter...");
                    $.ajax({
                        type: "POST",
                        url: IP + "user/new",
                        data: sessioned({
                            username: $("#nwu_pseudo").val().trim(),
                            title: $("#nwu_title").val().trim(),
                            email: $("#nwu_email").val().trim(),
                            dosendmail: $("#nwu_sendmail").prop("checked") ? 1 : 0,
                            perms: JSON.stringify($("#nwu_perms").val().trim().split(/\s*;\s*/g))
                        }),
                        dataType: "json",
                        success: function (response) {
                            if ($("#nwu_sendmail").prop("checked")){
                                $("#p_info").html("Un nouvel utilisateur a été créé et les identifiants ont été envoyés par mail.")
                            } else {
                                $("#p_info").html("Un nouvel utilisateur a été créé avec les identifiants suivants :<br/>\
                                Nom d'utilisateur : " + response[0] + "<br>Mot de passe : " + response[1]);
                            }
                            $("#p_info").append("<br/><br/><a href='?page=usermanage'>Retourner à la liste des utilisateurs</a>");
                        }
                    });
                } else {
                    $("#p_error").html("L'adresse email n'est pas dans un format correct.")
                }
                
            });
        }
    } else {
        location.href = "index.html";
    }
});