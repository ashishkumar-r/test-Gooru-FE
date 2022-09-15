import EndPointsConfig from 'gooru-web/utils/endpoint-config';
import { module, skip } from 'qunit';

module('Unit | utils | endpoint-config');

skip('getEndpointUrl', function(assert) {
  const endpointUrl = EndPointsConfig.getEndpointUrl();
  assert.equal(endpointUrl, 'http://localhost:7357');
});

skip('getEndpointSecureUrl', function(assert) {
  const endpointUrl = EndPointsConfig.getEndpointSecureUrl();
  assert.equal(endpointUrl, 'http://localhost:7357');
});

skip('getRealTimeWebServiceUrl', function(assert) {
  const endpointUrl = EndPointsConfig.getRealTimeWebServiceUrl();
  assert.equal(endpointUrl, 'https://localhost:7357');
});

skip('getRealTimeWebServiceUri', function(assert) {
  const endpointUrl = EndPointsConfig.getRealTimeWebServiceUri();
  assert.equal(endpointUrl, '/nucleus/realtime');
});

skip('getRealTimeWebSocketUrl', function(assert) {
  const endpointUrl = EndPointsConfig.getRealTimeWebSocketUrl();
  assert.equal(endpointUrl, 'https://localhost:7357/ws/realtime');
});

skip('getRealTimeWebSocketUri', function(assert) {
  const endpointUrl = EndPointsConfig.getRealTimeWebSocketUri();
  assert.equal(endpointUrl, '/ws/realtime');
});
