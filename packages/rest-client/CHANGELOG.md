# Change log

# 0.0.1

Initial release 

 @types/express  ^4.17.21 →  ^5.0.3
 nock            ^13.5.6" →  ^14.0.5

## 0.0.1-alpha.11

Revert prefixing node standard library imports with “node:” because cypress is unhappy with them.

## 0.0.1-alpha.10

Make `RestClient` non-abstract so that it can be instantiated directly in applications.
Instantiate `SanitisedError` class directly instead of using it purely as a type interface.

## 0.0.1-alpha.9

Improve JSDoc for `RestClient` to document the throwing of `SanitisedError` by default.

## 0.0.1-alpha.8

Rename `SanitisedError` status property to `responseStatus` and provide examples for use and document.
Also export `AuthOptions`.

## 0.0.1-alpha.7

Add in `errorLogger` parameter to streaming to override default logger behaviour.

## 0.0.1-alpha.6

Switch stream method to read the `response.body` instead of `response.text`. This is to allow clients to stream
compressed responses as `response.text` is `null` in those circumstances.

## 0.0.1-alpha.5

Fix to export AgentConfig class

## 0.0.1-alpha.4

Initial pre-release for testing with HMPPS projects.

## 0.0.1-alpha.1 to 0.0.1-alpha.3

Pre-releases which should not be used in projects.
