function WGetOpenViewButton(a,b)
{
    $(document).ready(function(){
        $(a).click(function(){
            $.ajax({url:b, success:function(result){
                get = result;
                $("#main-body-left").html(result);
            }});
            
        });
    });
}

function WGetOpenView(file,element,type)
{
	$.ajax({
		type: "GET",
		url: file,
		dataType : type,
		error:function(msg){
			// message en cas d'erreur : 
			htmlerror = "<span class='error red'>FL-W.GET-022: Error: W.Get['"+file+"'] introuvable !</span>"
			$(element).html(htmlerror);             
		},
		success:function(data){
			// affiche le contenu du fichier dans le conteneur dédié :
			$(element).html(data);
		}
	});
}
