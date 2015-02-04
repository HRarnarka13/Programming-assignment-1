module.exports = function ( grunt ) {
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.initConfig({
		jshint: {
			src: ['src/**/*.js', '!src/js/colpick.js'],
			gruntfile: ['Gruntfile.js'],
			option: {
				jQuery: true,
				"globas": {
					"curly": true,
					"eqnull": true,
					"eqeqeq": true,
					"undef": true,
					"console" : true
				}
			}
		}
	});
	grunt.registerTask('default', ['jshint']);
}
