import assert from 'assert';
import Entity from '../entity.js';


describe('Entity', function () {
  let entity;

  beforeEach(function () {
    entity = new Entity();
  });

  it('should have no components on initialisation', function () {
    assert.deepEqual(entity.c, {});
  });

  it('component should be properly attached and detached', function () {
    const testComponent = {$id: 'testComponent'};

    entity.attach(testComponent);
    assert.deepEqual(
      entity.c,
      {
        'testComponent': testComponent
      }
    );

    entity.detach(testComponent.$id);
    assert.deepEqual(entity.c, {});
  });

  it('component should meets its dependencies before being attached', function () {
    const testComponent1 = {
      $id: 'testComponent1',
    };
    const testComponent2 = {
      $id: 'testComponent2',
      $deps: ['testComponent1']
    };
    assert.throws(
      function () {
        entity.attach(testComponent2);
      },
      'ComponentDependencyMissing'
    );
    entity.attach(testComponent1);
    entity.attach(testComponent2);
  });

  it('component should not be attached twice', function () {
    const testComponent = {$id: 'testComponent'};
    entity.attach(testComponent);
    assert.throws(
      function () {
        entity.attach(testComponent);
      },
      'ComponentAlreadyAttached'
    );
  });

  it('multiple components should be attached and detached properly', function () {
    const testComponent1 = {$id: 'testComponent1'};
    const testComponent2 = {$id: 'testComponent2'};
    const testComponent3 = {$id: 'testComponent3'};

    entity.attach(testComponent1);
    assert.deepEqual(
      entity.c,
      {'testComponent1': testComponent1}
    );

    entity.attach(testComponent2);
    assert.deepEqual(
      entity.c,
      {
        'testComponent1': testComponent1,
        'testComponent2': testComponent2
      }
    );

    entity.attach(testComponent3);
    assert.deepEqual(
      entity.c,
      {
        'testComponent1': testComponent1,
        'testComponent2': testComponent2,
        'testComponent3': testComponent3
      }
    );

    assert.deepEqual(
      entity.c,
      {
        'testComponent1': testComponent1,
        'testComponent2': testComponent2,
        'testComponent3': testComponent3
      }
    );

    entity.detach(testComponent1.$id);
    assert.deepEqual(
      entity.c,
      {
        'testComponent2': testComponent2,
        'testComponent3': testComponent3
      }
    );

    entity.detach(testComponent2.$id);
    assert.deepEqual(
      entity.c,
      {'testComponent3': testComponent3}
    );

    entity.detach(testComponent3.$id);
    assert.deepEqual(entity.c, {});
  });

  it('has should test for components', function () {
    const testComponent = {$id: 'testComponent'};
    entity.attach(testComponent);
    assert.equal(true, entity.has(testComponent.$id));
    assert.equal(false, entity.has('noComponent'));
  });

  it('component should throw an error if it is detached while it is a dependency', function () {
    const testComponent1 = {
      $id: 'testComponent1',
    };
    const testComponent2 = {
      $id: 'testComponent2',
      $deps: ['testComponent1']
    };

    entity.attach(testComponent1);
    entity.attach(testComponent2);

    assert.throws(() => entity.detach('testComponent1'),
      'ComponentDependencyMissing'
    );
  });

});
