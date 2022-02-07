$(function(){
    $("#vaward_form").submit(function(e){
        e.preventDefault();
        $("#vaward_pseudo").prop("disabled",true);
        $("#error_vaward").hide();
        $("#p_info").html("");
        $.ajax({
            type: "POST",
            url: IP + "services/vote_award",
            data: {
                "pseudo": $("#vaward_pseudo").val().trim()
            },
            dataType: "json",
            success: function (response) {
                $("#vaward_pseudo").prop("disabled",false);
                if (response === "OK"){
                    $("#p_info").html("La récompense a été accordée.");
                } else {
                    $("#error_vaward").show();
                }
            },
            error: function(x){
                $("#vaward_pseudo").prop("disabled",false);
                if (x.status === 404){
                    $("#p_info").html("Le pseudo spécifié ne correspond à aucun joueur.");


                } else {
                    $("#p_info").html("Un erreur est survenur : " + x.status);
                }
            }
        });
    });
});