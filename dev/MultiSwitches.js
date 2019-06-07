/**
 * @module       MultiSwitches
 * @version      2.0.0
 * @author       OXAYAZA {@link https://github.com/OXAYAZA}
 * @license      CC BY-SA 4.0 {@link https://creativecommons.org/licenses/by-sa/4.0/}
 * @see          {@link https://codepen.io/OXAYAZA/pen/eRbYjV}
 * @see          {@link https://github.com/OXAYAZA/Multi-Switches}
 * @see          {@link https://oxayaza.page.link/linkedin}
 * @description  Allows you to use multiple switches to switch class on the target,
 *               itself and other switches linked to the same target.
 * @todo comments
 */

function MultiSwitch( options ) {
	/**
	 * @desc Returns random string
	 * @param {number} length - string length
	 */
	function randomStr( length ) {
		let str = '';
		for ( let n = 0; n < length; n++ ) str += String.fromCharCode( 97 + Math.random() * 25 );
		return str;
	}

	// Switcher prototype
	function Switch( options ) {
		this.id = randomStr( 8 );

		// Merge this, defaults & options
		for ( let key in Switch.defaults ) this[ key ] = Switch.defaults[ key ];
		for ( let key in options ) this[ key ] = options[ key ];

		// Get node lists
		[ 'targets', 'scope', 'isolate' ].forEach( ( function ( key ) {
			this[ key ] = Switch.procSelector( this[ key ] );
		}).bind( this ));

		// Link node and switch
		this.node.multiSwitch = this;

		// Init targets
		this.targets.forEach( ( function( target ) {
			if ( !target.multiSwitchTarget ) new Target( target );
			target.multiSwitchTarget.updateGroup({ node: this.node, state: this.state, class: this.class });
		}).bind( this ));

		// Assign an switch event handler
		this.node.addEventListener( this.event, ( function() {
			console.log( `SWITCH [${this.id}]: CLICK`, this.state );
			this.changeState();
		}).bind( this ));

		// Assign an emitter event handler
		this.node.addEventListener( `switch:${this.class}`, ( function( event ) {
			console.log( `SWITCH [${this.id}]: GET [${event.emitter.multiSwitchTarget.id}]`, event.emitter.multiSwitchTarget.groups[ this.class ].state );
			if( event.emitter.multiSwitchTarget.groups[ this.class ].state !== this.state ) this.changeState( event.emitter.multiSwitchTarget.groups[ this.class ].state );
		}).bind( this ));

		console.log( '%c[MultiSwitch]', 'color: yellow', this.node );
		return this;
	}

	Switch.defaults = {
		node: null,
		state: false,
		class: 'active',
		event: 'click',
		targets: null,
		scope: null,
		isolate: null
	};

	Switch.procSelector = function ( selector ) {
		if ( typeof( selector ) === 'string' ) return document.querySelectorAll( selector );
		return selector;
	};

	Switch.prototype.changeState = function ( state ) {
		if ( typeof( state ) !== 'boolean' ) this.state = !this.state;
		else this.state = state;

		if ( this.state ) this.node.classList.add( this.class );
		else this.node.classList.remove( this.class );

		this.targets.forEach( ( function( target ) {
			let event = new CustomEvent( `switch:${this.class}` );
			event.emitter = this.node;
			console.log( `SWITCH [${this.id}]: SEND`, this.state );
			target.dispatchEvent( event );
		}).bind( this ));
	};

	// Target Prototype
	function Target( node ) {
		this.id = randomStr( 8 );
		this.node = node;
		this.groups = {};

		this.node.multiSwitchTarget = this;
		console.log( '%c[MultiSwitchTarget]', 'color: cyan', this.node );
		return this;
	}

	Target.prototype.updateGroup = function ( params ) {
		if ( !this.groups[ params.class ] ) {
			this.groups[ params.class ] = {
				state: params.state,
				class: params.class,
				switches: [],
				event: ( function( event ) {
					console.log( `TARGET [${this.id}]: GET [${event.emitter.multiSwitch.id}]`, event.emitter.multiSwitch.state );
					if( event.emitter.multiSwitch.state !== this.state ) this.changeState( event.emitter.multiSwitch.state, event.emitter.multiSwitch.class );
				}).bind( this )
			};

			this.node.addEventListener( `switch:${params.class}`, this.groups[ params.class ].event );
		}

		this.groups[ params.class ].switches.push( params.node );
		console.log( this.groups );
	};

	Target.prototype.changeState = function ( state, className ) {
		let group = this.groups[ className ];

		if ( typeof( state ) !== 'boolean' ) group.state = !group.state;
		else group.state = state;

		if ( group.state ) this.node.classList.add( group.class );
		else this.node.classList.remove( group.class );

		group.switches.forEach( ( function ( node ) {
			let event = new CustomEvent( `switch:${group.class}` );
			event.emitter = this.node;
			console.log( `TARGET [${this.id}]: SEND`, group.state );
			node.dispatchEvent( event );
		}).bind( this ));
	};

	return new Switch( options );
}
