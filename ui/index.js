// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const path = require('path')
const fs = require('mz/fs')
const { BrowserWindow } = require('electron').remote
const { openExternal } = require('electron').shell

ready(() => {
  fs.readFile(path.join(__dirname, 'overrides.css'), 'utf8').then(contents => {
    const style = document.createElement('style')
    style.textContent = contents
    document.head.appendChild(style)
  })
})
window.addEventListener('load', init)

function init () {
  if (typeof window.$ !== 'function') {
    setTimeout(init, 100)
    return
  }
  const { $, application } = global
  const logButton = $('.activity-log-button')
  const consoleButton = logButton.clone()
  consoleButton
    .removeClass('activity-log-button')
    .addClass('console-button')
  consoleButton
    .find('.label')
    .text('Console')
  consoleButton
    .find('.status')
    .remove()
  consoleButton.click(() => {
    // source: https://support.glitch.com/t/testing-and-cmd/1215/2?u=j-f
    if (logButton.hasClass('active')) {
      logButton.click()
    }
    consoleButton.toggleClass('active')
    toggleConsole(consoleButton.hasClass('active'))
  })
  consoleButton.appendTo('.debug-buttons')
  logButton.click(e => {
    if ($(e.currentTarget).hasClass('active') && consoleButton.hasClass('active')) {
      consoleButton.removeClass('active')
      toggleConsole(false)
    }
  })

  $('#project-link').click(e => {
    e.preventDefault()
    openExternal($('#project-link').attr('href'))
  })
  $('a[target=_blank]').click(e => {
    e.preventDefault()
    openExternal(e.currentTarget.href)
  })
  $('.about-pop .last-section').append('<small style="display: inline-block; position: relative; top: 0.45em;"><a href="https://electron.atom.io">Electron</a> app built by <a href="https://github.com/j-f1">Jed Fox</a></small>')

  application.preview = () => {
    // from Glitch
    var preview, project
    const bg = '#335FFC'

    if (!preview || preview.closed) {
      preview = global.previewWindow = new BrowserWindow({
        titleBarStyle: 'hidden-inset'
      })
      window.addEventListener('beforeunload', () => preview && preview.close())
    }

    project = application.currentProject()

    if (preview != null) {
      const query = {
        bg,
        src: project.publishedUrl(),
        project: project.I,
        fontCSS: [].filter.call(document.querySelectorAll('link[rel=stylesheet]'), ({ href }) => href.startsWith('https://cloud.webtype.com'))[0].href
      }
      preview.loadURL(`file://${__dirname}/preview/index.html?${require('qs').stringify(query)}`)
    }
  }
  application.updatePreview = () => {
    if (application.refreshPreviewOnChanges() && global.previewWindow) {
      global.previewWindow.webContents.send('update-preview')
    }
  }
}

function ready (fn) {
  // from http://youmightnotneedjquery.com/#ready
  // jQuery isn’t available when this script runs,
  // so use this instead.
  if (document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

function toggleConsole (show) {
  const $ = window.$
  var existingConsole = $('.custom-console')
  if (existingConsole.length === 0) {
    var consoleDiv = $('<div class="custom-console" style="overflow: hidden;">')
    var url = `https://api.${window.location.host}/${window.application.currentProject().name()}/console/${window.application.currentUser().persistentToken()}/`
    consoleDiv[0].innerHTML = `<iframe src="${url}" style="width: 100%; height: 100%; border: none" />`
    $('#activity-log').after(consoleDiv)
  }
  existingConsole.toggle(show)
}
