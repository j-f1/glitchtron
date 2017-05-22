const { openExternal } = require('electron').shell
const $ = require('jquery')
const NProgress = require('nprogress')

const $page = $('webview')
const page = $page[0]
const query = require('qs').parse(window.location.search.slice(1))
$('.loading').css('background-color', query.bg)
$('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', query.fontCSS))

require('electron').ipcRenderer.on('update-preview', () => {
  page.reload()
})

$page.attr('partition', 'persist:preview-' + query.project.id)
$page.attr('src', query.src)
$('.url').text(query.src)
$page.on('dom-ready', updateButtons)
$page.one('dom-ready', () => $page.css('background', 'white'))
$page.on('page-title-updated', ({ originalEvent: { title } }) => {
  $('.title').text(title)
})
$page.on('page-favicon-updated', ({ originalEvent: { favicons: [ icon ] } }) => {
  $('.favicon').attr('src', icon)
})
$page.one('load-commit', () => {
  page.getWebContents().on('will-navigate', (e, url) => {
    if (!url.startsWith(query.src)) {
      e.preventDefault()
      process.nextTick(() => page.stop())
      openExternal(url)
    }
  })
})
$page.on('load-commit', ({ originalEvent: { url } }) => {
  $('.url').text(url)
  updateButtons()
})
$page.on('update-target-url', ({ originalEvent: { url } }) => {
  $('.href').toggleClass('hide', !url)
  if (url) {
    $('.href').text(url)
  }
})

$page.on('did-start-loading', NProgress.start)
$page.on('did-stop-loading', NProgress.done)

$('.back').click(() => {
  page.goBack()
})
$('.reload').click(() => {
  page.reload()
})
$('.forward').click(() => {
  page.goForward()
})
$('.title-wrap').click(() => {
  openExternal(page.getURL())
})
function updateButtons () {
  $('.back').toggleClass('disabled', !page.canGoBack())
  $('.forward').toggleClass('disabled', !page.canGoForward())
}
