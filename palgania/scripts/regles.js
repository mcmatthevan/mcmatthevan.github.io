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
function romanize (num) {
    if (isNaN(num))
        return NaN;
    var digits = String(+num).split(""),
        key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
               "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
               "","I","II","III","IV","V","VI","VII","VIII","IX"],
        roman = "",
        i = 3;
    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}
function formatted(txt){
    return unescape(txt).replace(/\[crv=(\S+?)\]([\S\s]+?)\[\/crv\]/g,"<a href=\"https://mcmatthevan.github.io/limoncello/crv/$1.pdf\">$2</a>").replace(/\[reg=(\S+?)\]([\S\s]+?)\[\/reg\]/g,"<a href=\"https://mcmatthevan.github.io/limoncello/reg/pdf/$1.pdf\">$2</a>").replace(/\[url=(\S+?)\]([\S\s]+?)\[\/url\]/g,"<a href=\"$1\">$2</a>").replace(/\[b\]([\s\S]+?)\[\/b\]/g,"<b>$1</b>").replace(/\[i\]([\s\S]+?)\[\/i\]/g,"<span style='font-style: italic;'>$1</span>").replace(/\[sc\]([\s\S]+?)\[\/sc\]/g,"<span style ='font-variant: small-caps;'>$1</span>").replace(/\n/g,"<br/>").replace(/\./g,".&nbsp;");
}
if (location.protocol === "https:"){
    var IP = location.origin;
} else {
    var IP = "https://mcmatthevan.github.io";
}
$(function(){
    var args = locationArgs();
    if (typeof args.reg === "undefined"){
        location.search = "?reg=R20210928-0";
    } else if (args.reg === "index"){
        location.href = IP + "/limoncello/find";
    }
    let reglement = $(".reglement").first();
    $.ajax({
        type: "GET",
        url: IP + "/limoncello/reg/"+args.reg+".json",
        dataType: "text",
        success: function (response) {
            response = JSON.parse(unescape(response));
            document.title = response.title;
            let textformat = "", titlecounter = 0, artcounter = 0;
            for (let i = 0, c = response.content.length ; i < c ; i++){
                if (typeof response.content[i].valueOf() === "string"){
                    response.content[i] = ["article",response.content[i]];
                }
                if (response.content[i][0] === "article"){
                    artcounter += 1;
                    textformat += "<p><b>"+ (titlecounter ? titlecounter+"-" : "") + artcounter + ".<br/></b> "+formatted(response.content[i][1])+"</p>";
                } else if (response.content[i][0] === "title"){
                    titlecounter += 1;
                    artcounter = 0;
                    textformat += "<h2>"+ romanize(titlecounter) + ". "+formatted(response.content[i][1])+"</h2>";
                }
            }
            let mentionlist = [];
            let signs = "";
            for (let i in response.sign){
                mentionlist.push(i);
            }
            mentionlist.sort();
            for (let i = 0, c = mentionlist.length ; i<c ; i++){
                let respobj = response.sign[mentionlist[i]][0];
                signs += "<p style='margin-bottom: 50px; text-align: end;'>" + (mentionlist[i] ? "<span style='font-style: italic; margin: inherits;'>" + mentionlist[i] + ": </span><br/>" : "") +
                           (respobj[1] ? "" : "<span style='font-variant: small-caps;'>") + respobj[0] + (respobj[1] ? "" : "</span>") + (respobj[1] ? ", <br/>" + respobj[1] : "")+ "</p>";
                for (let j = 1, d = response.sign[mentionlist[i]].length ; j < d ; ++j){
                    respobj = response.sign[mentionlist[i]][j];
                    signs += "<p style='margin-bottom: 50px; text-align: end;'>" +
                               (respobj[1] ? "" : "<span style='font-variant: small-caps;'>") + respobj[0] + (respobj[1] ? "" : "</span>") + (respobj[1] ? ", <br/>" + respobj[1] : "")+ "</p>";
                }
            }

            let infos = "";
            if (typeof response.infos !== "undefined"){
                for (let i = 0, c = response.infos.length ; i < c ; ++i){
                    if (response.infos[i][0] === "modified"){
                        infos += "<p style='font-size: 0.7em; font-style: italic; text-align: start;'>Modifié par ";
                    }
                    infos += formatted(response.infos[i][1]) + ".</p>";
                }
            }
            reglement.append("<h1>" + response.title + "</h1>" + "<p>" + [response.author,formatted(response.dispo.join(",<br/>")),response.verb].join(",<br/>") + ": <br/>" + (response.preamble ? "<p><b>Préambule : </b><br/>" + formatted(response.preamble) + "</p>" : "") + "</p>"+textformat+
            "<p style='text-align: right'>Fait le " + new Date(response.date*1000).toLocaleString("fr",{year: 'numeric', month: 'long', day: 'numeric'}) + ".</p>" +signs+infos);
            $("a").each(function(i,v){
                $(v).attr("href",$(v).attr("href").replace(/\s/g,"").replace(/\/limoncello\/reg\/pdf\/([\S\s]+?)\.pdf/,"/palgania/regles.html?reg=$1"));
            });
            $("#endsec").append("<p>Texte : " + response.title + "<br/><a href='" + IP + "/limoncello/reg/pdf/" + response.id+".pdf'>Téléchargement au format PDF</a><br/><br/>Vous pouvez retrouver l'ensemble des actes relatifs au serveur sur le <a href='"+IP+"/limoncello/find'>Recueil des documents à portée règlementaire</a>.");
        }});
});