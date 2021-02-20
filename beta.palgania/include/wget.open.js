function WGetOpenView(file,element)
{
	var tmp = null;
	$.ajax({
		type: "GET",
		url: file,
		dataType : 'html',
		error:function(msg){
			// message en cas d'erreur :               
		},
		success:function(data){
			// affiche le contenu du fichier dans le conteneur dédié :
			$(element).html(data);
		}
	});
}