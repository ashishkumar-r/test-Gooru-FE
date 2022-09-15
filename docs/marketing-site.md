Marketing Site
--------------

# Deploying

## Requirements

- [AWS CLI](https://aws.amazon.com/cli/)
- AWS Credentials to upload to desired S3 bucket

To upload a new version of the marketing site

```
export S3_BUCKET="projectnile-bamboo-builds"
export AWS_DEFAULT_REGION=us-west-1
export AWS_ACCESS_KEY_ID=YOUR_KEY_ID
export AWS_SECRET_ACCESS_KEY=YOUR_KEY

aws s3 cp welcome.tar.gz s3://${S3_BUCKET}/frontend-30/welcome/welcome.tar.gz
```

## Tarball structure

```
welcome
├── css
├── fonts
├── images
├── index.html
└── js
```

*Note*: The root of the tarball should be a welcome directory.

