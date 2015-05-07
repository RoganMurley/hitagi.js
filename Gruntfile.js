module.exports = function(grunt) {
    'use strict';

    require('load-grunt-config')(grunt, {
        init: true,
        data: {
            root: 'src'
        },
        loadGruntTasks: {
            pattern: 'grunt-*',
            config: require('./package.json'),
            scope: 'devDependencies'
        }
    });
};
