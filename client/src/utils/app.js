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