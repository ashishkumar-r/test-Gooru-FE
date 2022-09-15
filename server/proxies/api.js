/* eslint-env node */
var targetObj = {
  target: 'https://stage.gooru.org',
  headers: { Host: 'stage.gooru.org' },
  secure: false
};
var proxyPathList = [
  {
    endpoint: '/api',
    targetObj: targetObj
  },
  {
    endpoint: '/quizzes/api',
    targetObj: targetObj
  },
  {
    endpoint: '/web/parse',
    targetObj: targetObj
  },
  {
    endpoint: '/gooru-search/rest',
    targetObj: targetObj
  },
  {
    endpoint: '/tools/h5p',
    targetObj: {
      target: 'http://192.168.42.77:8080',
      secure: false
    }
  },
  {
    endpoint: '/ws',
    targetObj: targetObj
  }
];

module.exports = function(app) {
  // For options, see:
  // https://github.com/nodejitsu/node-http-proxy
  var proxy = require('http-proxy').createProxyServer({
    secure: false
  });

  proxyPathList.forEach(proxyPath => {
    app.use(proxyPath.endpoint, function(req, res) {
      // include root path in proxied request
      req.url = proxyPath.endpoint + req.url;
      proxy.web(req, res, proxyPath.targetObj);
    });
  });
};
