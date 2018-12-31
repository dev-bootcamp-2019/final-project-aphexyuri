import React, { Component } from 'react'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { Container, Header, Form, Button, Icon } from 'semantic-ui-react'

import ListingItem from './listingItem.js'

import {
    getListingsPastEvents
} from '../../modules/listings'

class Listings extends Component {
    state = { selectedCountry: null, selectedStateProvince: null, stateProvinceOptions: null }

    // constructor(props) {
    //     super(props)
    // }

    componentDidMount () {
        if(this.props.listingsContract) {
            // console.log('Listings componentsDidMount')
            // this.props.getListingsPastEvents(this.props.web3, this.props.listingsContract)
        }
    }

    renderEntry = item => {
        return (
            // title
            <ListingItem
                web3={this.props.web3}
                key={item.id}
                item={item}/>
        )
    }

    handleCountrySelectionChange = (event, data) => {
        this.setState({ selectedCountry: data.value })

        for (let country of this.props.countries) {
            if(country.value == data.value) {
                this.setState({stateProvinceOptions: country.stateprovince})
                break
            }
        }
    }

    handleStateProvinceSelectionChange = (event, data) => {
        this.setState({ selectedStateProvince: data.value })
    }

    handleFindItemsClicked = () => {
        this.props.getListingsPastEvents(
            this.props.web3,
            this.props.listingsContract,
            this.state.selectedCountry,
            this.state.selectedStateProvince)
    }

    handleFindAllItemsClicked = () => {
        this.props.getListingsPastEvents(
            this.props.web3,
            this.props.listingsContract)
    }

    render () {
        return (
            <div>
                <Container>
                    <Header as='h3'>Search Lost & Found Items near you</Header>

                    <Form>
                        <Form.Group widths='equal'>
                            <Form.Select fluid
                                label='Country'
                                options={this.props.countries}
                                placeholder='Country'
                                onChange={this.handleCountrySelectionChange} />
                            {
                                this.state.stateProvinceOptions ?
                                    <Form.Select fluid
                                        label='State/Province'
                                        options={this.state.stateProvinceOptions}
                                        placeholder='State/Province'
                                        onChange={this.handleStateProvinceSelectionChange} />
                                : null
                            }
                        </Form.Group>

                        <Button positive
                            size='huge'
                            color='black'
                            onClick={this.handleFindItemsClicked}
                            disabled={!this.state.selectedCountry || !this.state.selectedStateProvince} >
                            <Icon name='search' />
                            Filter Items
                        </Button>

                        <Button basic
                            size='huge'
                            color='black'
                            onClick={this.handleFindAllItemsClicked} >
                            Find All
                        </Button>
                    </Form>
                    {
                        this.props.listings ?
                            this.props.listings.map(this.renderEntry)
                        : null
                    }
                </Container>
            </div>
        )
      }
}

const mapStateToProps = state => ({
    countries: state.listings.countries,
    listings: state.listings.listings,
    listingsRetrieved: state.listings.listingsRetrieved,
    countries: state.listings.countries
  })

const mapDispatchToProps = dispatch => bindActionCreators({
    getListingsPastEvents
  }, dispatch)

export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(Listings)
