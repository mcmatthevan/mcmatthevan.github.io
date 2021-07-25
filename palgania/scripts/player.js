$(function(){
    function formattedArg(tx){

        return tx.replace(/\[player\]([\S\s]+?)\[\/player\]/g,`<a href="?pseudo=$1">$1</a>`).replace(/\[small\]([\S\s]+?)\[\/small\]/g,`<span class="small">$1</span>`);
    }
    let args = locationArgs();
    if (typeof args.pseudo === "undefined"){
        $("#load_div").hide();
        $("section").append("<form id='formsearch'><label>Entrez le pseudo d'un joueur : </label><input id='pseudosearch' type='text' required/><br/><input type='submit' value='Rechercher'/></form>");
        $("#formsearch").submit(function(e){
            e.preventDefault();
            location.search = "?pseudo=" + $("#pseudosearch").val().trim();
        });
    } else {
        $.ajax({
            type: "GET",
            url: IP + "services/player_info",
            data: {pseudo: args.pseudo},
            dataType: "json",
            success: function (response) {
                $("#pseudo").text(response.pseudo);
                if (response.firstjoin === null){
                    $("#inscr").text("Inconnue");
                } else {
                    $("#inscr").text(new Date(response.firstjoin).toLocaleString("fr",{year: 'numeric', month: 'long', day: 'numeric'}));
                }
                let logoutd = new Date(response.lastLogout).toLocaleString("fr",{year: 'numeric', month: 'long', day: 'numeric'});
                if (logoutd==="Invalid Date"){
                    $("#lastcotr").hide();
                } else {
                    $("#lastLogout").text(logoutd);
                }
                $("#skin").attr("src","https://crafatar.com/renders/body/"+response.uuid);
                $("#load_div").hide();
                $("#pframe").show();
                if (response.banned !== null){
                    let source = response.banned.source === "Console" ? "<i>Console</i>" : formattedArg("[player]" + response.banned.source.split(/\s+/g).reverse()[0].replace(/§\S/g,"") + "[/player]");
                    $("#baninfos").append(`<td>` + new Date(response.banned.created).toLocaleString("fr",{year: 'numeric', month: 'long', day: 'numeric', hour: "numeric", minute: "numeric"}) + `</td>
                    <td>` + new Date(response.banned.expires).toLocaleString("fr",{year: 'numeric', month: 'long', day: 'numeric', hour: "numeric", minute: "numeric"}) + `</td>
                    <td><p>` + response.banned.reason + `</p></td>
                    <td>` + source + `</td>`);
                    $("#pbio, #pbanned").show();
                }
                if (response.bio !== null && typeof response.bio.functions !== "undefined"){
                    let admin=false, modo=false;
                    for (let i = 0, c = response.bio.functions.length ; i < c ; i ++){
                        let toNotDefined = ~[null,undefined].indexOf(response.bio.functions[i].to),
                            fromDate = new Date(response.bio.functions[i].from),
                            timespan, toDate;
                        if (toNotDefined){
                            timespan = parseTimeSpan((Date.now() - fromDate.getTime())/1000,false);
                        } else {
                            toDate = new Date(response.bio.functions[i].to);
                            timespan = parseTimeSpan((toDate.getTime() - fromDate.getTime())/1000,false);
                        }
                        let formatted = `<table class="pfunctions"><tr><td colspan="2"><h3>` + formattedArg(response.bio.functions[i].title) + `</h3></td></tr><tr class='pfuncdate'><td colspan="2">` +
                        (toNotDefined ? "Depuis le " : "") + fromDate.toLocaleString("fr",{year: 'numeric', month: 'long', day: 'numeric'}) + (toNotDefined ? "" : " - " + toDate.toLocaleString("fr",{year: 'numeric', month: 'long', day: 'numeric'})) + `</td></tr><tr><td colspan='2'><span class='small'>(` + timespan + `)</span></td></tr><tr><td colspan='2'><br/></td></tr>`;
                        for (let key in response.bio.functions[i]){
                            if (key.charAt(0) === "_"){
                                formatted += "<tr><td class='tag wiki'>" + key.substring(1) + "</td><td class='item'>" + formattedArg(response.bio.functions[i][key]) + "</td></tr>";
                            }
                        }
                        $("#pfunctions").append(formatted + "</table>");
                        if (typeof response.bio.functions[i].to === "undefined" || response.bio.functions[i].to === null || response.bio.functions[i].to === ""){
                            if (/(administra(?:teur|trice))/gi.test(response.bio.functions[i].title) && !admin){
                                admin = response.bio.functions[i].title;
                            } else if (/(modéra(?:teur|trice|tion))/gi.test(response.bio.functions[i].title) && !modo){
                                modo = response.bio.functions[i].title;
                            }
                        }
                    }
                    if (admin){
                        $("#role").html("<span class='red'>" + admin + "</span>");
                    } else if (modo){
                        $("#role").html("<span class='blue'>" + modo + "</span>");
                    }
                    $("#pbio, #pfunctions").show();
                }
            },
            error: function(x){
                $("#load_div").hide();
                if (x.status === 404){
                    $(".error").text("Erreur : joueur non-trouvé. Est-il un joueur du serveur ? (404)");
                } else {
                    $(".error").text("Erreur " + x.status + " - " + x.statusText);
                }
            }
        });
    }
});