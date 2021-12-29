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
    let auth = isAuth(),
        counter = 0;
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
            $("#connection").css("display", "flex");
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
            $("#userbloc").css("display","flex");
            if (checkPerm("admin.access")){
                $("#homesettings").append("<a id='configlink' href='admin.html'>🔒 Administration</a>")
            }
            let userinfos = getUserInfo();
            $("#titlename").text(userinfos[0]);
            $("#titlerole").html(userinfos[1].replace(/\n/g,"<br>"));
            if (args.page === "newact"){
                $("#newact").css("display","block");
                if (typeof args.act === "undefined"){
                    $("#newact_choose").show();
                    $(".newAct").click(function(){
                        location.search = "?page=newact&id=" + args.id + "&act=" + this.id.replace(/newAct_/,"");
                    });
                } else {
                    $("#newact").append(`<form class='form_NA' id='form_NA_` + args.act + `'><fieldset class='fieldset_NA'>
                    <legend>` + _classEquivalent[args.act] + `</legend>
                    </fieldset></form><p class="error"></p><div id="request_result"></div>`);
                    for (let i in ACTLIST[args.act]){
                        $(".fieldset_NA").append(`<label for="inputNA_` + i + `">`+ACTLIST[args.act][i][0]+` : </label>`);
                        let attrs = `class="inputNA" id="inputNA_` + i + '" ' + (ACTLIST[args.act][i][1] ? "required":"");
                        if (typeof ACTLIST[args.act][i][2] === "undefined"){
                            $(".fieldset_NA").append("<input type='text' " + attrs + "/><br/>");
                        } else {
                            $(".fieldset_NA").append(ACTLIST[args.act][i][2].replace(/\$\$/g,attrs).replace(/\$pseudo\$/g,getUserInfo()[0]));
                        }
                    }
                    $(".fieldset_NA").append("<input type='submit' value='OK'/>");
                    $(".form_NA").submit(function(e){
                        e.preventDefault();
                        let dic = {type: args.act, authorId:"", procedure_id_:args.id};
                        $(".inputNA").each(function(i,v){
                            if (v.type === "date"){
                                dic[v.id.replace(/inputNA_/g,"")] = Math.floor(new Date($(v).val()).getTime()/1000);
                            } else if (v.id === "inputNA_content"){
                                dic[v.id.replace(/inputNA_/g,"")] = $(v).val().replace(/;/g,":::");
                            } else if (v.id === "inputNA_temp"){
                                dic[v.id.replace(/inputNA_/g,"")] = parseInt($(v).val())*60;
                            } else {
                                dic[v.id.replace(/inputNA_/g,"")] = $(v).val();
                            }
                        });
                        $.ajax({
                            type: "POST",
                            url: IP + "procedure/newAct",
                            data: sessioned(dic),
                            dataType: "json",
                            success: function (response) {
                                if (response === "OK"){
                                    location.search = "?page=display&show=procedure&id=" + args.id;
                                } else if (response === "ERR_TOO_MANY_LINES"){
                                    $(".error").html("La requête ne peut pas aboutir car le nombre de résultats est trop conséquent.<br>\
                                    Essayez d'affiner la recherche.");
                                    $("#request_result").html("");
                                } else if (response === "BAD_PSEUDO"){
                                    $(".error").html("La requête ne peut pas aboutir car le pseudo spécifié est incorrect.");
                                    $("#request_result").html("");
                                } else if (response === "ERR_BAD_GROUP" || response === "ERR_BAD_USER"){
                                    $(".error").html("La requête ne peut pas aboutir car le pseudo spécifié ne correspond pas au pseudo d'un modérateur.");
                                    $("#request_result").html("");
                                } else {
                                    $(".error").html("");
                                    $("#request_result").html("<h4>Résultat de la requête :</h4><hr/><div id='pre_result'>"+response+"</div>");
                                    if (args.act == "TempPerm"){
                                        $("input").prop("disabled",true);
                                    }
                                }
                            },
                            error: function(x){
                                if (x.status === 425){
                                    $(".error").html("Erreur : nombre de requêtes trop conséquent<br>Réessayez dans quelques secondes.")
                                }
                            }
                        });
                    });
                }
            } else if (args.page === "display") {
                if (args.show === "indictment") {
                    $.ajax({
                        type: "GET",
                        url: IP + "indictment/see",
                        data: sessioned({ id: args.id }),
                        dataType: "json",
                        success: function (response) {
                            console.log(response);
                            $("#display_section").css("display", "flex");
                            $("#main_title").addClass("indictment");
                            $("#big_title").text("Réquisitoire n°" + response.id);
                            $("#subtitle_infos").text("Créé par " + response.authorName + " le " + stringDate(response.date));
                            $("#a_title").text(response.title);
                            $("#a_descr").html(response.comment.replace(/\n/g, "<br>"));
                            if (response.tempActs.length > 0) {
                                let form = "";
                                for (let i = 0, c = response.tempActs.length; i < c; i++) {
                                    form += formatSanct(response.tempActs[i]);
                                }
                                $("#display_table").append(`<tr>
                                <td class='end'>Sanctions temporairement appliquées :</td><td id='sanct_display_td'>` + form + `</td>
                                </tr>`);
                            }
                            if (response.procedureId === null) {
                                $("#display_table").append("<tr><td class='end'>Statut:</td><td class='opened'>Non-traité</td></tr><tr><td></td><td id='statut_td'></td></tr>");
                                if (checkPerm("procedure.new")) {
                                    $("#statut_td").append("<a class='new' href='index.html?page=new&new=procedure&init=" + response.id + "' title='Traiter le réquisitoire par une procédure'>⊕ nouvelle procédure</a>");
                                }
                                if (checkPerm("ticket.new")) {
                                    $("#statut_td").append("<a class='new' href='index.html?page=new&new=ticket&init=" + response.id + "' title='Traiter le réquisitoire par un ticket'>⊕ nouveau ticket</a>");
                                }
                            } else {
                                let tickorproc = {
                                    "p": "procedure",
                                    "t": "ticket"
                                }[response.procedureId.substring(0, 1)];
                                $("#display_table").append("<tr><td class='end'>Statut:</td><td class='closed'>Traité par <a href='?page=display&show=" + tickorproc + "&id=" + response.procedureId + "'>" + response.procedureId + "</a></td></tr>");
                            }

                        },
                        error: function (x) {
                            if (x.status === 404) {
                                $("#error_404").show();
                            }
                        }
                    });
                } else if (args.show === "ticket") {
                    $.ajax({
                        type: "GET",
                        url: IP + "ticket/see",
                        data: sessioned({ id: args.id }),
                        dataType: "json",
                        success: function (response) {
                            console.log(response);
                            $("#display_section").css("display", "flex");
                            $("#main_title").addClass("ticket");
                            $("#big_title").text("Ticket n°" + response.id);
                            $("#subtitle_infos").text("Créé par " + response.authorName + " le " + stringDate(response.date));
                            $("#a_title").text(response.title);
                            $("#a_descr").html(response.comment.replace(/\n/g, "<br>"));

                            if (typeof response.initiative.valueOf() === "string") {
                                let objind = { type: "Indictment", Id: "<a class='normalsize' href='?page=display&show=indictment&id=" + response.initiative.replace(/::Indictment\./g, "") + "'>" + response.initiative.replace(/::Indictment\./g, "") + "</a>" };
                                $("#display_table").append("<tr><td class='end'>Initiative de la procédure :</td><td>" + formatSanct(objind) + "</td></tr>");
                            } else {
                                $("#display_table").append("<tr><td class='end'>Initiative de la procédure :</td><td>" + formatSanct(response.initiative, ["date"], {}, { "target": "Joueur ciblé :" }) + "</td></tr>")
                            }
                            if (response.act.comment !== "") {
                                $("#display_table").append(`<tr><td colspan='2'><hr/>
                                <table class='acts_list'><tr><td colspan='5' class='tag'>Liste des actes de procédure</td></tr><tr><td class='tag'>Type</td>
                                <td class='tag'>Acte</td><td class='tag'>Date</td>
                                <td class='tag'>Auteur</td></tr>`+ formatAct(response.act, []) + `</table><hr/></td></tr>`);
                            }

                            if (response.closeActs.length > 0) {
                                let form = "";
                                for (let i = 0, c = response.closeActs.length; i < c; i++) {
                                    form += formatSanct(response.closeActs[i]);
                                }
                                $("#display_table").append(`<tr>
                                <td class='end'>Décisions clôturant le ticket :</td><td id='sanct_display_td'>` + form + `</td>
                                </tr>`);
                            }
                            if (response.closedConfirm) {
                                $("#display_table").append("<tr><td class='end'>Statut :</td><td class='closed'>Clôturé</td></tr>");
                            } else {
                                $("#display_table").append("<tr><td class='end'>Statut :</td><td class='waiting'>En attente de clôture</td></tr>");
                                if (checkPerm("ticket.close.confirm")) {
                                    $("#display_table").append(`<tr><td></td><td>
                                    <form class='formcl'>
                                        <label for='close_password' class='tag end'>Entrez votre mot de passe pour clôturer le ticket :</label><input type='password' id='close_password' required/><input type='submit' value='OK'/>
                                        <p id='p_error'></p>
                                        </form>
                                    </td>`);
                                }
                                $(".formcl").submit(function (e) {
                                    e.preventDefault();
                                    $.ajax({
                                        type: "POST",
                                        url: IP + "ticket/close",
                                        data: sessioned({
                                            "id": response.id,
                                            "password": $("#close_password").val()
                                        }),
                                        dataType: "json",
                                        success: function (response) {
                                            if (response === "ERR_PASSWORD") {
                                                $("#p_error").html("Mot de passe incorrect");
                                            } else if (response === "OK") {
                                                $("#p_error").html("");
                                                location.reload();
                                            }
                                        },
                                        error: function(s){
                                            if (s.status === 425){
                                                $("#p_error").html("Nombre de requêtes serveurs trop important. <br/>Veuillez réessayer dans quelques secondes.")
                                            }
                                        }
                                    });
                                });
                            }
                            if (response.closeManage.length > 0) {
                                $("#display_table").append("<tr><td id='closemanagetd' colspan='2'><hr/></td></tr>");
                            }
                            for (let i = 0, c = response.closeManage.length; i < c; i++) {
                                $("#closemanagetd").append(formatCloseManage(response.closeManage[i]) + "<br/>");
                            }


                        },
                        error: function (x) {
                            if (x.status === 404) {
                                $("#error_404").show();
                            }
                        }
                    });
                } else if (args.show === "procedure") {
                    $.ajax({
                        type: "GET",
                        url: IP + "procedure/see",
                        data: sessioned({ id: args.id }),
                        dataType: "json",
                        success: function (response) {
                            console.log(response);
                            $("#display_section").css("display", "flex");
                            $("#main_title").addClass("procedure");
                            $("#big_title").text("Procédure n°" + response.id);
                            $("#subtitle_infos").text("Créée par " + response.authorName + " le " + stringDate(response.date));
                            $("#a_title").text(response.title);
                            $("#a_descr").html(response.descr.replace(/\n/g, "<br>"));

                            if (typeof response.initiative.valueOf() === "string") {
                                let objind = { type: "Indictment", Id: "<a class='normalsize' href='?page=display&show=indictment&id=" + response.initiative.replace(/::Indictment\./g, "") + "'>" + response.initiative.replace(/::Indictment\./g, "") + "</a>" };
                                $("#display_table").append("<tr><td class='end'>Initiative de la procédure :</td><td>" + formatSanct(objind) + "</td></tr>");
                            } else {
                                $("#display_table").append("<tr><td class='end'>Initiative de la procédure :</td><td>" + formatSanct(response.initiative, ["date"], {}, { "target": "Joueur ciblé :" }) + "</td></tr>")
                            }
                            $("#display_table").append(`<tr><td colspan='2'><hr/>
                            <table class='acts_list'><tr><td colspan='5' class='tag'>Liste des actes de procédure</td></tr><tr><td class='tag'>Type</td>
                            <td class='tag'>Acte</td><td class='tag'>Date</td>
                            <td class='tag'>Auteur</td></tr></table><hr/></td></tr>`);
                            for (let i = 0, c = response.acts.length; i < c; i++) {
                                $(".acts_list").append(formatAct(response.acts[i], []));
                            }
                            if (response.opened && checkPerm("procedure.act.new")){
                                $(".acts_list").append("<tr><td id='newact_td' colspan='5'><a href='?page=newact&id="+response.id+"'>⊕</a></td></tr>");
                            }


                            if (response.closeActs.length > 0) {
                                let form = "";
                                for (let i = 0, c = response.closeActs.length; i < c; i++) {
                                    form += formatSanct(response.closeActs[i]);
                                }
                                $("#display_table").append(`<tr>
                                <td class='end'>Décisions clôturant la procédure :</td><td id='sanct_display_td'>` + form + `</td>
                                </tr>`);
                            }
                            if (response.opened) {
                                $("#display_table").append("<tr><td class='end'>Statut :</td><td class='opened'>Ouvert</td></tr>");
                                if (checkPerm("procedure.close")) {
                                    $("#display_table").append(`<tr><td colspan='2'><input type='button' id='proc_close_button' value='Clore la procédure'><div id='proc_close_opt'>
                                    <form class='formcl'>
                                    <fieldset>
                                    <legend>Clore la procédure</legend>
                                    <div>
                                        <label for='proc_decision'>Décision de clôture : </label><select id='proc_decision' required>
                                            <option value=''></option>
                                            <option value='Dismissal'>Non-lieu</option>
                                            <option value='NoContinue'>Sans suite</option>
                                            <option value='Sanction'>Sanction(s)</option>
                                            <option value='NTD'>Rien à déclarer</option>
                                        </select>
                                    </div>
                                    <div id='proc_closeActs'>
                                    <div id="proc_close_new" class="plus" title="Ajouter un champ sanction">+</div></div></fieldset><fieldset>
                                    <legend>Mot de passe</legend>
                                        <label for='close_password' class='tag end'>Entrez votre mot de passe pour clôturer la procédure :<br/></label><input type='password' id='close_password' required/><input type='submit' value='OK'/><br/>
                                        <p id='p_error'></p></fieldset>
                                        </form></div>
                                    </td>`);

                                    $("#proc_close_button").click(function () {
                                        $("#proc_close_opt").css("display", ($("#proc_close_opt").css("display") === "none" ? "block" : "none"));
                                    });
                                    $("#proc_close_new").click(function () {
                                        counter += 1;
                                        let currentDate = parsedDate(new Date(new Date().getTime())),
                                            maxDate = parsedDate(new Date(new Date().getTime() + 31536000000));
                                        $(this).before(`<table id='pclose` + counter + `' class='pclose'>
                                        <tr><td><label for='pclose_type`+ counter + `'>Sanction :</label></td><td><select required id='pclose_type` + counter + `'>
                                            <option value=""></option>
                                            <optgroup label="Sanctions habituelles">
                                                <option value="Ban">Bannissement</option>
                                                <option value="Jail">Emprisonnement</option>
                                                <option value="Mute">Mute</option>
                                                <option value="ItemBlacklist">Interdiction d'item</option>
                                            </optgroup>
                                            <optgroup label="Autre">
                                                <option value="Repayment">Remboursement</option>
                                                <option value="Sanction">Autre</option>
                                            </optgroup>` + (counter > 1 ? `<optgroup label="OPTIONS">
                                            <option value="Delete" style='color:red;'>Supprimer le champ</option>
                                        </optgroup>` : "") + `
                                        </select></td></tr>
                                        <tr class="pclose_commenttd" id='pclose_commenttd`+ counter + `'><td><label for='pclose_comment` + counter + `'>Description de la sanction :</label></td><td><textarea id='pclose_comment` + counter + `' type='text' disabled required></textarea></td></tr>
                                        <tr class="pclose_itemd" id='pclose_itemtd`+ counter + `'><td><label for='pclose_item` + counter + `'>Item(s) interdit(s) :</label></td><td><input id='pclose_item` + counter + `' type='text' disabled required/></td></tr>
                                        <tr class="pclose_payertd" id='pclose_payertd`+ counter + `'><td><label for='pclose_payer` + counter + `'>Payeur du remboursement <i>(laisser vide si serveur)</i> :</label></td><td><input id='pclose_payer` + counter + `' type='text' disabled/></td></tr>
                                        <tr><td><label for='pclose_target`+ counter + `'>Joueur :</label></td><td><input required id='pclose_target` + counter + `' type='text'/></td></tr>
                                        <tr class="pclose_itemlistd" id='pclose_itemlistd`+ counter + `'><td><label for='pclose_itemlist` + counter + `'>Liste des items :</label></td><td><input id='pclose_itemlist` + counter + `' type='text' disabled required/></td></tr>
                                        <tr><td><label for='pclose_reason`+ counter + `'>Motif :</label></td><td><input required id='pclose_reason` + counter + `' type='text'/></td></tr>
                                        <tr id="pclose_expiretd`+counter+`"><td><label for='pclose_expire`+ counter + `'>Expiration :</label></td><td><input required id='pclose_expire` + counter + `' type='date' value="` + currentDate + `"min="` + currentDate + `" max="` + maxDate + `" /></td></tr>
                                        
                                        </table>`);
                                        (function (counter) {
                                            $("#pclose_type" + counter).change(function (e) {
                                                if ($(this).val() === "ItemBlacklist") {
                                                    $("#pclose_itemtd" + counter).show();
                                                    $("#pclose_item" + counter).prop({ "disabled": false });
                                                } else {
                                                    $("#pclose_itemtd" + counter).hide();
                                                    $("#pclose_item" + counter).prop({ "disabled": true });
                                                }
                                                if ($(this).val() === "Sanction") {
                                                    $("#pclose_commenttd" + counter).show();
                                                    $("#pclose_comment" + counter).prop({ "disabled": false });
                                                } else {
                                                    $("#pclose_commenttd" + counter).hide();
                                                    $("#pclose_comment" + counter).prop({ "disabled": true });
                                                }
                                                if ($(this).val() === "Repayment") {
                                                    $("#pclose_payertd" + counter).show();
                                                    $("#pclose_payer" + counter).prop({ "disabled": false });
                                                    $("#pclose_itemlistd" + counter).show();
                                                    $("#pclose_itemlist" + counter).prop({ "disabled": false });
                                                    $("#pclose_expiretd" + counter).hide();
                                                    $("#pclose_expire" + counter).prop({ "disabled": true });
                                                    $("label[for=pclose_target"+counter+"]").text("Destinataire du remboursement :");
                                                } else {
                                                    $("#pclose_payertd" + counter).hide();
                                                    $("#pclose_payer" + counter).prop({ "disabled": true });
                                                    $("#pclose_itemlistd" + counter).hide();
                                                    $("#pclose_itemlist" + counter).prop({ "disabled": true });
                                                    $("label[for=pclose_target"+counter+"]").text("Joueur :");
                                                    $("#pclose_expiretd" + counter).show();
                                                    $("#pclose_expire" + counter).prop({ "disabled": false });
                                                }
                                                if ($(this).val() === "Delete") {
                                                    $("#pclose" + this.id.replace(/pclose_type/, "")).remove();
                                                }
                                            });
                                        })(counter);

                                    });
                                    $("#proc_decision").change(function () {
                                        if ($("#proc_decision option:selected").val() === "Sanction") {
                                            $("#proc_closeActs").show();
                                            $("#proc_close_new").trigger("click");
                                        } else {
                                            $(".pclose").remove();
                                            $("#proc_closeActs").hide();
                                        }
                                    });
                                    $(".formcl").submit(function (e) {
                                        e.preventDefault();
                                        let closeActs = [],
                                            actType = $("#proc_decision option:selected").val();
                                        if (actType === "Sanction") {
                                            $(".pclose").each(function (j, v) {
                                                let i = parseInt(v.id.replace(/pclose/, ""));
                                                closeActs.push({
                                                    type: $("#pclose_type" + i + " option:selected").val(),
                                                    target: $("#pclose_target" + i).val(),
                                                    reason: $("#pclose_reason" + i).val(),
                                                    comment: $("#pclose_comment" + i).val(),
                                                    expire: new Date($("#pclose_expire" + i).val()).getTime() / 1000,
                                                    authorId: ""
                                                });
                                                if ($("#pclose_type" + i + " option:selected").val() === "ItemBlacklist") {
                                                    closeActs[j].blacklisted = $("#pclose_item" + i).val();
                                                }
                                                if ($("#pclose_type" + i + " option:selected").val() === "Repayment") {
                                                    closeActs[j].payer = $("#pclose_payer" + i).val();
                                                    closeActs[j].itemlist = $("#pclose_itemlist" + i).val();
                                                }
                                            });
                                        } else {
                                            closeActs.push({
                                                type: actType,
                                                authorId: ""
                                            });
                                        }
                                        $.ajax({
                                            type: "POST",
                                            url: IP + "procedure/close",
                                            data: sessioned({
                                                "id": response.id,
                                                "password": $("#close_password").val(),
                                                "closeActs": JSON.stringify(closeActs)
                                            }),
                                            dataType: "json",
                                            success: function (response) {
                                                if (response === "ERR_PASSWORD") {
                                                    $("#p_error").html("Mot de passe incorrect");
                                                } else if (response === "OK") {
                                                    $("#p_error").html("");
                                                    location.reload();
                                                }
                                            },
                                            error: function(s){
                                                if (s.status === 425){
                                                    $("#p_error").html("Nombre de requêtes serveurs trop important. <br/>Veuillez réessayer dans quelques secondes.")
                                                }
                                            }
                                        });
                                    });
                                }

                            } else if (response.closedConfirm) {
                                $("#display_table").append("<tr><td class='end'>Statut :</td><td class='closed'>Clôturé</td></tr>\
                                <tr><td></td><td><a id='pv_link' href='https://mcmatthevan.github.io/limoncello/pv_proc/" + response.id + ".pdf' target='_blank'>Afficher le PV de procédure</a></td></tr>");
                                $.ajax({
                                    type: "HEAD",
                                    url: "https://mcmatthevan.github.io/limoncello/pv_proc/"+response.id+".pdf",
                                    error: function (s) {
                                        if (s.status === 404){
                                            $("#pv_link").attr("href","https://github.com/mcmatthevan/mcmatthevan.github.io/raw/master/limoncello/pv_proc/"+response.id+".pdf");
                                        }
                                    }
                                });
                            } else {
                                $("#display_table").append("<tr><td class='end'>Statut :</td><td class='waiting'>En attente de clôture</td></tr>");
                                if (checkPerm("procedure.close.confirm")) {
                                    $("#display_table").append(`<tr><td></td><td>
                                    <form class='formcl'>
                                        <label for='close_password' class='tag end'>Entrez votre mot de passe pour clôturer la procédure :<br/></label><input type='password' id='close_password' required/><input type='submit' value='OK'/><br/>
                                        <p id='p_error'></p><hr/>
                                        <input style='font-size: 0.6em;font-style:italic' type='button' value='Réouvrir la procédure' id='reopen_proc'/>
                                        </form>
                                    </td>`);
                                }
                                $("#reopen_proc").click(function () {
                                    visualPrompt("Voulez-vous vraiment réouvrir la procédure ?<br/>Cela invalidera les décisions émises lors de sa clôture.", ["Oui", "Non"],
                                        function (ans) {
                                            if (ans === "Oui") {
                                                $.ajax({
                                                    type: "POST",
                                                    url: IP + "procedure/reopen",
                                                    data: sessioned({ "id": response.id }),
                                                    dataType: "json",
                                                    success: function (response) {
                                                        if (response === "OK") {
                                                            location.reload();
                                                        }
                                                    }
                                                });
                                            }
                                        });

                                });
                                $(".formcl").submit(function (e) {
                                    e.preventDefault();
                                    $.ajax({
                                        type: "POST",
                                        url: IP + "procedure/confirmClose",
                                        data: sessioned({
                                            "id": response.id,
                                            "password": $("#close_password").val()
                                        }),
                                        dataType: "json",
                                        success: function (resp) {
                                            if (resp === "ERR_PASSWORD") {
                                                $("#p_error").html("Mot de passe incorrect");
                                            } else if (resp === "OK") {
                                                $("#p_error").html("<span style='color: grey'>Veuillez patienter, la génération du PV est en cours...</span>");
                                                $.ajax({
                                                    type: "POST",
                                                    url: IP + "procedure/genpv",
                                                    data: sessioned({"id": response.id}),
                                                    dataType: "json",
                                                    success: function (response) {
                                                        if (response === "OK"){
                                                            $("#p_error").html("");
                                                            location.reload();
                                                        } else if (response === "ERR_INTERNAL"){
                                                            $("#p_error").html("Une erreur est survenue pendant la génération du PV.");
                                                        }
                                                    }
                                                });
                                            }
                                        },
                                        error: function(s){
                                            if (s.status === 425){
                                                $("#p_error").html("Nombre de requêtes serveurs trop important. <br/>Veuillez réessayer dans quelques secondes.")
                                            }
                                        }
                                    });
                                });
                            }
                            if (response.closeManage.length > 0) {
                                $("#display_table").append("<tr><td id='closemanagetd' colspan='2'><hr/></td></tr>");
                            }
                            for (let i = 0, c = response.closeManage.length; i < c; i++) {
                                $("#closemanagetd").append(formatCloseManage(response.closeManage[i], "e") + "<br/>");
                            }


                        },
                        error: function (x) {
                            if (x.status === 404) {
                                $("#error_404").show();
                            }
                        }
                    });
                }
            } else if (args.page === "home") {
                $("#home").show();
                $("#home_display_option input").change(function () {
                    let actsearch = location.search.replace(/&(nbpage|perpage)=[0-9]*/g, "");
                    location.search = actsearch + "&nbpage=" + $("#opt_page").val() + "&perpage=" + $("#opt_perpage").val();
                });
                if (~["indictments", "procedures", "tickets"].indexOf(args.show)) {
                    $("#home_display_option").css("display", "flex");
                }
                if (/^[0-9]+$/.test(args.nbpage)) {
                    $("#opt_page").val(args.nbpage);
                }
                if (/^[0-9]+$/.test(args.perpage)) {
                    $("#opt_perpage").val(args.perpage);
                }
                $("#button_tickets,#button_procedures,#button_indictments").click(function (e) {
                    location.search = "?page=home&show=" + e.currentTarget.id.replace(/button_/, "");
                });

                switch (args.show) {
                    case "tickets":
                        $("#button_tickets").addClass("selected");
                        $("#button_procedures").removeClass("selected");
                        $("#button_indictments").removeClass("selected");
                        if (checkPerm("ticket.new")) {
                            $("#home_new p").text("Nouveau ticket");
                            $("#home_new a").attr("href", $("#home_new a").attr("href") + "ticket");
                            $("#home_new").show();
                        }
                        $.ajax({
                            type: "GET",
                            url: IP + "ticket/list",
                            data: sessioned({
                                "page": $("#opt_page").val(),
                                "perpage": $("#opt_perpage").val()
                            }),
                            dataType: "json",
                            success: function (response) {
                                if (response.length !== 0) {
                                    $("#nothing_to_see").html("");
                                }
                                response.sort(function(a,b){
                                    if (a.date <= b.date){
                                        return 1;
                                    } else {
                                        return -1
                                    }
                                });
                                for (let i = 0, c = response.length; i < c; ++i) {
                                    let status;
                                    if (response[i].closedConfirm === false) {
                                        status = ["waiting", "En attente de clôture"];
                                    } else {
                                        status = ["closed", "Clôturé"];
                                    }
                                    let toappend = "<div class='summary' id='_tic_" + response[i].id + "'><div><p class='" + status[0] + "'>" + status[1] + "</p></div><div><h1>" + response[i].title +
                                        "</h1><p>" + response[i].comment + "</p></div><div><p>Id : " + response[i].id +
                                        "</p><p>" + response[i].authorName + "</p><p>" + new Date(response[i].date * 1000).toLocaleString("fr-FR", { year: 'numeric', month: 'numeric', day: 'numeric', hour: "numeric", minute: "numeric" })
                                        + "</p></div></div>";
                                    if (status[0] === "waiting") {
                                        $("#home_opened").append(toappend);
                                    } else {
                                        $("#home_closed").append(toappend);
                                    }
                                }
                                summRedirect();
                            }
                        });
                        break;
                    case "procedures":
                        $("#button_tickets").removeClass("selected");
                        $("#button_procedures").addClass("selected");
                        $("#button_indictments").removeClass("selected");
                        if (checkPerm("procedure.new")) {
                            $("#home_new p").text("Nouvelle procédure");
                            $("#home_new a").attr("href", $("#home_new a").attr("href") + "procedure");
                            $("#home_new").show();
                        }

                        $.ajax({
                            type: "GET",
                            url: IP + "procedure/list",
                            data: sessioned({
                                "page": $("#opt_page").val(),
                                "perpage": $("#opt_perpage").val()
                            }),
                            dataType: "json",
                            success: function (response) {
                                let status;

                                if (response.length !== 0) {
                                    $("#nothing_to_see").html("");
                                }
                                response.sort(function(a,b){
                                    if (a.date <= b.date){
                                        return 1;
                                    } else {
                                        return -1
                                    }
                                });
                                for (let i = 0, c = response.length; i < c; ++i) {
                                    if (response[i].closedConfirm && !response[i].opened) {
                                        status = ["closed", "Clôturée"];
                                    } else if (!response[i].opened) {
                                        status = ["waiting", "En attente de clôture"];
                                    } else {
                                        status = ["opened", "En cours"];
                                    }
                                    let toappend = "<div class='summary' id='_pro_" + response[i].id + "'><div><p class='" + status[0] + "'>" + status[1] + "</p></div><div><h1>" + response[i].title +
                                        "</h1><p>" + response[i].descr + "</p></div><div><p>Id : " + response[i].id +
                                        "</p><p>" + response[i].authorName + "</p><p>" + new Date(response[i].date * 1000).toLocaleString("fr-FR", { year: 'numeric', month: 'numeric', day: 'numeric', hour: "numeric", minute: "numeric" })
                                        + "</p></div></div>"
                                    if (status[0] === "waiting" || status[0] === "opened") {
                                        $("#home_opened").append(toappend);
                                    } else {
                                        $("#home_closed").append(toappend);
                                    }
                                }
                                summRedirect();
                            }
                        });
                        break;
                    case "indictments":
                        $("#button_tickets").removeClass("selected");
                        $("#button_procedures").removeClass("selected");
                        $("#button_indictments").addClass("selected");
                        if (checkPerm("indictment.new")) {
                            $("#home_new p").text("Nouveau réquisitoire");
                            $("#home_new a").attr("href", $("#home_new a").attr("href") + "indictment");
                            $("#home_new").show();
                        }
                        $.ajax({
                            type: "GET",
                            url: IP + "indictment/list",
                            data: sessioned({
                                "page": $("#opt_page").val(),
                                "perpage": $("#opt_perpage").val()
                            }),
                            dataType: "json",
                            success: function (response) {
                                let status;
                                if (response != []) {
                                    $("#nothing_to_see").html("");
                                }
                                response.sort(function(a,b){
                                    if (a.date <= b.date){
                                        return 1;
                                    } else {
                                        return -1
                                    }
                                });
                                for (let i = 0, c = response.length; i < c; ++i) {
                                    let status;
                                    if (typeof response[i].procedureId === "undefined" || response[i].procedureId === null) {
                                        status = ["opened", "Non-traité"];
                                    } else {
                                        status = ["closed", "Traité par<br/>" + response[i].procedureId];
                                    }
                                    let toappend = "<div class='summary' id='_ind_" + response[i].id + "'><div><p class='" + status[0] + "'>" + status[1] + "</p></div><div></div><div><h1>" + response[i].title +
                                        "</h1><p>" + response[i].comment + "</p></div><div><p>Id : " + response[i].id +
                                        "</p><p>" + response[i].authorName + "</p><p>" + new Date(response[i].date * 1000).toLocaleString("fr-FR", { year: 'numeric', month: 'numeric', day: 'numeric', hour: "numeric", minute: "numeric" })
                                        + "</p></div></div>";
                                    if (status[0] === "opened") {
                                        $("#home_opened").append(toappend);
                                    } else {
                                        $("#home_closed").append(toappend);
                                    }

                                }
                                summRedirect();
                            }
                        });
                        break;
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
                                $("#input_new").prop("disabled",true);
                                $("#input_confirm").prop("disabled",true);
                                $("#input_old").prop("disabled",true);
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
            } else if (args.page === "new") {
                switch (args.new) {
                    case "procedure":
                        $("#new_proc_form").submit(function (e) {
                            e.preventDefault();
                            let initValue = $("#proc_initiative option:selected").val(),
                                dic = {
                                    "title": $("#proc_title").val(),
                                    "descr": $("#proc_descr").val()
                                };
                            if (initValue === "Complaint") {
                                dic.initiative = JSON.stringify({
                                    type: "Complaint",
                                    complainant: $("#pinit_complainant").val(),
                                    target: $("#pinit_compl_target").val(),
                                    comment: $("#pinit_compl_comment").val()
                                });
                            } else if (initValue === "Observation") {
                                dic.initiative = JSON.stringify({
                                    type: "Observation",
                                    author: $("#pinit_observator").val(),
                                    comment: $("#pinit_obs_comment").val()
                                });
                            } else {
                                dic.initiative = "::Indictment." + $("#pinit_ind_id").val();
                            }
                            $.ajax({
                                type: "POST",
                                url: IP + "procedure/new",
                                data: sessioned(dic),
                                dataType: "JSON",
                                success: function (response) {
                                    console.log(response);
                                    location.search = "?page=home&show=procedures";
                                },
                                error: function(s){
                                    if (s.status === 425){
                                        $("#p_error").html("Nombre de requêtes serveurs trop important. <br/>Veuillez réessayer dans quelques secondes.")
                                    }
                                }
                            });

                        });
                        $("#new_procedure").css("display", "flex");

                        $("#proc_initiative").change(function () {
                            let initValue = $("#proc_initiative option:selected").val();
                            $(".pinit_config").hide();
                            $(".pinit_config input, .pinit_config textarea, .pinit_config select").prop({ "disabled": true });
                            switch (initValue) {
                                case "Complaint":
                                    $("#pinit_compl").show();
                                    $(".pinit_compl_input").prop({ "disabled": false });
                                    break;
                                case "Observation":
                                    $("#pinit_obs").show();
                                    $("#pinit_observator").val(getUserInfo()[0]);
                                    $(".pinit_obs_input").prop({ "disabled": false });
                                    $("#pinit_observator").trigger("focus");
                                    $("#pinit_observator").get()[0].selectionStart = 0;
                                    break;
                                case "Indictment":
                                    $("#pinit_ind").show();
                                    $(".pinit_ind_input").prop({ "disabled": false });
                                    $("#pinit_ind_id").html("<option value=''></option>");
                                    $.ajax({
                                        type: "GET",
                                        url: IP + "indictment/list",
                                        data: sessioned({
                                            "page": 1,
                                            "perpage": 20
                                        }),
                                        dataType: "json",
                                        success: function (response) {
                                            let ids = [];
                                            for (let i = 0, c = response.length; i < c; ++i) {
                                                if (response[i].procedureId === null) {
                                                    ids.push(response[i].id);
                                                }
                                            }
                                            delete response;
                                            for (let i = 0, c = ids.length; i < c; ++i) {
                                                $("#pinit_ind_id").append("<option value=\"" + ids[i] + "\">" + ids[i] + "</option>");
                                            }
                                            if (typeof args.init !== "undefined") {
                                                $("#pinit_ind_id option[value='" + args.init + "']").prop("selected", true);

                                            }
                                        }
                                    });
                                    break;

                                default:
                                    break;
                            }
                        });
                        if (typeof args.init !== "undefined") {
                            $("#proc_initiative option[value='Indictment']").prop("selected", true);
                            $("#proc_initiative").trigger("change");
                        }
                        break;
                    case "ticket":
                        $("#new_tick_form").submit(function (e) {
                            e.preventDefault();
                            let initValue = $("#tick_initiative option:selected").val(),
                                dic = {
                                    "title": $("#tick_title").val(),
                                    "descr": $("#tick_descr").val(),
                                    "act": JSON.stringify({
                                        "type": "Element",
                                        "subject": "Simple Element",
                                        "authorId": "",
                                        "comment": $("#tick_act").val()
                                    })
                                },
                                closeActs = [];
                            if (initValue === "Complaint") {
                                dic.initiative = JSON.stringify({
                                    type: "Complaint",
                                    complainant: $("#tinit_complainant").val(),
                                    target: $("#tinit_compl_target").val(),
                                    comment: $("#tinit_compl_comment").val()
                                });
                            } else if (initValue === "Observation") {
                                dic.initiative = JSON.stringify({
                                    type: "Observation",
                                    author: $("#tinit_observator").val(),
                                    comment: $("#tinit_obs_comment").val()
                                });
                            } else {
                                dic.initiative = "::Indictment." + $("#tinit_ind_id").val();
                            }
                            let actType = $("#tclose_actType option:selected").val();
                            if (actType === "Sanction") {
                                $(".tclose").each(function (j, v) {
                                    let i = parseInt(v.id.replace(/tclose/, ""));
                                    closeActs.push({
                                        type: $("#tclose_type" + i + " option:selected").val(),
                                        target: $("#tclose_target" + i).val(),
                                        reason: $("#tclose_reason" + i).val(),
                                        comment: $("#tclose_comment" + i).val(),
                                        expire: new Date($("#tclose_expire" + i).val()).getTime() / 1000,
                                        authorId: ""
                                    });
                                    if ($("#tclose_type" + i + " option:selected").val() === "ItemBlacklist") {
                                        closeActs[j].blacklisted = $("#tclose_item" + i).val();
                                    }
                                });
                            } else {
                                closeActs.push({
                                    type: actType,
                                    authorId: ""
                                });
                            }

                            dic.closeActs = JSON.stringify(closeActs);
                            $.ajax({
                                type: "POST",
                                url: IP + "ticket/new",
                                data: sessioned(dic),
                                dataType: "JSON",
                                success: function (response) {
                                    console.log(response);
                                    location.search = "?page=home&show=tickets";
                                },
                                error: function(s){
                                    if (s.status === 425){
                                        $("#p_error").html("Nombre de requêtes serveurs trop important. <br/>Veuillez réessayer dans quelques secondes.")
                                    }
                                }
                            });
                        });
                        $("#tclose_actType").change(function () {
                            if ($(this).val() === "Sanction") {
                                $("#tick_closeActs").css("display", "flex");
                                $("#tick_close_new").trigger("click");
                            } else {
                                $("#tick_closeActs").css("display", "none");
                                $(".tclose").remove();
                            }
                        });
                        $("#tick_close_new").click(function () {
                            counter += 1;
                            let currentDate = parsedDate(new Date(new Date().getTime())),
                                maxDate = parsedDate(new Date(new Date().getTime() + 31536000000));
                            $(this).before(`<table id='tclose` + counter + `' class='tclose'>
                            <tr><td><label for='tclose_type`+ counter + `'>Sanction :</label></td><td><select required id='tclose_type` + counter + `'>
                                <option value=""></option>
                                <optgroup label="Sanctions habituelles">
                                    <option value="Ban">Bannissement</option>
                                    <option value="Jail">Emprisonnement</option>
                                    <option value="Mute">Mute</option>
                                    <option value="ItemBlacklist">Interdiction d'item</option>
                                </optgroup>
                                <optgroup label="Autre">
                                    <option value="Sanction">Autre</option>
                                </optgroup>` + (counter > 1 ? `<optgroup label="OPTIONS">
                                <option value="Delete" style='color:red;'>Supprimer le champ</option>
                            </optgroup>` : "") + `
                            </select></td></tr>
                            <tr class="tclose_commenttd" id='tclose_commenttd`+ counter + `'><td><label for='tclose_comment` + counter + `'>Description de la sanction :</label></td><td><textarea id='tclose_comment` + counter + `' type='text' disabled required></textarea></td></tr>
                            <tr class="tclose_itemd" id='tclose_itemtd`+ counter + `'><td><label for='tclose_item` + counter + `'>Item(s) interdit(s) :</label></td><td><input id='tclose_item` + counter + `' type='text' disabled required/></td></tr>
                            <tr><td><label for='tclose_target`+ counter + `'>Joueur :</label></td><td><input required id='tclose_target` + counter + `' type='text'/></td></tr>
                            <tr><td><label for='tclose_reason`+ counter + `'>Motif :</label></td><td><input required id='tclose_reason` + counter + `' type='text'/></td></tr>
                            <tr><td><label for='tclose_expire`+ counter + `'>Expiration :</label></td><td><input required id='tclose_expire` + counter + `' type='date' value="` + currentDate + `"min="` + currentDate + `" max="` + maxDate + `" /></td></tr>
                            
                            </table>`);
                            (function (counter) {
                                $("#tclose_type" + counter).change(function (e) {
                                    if ($(this).val() === "ItemBlacklist") {
                                        $("#tclose_itemtd" + counter).show();
                                        $("#tclose_item" + counter).prop({ "disabled": false });
                                    } else {
                                        $("#tclose_itemtd" + counter).hide();
                                        $("#tclose_item" + counter).prop({ "disabled": true });
                                    }
                                    if ($(this).val() === "Sanction") {
                                        $("#tclose_commenttd" + counter).show();
                                        $("#tclose_comment" + counter).prop({ "disabled": false });
                                    } else {
                                        $("#tclose_commenttd" + counter).hide();
                                        $("#tclose_comment" + counter).prop({ "disabled": true });
                                    }
                                    if ($(this).val() === "Delete") {
                                        $("#tclose" + this.id.replace(/tclose_type/, "")).remove();
                                    }
                                });
                            })(counter);

                        });
                        $("#new_ticket").css("display", "flex");
                        $("#tick_initiative").change(function () {
                            let initValue = $("#tick_initiative option:selected").val();
                            $(".tinit_config").hide();
                            $(".tinit_config input, .tinit_config textarea, .tinit_config select").prop({ "disabled": true });
                            switch (initValue) {
                                case "Complaint":
                                    $("#tinit_compl").show();
                                    $(".tinit_compl_input").prop({ "disabled": false });
                                    break;
                                case "Observation":
                                    $("#tinit_obs").show();
                                    $("#tinit_observator").val(getUserInfo()[0]);
                                    $(".tinit_obs_input").prop({ "disabled": false });
                                    $("#tinit_observator").trigger("focus");

                                    $("#tinit_observator").get()[0].selectionStart = 0;
                                    break;
                                case "Indictment":
                                    $("#tinit_ind").show();
                                    $(".tinit_ind_input").prop({ "disabled": false });
                                    $("#tinit_ind_id").html("<option value=''></option>");
                                    $.ajax({
                                        type: "GET",
                                        url: IP + "indictment/list",
                                        data: sessioned({
                                            "page": 1,
                                            "perpage": 20
                                        }),
                                        dataType: "json",
                                        success: function (response) {
                                            let ids = [];
                                            for (let i = 0, c = response.length; i < c; ++i) {
                                                if (response[i].procedureId === null) {
                                                    ids.push(response[i].id);
                                                }
                                            }
                                            delete response;
                                            for (let i = 0, c = ids.length; i < c; ++i) {
                                                $("#tinit_ind_id").append("<option value=\"" + ids[i] + "\">" + ids[i] + "</option>");
                                            }
                                            if (typeof args.init !== "undefined") {
                                                $("#tinit_ind_id option[value='" + args.init + "']").prop("selected", true);
                                            }
                                        }
                                    });
                                    break;

                                default:
                                    break;
                            }
                        });
                        if (typeof args.init !== "undefined") {
                            $("#tick_initiative option[value='Indictment']").prop("selected", true);
                            $("#tick_initiative").trigger("change");
                        }
                        $("#tick_close_new").trigger("click");
                        break;
                    case "indictment":
                        $("#new_ind_form").submit(function (e) {
                            e.preventDefault();
                            let initValue = $("#ind_initiative option:selected").val(),
                                dic = {
                                    "title": $("#ind_title").val(),
                                    "comment": $("#ind_descr").val()
                                },
                                tempActs = [];
                            $(".rtemp").each(function (j, v) {
                                let i = parseInt(v.id.replace(/rtemp/, ""));
                                tempActs.push({
                                    type: $("#rtemp_type" + i + " option:selected").val(),
                                    target: $("#rtemp_target" + i).val(),
                                    reason: $("#rtemp_reason" + i).val(),
                                    comment: $("#rtemp_comment" + i).val(),
                                    expire: new Date($("#rtemp_expire" + i).val()).getTime() / 1000,
                                    authorId: ""
                                });
                                if ($("#rtemp_type" + i + " option:selected").val() === "ItemBlacklist") {
                                    tempActs[j].blacklisted = $("#rtemp_item" + i).val();
                                }
                            });
                            dic.tempActs = JSON.stringify(tempActs);
                            $.ajax({
                                type: "POST",
                                url: IP + "indictment/new",
                                data: sessioned(dic),
                                dataType: "JSON",
                                success: function (response) {
                                    console.log(response);
                                    location.search = "?page=home&show=indictments";
                                },
                                error: function(s){
                                    if (s.status === 425){
                                        $("#p_error").html("Nombre de requêtes serveurs trop important. <br/>Veuillez réessayer dans quelques secondes.")
                                    }
                                }
                            });
                        });
                        $("#ind_temp_new").click(function () {
                            counter += 1;
                            let currentDate = parsedDate(new Date(new Date().getTime())),
                                maxDate = parsedDate(new Date(new Date().getTime() + 31536000000));
                            $(this).before(`<table id='rtemp` + counter + `' class='rtemp'>
                            <tr><td><label for='rtemp_type`+ counter + `'>Sanction :</label></td><td><select required id='rtemp_type` + counter + `'>
                                <option value=""></option>
                                <optgroup label="Sanctions habituelles">
                                    <option value="Ban">Bannissement</option>
                                    <option value="Jail">Emprisonnement</option>
                                    <option value="Mute">Mute</option>
                                    <option value="ItemBlacklist">Interdiction d'item</option>
                                </optgroup>
                                <optgroup label="Autre">
                                    <option value="Sanction">Autre</option>
                                </optgroup><optgroup label="OPTIONS">
                                <option value="Delete" style='color:red;'>Supprimer le champ</option>
                            </optgroup>
                            </select></td></tr>
                            <tr class="rtemp_commenttd" id='rtemp_commenttd`+ counter + `'><td><label for='rtemp_comment` + counter + `'>Description de la sanction :</label></td><td><textarea id='rtemp_comment` + counter + `' type='text' disabled required></textarea></td></tr>
                            <tr class="rtemp_itemd" id='rtemp_itemtd`+ counter + `'><td><label for='rtemp_item` + counter + `'>Item(s) interdit(s) :</label></td><td><input id='rtemp_item` + counter + `' type='text' disabled required/></td></tr>
                            <tr><td><label for='rtemp_target`+ counter + `'>Joueur :</label></td><td><input required id='rtemp_target` + counter + `' type='text'/></td></tr>
                            <tr><td><label for='rtemp_reason`+ counter + `'>Motif :</label></td><td><input required id='rtemp_reason` + counter + `' type='text'/></td></tr>
                            <tr><td><label for='rtemp_expire`+ counter + `'>Expiration :</label></td><td><input required id='rtemp_expire` + counter + `' type='date' value="` + currentDate + `"min="` + currentDate + `" max="` + maxDate + `" /></td></tr>
                            
                            </table>`);
                            (function (counter) {
                                $("#rtemp_type" + counter).change(function (e) {
                                    if ($(this).val() === "ItemBlacklist") {
                                        $("#rtemp_itemtd" + counter).show();
                                        $("#rtemp_item" + counter).prop({ "disabled": false });
                                    } else {
                                        $("#rtemp_itemtd" + counter).hide();
                                        $("#rtemp_item" + counter).prop({ "disabled": true });
                                    }
                                    if ($(this).val() === "Sanction") {
                                        $("#rtemp_commenttd" + counter).show();
                                        $("#rtemp_comment" + counter).prop({ "disabled": false });
                                    } else {
                                        $("#rtemp_commenttd" + counter).hide();
                                        $("#rtemp_comment" + counter).prop({ "disabled": true });
                                    }
                                    if ($(this).val() === "Delete") {
                                        $("#rtemp" + this.id.replace(/rtemp_type/, "")).remove();
                                    }
                                });
                            })(counter);

                        });
                        $("#new_indictment").css("display", "flex");
                        break;
                    default:
                        $("#error_404").show();
                }
            } else {
                $("#error_404").show();
            }
        }

    }
});