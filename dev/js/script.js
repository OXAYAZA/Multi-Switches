var plugins = {
	multiSwitches: document.querySelectorAll( '[data-multi-switch]' )
};

document.addEventListener( 'DOMContentLoaded', function () {
	// Multi Switches
	if( plugins.multiSwitches.length ) {
		for ( var i = 0; i < plugins.multiSwitches.length; i++ ) {
			var node = plugins.multiSwitches[i];

			MultiSwitch({
				node:    node,
				targets: document.querySelectorAll( node.getAttribute( 'data-multi-switch' ) ),
				scope:   document.querySelectorAll( node.getAttribute( 'data-scope' ) ),
				isolate: document.querySelectorAll( node.getAttribute( 'data-isolate' ) )
			});
		}
	}
});
