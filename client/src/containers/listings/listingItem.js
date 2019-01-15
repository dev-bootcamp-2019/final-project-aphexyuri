import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';

import { Card, Icon, Button } from 'semantic-ui-react'

class ListingItem extends Component {
  handleItemSelect = (evt) => {
    this.props.itemSelectHandler(this.props.item.returnValues.assetId)
  }
  render () {
    // console.log(this.props.item)
    
    var isoCountryCode = this.props.app.web3.utils.hexToAscii(this.props.item.returnValues.isoCountryCode)
    var stateProvince = this.props.app.web3.utils.hexToAscii(this.props.item.returnValues.stateProvince)
    var city = this.props.app.web3.utils.hexToAscii(this.props.item.returnValues.city)

    var location = isoCountryCode + ', ' + stateProvince + ', ' + city

    return (
      <Card>
        <Card.Content>
          <Card.Header>{ this.props.item.returnValues.title }</Card.Header>
          <Card.Meta>{ location }</Card.Meta>
          <Card.Content extra>
            <Icon name='ethereum' />
            { this.props.app.web3.utils.fromWei(this.props.item.returnValues.reward, 'ether') } ETH
            <Button basic color='green' floated='right' size='mini' onClick={ this.handleItemSelect }>
              See more
            </Button>
          </Card.Content>
        </Card.Content>
      </Card>
    )
  }
}

ListingItem.propTypes = {
  item: PropTypes.object.isRequired,
  itemSelectHandler: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  app: state.app
})
  
const mapDispatchToProps = dispatch => bindActionCreators({

}, dispatch)
  
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ListingItem)