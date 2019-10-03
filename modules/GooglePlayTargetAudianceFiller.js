const ph = require('os-puppeteer-helper');
const tools = require('os-tools');

const self = module.exports = {

    fillTargetAudience: async function (page, appDictList, onlyAbove18) {
        for (let i = 6; i < appDictList.length; i++) {
            console.log("--------------------------------------------------------------")
            console.log(i + "/" + (appDictList.length - 1).toString())
            console.log("working on: " + appDictList[i].appName)
            if (onlyAbove18) {
                await fillIndividualAppOnlyAbove18(page, appDictList[i])
            } else {
                await fillIndividualAppBelow18(page, appDictList[i])
            }
        }
        console.log('Done updating ' + (appDictList.length - 1).toString() + ' apps')
    }
};

async function fillIndividualAppOnlyAbove18(page, app) {

    // fix link. Wait 2 seconds until page fully loaded
    let appContentUrl = app.appLink.replace('AppDashboardPlace', 'AppContentCenterPlace')
    await ph.navigateTo(page, appContentUrl, null, "div[role='article']")
    let firstPageExists = await fillTargetAge(page, app.appName, true);
    if (!firstPageExists) {
        return
    }

    // click ok on summary
    try {
        await ph.clickOnElementContainsText(page, 'div', 'Submit', true, false, true, true, 2000)
    } catch (e) {
        await fillAdsPage(page, 'aptForKidsRadioButton', 'No');
        await ph.clickOnElementContainsText(page, 'div', 'Submit', true, false, true, true, 2000)
    }
}

async function fillIndividualAppBelow18(page, app) {

    // fix link. Wait 2 seconds until page fully loaded
    let appContentUrl = app.appLink.replace('AppDashboardPlace', 'AppContentCenterPlace')
    await ph.navigateTo(page, appContentUrl, null, "div[role='article']")
    let firstPageExists = await fillTargetAge(page, app.appName, false);
    if (!firstPageExists) {
        return
    }

    await fillAppDetails(page);
    let processFailed = await fillAdsPage(page, 'adsNetworkRadioButton', 'Yes');
    if (!processFailed) {
        return
    }
    await fillStorePresence(page);

    // click ok on summary
    await ph.clickOnElementContainsText(page, 'div', 'Submit', true, false, true, true, 2000)
}


async function fillTargetAge(page, appName, onlyAbove18) {
    await ph.waitForSelectorWithText(page, 'div', appName)
    let startBtn = await ph.getElementByText(page, 'div', 'Start', true, false, true)
    // let startBtn = await ph.waitForSelectorWithText(page, 'button', 'start', 1000, 4000)
    if (startBtn !== undefined) {
        await ph.clickOnElement(page, startBtn, 3500)
        try {
            await ph.clickOnElementWithAdjacentLabel(page, '18 and over')
            if (!onlyAbove18) {
                await ph.clickOnElementWithAdjacentLabel(page, '16-17')
                await ph.clickOnElementWithAdjacentLabel(page, '13-15')
                await ph.clickOnElementWithAdjacentLabel(page, '9-12')
                await ph.clickOnElementWithAdjacentLabel(page, '6-8')
                await ph.clickOnElementWithAdjacentLabel(page, '5 and under')
            }
        } catch (e) {

        }
        await ph.clickOnSelector(page, "button[aria-label='Next']", 1000)
        try {
            await ph.clickOnElementContainsText(page, 'button', 'OK')
        } catch (e) {
            if (onlyAbove18) {
                return true
            }
            await tools.promptUser('It seems like this app needs special attention. Notify me when you want to skip to the next app (Ok)')
            return false
        }
        return true
    }
    return false
}

async function fillAppDetails(page) {

    await ph.clickOnElementWithAdjacentLabel(page, 'All functionality is available without special access')
    await ph.clickOnElementWithAdjacentLabel(page, 'No')


    let complianceLabel = await ph.getElementByText(page, 'div', ' Legal and regulatory compliance ', true, false, true)
    let complianceLabel2 = await ph.getNextSibling(page, complianceLabel)
    let complianceInput = await ph.getElement(complianceLabel2, 'input')
    await ph.clickOnElement(page, complianceInput)

    await ph.clickOnSelector(page, "button[aria-label='Next']", 1000)
}

async function fillAdsPage(page, radioName, yesOrNo) {
    let radioBtns = await ph.getElements(page, "input[name='" + radioName + "']")
    for (let i = 0; i < radioBtns.length; i++) {
        let radioLabel = await ph.getNextSibling(page, radioBtns[i])
        let radioText = await ph.getInnerHTML(page, radioLabel)
        if (radioText === yesOrNo) {
            try {
                await ph.clickOnElement(page, radioBtns[i])
            } catch (e) {
                await tools.promptUser('It seems like this app needs special attention. Notify me when you want to skip to the next app (Ok)')
                return false

            }
            break
        }
    }
    await ph.clickOnSelector(page, "button[aria-label='Next']", 1000)
    return true
}

async function fillStorePresence(page) {
    await ph.clickOnElementWithAdjacentLabel(page, 'No, I do not want to join Designed for Families')
    await ph.clickOnSelector(page, "button[aria-label='Next']", 1000)
}

/**playLinks =
 {
        "appName": "encouragit! - Diet, Health and Fitness",
        "packageName": "com.osfunapps.dietreddit",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.dietreddit&appid=4973283440227789254"
    },
 {
        "appName": "Mobile Mouse - NOW FREE",
        "packageName": "com.osfunapps.mobilemouse",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.mobilemouse&appid=4973545104964689036"
    },
 {
        "appName": "Mooji",
        "packageName": "com.osapps.hujimooodle",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osapps.hujimooodle&appid=4972828160756933648"
    },
 {
        "appName": "No More Drinking",
        "packageName": "com.osfunapps.noalcoholreddit",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.noalcoholreddit&appid=4974383136071661942"
    },
 {
        "appName": "No More Smoking",
        "packageName": "com.osfunapps.nosmokingreddit",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.nosmokingreddit&appid=4973460127710240315"
    },
 {
        "appName": "Remote Control For Airtel (unofficial)",
        "packageName": "com.osfunapps.RemoteforAirtel",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.RemoteforAirtel&appid=4976242139221486967"
    },
 {
        "appName": "Remote Control For Bouygues Telecom",
        "packageName": "com.osfunapps.remoteforbouyguestelecom",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforbouyguestelecom&appid=4976281919839835939"
    },
 {
        "appName": "Remote Control For BT TV",
        "packageName": "com.osfunapps.remoteforbtvision",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforbtvision&appid=4975038992554816106"
    },
 {
        "appName": "Remote Control For bTV",
        "packageName": "com.osfunapps.remoteforbtv",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforbtv&appid=4972508300919772714"
    },
 {
        "appName": "Remote Control For Cable Onda",
        "packageName": "com.osfunapps.remoteforcableonda",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforcableonda&appid=4975896526401347310"
    },
 {
        "appName": "Remote Control For Cable Vision Mexico",
        "packageName": "com.osfunapps.remoteforcablevisionmexico",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforcablevisionmexico&appid=4975606941710742308"
    },
 {
        "appName": "Remote Control For Catvision",
        "packageName": "com.osfunapps.remoteforcatvision",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforcatvision&appid=4975385349547984833"
    },
 {
        "appName": "Remote Control For Cisco",
        "packageName": "com.osfunapps.remoteforciscoindia",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforciscoindia&appid=4975899702764098177"
    },
 {
        "appName": "Remote Control For Claro Colombia",
        "packageName": "com.osfunapps.remoteforclarocolombia",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforclarocolombia&appid=4972088626378701723"
    },
 {
        "appName": "Remote Control For Claro Honduras",
        "packageName": "com.osfunapps.remoteforclarohonduras",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforclarohonduras&appid=4974521616808800934"
    },
 {
        "appName": "Remote Control For DEN",
        "packageName": "com.osfunapps.dentvremotecontrol",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.dentvremotecontrol&appid=4973636156406359341"
    },
 {
        "appName": "Remote Control For DirectTV Colombia",
        "packageName": "com.osfunapps.remotefordirecttvcolombia",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remotefordirecttvcolombia&appid=4974715400316561199"
    },
 {
        "appName": "Remote Control For DishTV",
        "packageName": "com.osfunapps.DishTVRemote",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.DishTVRemote&appid=4974046447468470993"
    },
 {
        "appName": "Remote Control For DSTV",
        "packageName": "com.osfunapps.remotefordstv",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remotefordstv&appid=4974865200498165428"
    },
 {
        "appName": "Remote Control For DVB",
        "packageName": "com.osfunapps.remoteForDVB",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteForDVB&appid=4972312247053397150"
    },
 {
        "appName": "Remote Control For eir Vision",
        "packageName": "com.osfunapps.remoteforeirvision",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforeirvision&appid=4975066491463013831"
    },
 {
        "appName": "Remote Control For ETB",
        "packageName": "com.osfunapps.remoteforetb",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforetb&appid=4974004501783697090"
    },
 {
        "appName": "Remote Control For FastWay",
        "packageName": "com.osfunapps.remoteForFastWay",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteForFastWay&appid=4973318777148501166"
    },
 {
        "appName": "Remote Control For FetchTV",
        "packageName": "com.osfunapps.RemoteforFetchTV",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.RemoteforFetchTV&appid=4974795242986730679"
    },
 {
        "appName": "Remote Control For Foxtel",
        "packageName": "com.osfunapps.remoteforfoxtel",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforfoxtel&appid=4974509726360364226"
    },
 {
        "appName": "Remote Control For Free",
        "packageName": "com.osfunapps.remoteForFree",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteForFree&appid=4974400503060307287"
    },
 {
        "appName": "Remote Control For GTPL",
        "packageName": "com.osfunapps.remoteforgtpl",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforgtpl&appid=4975684753503493279"
    },
 {
        "appName": "Remote Control For Hathway",
        "packageName": "com.osfunapps.remoteforhathway",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforhathway&appid=4974401780191475988"
    },
 {
        "appName": "Remote Control For Homecast",
        "packageName": "com.osfunapps.remoteforhomecast",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforhomecast&appid=4972650117389970451"
    },
 {
        "appName": "Remote Control For In DIGITAL",
        "packageName": "com.osfunapps.remoteforindigital",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforindigital&appid=4972198673529622801"
    },
 {
        "appName": "Remote Control For izzitv",
        "packageName": "com.osfunapps.remoteforizzitv",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforizzitv&appid=4973621475089202723"
    },
 {
        "appName": "Remote Control For Kogan",
        "packageName": "com.osfunapps.remoteforkogan",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforkogan&appid=4974898948063637048"
    },
 {
        "appName": "Remote Control For KT",
        "packageName": "com.osfunapps.remoteforktolleh",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforktolleh&appid=4975889475464968526"
    },
 {
        "appName": "Remote Control For KT SkyLife",
        "packageName": "com.osfunapps.remoteforskylife",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforskylife&appid=4976029049230754078"
    },
 {
        "appName": "Remote Control For LG Uplus",
        "packageName": "com.osfunapps.remoteforlguplus",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforlguplus&appid=4973173519042981890"
    },
 {
        "appName": "Remote Control For Logic Eastern",
        "packageName": "com.osfunapps.remoteforlogiceastern",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforlogiceastern&appid=4973423781684544403"
    },
 {
        "appName": "Remote Control For Mediaset Premium",
        "packageName": "com.osfunapps.remoteformediasetpremium",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteformediasetpremium&appid=4974850347726053331"
    },
 {
        "appName": "Remote Control For Millicom Tigo",
        "packageName": "com.osfunapps.remotefortigo",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remotefortigo&appid=4975131401775764157"
    },
 {
        "appName": "Remote Control For Movistar",
        "packageName": "com.osfunapps.remoteformoviestar",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteformoviestar&appid=4975001431853650831"
    },
 {
        "appName": "Remote Control For Multi TV",
        "packageName": "com.osfunapps.remoteformultitv",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteformultitv&appid=4975133303676548043"
    },
 {
        "appName": "Remote Control For My TV",
        "packageName": "com.osfunapps.remoteformytv",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteformytv&appid=4973565008297293517"
    },
 {
        "appName": "Remote Control For NC",
        "packageName": "com.osfunapps.remotefornc",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remotefornc&appid=4973946139617820422"
    },
 {
        "appName": "Remote Control For Netvision",
        "packageName": "com.osfunapps.remotefornetvision",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remotefornetvision&appid=4972075728399870835"
    },
 {
        "appName": "Remote Control For NXT DIGITAL",
        "packageName": "com.osfunapps.remotefornxtdigital",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remotefornxtdigital&appid=4976248081824725720"
    },
 {
        "appName": "Remote Control For Orange",
        "packageName": "com.osfunapps.remotefororange",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remotefororange&appid=4976122704742250096"
    },
 {
        "appName": "Remote Control For Ortel",
        "packageName": "com.osfunapps.remoteforortel",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforortel&appid=4975551176652563829"
    },
 {
        "appName": "Remote Control For Panasonic",
        "packageName": "com.osfunapps.remoteforpanasonic",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforpanasonic&appid=4973395891233312381"
    },
 {
        "appName": "Remote Control For Radiant Digitek",
        "packageName": "com.osfunapps.remoteforradiantdigitek",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforradiantdigitek&appid=4974673988209827525"
    },
 {
        "appName": "Remote Control For RCA",
        "packageName": "com.osfunapps.remoteforrca",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforrca&appid=4973422000712029771"
    },
 {
        "appName": "Remote Control For Reliance Digital",
        "packageName": "com.osfunapps.RemoteforRelianceDigital",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.RemoteforRelianceDigital&appid=4973437940158195078"
    },
 {
        "appName": "Remote Control For Samsung",
        "packageName": "com.osfunapps.remoteforsamsung",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforsamsung&appid=4974673305188745363"
    },
 {
        "appName": "Remote Control For Saorview",
        "packageName": "com.osfunapps.remoteforsaorview",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforsaorview&appid=4974916636130394997"
    },
 {
        "appName": "Remote Control For SFR",
        "packageName": "com.osfunapps.remoteForSFR",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteForSFR&appid=4974814759833843736"
    },
 {
        "appName": "Remote Control For Siti Digital",
        "packageName": "com.osfunapps.remoteForSitiDigital",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteForSitiDigital&appid=4973415753268084468"
    },
 {
        "appName": "Remote Control For Sky",
        "packageName": "com.osfunapps.SkyRemoteUK",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.SkyRemoteUK&appid=4975421252043592795"
    },
 {
        "appName": "Remote Control For Sky DE",
        "packageName": "com.osfunapps.SkyDERemote",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.SkyDERemote&appid=4972422036992218059"
    },
 {
        "appName": "Remote Control For Sky Mexico",
        "packageName": "com.osfunapps.RemoteforSkyMexico",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.RemoteforSkyMexico&appid=4973431269556329421"
    },
 {
        "appName": "Remote Control For SOLID",
        "packageName": "com.osfunapps.remoteforsolid",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforsolid&appid=4976107675439145321"
    },
 {
        "appName": "Remote Control For SR Digital",
        "packageName": "com.osfunapps.remoteforsrdigital",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforsrdigital&appid=4975435161433884565"
    },
 {
        "appName": "Remote Control For StarSat",
        "packageName": "com.osfunapps.remoteforstarsat",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforstarsat&appid=4974801029863432374"
    },
 {
        "appName": "Remote Control For StarTimes",
        "packageName": "com.osfunapps.remoteforstartimes",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforstartimes&appid=4973343558707949974"
    },
 {
        "appName": "Remote Control For Sun Direct",
        "packageName": "com.osfunapps.RemoteforSunDirect",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.RemoteforSunDirect&appid=4971979877668576734"
    },
 {
        "appName": "Remote Control For t-broad",
        "packageName": "com.osfunapps.remotefortbroad",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remotefortbroad&appid=4976192534173864758"
    },
 {
        "appName": "Remote Control For TalkTalk",
        "packageName": "com.osfunapps.RemoteforTalkTalkYouView",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.RemoteforTalkTalkYouView&appid=4974192622057098222"
    },
 {
        "appName": "Remote Control For TATA Sky",
        "packageName": "com.osfunapps.remoteforskyindia",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforskyindia&appid=4972856687168120576"
    },
 {
        "appName": "Remote Control For TechniSat",
        "packageName": "com.osfunapps.remotefortechnisat",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remotefortechnisat&appid=4972851960952268503"
    },
 {
        "appName": "Remote Control For Telekom",
        "packageName": "com.osfunapps.remotefortelekomromania",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remotefortelekomromania&appid=4972887789972209856"
    },
 {
        "appName": "Remote Control For Telesystem",
        "packageName": "com.osfunapps.remotefortelesystem",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remotefortelesystem&appid=4972743605529590938"
    },
 {
        "appName": "Remote Control For Televiziune digi",
        "packageName": "com.osfunapps.remotefordigi",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remotefordigi&appid=4975499829044299246"
    },
 {
        "appName": "Remote Control For Telstra",
        "packageName": "com.osfunapps.remotefortelstra",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remotefortelstra&appid=4972430952364367523"
    },
 {
        "appName": "Remote Control For Tigo Colombia",
        "packageName": "com.osfunapps.remotefortigoune",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remotefortigoune&appid=4973715745472369661"
    },
 {
        "appName": "Remote Control For Toshiba",
        "packageName": "com.osfunapps.remotefortoshiba",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remotefortoshiba&appid=4975671786587215291"
    },
 {
        "appName": "Remote Control For Total Play",
        "packageName": "com.osfunapps.remotefortotalplay",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remotefortotalplay&appid=4975577919091380458"
    },
 {
        "appName": "Remote Control For TRENDTV",
        "packageName": "com.osfunapps.remotefortrendtv",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remotefortrendtv&appid=4972704529068580153"
    },
 {
        "appName": "Remote Control For Unitymedia KabelBW",
        "packageName": "com.osfunapps.RemoteforUnitymedia",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.RemoteforUnitymedia&appid=4973201826853953369"
    },
 {
        "appName": "Remote Control For Vectra Networks",
        "packageName": "com.osfunapps.remoteforvectra",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforvectra&appid=4974415883882395020"
    },
 {
        "appName": "Remote Control For Viasat",
        "packageName": "com.osfunapps.remoteforviasatnigeria",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforviasatnigeria&appid=4972794493559716223"
    },
 {
        "appName": "Remote Control For Viasat Ukraine",
        "packageName": "com.osfunapps.remoteforviasatukrain",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforviasatukrain&appid=4976153691123431870"
    },
 {
        "appName": "Remote Control For Videocon d2h",
        "packageName": "com.osfunapps.Remoteforvidecondth",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.Remoteforvidecondth&appid=4972155861868230124"
    },
 {
        "appName": "Remote Control For Virgin",
        "packageName": "com.osfunapps.remoteforvirgin",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforvirgin&appid=4972238866568238236"
    },
 {
        "appName": "Remote Control For Vizio",
        "packageName": "com.osfunapps.remoteforvizio",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforvizio&appid=4972578743507260359"
    },
 {
        "appName": "Remote Control For Vodafone Kabel",
        "packageName": "com.osfunapps.RemoteforKabelDeutschland",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.RemoteforKabelDeutschland&appid=4976063075515420586"
    },
 {
        "appName": "Remote Control For Volia",
        "packageName": "com.osfunapps.remoteforvolia",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforvolia&appid=4974417857148937760"
    },
 {
        "appName": "Remote Control For WIND Telecom",
        "packageName": "com.osfunapps.remoteforwindtelecom",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforwindtelecom&appid=4972887029789836055"
    },
 {
        "appName": "Remote Control For Wintal",
        "packageName": "com.osfunapps.remoteforwintal",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforwintal&appid=4973392028594426112"
    },
 {
        "appName": "Remote Control For Zenga",
        "packageName": "com.osfunapps.remoteforzenga",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.remoteforzenga&appid=4975109849805718729"
    },
 {
        "appName": "Remote Control For Zgemma",
        "packageName": "com.osfunapps.RemoteforZgemma",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.RemoteforZgemma&appid=4973982495955036972"
    },
 {
        "appName": "מתוזמנת",
        "packageName": "com.osfunapps.schedulesms",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osfunapps.schedulesms&appid=4975791777429415581"
    },
 {
        "appName": "שלט להוט",
        "packageName": "com.osapps.hotremote",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osapps.hotremote&appid=4975241554859540834"
    },
 {
        "appName": "שלט למזגן",
        "packageName": "com.osapps.airremote",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osapps.airremote&appid=4974005302889708941"
    },
 {
        "appName": "שלט למזגן אלקטרה",
        "packageName": "com.shabat.electraremotee",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#SuspendedAppPlace:p=com.shabat.electraremotee&appid=4975992760294749361"
    },
 {
        "appName": "שלט לעידן +",
        "packageName": "com.osapps.idanremote",
        "appLink": "https://play.google.com/apps/publish/?account=5954486049666324780#AppDashboardPlace:p=com.osapps.idanremote&appid=4975508463197946607"
    }

 **/