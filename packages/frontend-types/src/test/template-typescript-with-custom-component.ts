/**
 * Projects using ministryofjustice/hmpps-template-typescript can create their own components using govuk-frontend
 */

import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'

govukFrontend.initAll()
mojFrontend.initAll()

class MyPrintLink extends govukFrontend.Component<HTMLAnchorElement> {
  static moduleName = 'my-print-link'

  static elementType = HTMLAnchorElement

  constructor(root: HTMLAnchorElement) {
    super(root)

    root.addEventListener('click', event => {
      event.preventDefault()
      window.print()
    })
  }
}

govukFrontend.createAll(MyPrintLink)
