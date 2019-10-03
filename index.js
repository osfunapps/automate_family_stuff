const ph = require('os-puppeteer-helper');
const lg = require('os-android-google-play-links-grabber');
const af = require('./modules/GooglePlayTargetAudianceFiller');

ONLY_ABOVE_18 = true
const self = module.exports = {};

async function init() {
    let pEles = await ph.createBrowser()
    let page = pEles[1]
    let playLinks = await lg.grabGooglePlayLinks(page)
    await af.fillTargetAudience(page, playLinks, ONLY_ABOVE_18)
    await ph.close(pEles[0])
}

init()