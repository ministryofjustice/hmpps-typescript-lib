# @ministryofjustice/frontend-types

Provides typescript definitions as ambient modules for these client-side libraries/components:

- [GOV.UK frontend](https://design-system.service.gov.uk)
- [MoJ frontend](https://design-patterns.service.justice.gov.uk)
- [Accessible Autocomplete](https://github.com/alphagov/accessible-autocomplete)

## Status

**This library is currently: ready to trial.**
Teams are welcome to trial this library. Please provide feedback via slack to the `#typescript` channel.

## Usage

Usage is best demonstrated by the [HMPPS typescript template](https://github.com/ministryofjustice/hmpps-template-typescript).
Note the `tsconfig.json` in the /assets/js folder, particularly the `lib` and `typeRoots` properties.

```typescript
import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'

govukFrontend.initAll()
mojFrontend.initAll()

class MyPrintButton extends govukFrontend.Component {
  static moduleName = 'my-print-btn'

  constructor(root: HTMLElement) {
    super(root)
    root.addEventListener('click', event => {
      event.preventDefault()
      window.print()
    })
  }
}

govukFrontend.createAll(MyPrintLink)
```

```html
<a href="#" data-module="my-print-link">Print</a>
```

## Developing this package

Type definitions in the `src/@types` folder must be ambient typescript modules. All of these are concatenated into
one file during build; sources and tests are not included.

When adding or updating type defitions, the target version or version ranges should be updated
in the `peerDependencies` property in package.json. These peer dependencies should be marked as optional so that
client projects aren’t required to install them.

The `devDependencies` property should contain a precise version
(which is compatible with the peer dependency version ranges) so that this package can be tested in isolation.
