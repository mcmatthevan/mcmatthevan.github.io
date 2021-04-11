$(function(){
    let id = location.search.replace(/^[\s\S]*[\?&]id=([\S\s]*?)(?:&[\S\s]*)?$/,"$1");
    $.ajax({
        type: "GET",
        url: "lic/"+id+".json",
        success: function (response) {
            $("#pseudo").text(response.pseudo);
            $("#uuid").text(response.uuid);
            $("#nb-c").text(response.id);
            $("#date").text(new Date(timestamp=parseFloat(response.delivt)*1000).toLocaleString("fr-FR",{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
            $("#link").attr("href","pdf_lic/"+response.id+".pdf");
            $("#serie").text(reponse.serie)
        },
        error: function(x,h,r){
            location.href = "../palgania/404.html";
        }
    });
});