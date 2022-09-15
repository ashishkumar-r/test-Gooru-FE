import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import Pretender from 'pretender';

moduleForComponent(
  'adapter:real-time/real-time',
  'Unit | Adapter | real-time/real-time',
  {
    // Specify the other units that are required for this test.
    // needs: ['serializer:foo']
    beforeEach: function(assert) {
      this.pretender = new Pretender();
      this.pretender.unhandledRequest = function(verb, path) {
        assert.ok(false, `Wrong request [${verb}] url: ${path}`);
      };
    },
    afterEach: function() {
      this.pretender.shutdown();
    }
  }
);

test('postData', function(assert) {
  const adapter = this.subject();
  const data = {
    query: {
      classId: 'the-class-id',
      collectionId: 'the-collection-id',
      userId: 'the-user-id'
    },
    body: {}
  };

  this.pretender.map(function() {
    this.post(
      '/nucleus/realtime/class/the-class-id/collection/the-collection-id/user/the-user-id/event',
      function() {
        return [200, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });

  adapter.postData(data).then(function(response) {
    assert.equal('', response, 'Wrong response');
  });
});

test('getData', function(assert) {
  const adapter = this.subject();
  const query = {
    classId: 'the-class-id',
    collectionId: 'the-collection-id'
  };

  this.pretender.map(function() {
    this.get(
      '/nucleus/realtime/class/the-class-id/collection/the-collection-id/events',
      function() {
        return [
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify({})
        ];
      },
      false
    );
  });

  adapter.getData(query).then(function(response) {
    assert.deepEqual({}, response, 'Wrong response');
  });
});

test('postAttempt', function(assert) {
  const adapter = this.subject();
  const query = {
    classId: 'the-class-id',
    collectionId: 'the-collection-id',
    userId: 'the-user-id'
  };

  this.pretender.map(function() {
    this.post(
      '/nucleus/realtime/class/the-class-id/collection/the-collection-id/user/the-user-id/complete',
      function() {
        return [200, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });

  adapter.postAttempt(query).then(function(response) {
    assert.equal('', response, 'Wrong response');
  });
});

test('deleteAttempt', function(assert) {
  const adapter = this.subject();
  const query = {
    classId: 'the-class-id',
    collectionId: 'the-collection-id',
    userId: 'the-user-id'
  };

  this.pretender.map(function() {
    this.delete(
      '/nucleus/realtime/class/the-class-id/collection/the-collection-id/user/the-user-id/reset',
      function() {
        return [200, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });

  adapter.deleteAttempt(query).then(function(response) {
    assert.equal('', response, 'Wrong response');
  });
});

test('postOnAir', function(assert) {
  const adapter = this.subject();
  const query = {
    classId: 'the-class-id',
    collectionId: 'the-collection-id'
  };

  this.pretender.map(function() {
    this.post(
      '/nucleus/realtime/class/the-class-id/collection/the-collection-id/onair',
      function() {
        return [200, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });

  adapter.postOnAir(query).then(function(response) {
    assert.equal('', response, 'Wrong response');
  });
});

test('deleteOnAir', function(assert) {
  const adapter = this.subject();
  const query = {
    classId: 'the-class-id',
    collectionId: 'the-collection-id'
  };

  this.pretender.map(function() {
    this.delete(
      '/nucleus/realtime/class/the-class-id/collection/the-collection-id/onair',
      function() {
        return [200, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });

  adapter.deleteOnAir(query).then(function(response) {
    assert.equal('', response, 'Wrong response');
  });
});

test('isOnAir', function(assert) {
  const adapter = this.subject();
  const query = {
    classId: 'the-class-id',
    collectionId: 'the-collection-id'
  };

  this.pretender.map(function() {
    this.get(
      '/nucleus/realtime/class/the-class-id/collection/the-collection-id/onair',
      function() {
        return [200, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });

  adapter.isOnAir(query).then(function(response) {
    assert.equal('', response, 'Wrong response');
  });
});
