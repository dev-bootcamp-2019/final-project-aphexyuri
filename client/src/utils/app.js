var lafConstants = require('../LAFConstants.js')

export const AssetStatus = {
    Posted: 0,
    PotentialMatch: 1,
    MatchConfirmed: 2,
    Recovered: 3,
    Cancelled: 4
}

const assetStatusEnumMapping = [
    'Not found',
    'Potential Match',
    'Match Confirmed',
    'Recovered',
    'Cancelled'
]

export function assetStatusToString(status) {
    return assetStatusEnumMapping[status]
}

export function longLocationString(country, stateProvince) {
    for(let i = 0; i < lafConstants.countries.length; i++) {
        if(lafConstants.countries[i].value === country) {
            for(let j = 0; j < lafConstants.countries[i].stateprovince.length; j++) {
                if(lafConstants.countries[i].stateprovince[j].value === stateProvince) {
                    return [lafConstants.countries[i].text, lafConstants.countries[i].stateprovince[j].text]
                }
            }
        }
    }
}