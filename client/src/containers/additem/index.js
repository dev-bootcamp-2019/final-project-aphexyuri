import React, { Component } from 'react'
import { Container, Button, Form } from 'semantic-ui-react'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

var web3 = require('web3');

class AddItem extends Component {
    state = { selectedCountry: null, selectedStateProvince: null, stateProvinceOptions: null }

    // constructor (props) {
    //     super(props)
    // }

    handleTitleFieldChange = e => {
        // console.log('title', e.target.value)
        this.setState({
            title: e.target.value
        })
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

    handleCityFieldChange = e => {
        // console.log('city', e.target.value)
        this.setState({
            city: e.target.value
        })
    }

    handleRewardAmountFieldChange = e => {
        // console.log('rewardAmount', e.target.value)
        this.setState({
            rewardAmount: e.target.value
        })
    }

    handlePostItemClicked = async () => {
        var countryHex = web3.utils.asciiToHex(this.state.selectedCountry)
        // console.log('countryHex', countryHex)

        var stateProvinceHex = web3.utils.asciiToHex(this.state.selectedStateProvince)
        // console.log('stateProvinceHex', stateProvinceHex)

        var cityHex = web3.utils.asciiToHex(this.state.city)
        // console.log('cityHex', cityHex)

        var titleHex = web3.utils.asciiToHex(this.state.title)
        // console.log('titleHex', titleHex)

        await this.props.listingsContract.methods.newLostItem(
            countryHex,
            stateProvinceHex,
            cityHex,
            titleHex).send({
                from: this.props.accounts[0],
                value: web3.utils.toWei(this.state.rewardAmount)
            });
    }

    renderNearestCityField = e => {
        if(this.state.selectedCountry && this.state.selectedStateProvince) {
            return (
                <Form.Field>
                    <label>Nearest City</label>
                    <input placeholder='Nearest City' onChange={this.handleCityFieldChange}/>
                </Form.Field>
            )
        }
    }

    renderRewardAmountField = e => {
        if(this.state.selectedCountry && this.state.selectedStateProvince) {
            return (
                <Form.Field>
                    <label>Reward amount</label>
                    <input placeholder='ETH' onChange={this.handleRewardAmountFieldChange}/>
                </Form.Field>
            )
        }
    }

    renderPostItemField = e => {
        if(this.state.selectedCountry && this.state.selectedStateProvince) {
            return (
                <Button type='submit' onClick={this.handlePostItemClicked}>Post Item</Button>
            )
        }
    }

    render () {
        return (
              <div>
                <Container>
                    <Form>
                        <Form.Field>
                            <label>Title</label>
                            <input placeholder='Short description of item' onChange={this.handleTitleFieldChange}/>
                        </Form.Field>
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
                        { this.renderNearestCityField() }
                        { this.renderRewardAmountField() }
                        { this.renderPostItemField() }
                    </Form>
                </Container>
              </div>
        )
    }
}

const mapStateToProps = state => ({
    countries: state.listings.countries
})

const mapDispatchToProps = dispatch => bindActionCreators({

}, dispatch)

export default connect(
    mapStateToProps,
    mapDispatchToProps
) (AddItem)