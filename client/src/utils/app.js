var lafConstants = require('../LAFConstants.js')

export const AssetStatus = {
    None: 0,
    Posted: 1,
    PotentialMatch: 2,
    MatchConfirmed: 3,
    Recovered: 4,
    Cancelled: 5
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