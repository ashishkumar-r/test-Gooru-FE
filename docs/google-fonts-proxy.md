Google Fonts Proxy
=============

We found that some local area networks has restricted access to some Google APIs. Due that it is not practical to
ask every network manager on every school to change the network access rules we decided to proxy the required Google
APIs (and this could be the same approach for all the external resources, meaning non Gooru resources), so we can avoid
the issue.

The proxy solution we have in place is using Nginx server, which provides us the functionality to reverse-proxy the 
requests that go to Google APIs.

Here we show a piece of the current Nginx configuration that allow us to proxy the content:

```
http {
    server {
        listen       80;
        server_name  localhost;

        location /css {
            sub_filter 'https://fonts.gstatic.com/' 'https://$host/fonts/';
            sub_filter_once off;
            sub_filter_types *;
            proxy_set_header Accept-Encoding "";
            proxy_pass https://fonts.googleapis.com/css;
        }

        location /icon {
            sub_filter 'https://fonts.gstatic.com/' 'https://$host/fonts/';
            sub_filter_once off;
            sub_filter_types *;
            proxy_set_header Accept-Encoding "";
            proxy_pass https://fonts.googleapis.com/icon;
        }

        location /fonts {
            proxy_pass https://fonts.gstatic.com/;
        }
    }
}
```
