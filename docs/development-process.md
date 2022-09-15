Development process
=============
This document describes the development process for features, release candidate fixes and production hotfixes

## Feature development
The feature development occurs during sprints, at the sprint planning the stories are selected and added to the sprint board. Developers will take one story/improvement/bug at the time

* Move the ticket to the in progress column
* Create a feature branch (using the latest of develop) 
    * `git checkout develop`
    * `git pull origin develop`
    * `git flow feature start BRANCH_NAME`
* When changes are ready, publish them for peer review 
    * `git flow feature publish BRANCH_NAME`
* Once changes are approved and the branch build is passing finish the feature branch 
    * `git flow feature finish BRANCH_NAME`
* Once your changes are merged to develop a QA (Edify QA environment) deployment will occur, verify that your changes are deployed correctly and move the ticket to QA

## Doing a release candidate
Once the sprint is **Done** the tech lead will create a release candidate branch so QA can start the validation period before going to production. These are the steps for doing a release branch

* A release candidate ticket will be created following the template
* Create the release branch from the latest of develop
    * `git checkout develop`
    * `git pull origin develop`
    * `git flow release start RELEASE_CANDIDATE_BRANCH`
* Publish the release branch so people can check the code and do changes if necessary
    * `git flow release publish RELEASE_CANDIDATE_BRANCH` 
* When the release branch is published a deployment will occur to the staging server (Nucleus QA) for QA validation
* If issues are found the developers will follow the **Release fix development** process
* Once the release candidate is approved by QA and Product Owner the tech lead will generate/add the changelog (using the script changelog.sh) and finish the release
    * `./changelog.sh RELEASE_CANDIDATE_BRANCH` 
    * Add the output to the CHANGELOG.md file and commit the changes
    * `git flow release finish RELEASE_CANDIDATE_BRANCH`
* Make sure the **release branch is also merged back to develop**
* Once changes are in master the tech lead will coordinate the production deployment
* Once it is deploy to prod the release candidate ticket is closed

## Release fix development
Once the release branch has been created, the build will be deployed to the staging server (Nucleus QA Environment), if any issue is reported from that environment during the release validation period it will be treated as a release fix. Release fixes are tagged with the **Release** label, developers will take one release fix at the time

* Move the ticket (having the Release label) to the in progress column
* Create a release fix branch (using the latest of the release candidate branch)
    * `git checkout release/RELEASE_CANDIDATE_BRANCH`   
    * `git pull origin release/RELEASE_CANDIDATE_BRANCH`
    * `git checkout -b BRANCH_NAME`
* When changes are ready, publish them for peer review 
    * `git push origin BRANCH_NAME`
* Once changes are approved and the branch build is passing merge the changes back to the release candidate branch
    * `git checkout release/RELEASE_CANDIDATE_BRANCH`
    * `git merge BRANCH_NAME`
    * `git push origin release/RELEASE_CANDIDATE_BRANCH`
* The release fixes **are not merged to develop**, they will get there once the release is finished 
* Once your changes are merged to the release candidate branch a Staging deployment will occur, verify that your changes are deployed correctly and move the ticket to QA

## Hotfix development
Once the release candidate is deployed to production, if any issue is reported from that environment it will be treated as a hotfix (if approved by Product Owner/PM/Tech Lead/QA). Every hotfix will have a Jira ticket tagged with the **Hot-Fix** label. Also a Production Release Hotfix ticket will be created in Jira, this ticket will be the reference to create a new hotfix branch in Git. Every hotfix reported will be worked in a sub-branch (normal branch) created from hotfix branch.

* Create and move the ticket Production Release <release number> (Hotfix) to the in progress column.
* Create the hotfix branch (using the latest of the master branch)
    * `git checkout master`   
    * `git pull origin master`
    * `git flow hotfix start HOTFIX_BRANCH_NAME`
* Move the hotfix ticket (having the Hot-Fix label) to the in progress column
* Create a sub-branch (normal branch) from the hotfix branch
    * `git checkout hotfix/HOTFIX_BRANCH_NAME`   
    * `git pull origin hotfix/HOTFIX_BRANCH_NAME`
    * `git checkout -b BRANCH_NAME`
* When changes are ready, publish them for peer review 
    * `git push origin BRANCH_NAME`
* Once changes are approved and the branch build is passing merge the changes back to the hotfix branch (Hotfix production candidate branch)
    * `git checkout hotfix/HOTFIX_BRANCH_BRANCH`
    * `git merge BRANCH_NAME`
    * `git push origin hotfix/HOTFIX_BRANCH_BRANCH`
* Once all hotfixes were completed and merged back into the hotfix branch then publish the hotfix branch to be deployed to the staging server (Nucleus QA) for validation.
    * `git flow hotfix publish BRANCH_NAME`
* Once **QA sign off the changes** the hotfix branch can be merged back to master
    * `git flow hotfix finish BRANCH_NAME`
* Make sure you changes are **also merged back to develop** 
* The production deployment will be coordinated by the tech lead
