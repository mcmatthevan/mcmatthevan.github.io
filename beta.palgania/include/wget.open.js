
		var tmp = null;
		$.ajax({
				type: "GET",
				url: "docs/wget.inside.html",
				error:function(msg){
                  // message en cas d'erreur :
                  alert( "Error !: " + msg );
                },
				success:function(data){
                  // affiche le contenu du fichier dans le conteneur dédié :
                  $('#content-wget-info').text(data);
                }
        });