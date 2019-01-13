export const LISTINGS_RETRIEVED = 'listings/LISTINGS_RETRIEVED'

const initialState = {
    listings: null,
    listingsRetrieved: false,
    countries: [
        // { key: 'AUS', text: 'Australia', value: 'AUS' },
        { key: 'CAN', text: 'Canada', value: 'CAN', stateprovince: [
            { key: 'AB', text: 'Alberta', value: 'AB' },
            { key: 'BC', text: 'British Columbia', value: 'BC' },
            { key: 'MB', text: 'Manitoba', value: 'MB' },
            { key: 'NLLD', text: 'Newfoundland and Labrador', value: 'NLLD' },
            { key: 'NB', text: 'New Brunswick', value: 'NB' },
            { key: 'NWT', text: 'Northwest Territories', value: 'NWT' },
            { key: 'NS', text: 'Nova Scotia', value: 'NS' },
            { key: 'NU', text: 'Nunavut', value: 'NU' },
            { key: 'ON', text: 'Ontario', value: 'ON' },
            { key: 'PEI', text: 'Prince Edward Island', value: 'PEI' },
            { key: 'QC', text: 'Quebec', value: 'QC' },
            { key: 'SK', text: 'Saskatchewan', value: 'SK' },
            { key: 'YK', text: 'Yukon', value: 'YK'}
        ] },
        // { key: 'FRA', text: 'France', value: 'FRA' },
        // { key: 'DEU', text: 'Germany', value: 'DEU' },
        // { key: 'NZL', text: 'New Zealand', value: 'NZL' },
        // { key: 'GBR', text: 'United Kingdom', value: 'GBR' },
        { key: 'USA', text: 'United States of America', value: 'USA', stateprovince: [
            { key: 'AL', text: 'Alabama', value: 'AL' },
            { key: 'AK', text: 'Alaska', value: 'AK' },
            { key: 'AZ', text: 'Arizona', value: 'AZ' },
            { key: 'AR', text: 'Arkansas', value: 'AR' },
            { key: 'CA', text: 'California', value: 'CA' },
            { key: 'CO', text: 'Colorado', value: 'CO' },
            { key: 'CT', text: 'Connecticut', value: 'CT' },
            { key: 'DE', text: 'Delaware', value: 'DE' },
            { key: 'FL', text: 'Florida', value: 'FL' },
            { key: 'GA', text: 'Georgia', value: 'GA' },
            { key: 'HI', text: 'Hawaii', value: 'HI' },
            { key: 'ID', text: 'Idaho', value: 'ID' },
            { key: 'IL', text: 'Illinois', value: 'IL' },
            { key: 'IN', text: 'Indiana', value: 'IN' },
            { key: 'IA', text: 'Iowa', value: 'IA' },
            { key: 'KS', text: 'Kansas', value: 'KS' },
            { key: 'KY', text: 'Kentucky', value: 'KY' },
            { key: 'LA', text: 'Louisiana', value: 'LA' },
            { key: 'ME', text: 'Maine', value: 'ME' },
            { key: 'MD', text: 'Maryland', value: 'MD' },
            { key: 'MA', text: 'Massachusetts', value: 'MA' },
            { key: 'MI', text: 'Michigan', value: 'MI' },
            { key: 'MN', text: 'Minnesota', value: 'MN' },
            { key: 'MS', text: 'Mississippi', value: 'MS' },
            { key: 'MO', text: 'Missouri', value: 'MO' },
            { key: 'MT', text: 'Montana', value: 'MT' },
            { key: 'NE', text: 'Nebraska', value: 'NE' },
            { key: 'NV', text: 'Nevada', value: 'NV' },
            { key: 'NH', text: 'New Hampshire', value: 'NH' },
            { key: 'NJ', text: 'New Jersey', value: 'NJ' },
            { key: 'NM', text: 'New Mexico', value: 'NM' },
            { key: 'NY', text: 'New York', value: 'NY' },
            { key: 'NC', text: 'North Carolina', value: 'NC' },
            { key: 'ND', text: 'North Dakota', value: 'ND' },
            { key: 'OH', text: 'Ohio', value: 'OH' },
            { key: 'OK', text: 'Oklahoma', value: 'OK' },
            { key: 'OR', text: 'Oregon', value: 'OR' },
            { key: 'PA', text: 'Pennsylvania', value: 'PA' },
            { key: 'RI', text: 'Rhode Island', value: 'RI' },
            { key: 'SC', text: 'South Carolina', value: 'SC' },
            { key: 'SD', text: 'South Dakota', value: 'SD' },
            { key: 'TN', text: 'Tennessee', value: 'TN' },
            { key: 'TX', text: 'Texas', value: 'TX' },
            { key: 'UT', text: 'Utah', value: 'UT' },
            { key: 'VT', text: 'Vermont', value: 'VT' },
            { key: 'VA', text: 'Virginia', value: 'VA' },
            { key: 'WA', text: 'Washington', value: 'WA' },
            { key: 'WV', text: 'West Virginia', value: 'WV' },
            { key: 'WI', text: 'Wisconsin', value: 'WI' },
            { key: 'WY', text: 'Wyoming', value: 'WY' }
        ] }
    ]
  }

export const getListingsPastEvents = (web3, listingsContract, country, stateProvince) => {
    // console.log('listings.getListingsPastEvents for', country + ' ' + stateProvince);

    var getEventsOptions = {
        fromBlock: 0, //TODO should this be narrowed down?
        toBlock: 'latest'
    }

    if(country || stateProvince) {
        var filter = {}

        if(country) {
            var hexCountry = web3.utils.padRight(web3.utils.asciiToHex(country), 16)
            // console.log('hexCountry', hexCountry)
            filter.isoCountryCode = hexCountry
        }

        if(stateProvince) {
            var hexStateProvice = web3.utils.padRight(web3.utils.asciiToHex(stateProvince), 16)
            // console.log('hexStateProvice', hexStateProvice)
            filter.stateProvince = hexStateProvice
        }

        getEventsOptions.filter = filter
    }

    console.log('getEventsOptions', getEventsOptions)

    return function action(dispatch) {
        listingsContract.getPastEvents('ItemStored', getEventsOptions)
        .then(function(listings){
            console.log('retrieved past events', listings)
            dispatch({
                type: LISTINGS_RETRIEVED,
                listings: listings
            })
        })
    }
}

export default (state = initialState, action) => {
    switch (action.type) {
        case LISTINGS_RETRIEVED:
            console.log('getListingsPastEvents handler', action)
            return {
                ...state,
                listings: action.listings,
                listingsRetrieved: true
            }

        default:
            return state
    }
}