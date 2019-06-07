document.addEventListener( 'DOMContentLoaded', function () {
	let switches = document.querySelectorAll( '[data-multi-switch]' );

	if( switches.length ) switches.forEach( function ( node ) {
		let params = JSON.parse( node.getAttribute( 'data-multi-switch' ) );
		MultiSwitch({
			node: node,
			...params
		});
	});
});
