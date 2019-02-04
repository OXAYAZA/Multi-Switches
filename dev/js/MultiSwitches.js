/**
 * @module       MultiSwitches
 * @version      1.0.0
 * @author       OXAYAZA {@link https://github.com/OXAYAZA}
 * @license      CC BY-SA 4.0 {@link https://creativecommons.org/licenses/by-sa/4.0/}
 * @see          {@link https://codepen.io/OXAYAZA/pen/eRbYjV}
 * @see          {@link https://github.com/OXAYAZA/Multi-Switches}
 * @see          {@link https://oxayaza.page.link/linkedin}
 * @description  Allows you to use multiple switches to switch class on the target,
 *               itself and other switches linked to the same target.
 */

function MultiSwitch( options ) {
	// Switch Prototype
	function Switch( options ) {
		if( !options.node ) throw new Error( 'Switch node is required' );
		if( !options.targets ) throw new Error( 'Target node is required' );

		this.node    = options.node;
		this.node.mt = this;
		this.state   = options.state   || false;
		this.clas    = options.clas    || 'active';
		this.targets = options.targets;
		this.scope   = options.scope   || null;
		this.isolate = options.isolate || null;
		this.event = options.event || 'click';

		for( var i = 0; i < this.targets.length; i++) {
			if( !this.targets[i].mtt ) {
				new Target({
					node:    this.targets[i],
					toggles: [ this.node ],
					state:   this.state,
					clas:    this.clas
				});
			} else {
				this.targets[i].mtt.toggles.push( this.node );
			}
		}

		this.node.addEventListener( this.event, function() {
			this.mt.changeState();
		});

		this.node.addEventListener( 'changeState', function( event ) {
			if( event.emitter.mtt.state !== this.mt.state ) {
				this.mt.changeState();
			};
		});

		if ( this.scope.length ) {
			var toggle = this;
			document.addEventListener( this.event, function ( event ) {
				if( !toggle.checkScope( event.target ) && toggle.state ) toggle.changeState();
			});
		}

		if ( this.isolate.length ) {
			var toggle = this;
			document.addEventListener( this.event, function ( event ) {
				if( toggle.checkIsolate( event.target ) && toggle.state ) toggle.changeState();
			});
		}

		return this;
	}

	Switch.prototype.changeState = function ( state ) {
		this.state = !this.state;
		this.node.classList.toggle( this.clas );

		for( var i = 0; i < this.targets.length; i++) {
			var event = new CustomEvent( 'changeState' );
			event.emitter = this.node;
			this.targets[i].dispatchEvent( event );
		}
	};

	Switch.prototype.checkScope = function ( node ) {
		if( this.node.contains( node ) ) return true;

		for ( var i = 0; i < this.scope.length; i++ ) {
			if( this.scope[i].contains( node ) ) return true;
		}

		return false;
	};

	Switch.prototype.checkIsolate = function ( node ) {
		if( this.node.contains( node ) ) return false;

		for ( var i = 0; i < this.isolate.length; i++ ) {
			if( this.isolate[i].contains( node ) ) return true;
		}

		return false;
	};

	// Target Prototype
	function Target( options ) {
		this.node     = options.node;
		this.node.mtt = this;
		this.state    = options.state || false;
		this.clas     = options.clas  || 'active';
		this.toggles  = options.toggles;

		this.node.addEventListener( 'changeState', function( event ) {
			if( event.emitter.mt.state !== this.mtt.state ) {
				this.mtt.changeState();
			}
		});

		return this;
	};

	Target.prototype.changeState = function () {
		this.state = !this.state;
		this.node.classList.toggle( this.clas );

		for( var i = 0; i < this.toggles.length; i++) {
			var event = new CustomEvent( 'changeState' );
			event.emitter = this.node;
			this.toggles[i].dispatchEvent( event );
		}
	};


	return new Switch( options );
}
