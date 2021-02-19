
		var tmp = null;
		$.ajax({
				type: "GET",
				url: "docs/wget.inside.html",
				dataType : 'html',
				error:function(msg){
                  // message en cas d'erreur :
                  
                },
				success:function(data){
                  // affiche le contenu du fichier dans le conteneur dédié :
                  $('#content-wget-info').text(data);
                }
        });