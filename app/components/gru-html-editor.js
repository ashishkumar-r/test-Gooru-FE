/* eslint-disable */
import Ember from 'ember';
import CKEditorUploadAdapter from './ckeditor-upload';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-html-editor'],

  textData: null,

  description: '',

  editorContent: null,

  EditHtml: Ember.observer('isEditHtml', function() {
    this.get('editorContent').isReadOnly = !this.get('isEditHtml');
    if (!this.get('isEditHtml')) {
      this.get('editorContent').ui.view.toolbar.element.setAttribute(
        'style',
        'display:none'
      );
    } else {
      this.get('editorContent').ui.view.toolbar.element.setAttribute(
        'style',
        'display:flex'
      );
    }
  }),

  session: Ember.inject.service(),

  // --------------------------------------------------------------------
  // Hooks

  didInsertElement() {
    this.loadData();
  },

  // --------------------------------------------------------------------
  // Methods

  loadData() {
    const component = this;
    DecoupledDocumentEditor.create(component.$('#html-editor')[0], {
      toolbar: [
        'heading',
        '|',
        'alignment',
        '|',
        'fontBackgroundColor',
        'fontColor',
        'fontFamily',
        'fontSize',
        '|',
        'highlight',
        '|',
        'blockQuote',
        'bold',
        'italic',
        'underline',
        'link',
        '|',
        'code',
        'codeBlock',
        '|',
        'selectAll',
        'undo',
        'redo',
        '|',
        'findAndReplace',
        'htmlEmbed',
        'uploadImage',
        '|',
        'indent',
        'outdent',
        '|',
        'numberedList',
        'bulletedList',
        'todoList',
        '|',
        'mediaEmbed',
        'specialCharacters',
        'strikethrough',
        '|',
        'subscript',
        'superscript',
        '|',
        'insertTable',
        '|',
        'textPartLanguage'
      ],
      extraPlugins: [component.myCustomUploadAdapterPlugin],
      link: {
        addTargetToExternalLinks: true
      },
      fontSize: {
        options: [7, 9, 11, 13, 'default', 17, 19, 21, 23]
      },
      mediaEmbed: {
        previewsInData: true
      },
      language: {
        textPartLanguage: [
          { title: 'Arabic', languageCode: 'ar' },
          { title: 'Afrikaans', languageCode: 'af' },
          { title: 'Asturian', languageCode: 'ast' },
          { title: 'Chinese', languageCode: 'zh' },
          { title: 'English', languageCode: 'en' },
          { title: 'French', languageCode: 'fr' },
          { title: 'Gujarati', languageCode: 'gu' },
          { title: 'Hebrew', languageCode: 'he' },
          { title: 'Hindi', languageCode: 'hi' },
          { title: 'Kannada', languageCode: 'kn' },
          { title: 'Spanish', languageCode: 'es' }
        ]
      },
      image: {
        toolbar: [
          'imageStyle:alignCenter',
          'imageStyle:wrapText',
          'imageStyle:breakText',
          '|',
          'toggleImageCaption',
          'imageTextAlternative'
        ]
      },
      licenseKey: ''
    })
      .then(editor => {
        const toolbarContainer = document.querySelector('#toolbar-container');
        toolbarContainer.appendChild(editor.ui.view.toolbar.element);
        if (component.get('description')) {
          editor.setData(component.get('description'));
        }
        if (!this.get('isEditHtml')) {
          editor.isReadOnly = true;
          editor.ui.view.toolbar.element.setAttribute('style', 'display:none');
        }
        component.set('editorContent', editor);
        editor.model.document.on('change:data', () => {
          component.set('textData', editor.getData());
          component.set('description', editor.getData());
        });
      })
      .catch(err => {
        console.error(err.stack);
      });
  },

  myCustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = loader => {
      return new CKEditorUploadAdapter(loader);
    };
  }
});
