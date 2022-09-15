import Ember from 'ember';
export default Ember.Component.extend({
  tagName: 'span',

  // -------------------------------------------------------------------------
  // Events

  renderMathExpression: Ember.on('didInsertElement', function() {
    var component = this;
    component.renderInMath();
    const $fileInput = this.$('input[type="text"]');
    if ($fileInput) {
      $fileInput.attr('title', 'math-input');
    }
  }),

  /**
   * @requires service:api-sdk/resource
   */
  resourceService: Ember.inject.service('api-sdk/resource'),

  // -------------------------------------------------------------------------
  // Properties
  /**
   * Text to render
   */
  text: null,

  /**
   * based on this to show full videos
   */
  isShowVideo: false,

  /**
   * based on this to show full videos
   */
  isShowURL: true,

  /**
   * Observe when the text change
   */
  mathRender: function() {
    var component = this;
    component.renderInMath();
  }.observes('text'),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * It searches all of the text nodes in a given element for the given delimiters, and renders the math in place.
   */
  renderInMath: function() {
    var component = this;
    component.$('.gru-math-text').html(component.get('text'));
    let text = component.$('.gru-math-text a');
    if (text && text.length && component.get('isShowVideo')) {
      Array.from(text).forEach((aTag, index) => {
        if (aTag.host === 'www.youtube.com') {
          let url = aTag.href;
          let youtubeURl = url.replace('watch?v=', 'embed/');
          $(aTag).after(
            $('<iframe>', {
              src: youtubeURl,
              width: '100%',
              height: '100%'
            })
          );
          $(aTag).remove();
        } else if (
          aTag.host !== 'www.youtube.com' &&
          aTag.host !== 'cdn.gooru.org'
        ) {
          this.get('resourceService')
            .createFbChecker(aTag.href)
            .then(data => {
              if (data.is_framebreaker === true) {
                $(aTag)
                  .after(`<div style="background-color: #00BFFF;" class="card bg-info text-white"><div class="card-body" style="text-align: center;"><br><p><h2 style="color:white">The following link cannot be embedded here.</h2>
                <br><h5>${aTag.href}<h5><h3 style="color:white">Please click on the link to view the content in a separate tab and then return here to answer the question.</h3></p><br>
                <button style="background-color:black" class="btn btn-primary"><a style="color:white" href="${aTag.href}" target="_blank">Launch!</a></button>
                </div><br></div>
                `);
                $(aTag).remove();
              } else {
                $(aTag).after(
                  $(
                    `<iframe src="${aTag.href}" width="100%" height="400"></iframe><br>
                    <button type="button" class="btn btn-lg pull-right" style="font-size: large;color: black;" data-toggle="modal"
                    data-target="#iframeModalCenter-${index}">
                    <i class="fa fa-expand" data-toggle="tooltip" title="Full Screen View" data-placement="top"></i>
                    </button><br>
                    <div class="modal fade" id="iframeModalCenter-${index}" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                      <div class="modal-dialog modal-dialog-centered" role="document">
                          <div class="modal-header">
                            <button type="button" style="color:white;font-weight: bold;" class="close" data-dismiss="modal" aria-label="Close">
                              <span aria-hidden="true">&times;</span>
                            </button>
                          </div>
                          <div class="modal-body">
                          <iframe src="${aTag.href}" width="100%" style="height:850px !important" ></iframe><br>
                          </div>
                      </div>
                    </div><br>`
                  )
                );
                $(function() {
                  $('[data-toggle="tooltip"]').tooltip();
                });

                $(aTag).remove();
              }
            });
        } else {
          let audioLink = new Audio(aTag.href);
          let href = audioLink.src;
          var extensionLink = href.split('.').pop();
          if (audioLink) {
            if (
              extensionLink === 'mp3' ||
              extensionLink === 'wav' ||
              extensionLink === 'm4a'
            ) {
              let audioType = extensionLink === 'm4a' ? 'x-m4a' : extensionLink;
              $(aTag).after(
                $(
                  `<audio controls style="width:100%"> <source src=${aTag.href} type="audio/${audioType}"/></audio>`
                )
              );
              $(aTag).remove();
            } else {
              $(aTag).after(
                $(
                  `<video controls style="width:100%"> <source src=${aTag.href} type="video/mp4"/></video>`
                )
              );
              $(aTag).remove();
            }
          }
        }
      });
    } else if (text && text.length) {
      if (component.get('isShowURL')) {
        component.$('.gru-math-text a[href]').attr('target', '_blank');
      } else {
        Array.from(text).forEach(aTag => {
          $(aTag).remove();
        });
      }
    }
    window.renderMathInElement(component.$('.gru-math-text').get(0), {
      delimiters: [
        {
          left: '$$',
          right: '$$',
          display: false
        }
      ]
    });
  }
});
