(function () {
    'use strict';

    var assert = require('assert');

    var proxy = require('../proxy.js');

    describe('proxy', function () {

        it('should proxy a property of the same name', function () {
            var person = {name: 'Senjougahara'};
            var robot = {name: ''};

            proxy(person, 'name', robot, 'name');
            person.name = 'Araragi';

            assert.equal(person.name, robot.name);
        });

        it('should proxy a property of a different name', function () {
            var person = {name: 'Senjougahara'};
            var robot = {serialNumber: ''};

            proxy(person, 'name', robot, 'serialNumber');
            person.name = 'Araragi';

            assert.equal(person.name, robot.serialNumber);
        });
    });

} ());
