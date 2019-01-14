import React, { Component } from 'react'
import { Container, Button, Form, Image } from 'semantic-ui-react'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import classNames from 'classnames'
import Dropzone from 'react-dropzone'

import Ipfs from 'ipfs'

var lafConstants = require('../../LAFConstants.js')

const clearState = {
  title: '',
  description: '',
  selectedCountry: null,
  selectedStateProvince: null,
  city: null,
  stateProvinceOptions: null,
  rewardAmount: null,
  imagePreview: null,
  imageBuffer: null
}

class AddItem extends Component {
  state = clearState

  constructor (props) {
      super(props)
      // console.log('AddItem constructor', this.props)
  }

  // componentDidUpdate = async () => {
  //   console.log('AddItem componentDidUpdate', this.props)
  // }

  setClearedState = () => {}

  handleTitleFieldChange = e => {
    // console.log('title', e.target.value)
    this.setState({
      title: e.target.value
    })
  }

  handleDescriptionFieldChange = e => {
    this.setState({
      description: e.target.value
    })
  }

  handleCountrySelectionChange = (event, data) => {
    this.setState({ selectedCountry: data.value })

    for (let country of lafConstants.countries) {
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

    var stateProvinceHex = this.props.app.web3.utils.asciiToHex(this.state.selectedStateProvince)

    var cityHex = this.props.app.web3.utils.asciiToHex(this.state.city)

    let ipfs = new Ipfs()
    
    let content = ipfs.types.Buffer.from('ABC');
    let results = await ipfs.files.add(content);
    let hash = results[0].hash; // "Qm...WW"

    console.log(hash)

    // ipfs.files.add(this.state.imageBuffer, (error, result) => {
    //   if(error) {
    //     console.log('error', error)
    //     return
    //   }
    //   console.log(result[0].hash)
    // })

    // console.log('from', this.props.app.accounts[0])
    // console.log('amount', this.props.app.web3.utils.toWei(this.state.rewardAmount))

    // try {
    //   let newLostAssetResponse = await this.props.app.registryContract.methods.newLostAsset(
    //     this.state.title,
    //     this.state.description,
    //     countryHex,
    //     stateProvinceHex,
    //     cityHex
    //   ).send({
    //     from: this.props.app.accounts[0],
    //     value: this.props.app.web3.utils.toWei(this.state.rewardAmount)
    //   });

    //   // TODO feedback that item has been added + clear UI
    // }
    // catch(e) {
    //   console.log('newLostAsset Error', e)
    //   // TODO feedback of error
    // }

    this.setState(clearState)    
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

  onDrop = (acceptedFiles, rejectedFiles) => {
    console.log('acceptedFiles', acceptedFiles)
    console.log('rejectedFiles', rejectedFiles)

    if(acceptedFiles.length > 1) {
      // TODO user feedback, jsut one file allowed
      return
    }

    acceptedFiles.forEach(file => {
      const url = URL.createObjectURL(file)
      this.setState({ imagePreview: url })

      const reader = new FileReader()
      // reader.onloadend = () => {}
      reader.onload = () => {
        const fileAsBinaryString = reader.result;
        console.log('file loaded')
        this.setState({ imageBuffer: Buffer(fileAsBinaryString) })
      };
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');

      reader.readAsBinaryString(file);
      console.log(reader)
    })
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
            <Form.Field>
              <label>Description</label>
              <input placeholder='Descrption of item' value={this.state.description} onChange={this.handleDescriptionFieldChange}/>
            </Form.Field>
            <Form.Select fluid
              value= {this.state.selectedCountry}
              label='Country'
              options={lafConstants.countries}
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
            
          </Form>

          <Dropzone accept="image/jpeg, image/png" onDrop={this.onDrop}>
            {({getRootProps, getInputProps, isDragActive}) => {
              return (
                <div {...getRootProps()} className={classNames('dropzone', {'dropzone--isActive': isDragActive})}>
                  <input {...getInputProps()} />
                  {
                    isDragActive ?
                      <p>Drop files here...</p> :
                      <p>Try dropping some files here, or click to select files to upload.</p>
                  }
                </div>
              )
            }}
          </Dropzone>

          <Image src={this.state.imagePreview} size='small' />

          { this.renderPostItemField() }
        </Container>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  app: state.app
})

const mapDispatchToProps = dispatch => bindActionCreators({

}, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps
) (AddItem)