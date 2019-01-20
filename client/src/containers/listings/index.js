import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';

import {
  Container,
  Segment,
  Header,
  Form,
  Button,
  Icon,
  Grid
} from 'semantic-ui-react'

import Loadable from 'react-loadable';

import {
  getAssetStoredEvents,
  getAsset,
  getAssetMetadata
} from '../../modules/listings'

const Loading = () => <Segment style={{ padding: '4em 0em' }} vertical loading/>;

const ListingItem = Loadable({
  loader: () => import('./listingItem'),
  loading: Loading
})

var lafConstants = require('../../LAFConstants.js')

class Listings extends Component {
  state = {
    selectedCountry: null,
    selectedStateProvince: null,
    stateProvinceOptions: null,
    initialAssetType: null }

  // constructor(props) {
  //     super(props)
  // }

  // componentDidMount () {
  //   if(this.props.listingsContract) {
  //     console.log('Listings componentsDidMount')
  //     this.props.getListingsPastEvents(this.props.web3, this.props.listingsContract)
  //   }
  // }

  renderEntry = item => {
    return (
      <ListingItem
        key={item.id}
        item={item}
        itemSelectHandler={this.handleItemSelect}/>
    )
  }

  handleCountrySelectionChange = (event, data) => {
    this.setState({ selectedCountry: data.value })

    for (let country of lafConstants.countries) {
      if(country.value === data.value) {
        this.setState({stateProvinceOptions: country.stateprovince})
        break
      }
    }
  }

  handleStateProvinceSelectionChange = (event, data) => {
    this.setState({ selectedStateProvince: data.value })
  }

  handleFindItemsClicked = () => {
    this.props.getAssetStoredEvents(
      this.state.selectedCountry,
      this.state.selectedStateProvince,
      this.state.initialAssetType)
  }

  handleFindAllItemsClicked = () => {
    this.setState({
      selectedCountry: null,
      selectedStateProvince: null,
      stateProvinceOptions: null
    })

    this.props.getAssetStoredEvents()
  }

  handleItemSelect = (assetId) => {
    this.props.getAsset(assetId)
    this.props.getAssetMetadata(assetId)
    this.props.history.push('listings/' + assetId)
  }

  render () {
    return (
      <div>
        <Container>
          <Header as='h2'>Find Lost & Found Stuff near you</Header>
          <Segment basic textAlign='center'>
            <Form style={{ paddingBottom: '0.5em' }}>
              <Form.Group widths='equal'>
                <Form.Select fluid
                  value= {this.state.selectedCountry}
                  // label='Country'
                  options={lafConstants.countries}
                  placeholder='Country'
                  onChange={this.handleCountrySelectionChange} />
                {
                  this.state.stateProvinceOptions ?
                    <Form.Select fluid
                      // label='State/Province'
                      options={this.state.stateProvinceOptions}
                      placeholder='State/Province'
                      onChange={this.handleStateProvinceSelectionChange} />
                  : null
                }
              </Form.Group>

              <Button positive
                color='black'
                onClick={this.handleFindItemsClicked}
                disabled={!this.state.selectedCountry} >
                <Icon name='search' />
                Gind by Geo
              </Button>
            </Form>
              
            <Button basic compact
              size='mini'
              onClick={this.handleFindAllItemsClicked} >
              Find All
            </Button>
          </Segment>

          <Container textAlign='left' style={{ paddingTop: '2em', paddingBottom: '1em'}}>
            {
              this.props.assetStoredEvents ?
                // <Card.Group>
                <Grid>
                  { this.props.assetStoredEvents.map(this.renderEntry) }
                </Grid>
                // </Card.Group>
              : null
            }
          </Container>
        </Container>
      </div>
    )
  }
}

Listings.contextTypes = {
  store: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  app: state.app,
  assetStoredEvents: state.listings.assetStoredEvents,
  assetStoredEventsRetrieved: state.listings.assetStoredEventsRetrieved
})

const mapDispatchToProps = dispatch => bindActionCreators({
  getAssetStoredEvents,
  getAsset,
  getAssetMetadata
}, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps
) (Listings)
