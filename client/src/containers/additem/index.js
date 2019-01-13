import React, { Component } from 'react'
import { Container, Button, Form } from 'semantic-ui-react'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { addLostAsset } from '../../modules/registry'

class AddItem extends Component {
  state = {
    title: '',
    selectedCountry: null,
    selectedStateProvince: null,
    city: null,
    stateProvinceOptions: null,
    rewardAmount: null
  }

  constructor (props) {
      super(props)
      // console.log('AddItem constructor', this.props)
  }

  // componentDidUpdate = async () => {
  //   console.log('AddItem componentDidUpdate', this.props)
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
    var countryHex = this.props.app.web3.utils.asciiToHex(this.state.selectedCountry)
    // console.log('countryHex', countryHex)

    var stateProvinceHex = this.props.app.web3.utils.asciiToHex(this.state.selectedStateProvince)
    // console.log('stateProvinceHex', stateProvinceHex)

    var cityHex = this.props.app.web3.utils.asciiToHex(this.state.city)
    // console.log('cityHex', cityHex)

    // console.log('from', this.props.app.accounts[0])
    // console.log('amount', this.props.app.web3.utils.toWei(this.state.rewardAmount))

    try{
      let newLostAssetResponse = await this.props.app.registryContract.methods.newLostAsset(
        this.state.title,
        countryHex,
        stateProvinceHex,
        cityHex
      ).send({
        from: this.props.app.accounts[0],
        value: this.props.app.web3.utils.toWei(this.state.rewardAmount)
      });

      // TODO feedback that item has been added + clear UI
    }
    catch(e) {
      console.log('newLostAsset Error', e)
      // TODO feedback of error
    }

    this.setState({
      title: '',
      selectedCountry: null,
      selectedStateProvince: null,
      city: null,
      stateProvinceOptions: null,
      rewardAmount: null
    })    
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
          <Form ref='form'>
            <Form.Field>
              <label>Title</label>
              <input placeholder='Title of item' value={this.state.title} onChange={this.handleTitleFieldChange}/>
            </Form.Field>
            <Form.Select fluid
              value= {this.state.selectedCountry}
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
  app: state.app,
  countries: state.listings.countries,
})

const mapDispatchToProps = dispatch => bindActionCreators({
  addLostAsset
}, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps
) (AddItem)