Player events flow
==================
This document describes several player scenarios related to sending or not player events 


# Collection flow

## When starting a new collection attempt
This is when the user access a *new attempt* from search, profile, course map or data analytics

* A collection start event should be sent when playing the new attempt
* A resource/question start event is sent, since the player shows the first resource/question in the list by default
* No events are sent if the user is not logged in
* The start time for the collection and the first resource should be the same

## When playing a non finished collection attempt
This is when the user access a *previous started attempt* from search, profile, course map or data analytics 

* No collection start event should be sent since it was already started
* A resource/question start event is sent, since the player shows the last visited resource/question in the list by default
* The resource/question event is not sent when the user is not logged in

## When finishing a collection attempt
This is when the user clicks at See usage report

* A stop resource event should be sent for the last resource visited
* A question start event should be sent for any question not started by the user
* A question stop event should be sent for any started but not submitted question (pending)
* No start resource events should be sent for non visited resources
* No stop resource events should be sent for visited resources
* A collection stop event should be sent, event if the user is not logged in
* Resource and question events are not sent if the user is not logged in
* The stop time for the collection and resources are the same

## When finishing a collection attempt by submitting the last resource
This is when the last resource is a question and the user click submit at it

* Same as finishing a collection but also a stop event should be sent for the current resource
* Resource event is not sent if the user is not logged in
* The collection and resource stop time are the same

## When navigating to a non visited resource from left navigation panel
This is when the user click at any other non visited resource at the navigation panel

* A stop resource event should be sent for the current resource
* A start resource event should be sent for the resource the user is moving to
* Resource events are not sent if the user is not logged in
* The start time of the resource is the stop time of the previous resource

## When navigating back to a resource already visited from left navigation panel
This is when the user click at any visited resource at the navigation panel

* A stop resource event should be sent for the current resource
* A start resource event should be sent for the resource the user is moving
* If the resource was already started then the startedAt and resourceEventId are not modified, it keeps the original one
* Resource events are not sent if the user is not logged in
* The start time of the resource is the stop time of the previous resource


# Assessment flow

## When starting a new assessment attempt
This is when the user access a *new attempt* from search, profile, course map or data analytics

* A assessment start event should be sent when playing the new attempt
* A question start event is sent, since the player shows the first question in the list by default
* No events are sent if the user is not logged in
* The start time for the assessment and first resource are the same

## When playing a non finished assessment attempt
This is when the user access a *previous started attempt* from search, profile, course map or data analytics 

* No assessment start event should be sent since it was already started
* A question start event is sent, since the player shows the last visited question in the list by default
* The question event is not sent when the user is not logged in

## When submitting all questions in an assessment attempt
This is when the user clicks at Submit All

* A question start event should be sent for any question not started by the user
* A question stop event should be sent for any started but not submitted question (pending), if the user entered an answer the answer is saved, the question is not skipped
* A collection stop event should be sent, event if the user is not logged in
* The question events are not sent if the user is not logged in
* The stop time for the assessment and the stop time for all pending questions are the same

## When submitting the last question in an assessment attempt
This is when the user clicks submit at the last question attempt

* Same as submitting all flow but also a stop resource event should be sent for the current question
* The question event is not sent if the user is not logged in
* The stop time of the resource and assessment are the same

## When navigating to a non visited question from left navigation panel
This is when the user click at any other non visited question at the navigation panel

* A stop question event should be sent for the current question, if the user entered an answer the answer is saved, the question is not skipped
* A start question event should be sent for the question the user is moving to
* Question events are not sent if the user is not logged in
* The start time of the question is the stop time of the previous question

## When navigating back to a question visited from left navigation panel
This is when the user click at any other visited question at the navigation panel

* A stop question event should be sent for the current question, if the user entered an answer the answer is saved, the question is not skipped
* A start question event should be sent for the question the user is moving
* If the question was already started then the startedAt and resourceEventId are not modified, it keeps the original one
* Question events are not sent if the user is not logged in
* The start time of the question is the stop time of the previous question

## When submitting a question
This is when the user completes a question and submits it.

* A stop question event should be sent for the current question
* Question events are not sent if the user is not logged in


# Common flows

## When rating a resource/question
This is when the user clicks at the emotion icons

* A rate event is should be sent for the current resource/question
* No event is sent for anonymous users


## When navigating back to course map, data, search or profile
This is when the user clicks at the back button

* No events are sent at this point

## When closing the browser
This is when the user closes the browser

* No events are sent at this point


## When losing connectivity
This is when the user lose connectivity

* No events are sent or queued for sending them later
