'use babel'

/* @flow */

import { CompositeDisposable } from 'atom'
import LinterUI from './main'
import type Intentions from './intentions'

module.exports = {
  activate() {
    if (atom.inSpecMode()) {
      require('atom-package-deps').install('linter-ui-default')
    }
    this.ui = new LinterUI()
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(this.ui)
  },
  deactivate() {
    this.subscriptions.dispose()
  },
  provideUI(): LinterUI {
    return this.ui
  },
  provideIntentions(): Intentions {
    return this.ui.intentions
  },
  consumeSignal(registry: Object) {
    this.ui.signal.attach(registry)
  }
}
