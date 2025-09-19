# Change log

## 0.0.2

No functional change - testing trusted publishing

## 0.0.1

Initial release 

 @types/express  ^4.17.21 →  ^5.0.3
 nock            ^13.5.6" →  ^14.0.5


## 0.0.1-beta.2

Fix issue with script to rename reference to retries to attempts in cypress test to represent new structure

## 0.0.1-beta.1

Inital beta

## 0.0.1-alpha.6

There was an issue with the new healthPath key not actually being used

This fixes that and ensures we have test coverage
Add a log message at start up to notify of health check registration
Adding a script to make it easier to apply the plugin

This will be more successful with applications that have not evolved away from the template project
Updating docs

## 0.0.1-alpha.4

Prepare for another testing release

Changes include:

- Version bump
- Making logger mandatory - was a bit too easy to not include
- Endpoint component
  * Log message when receiving a non-successful response code and add tests
  * Tweak config to allow mapping from api declaration in config.ts
  * Expose options type to allow 3rd parties to reference it.
- Type checking tests - adding a step to build to ensure types are consistent across tests and production code
- Adding initial draft of a README
- Rename components arg -> healthComponents

## 0.0.1-alpha.3

Changes include:

* Version bump
* Making logger mandatory - was a bit too easy to not include
* Endpoint component
  * Log message when receiving a non-successful response code and add tests
  * Tweak config to allow mapping from api declaration in config.ts
  * Expose options type to allow 3rd parties to reference it.

## 0.0.1-alpha.2

Pre-release which should not be used in projects.

- Adding additional details via /info.
- Making productId mandatory - this should be populated for all services

## 0.0.1-alpha.1

Pre-release which should not be used in projects.
