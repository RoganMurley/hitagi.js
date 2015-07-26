(function () {
    'use strict';

    var assert = require('assert');

    var proxy = require('../utils.js').proxy;

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

        it('should proxy POJOs', function () {
            var myPoint = {
                position: {
                    x: 0,
                    y: 0
                }
            };
            var yourPoint = {
                position: {
                    x: 0,
                    y: 0
                }
            };

            proxy(myPoint, 'position', yourPoint, 'position');

            myPoint.position.x = 1;
            assert.equal(myPoint.position.x, 1);
            assert.equal(myPoint.position.y, 0);

            myPoint.position.y = 1;
            assert.equal(myPoint.position.x, 1);
            assert.equal(myPoint.position.y, 1);

            myPoint.position = {
                x: 10,
                y: 11
            };
            assert.equal(myPoint.position.x, 10);
            assert.equal(myPoint.position.y, 11);
        });
    });

} ());
