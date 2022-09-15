import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import Tenant from 'gooru-web/models/tenant/tenant';

moduleForComponent(
  'tenant/gru-tenant-theme',
  'Integration | Component | tenant/gru tenant theme',
  {
    integration: true
  }
);

test('Layout', function(assert) {
  this.set(
    'tenant',
    Tenant.create({
      id: 'ba956a97-ae15-11e5-a302-f8a963065976',
      theme: {
        buttons: {
          primary: {
            color: 'gray'
          },
          info: {
            color: 'blue'
          },
          success: {
            color: 'green'
          },
          warning: {
            color: 'orange'
          },
          danger: {
            color: 'red'
          }
        },
        header: {
          logo: {
            url: 'http://gooru.org/welcome/images/GooruLogo.png'
          }
        }
      }
    })
  );

  this.render(hbs`{{tenant/gru-tenant-theme tenant=tenant}}`);

  var $component = this.$(); //component dom element

  const $style = $component.find('style');
  T.exists(assert, $style, 'Missing  style component');

  const expedtedStyle = `
    .btn-primary, .btn-primary:active {
        background-color: gray !important;
    }

    .btn-info, .btn-info:active {
        background-color: blue !important
    }

    .btn-success, .btn-success:active {
        background-color: green !important
    }

    .gru-header .container-fluid .navbar-default .navbar-header .navbar-brand {
        background: url("http://gooru.org/welcome/images/GooruLogo.png");
        height: 55px;
        padding: 0;
        width: 140px;
        background-size: 140px 55px;
    }

    .content.modals.gru-welcome-message .modal-body .last-text p .logo {
        background: url("http://gooru.org/welcome/images/GooruLogo.png") no-repeat;
        background-size: contain;
    }

    .gru-study-navbar .header-panel .nav-body .app-brand a {
      background-image: url("http://gooru.org/welcome/images/GooruLogo.png");
    }

    .gru-class-navbar .header-panel .nav-body .app-brand a {
      background-image: url("http://gooru.org/welcome/images/GooruLogo.png");
    }

    .controller.sign-in .sign-in-wrapper .sign-in-tenant-header .tenant-logo {
      background-image: url("http://gooru.org/welcome/images/GooruLogo.png");
    }
`;
  assert.equal($style.text(), expedtedStyle, 'Wrong style body');
});
