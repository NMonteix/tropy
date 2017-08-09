'use strict'

const START = performance.now()

{
  const decode = decodeURIComponent
  const hash = window.location.hash.slice(1)

  global.ARGS = JSON.parse(decode(hash))
  process.env.NODE_ENV = ARGS.environment
}

const { join } = require('path')
const LOGDIR = join(ARGS.home, 'log')

const { verbose } = require('./common/log')(LOGDIR)
const { ready } = require('./dom')
const { win } = require('./window')

ready.then(() => {
  const READY = performance.now()

  win.init(() => {
    requestIdleCallback(() => {
      win.show()
      win.emit('init')
    }, { timeout: 200 })

    const DONE = performance.now()

    verbose('%s ready after %dms (%dms)', win.type,
      (DONE - START).toFixed(3),
      (DONE - READY).toFixed(3))
  })
})


if (ARGS.dev) {
  if (process.platform !== 'linux') {
    const { remote } = require('electron')

    Object.defineProperties(process, {
      stdout: { value: remote.process.stdout },
      stderr: { value: remote.process.stderr }
    })
  }

} else {
  global.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {}
}
