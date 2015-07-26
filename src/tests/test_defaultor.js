(function () {
    'use strict';

    var assert = require('assert');

    var defaultor = require('../defaultor.js');

    describe('defaultor', function () {

        it('should not change params with no defaults set', function () {
            var params = {
                'one': 1,
                'two': 2,
                'three': 3
            };
            var defaults = {};

            var actual = defaultor(defaults, params);

            var expected = {
                'one': 1,
                'two': 2,
                'three': 3
            };

            assert.deepEqual(actual, expected);
        });

        it('should add a default param that is not present', function () {
            var params = {};
            var defaults = {
                'one': 1
            };

            var actual = defaultor(defaults, params);

            var expected = {
                'one': 1
            };

            assert.deepEqual(actual, expected);
        });

        it('should add multiple default params that are not present', function () {
            var params = {};
            var defaults = {
                'one': 1,
                'two': 2,
                'three': 3
            };

            var actual = defaultor(defaults, params);

            var expected = {
                'one': 1,
                'two': 2,
                'three': 3
            };

            assert.deepEqual(actual, expected);
        });



        it('should respect given params', function () {
            var params = {
                'one': 1
            };
            var defaults = {
                'one': 2
            };

            var actual = defaultor(defaults, params);

            var expected = {
                'one': 1
            };

            assert.deepEqual(actual, expected);
        });
    });

} ());
