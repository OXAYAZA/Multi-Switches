document.addEventListener( 'DOMContentLoaded', function () {
	let switches = document.querySelectorAll( '[data-multi-switch]' );

	if( switches.length ) switches.forEach( function ( node ) {
		MultiSwitch({
			node: node,
			...JSON.parse( node.getAttribute( 'data-multi-switch' ) )
		});
	});
});
