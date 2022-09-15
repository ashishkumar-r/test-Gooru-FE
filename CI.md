Continuous integration
======================

The build process consists of a plan that contains 2 stages. Then a Bamboo deployment project
is in charged of only the deployment part to any enviroment needed.

# Build stage

This stage would run the tests and builds the deployment artifact.

This stage would publish the following artifacts:

- Deploy artifact (the actual site + AWS CodeDeploy config and scripts)
- .ci/publish.sh script
- .ci/common.sh script
- .ci/deploy.sh script

The scripts are publish as shared artifacts so that we can use them in other stages without
downloading from source control.

## .ci/do-build.sh

Required enviroment variables:

- S3_BUCKET the S3 bucket where the welcome site can be found
- AWS_DEFAULT_REGION
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY

The AWS credentials need to have at at least read access to the S3_BUCKET.

This scripts downloads the welcome site from `s3://${S3_BUCKET}/frontend-30/builds/welcome/welcome.tar.gz`

Then it starts the actual build process inside a node:4.6 Docker container, passing the following
Bamboo env variables to the build script:

- bamboo_buildNumber
- bamboo_repository_branch_name

## .ci/build.sh

The actual build script that runs inside the node:4.6 Docker container.

This scripts runs as a `builder` user instead of the default which is `root`.

The script does the following:

- Update NPM
- Install the required global Node deps (ember-cli, phantomjs, etc.)
- Install the project Node deps
- Install the project Bower deps
- Run the unit and integration tests
- Build the site
- Create the deploy artifact that includes the builded site, the appspec.yml, the deploy scripts in
  .deploy and the previously downloades welcome site

The naming of the deploy artifact is gooru-web-${GIT_BRANCH}-${BUILD_NUMBER}

# Publish stage

This stage uploads the deploy artifact to an S3 bucket. Currently only uploads the artifact for 
the `GG-Nile` branch.

## .ci/publish.sh

Required enviroment variables:

- S3_BUCKET the S3 bucket where the welcome site can be found
- AWS_DEFAULT_REGION
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY

The AWS credentials need to have at at least read/write access to the S3_BUCKET.

This scripts uploads the deploy artifact from the previous stage into
`s3://${S3_BUCKET}/frontend-30/builds/${GIT_BRANCH}/gooru-web-$VERSION.tar.gz`

# Deployments

Deployments are done via AWS CodeDeploy and all the configuration and scripts are in this repo and
bundle in the deployment artifact as described above.

## .ci/deploy.sh

Required enviroment variables:

- S3_BUCKET the S3 bucket where the welcome site can be found
- AWS_DEFAULT_REGION
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- CODE_DEPLOY_APP_NAME
- DEPLOYMENT_GROUP

The AWS credentials need to have at at least access to the CodeDeploy app (CODE_DEPLOY_APP_NAME).

The script simply triggers a deploy via AWS CodeDeploy.

# Updating the welcome site

The welcome site is store in S3 under `s3://${S3_BUCKET}/frontend-30/welcome/welcome.tar.gz`

To upload a new version you would need to install the AWS CLI:

## OS X

`brew install awscli`

## Linux

`sudo pip install -U awscli` or `pip install --user -U awscli`

To configure the AWS CLI check http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html

The to upload create tar.gz file of a folder called welcome that contains the site files.

```
welcome
├── css
├── fonts
├── images
├── index.html
└── js
```

```
tar czf welcome.tar.gz welcome

aws s3 cp welcome.tar.gz s3://projectnile-bamboo-builds/frontend-30/welcome/welcome.tar.gz
```
