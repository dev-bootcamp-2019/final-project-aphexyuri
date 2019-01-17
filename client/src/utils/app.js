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