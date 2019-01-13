import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { Card, Icon } from 'semantic-ui-react'

class ListingItem extends Component {
    render () {
        var stateProvince = this.props.web3.utils.hexToUtf8(this.props.item.returnValues.stateProvince)
        var city = this.props.web3.utils.hexToUtf8(this.props.item.returnValues.city)

        // console.log('title', title)

        var location = this.props.web3.utils.hexToUtf8(this.props.item.returnValues.isoCountryCode) +
            ', ' +
            this.props.web3.utils.hexToUtf8(this.props.item.returnValues.stateProvince) +
            ', ' +
            this.props.web3.utils.hexToUtf8(this.props.item.returnValues.city)

        return (
            <Card>
                <Card.Content>
                    <Card.Header>{ this.props.web3.utils.hexToUtf8(this.props.item.returnValues.title) }</Card.Header>
                    <Card.Meta>{ location }</Card.Meta>
                    <Card.Content extra>
                        <Icon name='ethereum' />
                        { this.props.web3.utils.fromWei(this.props.item.returnValues.reward, 'ether') } ETH
                    </Card.Content>
                </Card.Content>
            </Card>
        )
    }
}

ListingItem.propTypes = {
    item: PropTypes.object.isRequired
}

export default ListingItem