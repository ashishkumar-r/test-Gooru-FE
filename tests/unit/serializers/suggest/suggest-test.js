import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'serializer:suggest/suggest',
  'Unit | Serializer | suggest/suggest'
);

test('normalizeSearchResources', function(assert) {
  const serializer = this.subject();
  const resourcesPayload = {
    suggestResults: [
      {
        description: '7th Grade Cells unit',
        gooruOid: '415c37da-4727-11e5-8333-22000ac41a3c',
        contentSubFormat: 'text_resource',
        resourceType: {
          name: 'text_resource'
        },
        title: 'Cells Unit',
        url: 'https://docs.google.com/file/d/0B9aKdxaTnscydmJGa2pXbEx6Wmc'
      },
      {
        description: '7th Grade Cells unit',
        gooruOid: '415c37da-4727-11e5-8333-22000ac41a3c',
        contentSubFormat: 'text_resource',
        resourceType: {
          name: 'text_resource'
        },
        title: 'Cells Unit',
        url: 'https://docs.google.com/file/d/0B9aKdxaTnscydmJGa2pXbEx6Wmc'
      }
    ]
  };

  const resources = serializer.normalizeSuggestResources(resourcesPayload);
  assert.equal(resources.length, 2, 'Wrong resources length');
  assert.equal(
    resources[0].get('format'),
    'text',
    'Wrong format for resource 1'
  );
});
