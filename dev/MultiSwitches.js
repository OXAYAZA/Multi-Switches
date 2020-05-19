/**
 * @module       MultiSwitches
 * @version      2.2.3
 * @author       OXAYAZA {@link https://oxayaza.page.link/github}
 * @license      CC BY-SA 4.0 {@link https://creativecommons.org/licenses/by-sa/4.0/}
 * @see          {@link https://codepen.io/OXAYAZA/pen/eRbYjV}
 * @see          {@link https://oxayaza.page.link/github_mswitches}
 * @see          {@link https://oxayaza.page.link/linkedin}
 * @description  Allows you to use multiple switches to switch class on the target,
 *               itself and other switches linked to the same target.
 */

function MultiSwitch( options ) {
	/**
	 * Switch prototype
	 * @param {object} options
	 * @param {Element} options.node - the element from which the switch will be created
	 * @param {NodeList|string} options.targets - switchable elements
	 * @param {boolean} [options.state] - initial state of the switch
	 * @param {string} [options.class] - switchable class
	 * @param {string} [options.event] - event to initiate a switch
	 * @param {NodeList|string} [options.scope] - elements indicating switch status save area, triggering a switching event on any element outside this area will reset the state of the switch
	 * @param {NodeList|string} [options.isolate] - elements by clicking on which the state of the switch will reset
	 * @returns {Switch}
	 * @constructor
	 */
	function Switch( options ) {
		// Check passed options
		if( !( options.node instanceof Element ) ) {
			throw new Error( 'Switch element is required' );
		}
		if( !( options.targets instanceof NodeList || options.targets instanceof Array ) && typeof( options.targets ) !== 'string') {
			throw new Error( 'Targets must be NodeList, Array or string' );
		}

		// Merging this, defaults and options
		for ( let key in Switch.defaults ) this[ key ] = Switch.defaults[ key ];
		for ( let key in options ) this[ key ] = options[ key ];

		// Get node lists if strings are passed
		[ 'targets', 'scope', 'isolate' ].forEach( ( function ( key ) {
			this[ key ] = Switch.procSelector( this[ key ] );
		}).bind( this ));

		// Link the switch instance to the element
		this.node.multiSwitch = this;

		// Init targets
		this.targets.forEach( ( function( target ) {
			if ( !target.multiSwitchTarget ) new Target( target );
			target.multiSwitchTarget.updateGroup({ node: this.node, state: this.state, class: this.class });
		}).bind( this ));

		// Assign event handlers
		this.assignHandlers();

		// Set initial state
		this.changeState( this.state );

		// Dispatch switch ready event
		this.node.dispatchEvent( new CustomEvent( 'switch:ready' ) );
	}

	/**
	 * Default switch parameters
	 * @type {object}
	 * @static
	 */
	Switch.defaults = {
		node: null,
		state: false,
		class: 'active',
		event: 'click',
		targets: null,
		scope: null,
		isolate: null,
		handlers: {
			switch: null,
			emitter: null,
			scope: null,
			isolate: null
		}
	};

	/**
	 * Assign switch event handlers
	 */
	Switch.prototype.assignHandlers = function () {
		// Assign an switch event handler
		this.handlers.switch = this.changeState.bind( this );
		this.node.addEventListener( this.event, this.handlers.switch );

		// Assign an emitter event handler
		this.handlers.emitter = ( function( event ) {
			if( event.emitter.multiSwitchTarget.groups[ this.class ].state !== this.state ) {
				this.changeState( event.emitter.multiSwitchTarget.groups[ this.class ].state );
			}
		}).bind( this );

		this.node.addEventListener( `switch:${this.class}`, this.handlers.emitter );

		// Assign an switch event handler with scope check
		if ( this.scope && this.scope.length ) {
			this.handlers.scope = ( function ( event ) {
				if( !this.checkScope( event.target ) && this.state ) this.changeState();
			}).bind( this );

			document.addEventListener( this.event, this.handlers.scope );
		}

		// Assign an switch event handler with isolation check
		if ( this.isolate && this.isolate.length ) {
			this.handlers.isolate = ( function ( event ) {
				if( this.checkIsolate( event.target ) && this.state ) this.changeState();
			}).bind( this );

			document.addEventListener( this.event, this.handlers.isolate );
		}
	};

	/**
	 * Remove switch event handlers
	 */
	Switch.prototype.removeHandlers = function () {
		if ( this.handlers.switch ) {
			this.node.removeEventListener( this.event, this.handlers.switch );
			this.handlers.switch = null;
		}

		if ( this.handlers.emitter ) {
			this.node.removeEventListener( `switch:${this.class}`, this.handlers.emitter );
			this.handlers.emitter = null;
		}

		if ( this.handlers.scope ) {
			document.removeEventListener( this.event, this.handlers.scope );
			this.handlers.scope = null;
		}

		if ( this.handlers.isolate ) {
			document.removeEventListener( this.event, this.handlers.isolate );
			this.handlers.isolate = null;
		}
	};

	/**
	 * Returns NodeList if selector string is passed
	 * @param {NodeList|string} selector
	 * @returns {NodeList}
	 * @static
	 */
	Switch.procSelector = function ( selector ) {
		if ( typeof( selector ) === 'string' ) return document.querySelectorAll( selector );
		return selector;
	};

	/**
	 * Changing the state of the switch to the specified or opposite of the initial
	 * @param {boolean} [state]
	 */
	Switch.prototype.changeState = function ( state ) {
		if ( typeof( state ) !== 'boolean' ) this.state = !this.state;
		else this.state = state;

		if ( this.state ) this.node.classList.add( this.class );
		else this.node.classList.remove( this.class );

		// Dispatching switching events to all targets
		this.targets.forEach( ( function( target ) {
			let event = new CustomEvent( `switch:${this.class}` );
			event.emitter = this.node;
			target.dispatchEvent( event );
		}).bind( this ));
	};

	/**
	 * Check whether the element in the switch or in one of the specified areas.
	 * @param {Element} node
	 * @returns {boolean}
	 */
	Switch.prototype.checkScope = function ( node ) {
		if( this.node.contains( node ) ) return true;

		for ( let i = 0; i < this.scope.length; i++ ) {
			if( this.scope[i].contains( node ) ) return true;
		}

		return false;
	};

	/**
	 * Check whether the element is one of the isolated elements.
	 * @param {Element} node
	 * @returns {boolean}
	 */
	Switch.prototype.checkIsolate = function ( node ) {
		if( this.node.contains( node ) ) return false;

		for ( let i = 0; i < this.isolate.length; i++ ) {
			if( this.isolate[i].contains( node ) ) return true;
		}

		return false;
	};

	/**
	 * Target prototype
	 * @param {Element} node - target element
	 * @returns {Target}
	 * @constructor
	 */
	function Target( node ) {
		this.node = node;
		this.groups = {};

		// Link the target instance to the element
		this.node.multiSwitchTarget = this;

		// Dispatch target ready event
		this.node.dispatchEvent( new CustomEvent( 'target:ready' ) );
	}

	/**
	 * Creating or updating a group of switches linked to the target, which is based on a switchable class.
	 * @param {object} params
	 * @param {Element} params.node - linked switch
	 * @param {string} params.class - switchable class of the group
	 * @param {boolean} params.state - initial target state
	 */
	Target.prototype.updateGroup = function ( params ) {
		if ( !this.groups[ params.class ] ) {
			this.groups[ params.class ] = {
				state: params.state,
				class: params.class,
				switches: [],
				event: ( function( event ) {
					if( event.emitter.multiSwitch.state !== this.state ) {
						this.changeState( event.emitter.multiSwitch.state, event.emitter.multiSwitch.class );
					}
				}).bind( this )
			};

			// Assign an emitter event handler
			this.node.addEventListener( `switch:${params.class}`, this.groups[ params.class ].event );

			// Dispatch group update event
			this.node.dispatchEvent( new CustomEvent( 'target:updated' ) );
		}

		this.groups[ params.class ].switches.push( params.node );
	};

	/**
	 * Changing the state of the target to the specified or opposite of the initial
	 * @param {boolean} [state]
	 * @param {string} className - switchable class
	 */
	Target.prototype.changeState = function ( state, className ) {
		let group = this.groups[ className ];

		if ( typeof( state ) !== 'boolean' ) group.state = !group.state;
		else group.state = state;

		if ( group.state ) this.node.classList.add( group.class );
		else this.node.classList.remove( group.class );

		// Dispatching switching events to all linked switches
		group.switches.forEach( ( function ( node ) {
			let event = new CustomEvent( `switch:${group.class}` );
			event.emitter = this.node;
			node.dispatchEvent( event );
		}).bind( this ));
	};

	return new Switch( options );
}
