import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('gru-tour', 'Unit | Component | gru-tour', {
  integration: false,
  needs: ['service:i18n']
});

test('generateTemplate', function(assert) {
  const component = this.subject();
  const title = 'some-title';
  const description = 'some-description';
  const image = 'some-image-class';
  const containerClass = 'test-class';
  const result = component.constructModal(
    title,
    description,
    image,
    containerClass
  );

  let template = `<div class="tour-header test-class">
        <h2>some-title</h2>
        <i class="material-icons exit-button">clear</i>
      </div>
      <div class="tour-description-test-class"><img class=some-image-class><p>some-description</p>
      </div>`;

  assert.equal(result, template, 'wrong template');
});
