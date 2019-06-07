const action = require( 'tempaw-functions' ).action;

module.exports = {
	livedemo: {
		enable: true,
		server: {
			baseDir: `dev/`,
			directory: false
		},
		port: 8000,
		open: false,
		notify: true,
		reloadDelay: 0,
		ghostMode: {
			clicks: false,
			forms: false,
			scroll: false
		}
	},
	sass: {
		enable: true,
		showTask: false,
		watch: `dev/**/*.scss`,
		source: `dev/!(_).scss`,
		dest: `dev/`,
		options: {
			outputStyle: 'expanded',
			indentType: 'tab',
			indentWidth: 1,
			linefeed: 'cr'
		}
	},
	pug: {
		enable: true,
		showTask: false,
		watch: `dev/**/*.pug`,
		source: `dev/!(_)*.pug`,
		dest: `dev/`,
		options: {
			pretty: true,
			verbose: true,
			emitty: true
		}
	},
	autoprefixer: {
		enable: false,
		options: {
			cascade: true,
			browsers: ['Chrome >= 45', 'Firefox ESR', 'Edge >= 12', 'Explorer >= 10', 'iOS >= 9', 'Safari >= 9', 'Android >= 4.4', 'Opera >= 30']
		}
	},
	watcher: {
		enable: true,
		watch: `dev/!(_)*.js`
	},
	buildRules: {
		'dist': [
			action.clean({ src: `dist` }),
			action.minifyJs({ src: `dev/js/MultiSwitches.js`, dest: `dist` }),
			{ // TODO Add comment
				execute: function( end ) {
					const
						fs = require( 'fs' ),
						path = require( 'path' ),
						glob = require( 'glob' );

					let paths = glob.sync( `dev/js/MultiSwitches.js` );
					paths.forEach( function( item ) {
						let
							fname   = `dist/`+ path.basename( item, '.js' ) +`.min.js`,
							comment = fs.readFileSync( item, 'utf8' ).match( /\/\*\*(.|\s)*?\*\// )[0],
							content = fs.readFileSync(  fname, 'utf8' );

						fs.writeFileSync( fname, comment +'\n'+ content.replace( /(['"])use strict\1;/, '' ) );
					});
					end();
				}
			}
		],
		'util-backup': [
			action.pack({
				src: [ 'dev/**/*', '*.*' ], dest: 'versions/',
				name( dateTime ) { return `backup-${dateTime[0]}-${dateTime[1]}.zip`; }
			})
		]
	}
};
