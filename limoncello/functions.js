const IP = "http://localhost:8888/"

function parsedDate(date) {
    return date.getFullYear() + "-" + (date.getMonth() + 1).toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false }) + "-" + date.getDate().toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
}

function format00(nb) {
    return nb.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
    });
}

function summRedirect() {

    $(".summary").click(function () {
        location.search = "?page=display&show=" + { "_pro_": "procedure", "_ind_": "indictment", "_tic_": "ticket" }[this.id.substring(0, 5)] + "&id=" + this.id.substring(5);
    });
}

function stringDate(date, a = true) {
    return new Date(date * 1000).toLocaleString("fr", { year: 'numeric', month: 'numeric', day: 'numeric', hour: "numeric", minute: "numeric" }).replace(", ", (a ? " à " : ", "));
}

function parseTimeSpan(time) {
    let data = {
        "mois": 2592000,
        "jours": 86400,
        "heures": 3600
    },
        counter = {
            "mois": 0,
            "jours": 0,
            "heures": 0
        };
    for (let tps in data) {
        while (time >= data[tps]) {
            counter[tps] += 1;
            time -= data[tps];
        }
    }
    let result = "";
    for (let tps in counter) {
        if (counter[tps] > 0) {
            result += (result !== "" ? " " : "") + counter[tps] + " " + tps;
        }
    }
    return (result === "" ? "0 jour" : result);
}

function locationArgs() {
    var pairs = window.location.search.substring(1).split("&"),
        obj = {},
        pair,
        i;

    for (i in pairs) {
        if (pairs[i] === "") continue;

        pair = pairs[i].split("=");
        obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }

    return obj;
}

function sessioned(dic) {
    if (typeof sessionStorage["limoncello-sessionId"] != "undefined") {
        dic["sessionId"] = sessionStorage["limoncello-sessionId"];
    }
    return dic;
}

function checkPerm(perm) {
    return $.ajax({
        type: "GET",
        url: IP + "user/checkPerm",
        async: false,
        data: sessioned({
            "perm": perm
        }),
        dataType: "json"
    }).responseJSON;
}

function isAuth() {
    let result;
    $.ajax({
        type: "GET",
        url: IP + "user/auth",
        data: sessioned({}),
        async: false,
        dataType: "json",
        error: function (x) {
            if (x.status === 0) {
                result = "ERR_NOT_AVAILABLE";
            }
        },
        success: function (response) {
            result = response;
        }
    });
    return result;
}

function needPassword() {
    let result;
    if (typeof sessionStorage["limoncello-sessionId"] !== "undefined") {
        $.ajax({
            type: "GET",
            url: IP + "user/changePassword",
            data: sessioned({}),
            async: false,
            dataType: "json",
            error: function (x) {
                if (x.status === 0) {
                    result = "ERR_NOT_AVAILABLE";
                }
            },
            success: function (response) {
                result = response == "NEEDED";
            }
        });
        return result;
    }
}

function getUserInfo() {
    let result;
    if (typeof sessionStorage["limoncello-sessionId"] !== "undefined") {
        $.ajax({
            type: "GET",
            url: IP + "user/selfInfo",
            data: sessioned({}),
            async: false,
            dataType: "json",
            error: function (x) {
                if (x.status === 0) {
                    result = "ERR_NOT_AVAILABLE";
                }
            },
            success: function (response) {
                result = response;
            }
        });
        return result;
    }
}

let _classEquivalent = {
    "Ban": "Bannissement",
    "Mute": "Mute",
    "ItemBlacklist": "Interdiction d'item",
    "Jail": "Emprisonnement",
    "Dismissal": "Non-lieu",
    "NoContinue": "Sans suite",
    "Element": "Élément de procédure",
    "Complaint": "Plainte",
    "Indictment": "Réquisitoire",
    "Observation": "Constat",
    "Sanction": "Sanction",
    "LogGetting": "Demande de logs"
},
    _attrEquivalent = {
        "target": "Joueur :",
        "date": "Date :",
        "expire": "Expiration :",
        "blacklisted": "Item(s) interdit(s) :",
        "reason": "Raison indiquée :",
        "comment": "Description :",
        "authorId": "Modérateur :",
        "complainant": "Plaignant :",
        "Id": "Id :",
        "dayLog": "Date des logs consultés :",
        "content": "Termes recherchés :"
    };

function getActType(type) {
    if (~["Ban", "Mute", "ItemBlacklist", "Jail"].indexOf(type)) {
        return "Sanction temporaire";
    } else if (~["Element"].indexOf(type)) {
        return "Élément de procédure";
    } else if (~["LogGetting", "IpGetting"].indexOf(type)) {
        return "Requête";
    }
}

function formatSanct(act, notshown = ["authorId", "sanctionType"], modifClassEquiv = {}, modifAttrEquiv = {}) {
    let classEquivalent = Object.assign({}, _classEquivalent),
        attrEquivalent = Object.assign({}, _attrEquivalent);
    for (let mod in modifClassEquiv) {
        classEquivalent[mod] = modifClassEquiv[mod];
    }
    for (let mod in modifAttrEquiv) {
        attrEquivalent[mod] = modifAttrEquiv[mod];
    }
    let result = "<table class='display_sanct'><tr><td class='tag' colspan='2'>",
        atype = classEquivalent[act.type];
    delete act.type;
    result += atype + "<hr/></td></tr>";
    for (let item in act) {
        if (!~notshown.indexOf(item) && act[item] !== "") {
            let value;
            if (item === "date") {
                value = stringDate(act[item]);
            } else if (item === "expire") {
                value = stringDate(act[item]) + "</td></tr><tr><td class='tag end smaller'><i>(Durée totale :</i></td><td class='smaller'><i>" + parseTimeSpan(act.expire - act.date) + "<b>)</b></i>";
            } else {
                value = act[item];
            }
            result += "<tr><td class='tag end'>" + attrEquivalent[item] + "</td><td>" + value + "</td></tr>";
        }
    }
    return result + "</table>";

}

function formatAct(act, notshown = [], modifClassEquiv = {}, modifAttrEquiv = {}) {
    let classEquivalent = Object.assign({}, _classEquivalent),
        attrEquivalent = Object.assign({}, _attrEquivalent);
    for (let mod in modifClassEquiv) {
        classEquivalent[mod] = modifClassEquiv[mod];
    }
    for (let mod in modifAttrEquiv) {
        classEquivalent[mod] = modifAttrEquiv[mod];
    }
    let result = "<tr class='display_act'><td>",
        atype = classEquivalent[act.type];
    result += getActType(act.type) + "</td><td><table class='display_act_descr'><tr><td class='tag' colspan='2'>" + atype + "<hr/></td>";
    delete act.type;
    for (let item in act) {
        if (!~notshown.concat(["date", "authorId"]).indexOf(item) && act[item] !== "") {
            let value;
            if (item === "expire") {
                value = stringDate(act[item]) + "</td></tr><tr><td class='tag end'><i>Durée totale</i></td><td><i>" + parseTimeSpan(act.expire - act.date) + "</i>";
            } else if (item === "dayLog") {
                let actual = new Date();
                if (act[item] === "today") {
                    value = format00(actual.getDate()) + "/" + format00(actual.getMonth()) + "/" + format00(actual.getFullYear());
                } else if (act[item] === "yest") {

                    let yest = new Date(actual.getTime() - 86400000);
                    value = format00(yest.getDate()) + "/" + format00(yest.getMonth()) + "/" + format00(yest.getFullYear());
                } else {
                    value = act[item].replace(/-/g, "/");
                }
            } else {
                value = act[item];
            }
            result += "<tr><td class='tag end'>" + attrEquivalent[item] + "</td><td>" + value + "</td></tr>";
        }
    }
    return result + "</table><td>" + stringDate(act.date).replace(/ à /g, "<br>") + "</td><td>" + act.authorId + "</td>";
}

function formatCloseManage(act, e = "") {
    return {
        "Close": "Clôturé" + e,
        "ConfirmClose": "Confirmé" + e,
        "Reopen": "Réouvert" + e
    }[act.type] + " le " + stringDate(act.date) + " par " + act.authorId;
}

function visualPrompt(question, choices, funct) {
    let answered;
    $("#display_section").append(`<div id='prompt_overlay' style='position:fixed; left:0;top:0;width:100%;height:100%;'>
    <div id='prompt_window' style='background:white;border:2px solid grey;position:relative;top: 40%; width: 40%; margin: auto;text-align:center;'></div></div>`);
    $("#prompt_window").append("<p>" + question + "</p>");
    let c = choices.length;
    for (let i = 0; i < c; i++) {
        $("#prompt_window").append("<input type='button' class='prompt_button' value='" + choices[i] + "'/>");
    }
    $(".prompt_button").click(function () {
        answered = $(this).val();
    });
    let interv = setInterval(function () {
        if (typeof answered !== "undefined") {
            $("#prompt_overlay").remove();
            clearInterval(interv);
            funct(answered);
        }
    },100);

}