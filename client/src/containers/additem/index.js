import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import {
  Segment,
  Container,
  Button,
  Form,
  Image,
  Header,
  Icon,
  TextArea
} from 'semantic-ui-react'

import classNames from 'classnames'
import Dropzone from 'react-dropzone'

// import getBytes32FromMultihash from '../../utils/multihash'

var ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient('ipfs.infura.io', '5001', { protocol: 'https' })

var multihash = require('../../utils/multihash')
var lafConstants = require('../../LAFConstants.js')
var that

const clearState = {
  title: '',
  description: '',
  selectedCountry: null,
  selectedStateProvince: null,
  city: null,
  stateProvinceOptions: null,
  rewardAmount: null,
  ipfsUploadInProgress: false,
  ipfsHash: null,
  ipfsDigest: null,
  ipfsHashFunction: null,
  ipfsSize: null
}

class AddItem extends Component {
  state = clearState

  constructor (props) {
      super(props)
      that = this
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

  handleDescriptionFieldChange = e => {
    this.setState({
      description: e.target.value
    })
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

  renderNearestCityField = e => {
    if(this.state.selectedCountry && this.state.selectedStateProvince) {
      return (
        <Form.Field>
          <label>Nearest City/Landmark</label>
          <input placeholder='City or Landmark' onChange={this.handleCityFieldChange}/>
        </Form.Field>
      )
    }
  }

  renderRewardAmountField = e => {
    if(this.state.selectedCountry && this.state.selectedStateProvince) {
      return (
        <Form.Field>
          <label>Reward amount</label>
          <input placeholder='Amount of ETH' onChange={this.handleRewardAmountFieldChange}/>
        </Form.Field>
      )
    }
  }

  renderDropZoneStatusSegment = (isDragActive) => {
    if(this.state.ipfsHash) {
      return (
        <Segment placeholder loading={ this.state.ipfsUploadInProgress }>
          {
            isDragActive ?
              <Header icon>
                <div>
                  <Icon name='check' />
                  Drop file here
                </div>
              </Header>
            :
              <Image rounded centered src={ 'https://gateway.ipfs.io/ipfs/' + this.state.ipfsHash } size='medium' />
          }
        </Segment>
      )
    }
    else {
      return (
        <Segment placeholder
          loading={ this.state.ipfsUploadInProgress }>
          <Header icon>
            {
              isDragActive ?
                <div>
                  <Icon name='check' />
                  Drop file here
                </div>
              :
              <div>
                <Icon name='add' />
                Drag file here 
                <p>or Click to browse</p>
                <p>(image files only)</p>
              </div>
            }
          </Header>
        </Segment>
      )
    }
  }

  renderDropZone = e => {
    if(this.state.selectedCountry && this.state.selectedStateProvince) {
      return (
        <Dropzone
          accept="image/jpeg, image/png"
          onDrop={this.onDrop}>
          {
            ({ getRootProps, getInputProps, isDragActive }) => {
              return (
                <div { ...getRootProps() } className={ classNames('dropzone', { 'dropzone--isActive': isDragActive }) }>
                  <input { ...getInputProps() } />
                  { this.renderDropZoneStatusSegment(isDragActive) }
                </div>
              )
            }
          }
        </Dropzone>
      )
    }
  }

  renderSubmitBtn = e => {
    if(this.state.selectedCountry &&
      this.state.selectedStateProvince &&
      this.state.ipfsDigest &&
      this.state.ipfsHashFunction &&
      this.state.ipfsSize) {
      return (
        <Button fluid positive type='submit' onClick={this.handlePostItemClicked}>Submit</Button>
      )
    }
  }

  onDrop = async (acceptedFiles, rejectedFiles) => {
    // console.log('acceptedFiles', acceptedFiles)
    // console.log('rejectedFiles', rejectedFiles)

    if(acceptedFiles.length > 1) {
      // TODO user feedback, just one file allowed
      return
    }

    acceptedFiles.forEach(file => {
      let reader = new window.FileReader()
      reader.onloadend = () => this.saveToIpfs(reader)
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.readAsArrayBuffer(file)

      // TODO handle file reading errors
    })
  }

  saveToIpfs = (reader) => {
    const buffer = Buffer.from(reader.result)

    // console.log('adding file to ipfs')

    this.setState({
      // ipfsFileProgress: 10,
      ipfsUploadInProgress: true
    })  

    // --- ipfs addReadableStream ---
    const stream = ipfs.addReadableStream({progress: this.ipfsProgress})
    stream.on('data', function (data) {
      // console.log(`Added hash: ${data.hash}`)

      let multihashObj = multihash.getBytes32FromMultihash(data.hash)

      that.setState({
        ipfsHash: data.hash,
        ipfsDigest: multihashObj.digest,
        ipfsHashFunction: multihashObj.hashFunction,
        ipfsSize: multihashObj.size,
        ipfsUploadInProgress: false
      })
    })
    // TODO handle stream error

    stream.write(buffer)
    stream.end()
  }

  ipfsProgress = (progress) => {
    // console.log('IPFS upload progress', progress)
  }

  handlePostItemClicked = async () => {
    let titleHex = this.state.title
    let countryHex = this.props.app.web3.utils.asciiToHex(this.state.selectedCountry)
    let stateProvinceHex = this.props.app.web3.utils.asciiToHex(this.state.selectedStateProvince)
    let cityHex = this.props.app.web3.utils.asciiToHex(this.state.city)

    try {
      await this.props.app.registryContract.methods.newLostAsset(
        titleHex,
        this.state.description,
        countryHex,
        stateProvinceHex,
        cityHex,
        this.state.ipfsDigest,
        this.state.ipfsHashFunction,
        this.state.ipfsSize
      ).send({
        from: this.props.app.accounts[0],
        value: this.props.app.web3.utils.toWei(this.state.rewardAmount)
      });

      this.setState(clearState)
      // TODO feedback that item has been added + clear UI
    }
    catch(e) {
      console.log('newLostAsset Error', e)
      // TODO feedback of error
    }
  }

  render () {
    return (
      <div>
        <Container>
          <Form>
            <Form.Field>
              <label>Title</label>
              <input placeholder='Title of item' value={this.state.title} onChange={this.handleTitleFieldChange}/>
            </Form.Field>
            <Form.Field>
              <label>Description</label>
              <TextArea autoHeight rows={1}
                placeholder='Descrption of item' value={this.state.description} onChange={this.handleDescriptionFieldChange} />
            </Form.Field>
            <Form.Group widths='equal'>
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
            </Form.Group>
            
            { this.renderNearestCityField() }
            { this.renderRewardAmountField() }
            { this.renderDropZone() }

            <br/>

            { this.renderSubmitBtn() }
            
          </Form>
          
          {/* https://gateway.ipfs.io/ipfs/QmRFYwD1sna2Tqzq45yq5UccjYkDBVN9NYNBxrPXKmKjNv */}
          {/* https://gateway.ipfs.io/ipfs/QmaSwvR434nGXrTtQShkypBHYkEn5xp9VHB6ycURYwpm8A */}

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