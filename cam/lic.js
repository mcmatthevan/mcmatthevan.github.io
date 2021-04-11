$(function(){
    let id = location.search.replace(/^[\s\S]*[\?&]id=([\S\s]*?)(?:&[\S\s]*)?$/,"$1");
    $.ajax({
        type: "POST",
        url: "lic/"+id+".json",
        success: function (response) {
            response = JSON.parse(response);
            $("#pseudo").text(reponse.pseudo);
            $("#uuid").text(response.uuid);
            $("#nb-c").text(response.id);
            $("#date").text(new Date(timestamp=parseFloat(response.delivt)*1000).toLocaleString("fr-FR",{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
            $("#link").attr("href","pdf_lic/"+reponse.id+".pdf");
        }
    });
});
//{"pseudo": "pseudo", "uuid": "0bf7687", "id": "PALG2021-04-11-5518", "delivt": 1618127718.414568}