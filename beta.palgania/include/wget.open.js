function WGetOpenView(file,element,type)
{
	var tmp = null;
	$.ajax({
		type: "GET",
		url: file,
		dataType : type,
		error:function(msg){
			// message en cas d'erreur : 
			htmlerror = "<span class='error red'>FL-W.GET-010: Error: W.Get['"+file+"'] introuvable !</span>"
			$(element).html(htmlerror);             
		},
		success:function(data){
			// affiche le contenu du fichier dans le conteneur dédié :
			$(element).html(data);
		}
	});
}
