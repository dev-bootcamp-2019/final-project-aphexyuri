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
  getItemStoredEvents,
} from '../../modules/listings'

import {
  getItem,
  getItemMetadata
} from '../../modules/items'

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
    initialItemType: null }

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
        item={item.returnValues}
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
    this.props.getItemStoredEvents(
      this.state.selectedCountry,
      this.state.selectedStateProvince,
      this.state.initialItemType)
  }

  handleFindAllItemsClicked = () => {
    this.setState({
      selectedCountry: null,
      selectedStateProvince: null,
      stateProvinceOptions: null
    })

    this.props.getItemStoredEvents()
  }

  handleItemSelect = (itemId) => {
    this.props.getItem(itemId)
    this.props.getItemMetadata(itemId)
    this.props.history.push('items/' + itemId)
  }

  render () {
    return (
      <div>
        <Container>
          <Header as='h2'>Find Lost Stuff near you</Header>
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
                Find by Geo
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
              this.props.itemStoredEvents ?
                <Grid>
                  { this.props.itemStoredEvents.map(this.renderEntry) }
                </Grid>
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
  itemStoredEvents: state.listings.itemStoredEvents,
  itemStoredEventsRetrieved: state.listings.itemStoredEventsRetrieved
})

const mapDispatchToProps = dispatch => bindActionCreators({
  getItemStoredEvents,
  getItem,
  getItemMetadata
}, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps
) (Listings)
