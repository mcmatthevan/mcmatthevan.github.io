const regexp = /#[a-z_A-Z0-9]+/g;
var str = document.getElementById('main-articles-view').textContent;

while ((matches = regexp.exec(str)) !== null) {
    console.log(`${matches[0]} trouvé. Prochaine recherche à partir de ${regexp.lastIndex}.`);
}

function $_GET(param) {
	var vars = {};
	window.location.href.replace( location.hash, '' ).replace( 
		/[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
		function( m, key, value ) { // callback
			vars[key] = value !== undefined ? value : '';
		}
	);

	if ( param ) {
		return vars[param] ? vars[param] : null;	
	}
	return vars;
}