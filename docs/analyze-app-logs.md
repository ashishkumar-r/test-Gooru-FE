Analyze Application Logs
=============

To analyze the application logs we are using SumoLogic (https://www.sumologic.com). We use a free account that provides us a trial for 30 days with full functionality.

## Create a collector
Once you Signed In in Sumo, go to menu Manage > Collection and create a HTTP collector.
 
The name of the collector is important because you will need it for every  query you want to do. For example we used a name like 'gooru_web_logs'.

SumoLogic will provide you the URL of the new collector so you can POST the log data through that collector.

## Access log file
To access to the current Gooru Web log file you will need to configure SSH to pass through the Bastion server.

Create this file if it does not exist: 

`vi ~/.ssh/config`

and copy/paste this:

```
Host logs.machine
  User          ubuntu
  HostName      54.67.0.104
  ProxyCommand  ssh ec2-user@52.8.204.218 nc %h %p 2> /dev/null
```

To copy the file from the remote server do this:

`scp logs.machine:/opt/nucleus/logs/nucleus-utils-user-error.log .`

You can have a local process that compare the last version you copied with the most recent copy and just send the differences to the SumoLogic HTTP processor.

## How to query the log files
Once the processor is getting data you can start doing queries. Here we have some examples of the kind of queries we do to group the errors registered in the log file:


* Count Errors by API
```
_sourceCategory="gooru_web_logs" AND "client_context\":\"url\""
  | parse "api\":\"*://www.gooru.org/*/*/" as (protocol, api_path1, api_path2)
  | count by api_path1, api_path2
  | sort by _count
```

* Count Errors by api_status 
```
_sourceCategory="gooru_web_logs" AND "client_context\":\"url\""
  | parse "api_status\":*," as api_status 
  | count as errors group by api_status
  | sort by errors
```
* Count errors by client_context
```
_sourceCategory="gooru_web_logs" 
| parse "client_context\":\"*\"" as client_context 
| count as errors group by client_context
```
* Count errors by status and API
```
_sourceCategory="gooru_web_logs" AND "client_context\":\"url\""
| parse "api\":\"*://www.gooru.org/*/*/" as (protocol, api_path1, api_path2) 
| parse "api_status\":*," as api_status 
| count by api_status, api_path1, api_path2
| sort by api_status asc, _count
```
* Count errors by user_id (only if occurs more than 10 times)
```
_sourceCategory="gooru_web_logs" AND "client_context\":\"url\""
| parse "user_id\":\"*\"" as user_id 
| count as errors group by user_id
| sort by errors
| where errors >= 10
```
* Count errors by API (more detailed groups)
```
_sourceCategory="gooru_web_logs" AND "client_context\":\"url\""
| parse "api\":\"*://www.gooru.org/*/*/*/*/" as (protocol, api_path1, api_path2, api_path3, api_path4) 
| count by api_path1, api_path2, api_path3, api_path4
| where api_path2 matches "nucleus"
| sort by _count
```
Note: Every query can be saved and the results can be posted in you personal dashboard if you wish.
