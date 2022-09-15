import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';

moduleForComponent('gru-footer', 'Integration | Component | Footer', {
  // needs: ['component:foo', 'helper:bar']
  integration: true,
  beforeEach: function() {
    this.container.lookup('service:i18n').set('locale', 'en');
  }
});

test('footer layout', function(assert) {
  assert.expect(27); //making sure all asserts are called

  this.render(hbs`{{gru-footer}}`); //render the component
  var $component = this.$(); //component dom element

  T.exists(
    assert,
    $component.find('footer.gru-footer'),
    'Footer root element not found'
  );

  var $footerLogo = $component.find('.logoColumn');
  T.exists(assert, $footerLogo, 'Missing logo section');
  T.exists(assert, $footerLogo.find('div'), 'Missing image logo section');
  T.exists(assert, $footerLogo.find('p'), 'Missing footer description');

  var $company = $component.find('.company');
  T.exists(assert, $company, 'Missing company section');
  T.exists(assert, $company.find('h5'), 'Missing company title');
  T.exists(assert, $company.find('.about'), 'Missing about link');
  T.exists(assert, $company.find('.careers'), 'Missing careers link');
  T.exists(
    assert,
    $company.find('.supportCenter'),
    'Missing supportCenter link'
  );
  T.exists(assert, $company.find('.contactUs'), 'Missing contactUs link');

  var $community = $component.find('.community');
  T.exists(assert, $community, 'Missing community section');
  T.exists(assert, $community.find('h5'), 'Missing community title');
  T.exists(assert, $community.find('.districts'), 'Missing districts link');
  T.exists(assert, $community.find('.partners'), 'Missing partners link');
  T.exists(assert, $community.find('.coaches'), 'Missing coaches link');
  T.exists(assert, $community.find('.events'), 'Missing events link');

  var $legal = $component.find('.legal');
  T.exists(assert, $legal, 'Missing legal section');
  T.exists(assert, $legal.find('h5'), 'Missing legal title');
  T.exists(assert, $legal.find('.terms'), 'Missing terms link');
  T.exists(assert, $legal.find('.privacy'), 'Missing privacy link');
  T.exists(assert, $legal.find('.copyright'), 'Missing copyright link');

  var $connect = $component.find('.connect');
  T.exists(assert, $connect, 'Missing connect section');
  T.exists(assert, $connect.find('h5'), 'Missing connect title');
  T.exists(assert, $connect.find('.facebook'), 'Missing facebook link');
  T.exists(assert, $connect.find('.twitter'), 'Missing twitter link');
  T.exists(assert, $connect.find('.youtube'), 'Missing youtube link');
  T.exists(assert, $connect.find('.google'), 'Missing google link');
});
