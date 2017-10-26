const puppeteer = require('puppeteer')
const devices = require('puppeteer/DeviceDescriptors')
const { sleep, genScriptContent, log } = require('./util/utils')

class Skeleton {
  constructor(options = {}) {
    this.options = options
    this.browser = null
    this.page = null
  }

  closeBrowser() {
    this.browser.close()
  }

  async _init() {
    if (this.browser && this.page) {
      return this.page
    }
    const { device, headless } = this.options
    const browser = await puppeteer.launch({ headless })
    const page = await browser.newPage()
    await page.emulate(devices[device])
    this.browser = browser
    this.page = page
    return this.page
  }

  async _makeSkeleton() {
    const { defer, remove, excludes, hide } = this.options
    const content = await genScriptContent()
    // `./util/headlessClient.js` 文件插入到 page 中
    await this.page.addScriptTag({ content })
    await sleep(defer)
    const html = await this.page.evaluate(async (remove, excludes, hide) => {
      return getOutHtml(remove, excludes, hide)
    }, remove, excludes, hide)
    return { html }
  }

  async genHtml(url) {
    await this._init()
    await this.page.goto(url)
    return await this._makeSkeleton()
  }

  async genScreenShot(url) {
    const { screenShot } = this.options
    await this._init()
    await this.page.goto(url)
    await this._makeSkeleton()

    const screenShotBuffer = await this.page.screenshot(screenShot)

    return { screenShotBuffer }
  }
}

module.exports = Skeleton
