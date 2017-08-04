const fetch = require('node-fetch'),
    cheerio = require('cheerio'),
    moment = require('moment')

const config = {
    DBUrl1: 'https://reiseauskunft.bahn.de/bin/query.exe/dn?revia=yes&existOptimizePrice=1&country=DEU&dbkanal_007=L01_S01_D001_KIN0001_qf-bahn-svb-kl2_lz03&start=1&REQ0JourneyStopsS0A=1&S=M%C3%BCnchen+Ost&REQ0JourneyStopsSID=A%3D1%40O%3DM%C3%BCnchen+Hbf%40X%3D11558338%40Y%3D48140228%40U%3D80%40L%3D008000261%40B%3D1%40p%3D1320260835%40&Z=Rosenheim&REQ0JourneyStopsZID=',
    //+ '&date=Mi%2C+31.05.17&time=12%3A34'
    DBUrl2: '&timesel=depart&returnDate=&returnTime=&returnTimesel=depart&optimize=0&auskunft_travelers_number=1&tariffTravellerType.1=E&tariffTravellerReductionClass.1=0&tariffClass=2&rtMode=DB-HYBRID&externRequest=yes&HWAI=JS%21js%3Dyes%21ajax%3Dyes%21'
    //DBUrl: 'https://reiseauskunft.bahn.de/bin/query.exe/dn?ld=15058&protocol=https:&seqnr=1&ident=hd.01626358.1496227303&rt=1&rememberSortType=minDeparture&REQ0HafasScrollDir=2'
}

function generateDateAndTimeString(date) {
    var dd = date.date(),
        mm = date.month() + 1,
        yy = date.year() - 2000,
        hh = date.hour(),
        ii = date.minute(),
        result = '&date=Mi%2C+'

    ii = ii < 10 ? '0' + ii : ii
    hh = hh < 10 ? '0' + hh : hh
    dd = dd < 10 ? '0' + dd : dd
    mm = mm < 10 ? '0' + mm : mm

    result += dd + '.' + mm + '.' + yy + '&time=' + hh + '%3A' + ii
    return result
}

function getDate(offsetInMinutes) {
    let today = new Date()
    let date = moment(today).add(offsetInMinutes, 'm');
    return generateDateAndTimeString(date)
}

function clean(input) {
    return input.replace('\n', '')
}


function parseSiteResponse(body) {
    let $ = cheerio.load(body)
    let result = $('td[class=time]')
    let delays = []
    let ontime = []

    for (let i = 0; i < result.length; i++) {
        let hasCorrectParent = result[i].parent.attribs.class.indexOf('firstrow') > -1;
        if (result.length > 1 && hasCorrectParent && result[i].children.length > 1) {
            let delay = result[i].children[1].children[0]

            if (delay.data != '+0') {
                // We have a dalay!
                delays.push({ departure: clean(result[i].children[0].data), delay: delay.data })
            } else {
                ontime.push({ departure: clean(result[i].children[0].data), delay: 'None' })
            }
        }
    }

    console.log('DELAYS')
    console.log(delays)
    console.log('ONTIME')
    console.log(ontime)


}

let url = config.DBUrl1 + getDate(0) + config.DBUrl2
fetch(url)
    .then(res => res.text())
    .then(parseSiteResponse)


