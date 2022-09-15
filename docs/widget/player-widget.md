Player Widget
=============
As any other application page the player can be embedded in a 3rd party system.
See [Application Widget](application-widget.md) documentation for configuration

## Anonymous player session

```
  <script type="text/javascript">
    (function () {
      var aw = new ApplicationWidget('#gooru-application-container', {
        "environment": "qa",
        "transition": [ 'player', 'b6170219-5841-46b8-9c6a-d684bc457538', { queryParams: { type: 'collection', role: 'student' }}]
      });
    })();
  </script>
```

## Authenticated player session
```
  <script type="text/javascript">
    (function () {
      var aw = new ApplicationWidget('#gooru-application-container', {
        "environment": "qa",
        "transition": [ 'player', 'b6170219-5841-46b8-9c6a-d684bc457538', { queryParams: { type: 'collection', role: 'student' }}],
        "token": any-valid-token-here
      });
    })();
  </script>
```
Note: Change the appRootPath to match the base path of the application-widget.js file


## Enabling/Disabling player features
 See supported features [here](../features-flags.md) 
