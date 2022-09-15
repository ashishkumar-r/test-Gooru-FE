Tenant configuration support
============================
This document describes how tenant information is loaded and used by the application. The application loads the tenant information from the configured repository 
using the tenant id provided at the authentication response. With this information the tenant theme is generated when loading the application. 
If the file is not found the application will still load normally but tenant settings wont be applied.


# Tenant repository
The tenant information is stored in s3 bucket repository, the bucket is configured at the application configuration file, using the "tenantUrl" property. 
See [Application Properties](application-properties.md)

## Bucket configuration
The s3 bucket can have any name, but the application is configured to use nile-tenants as default. 
This bucket should support CORS calls by adding this configuration
```
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <CORSRule>
        <AllowedOrigin>*</AllowedOrigin>
        <AllowedMethod>GET</AllowedMethod>
        <MaxAgeSeconds>3000</MaxAgeSeconds>
        <AllowedHeader>*</AllowedHeader>
    </CORSRule>
</CORSConfiguration>
```

## Tenant environments
The nile-tenants bucket contains 3 default environments - dev, qa and prod - so tenants can be configured independently for each of them.
But more environments could be configured as well, the application configuration property "tenantUrl", should be configured accordingly.

## Tenant configuration file
Each tenant should have a file called tenant.json inside its own folder following this structure

`/nile-tenants/{environment}/{tenant-id}/tenant.json`, for example `/nile-tenants/dev/ba956a97-ae15-11e5-a302-f8a963065976/tenant.json`

The file should be public and the content type should be `application/json`

The tenant should have this structure

```
{
  "id": "ba956a97-ae15-11e5-a302-f8a963065976",
  "theme": {
    "buttons": {
      "primary": {
        "color": "gray"
      },
      "info": {
        "color": "blue"
      },
      "success": {
        "color": "green"
      },
      "warning": {
        "color": "orange"
      },
      "danger": {
        "color": "red"
      }
    },
    "header": {
      "logo": {
        "url": "http://www.edify.cr/images/logo-EDIFY.png"
      }
    }
  }
}
```

For now only the button colors and logo url can be configure.
The logo suggested width is 140px and height is 55px, if bigger the application will scale it down to that size.


# Theme generation
Using the tenant configuration file the application generates the tenant theme style using the `gru-tenant-theme` component (see applications.hbs file). This style overrides the default style rules.
