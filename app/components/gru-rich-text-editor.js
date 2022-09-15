import Ember from 'ember';
import {
  LATEX_EXPRESSIONS,
  ADVANCED_LATEX_EXPRESSION
} from 'gooru-web/config/question';
import {
  removeHtmlTags,
  generateUUID,
  validateSquareBracket
} from 'gooru-web/utils/utils';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
/**
 * Rich text editor component
 *
 * @module
 */
export default Ember.Component.extend(ConfigurationMixin, {
  /**
   * @property {MediaService} Media service API SDK
   */
  mediaService: Ember.inject.service('api-sdk/media'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-rich-text-editor'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    toggleExpressionsPanel() {
      this.set('showAdvanceEditor', false);
      if (this.get('showExpressionsPanel')) {
        this.cancelExpression();
      }
      this.toggleProperty('showExpressionsPanel');
    },
    insertExpression() {
      var component = this;
      var editorClass = `.editor-box${component.get('editorIndex')}`;
      const advancedLatex = component.get('advancedEditItem');
      const showAdvanceEditor = component.get('showAdvanceEditor');
      if (
        component.get('editor') &&
        (component.get('mathField') || advancedLatex)
      ) {
        let latex = showAdvanceEditor
          ? advancedLatex
          : component.get('mathField').latex();
        try {
          let html = `<span class='gru-math-expression ${
            advancedLatex ? 'advanced-edit' : ''
          }'><span class='source' hidden>${latex}</span>${katex.renderToString(
            latex
          )}</span>`;

          component.get('editor').focus();
          if (component.get('cursor')) {
            component
              .get('editor')
              .composer.selection.setBookmark(component.get('cursor'));
          }
          if (component.get('editor').composer) {
            component.get('editor').composer.commands.exec('insertHTML', html);
            var editorElement = component.$(editorClass);
            component.set('content', editorElement.html());
            component.makeExpressionsReadOnly();
            component.setCursor();
          }
          this.cancelExpression();
          this.toggleProperty('showExpressionsPanel');
        } catch (e) {
          if (e instanceof katex.ParseError) {
            component.set('invalidSymbol', true);
          } else {
            throw e;
          }
        }
      }
    },

    updateExpression() {
      var component = this;
      var editorClass = `.editor-box${component.get('editorIndex')}`;
      const advancedLatex = component.get('advancedEditItem');
      const showAdvanceEditor = component.get('showAdvanceEditor');
      if (
        (component.get('editingExpression') &&
          component.get('editor') &&
          component.get('mathField')) ||
        advancedLatex
      ) {
        try {
          let latex = showAdvanceEditor
            ? advancedLatex
            : component.get('mathField').latex();
          let source = component.get('editingExpression').find('.source');
          if (source && source.length && latex !== source.text()) {
            let html = katex.renderToString(latex);
            source.text(latex);
            component
              .get('editingExpression')
              .find('.katex')
              .replaceWith(html);
          }
          var editorElement = component.$(editorClass);
          component.set('content', editorElement.html());
          component.makeExpressionsReadOnly();
          component.setCursor();
          this.cancelExpression();
          this.toggleProperty('showExpressionsPanel');
        } catch (e) {
          if (e instanceof katex.ParseError) {
            component.set('invalidSymbol', true);
          } else {
            throw e;
          }
        }
      }
    },

    selectFile: function(file) {
      let component = this;
      let imageIdPromise = new Ember.RSVP.resolve(file);
      imageIdPromise = component.get('mediaService').uploadContentFile(file);
      imageIdPromise.then(function(imageId) {
        var editorClass = `.editor-box${component.get('editorIndex')}`;
        let html = `<a href="${imageId}">${imageId}</a>`;
        component.get('editor').composer.commands.exec('insertHTML', html);
        var editorElement = component.$(editorClass);
        component.set('content', editorElement.html());
      });
    }
  },

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
    component.set('filePickerErrors', Ember.A());
    var editorId = `wysihtml-editor${component.get('editorIndex')}`;
    var editorClass = `.editor-box${component.get('editorIndex')}`;
    var toolbarId = `wysihtml-toolbar${component.get('editorIndex')}`;
    var mathExp = `#wysihtml-editor${component.get(
      'editorIndex'
    )}.editable .gru-math-expression`;
    var mathFieldClass = `.math-field${component.get('editorIndex')}`;

    var mathFieldSpan = component.$(mathFieldClass)[0];
    // Initialize Mathquill
    var MQ = MathQuill.getInterface(2);
    const mathQuill = MQ.MathField(mathFieldSpan, {
      spaceBehavesLikeTab: false
    });
    component.set('mathField', mathQuill);
    component.set('MQ', MQ);

    // Initialize RTE

    var editor = new wysihtml5.Editor(editorId, {
      toolbar: toolbarId,
      cleanUp: false,
      parserRules: true
    });
    component.set('editor', editor);
    /**
     * Function to run on load
     */
    function onLoad() {
      Ember.run(function() {
        if (editor.composer && editor.composer.commands) {
          let isAutoFocus = component.get('isAutoFocusDisabled');
          if (!isAutoFocus) {
            editor.focus();
          }
          if (component.get('content')) {
            if (
              editor &&
              editor.composer &&
              editor.composer.element &&
              editor.composer.selection
            ) {
              editor.composer.selection.selectNode(editor.composer.element);
            }

            if (!component.get('courseLessonDesc')) {
              editor.composer.commands.exec(
                'insertHTML',
                component.get('content')
              );
            }
            component.renderMathExpressions();
            component.makeExpressionsReadOnly();
            component.setCursor();
            component.$(editorClass).blur();
          }
        }
      });
      // unobserve load Event
      editor.stopObserving('onLoad', onLoad);
    }

    // observe load Event
    editor.on('load', function() {
      onLoad();
    });

    // Add expression to MathQuill field
    component.$().on('click', '.tab-pane a', function(e) {
      e.preventDefault();
      component.get('mathField').latex();
      var expression = $(this).data('expression');
      const isAdvancedEditor =
        $(this).parents('.advanced-toolbar').length !== 0;
      component.set('showAdvanceEditor', isAdvancedEditor);
      if (
        component.get('mathField') &&
        LATEX_EXPRESSIONS[expression] &&
        !isAdvancedEditor
      ) {
        component
          .get('mathField')
          .write(LATEX_EXPRESSIONS[expression])
          .focus();
      } else {
        component.set('advancedEditItem', expression);
      }
    });
    // Save cursor position
    component.$().on('click', editorClass, function(e) {
      e.preventDefault();
      component.setCursor(true);
    });

    component.$().on('keyup', editorClass, function(e) {
      e.preventDefault();
      var editorElement = component.$(editorClass);
      component.set('content', editorElement.html());
      component.setCursor();
    });

    component.$().on('keyup', '.advanced-text-editor', function() {
      component.set('advancedEditItem', $(this).val());
    });

    component.$().on('click', '.btn-toolbar ', function(e) {
      e.preventDefault();
      var editorElement = component.$(editorClass);
      component.set('content', editorElement.html());
      const classList = e.target.classList;
      component.set('isCreateExp', classList.contains('add-function'));
    });

    // Go to edit mode of existing expression
    component.$().on('click', '.gru-math-expression', function(e) {
      e.preventDefault();
      var sourceLatex = $(this)
        .find('.source')
        .text();
      const isAdvancedEditor = $(this).hasClass('advanced-edit');
      component.set('showAdvanceEditor', isAdvancedEditor);
      if (sourceLatex && sourceLatex !== '' && !isAdvancedEditor) {
        component.set('editingExpression', $(this).closest(mathExp));
        component.set('showExpressionsPanel', true);
        Ember.run.later(function() {
          component
            .get('mathField')
            .latex(sourceLatex)
            .reflow()
            .focus();
        }, 100);
      } else {
        component.set('editingExpression', $(this).closest(mathExp));
        component.set('showExpressionsPanel', true);
        component
          .$('.advanced-text-editor')
          .val(sourceLatex)
          .focus();
        component.set('advancedEditItem', sourceLatex);
      }
    });
  },

  /**
   * willDestroyElement events
   */
  willDestroyElement: function() {
    const component = this;
    var editorClass = `.editor-box${component.get('editorIndex')}`;
    var mathExp = `#wysihtml-editor${component.get(
      'editorIndex'
    )}.editable .gru-math-expression`;

    component.$().off('click', '.tab-pane a');
    component.$().off('click', editorClass);
    component.$().off('keyup', editorClass);
    component.$().off('click', mathExp);
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Boolean} Indicates if the expressions panel must be showed
   */
  showExpressionsPanel: false,

  /**
   * @property {DOMElement} Reference to the DOM element of the editing expression
   */
  editingExpression: null,

  /**
   * @property {boolean} Indicates it the user is editing an existing expression
   */
  isEditingExpression: Ember.computed('editingExpression', function() {
    return this.get('editingExpression') !== null;
  }),

  /**
   * @property {MQ} Mathquill instance
   */
  MQ: null,

  /**
   * @property {MathQuill} MathQuill field reference
   */
  mathField: null,

  /**
   * @property {Object} wysihtml5 editor instance
   */
  editor: null,

  /**
   * @property {string} content to edit
   */
  content: null,

  /**
   * @param {Object} model - Model that will be attached to the component
   */
  model: null,

  /**
   * @param {String} valuePath - value used to set the validation message
   */
  valuePath: '',

  /**
   * @property {WrappedRange} Cursor position on wysihtml5 editor
   */
  cursor: null,

  /**
   * @param {String} uuid
   */
  uuid: null,

  /**
   * @param {Computed } showMessage - computed property that defines if show validation messages
   */
  showMessage: Ember.computed('content', function() {
    var contentEditor = removeHtmlTags(this.get('content'));
    let questionType = this.get('model.type');
    if ($.trim(contentEditor) === '') {
      //this.set('content', contentEditor); //ember deprecation
      return true;
    } else if (
      !validateSquareBracket(contentEditor) &&
      questionType === 'FIB'
    ) {
      return true;
    }
    return false;
  }),

  /**
   * @param {Computed } editorIndex - computed property that generate an UUID for the editor index
   */

  editorIndex: Ember.computed(function() {
    let editorIndex = this.get('uuid');
    if (!editorIndex) {
      editorIndex = generateUUID();
    }

    return editorIndex;
  }),

  restoreMathAndSelection: Ember.observer('showExpressionsPanel', function() {
    var component = this;
    Ember.run.later(function() {
      if (component.get('showExpressionsPanel')) {
        if (component.get('mathField')) {
          component.get('mathField').focus();
        }
      } else {
        if (component.get('cursor')) {
          component.setCursor();
        }
      }
    }, 100);
  }),

  /**
   * @property {Boolean} isCustomEditor
   */
  isCustomEditor: false,

  isCreateExp: false,

  /**
   * List of error messages to present to the user for conditions that the loaded image does not meet
   * @prop {String[]}
   */
  filePickerErrors: null,

  audioExtensionsType: '.mp3, .ogg, .m4a and .wav',

  videoExtensionsType: '.mp4, .mov, .webm and .ogg',

  maxFileSize: Ember.computed.alias('configuration.FILE_UPLOAD.MAX_SIZE_IN_MB'),

  advancedMathExpression: Ember.computed(function() {
    return ADVANCED_LATEX_EXPRESSION;
  }),

  showAdvanceEditor: false,

  advancedEditItem: null,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Makes sure that the expressions inside the RTE are not editable
   */
  makeExpressionsReadOnly() {
    this.$('.gru-math-expression').attr('contenteditable', false);
  },
  /**
   * Cancel expression panel
   */
  cancelExpression() {
    this.get('mathField').latex(''); // Clear math field
    this.set('editingExpression', null);
    this.set('invalidSymbol', false);
    this.set('advancedEditItem', null);
    this.$('.advanced-text-editor').val('');
  },

  setCursor(isFromBox = false) {
    var component = this;
    const isCreateExp = component.get('isCreateExp');
    var composer = component.get('editor').composer;
    if (composer.selection && !isFromBox) {
      component.set('cursor', composer.selection.getBookmark());
      composer.selection.setBookmark(component.get('cursor'));
    }
    component.get('editor').focus();
    if (this.get('checkFocus')) {
      if (component.get('editor').focus()) {
        component
          .$(`#${component.get('editor').currentView.config.toolbar}`)
          .css('opacity', 1);
      }
      $('.rich-editor').focusout(function() {
        const opacity = isCreateExp ? 1 : 0;
        component
          .$(`#${component.get('editor').currentView.config.toolbar}`)
          .css('opacity', opacity);
        component.set('isCreateExp', false);
      });
    }
  },

  /**
   * It searches all of the text nodes in a given element for the given delimiters, and renders the math in place.
   */
  renderMathExpressions() {
    var editorId = `wysihtml-editor${this.get('editorIndex')}`;
    window.renderMathInElement(document.getElementById(editorId), {
      delimiters: [{ left: '$$', right: '$$', display: false }]
    });
  },
  didRender: function() {
    const $fileInput = this.$('input[type="file"]');
    if ($fileInput) {
      for (let i = 0; i < $fileInput.length; i++) {
        $fileInput[i].title = $fileInput[i].id;
      }
    }
    const $mqTextarea = this.$('.mq-textarea > textarea');
    if ($mqTextarea) {
      for (let i = 0; i < $mqTextarea.length; i++) {
        $mqTextarea[i].title = `${{ i }} mqeditor`;
      }
    }
  }
});
