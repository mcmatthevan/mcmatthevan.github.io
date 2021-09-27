$(function () {
    (function(){
        let today = new Date(),
            dic = ["value","min","max"];
        for (let i = 0; i < 3 ; ++i){
            $("input[type='date'][" + dic[i] + "='today']").attr(dic[i],today.getFullYear().toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false
            }) + "-" + (today.getMonth() + 1).toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false
            }) + "-" + today.getDate().toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false
            }));
        }
    })();
    $("#settings input, #settings select").change(function(){
        $("#results").html("<p class='info'>Veuillez patienter</p><img class='loading_img' src='https://media.giphy.com/media/sSgvbe1m3n93G/giphy.gif' alt=''/>");
        $.ajax({
            type: "GET",
            url: "https://mcmatthevan.github.io/limoncello/reg/index.json",
            //url: "reg/index.json",
            dataType: "json",
            success: function (response) {

                $.ajax({
                    type: "GET",
                    url: "https://mcmatthevan.github.io/limoncello/crv/index.txt",
                    success: function (resp) {
                        resp = resp.trim().split(/\n+/g);
                        for (let i = 0, c = resp.length ; i < c ; ++i){

                            let date = new Date(resp[i].substring(3,7)+"-"+resp[i].substring(7,9)+"-"+resp[i].substring(9,11));
                            console.log(resp[i].substring(3,7)+"-"+resp[i].substring(7,8)+"-"+resp[i].substring(9,10))
                            response.push({
                                
                                id: resp[i],
                                title: "Compte-rendu de vote du " + date.toLocaleString("fr",{year: 'numeric', month: 'long', day: 'numeric'}),
                                date: Math.floor(date.getTime()/1000),
                                type: "CRV"
                            });
                        }
                        response.sort(function(a,b){
                            if (a.date > b.date){
                                return -1;
                            } else {
                                return 1;
                            }
                        });
                        let results = [],
                            date_xt = [new Date($("#date1").val()).getTime()/1000,new Date($("#date2").val()).getTime()/1000].sort();
                        for (let i = 0, c = response.length ; i < c ; ++i){
                            if (response[i].date >= date_xt[0]){
                                if (response[i].date <= date_xt[1] + 86400 && ~["",response[i].type].indexOf($("#doctype").val())){
                                    results.push(response[i]);
                                }
                            } else {
                                break;
                            }
                        }
                        let c = results.length;
                        if (parseInt($("#perpage").val()) >= parseInt($("#perpage").attr("max"))){
                            $("#perpage").val(c);
                        }
                        $("#perpage").attr("max",c < 50 ? c : 50);
                        $("#perpage_max").text(c);
                        let perpage = parseInt($("#perpage").val()),
                            page = (parseInt($("#page").val())-1),
                            maxpage = Math.ceil(results.length/perpage);
                        $("#page").attr("max",maxpage);
                        $("#page_max").text(maxpage);
                        results = results.slice(perpage*page,perpage*(page+1));
                        $("#results").html("<table><tr><td class='tag'>ID</td><td class='tag'>Titre</td><td class='tag'>Date</td></tr></table>");
                        for (let i = 0, d = results.length ; i < d ; i++){
                            let rtype;
                            if (results[i].type === "CRV"){
                                rtype = "crv/";
                            } else {
                                rtype = 'reg/pdf/';
                            }
                            $("#results table").append("<tr><td>" + results[i].id + "</td><td><a href=\""+ rtype + results[i].id + ".pdf\" target='_blank'>" + results[i].title + "</a></td><td>" + new Date(results[i].date*1000).toLocaleString("fr",{year: 'numeric', month: 'long', day: 'numeric'}) + "</td></tr>");
                        }
                    }
                });
                
            },
            error: function(x){
                $("#results").html("<p class='error'>Une erreur est survenue (" + x.status + ")</p>");
            }
        });
    });
    $("#settings input").first().trigger("change");


});