import React, { Component } from 'react'
import { Container, Button, Form, Image } from 'semantic-ui-react'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

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

  onDrop = async (acceptedFiles, rejectedFiles) => {
    console.log('acceptedFiles', acceptedFiles)
    console.log('rejectedFiles', rejectedFiles)

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

    console.log('adding file to ipfs')

    this.setState({ipfsFileProgress: 10})  

    // --- ipfs addReadableStream ---
    const stream = ipfs.addReadableStream({progress: this.ipfsProgress})
    stream.on('data', function (data) {
      console.log(`Added hash: ${data.hash}`)

      let multihashObj = multihash.getBytes32FromMultihash(data.hash)

      that.setState({
        ipfsHash: data.hash,
        ipfsDigest: multihashObj.digest,
        ipfsHashFunction: multihashObj.hashFunction,
        ipfsSize: multihashObj.size,
      })
    })
    // TODO handle stream error

    stream.write(buffer)
    stream.end()
  }

  ipfsProgress = (progress) => {
    console.log('IPFS upload progress', progress)
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

          <Dropzone
            accept="image/jpeg, image/png"
            onDrop={this.onDrop}>
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
          
          {
            this.state.ipfsHash ? <Image src={'https://gateway.ipfs.io/ipfs/' + this.state.ipfsHash} size='small' /> : null
          }
          {/* https://gateway.ipfs.io/ipfs/QmRFYwD1sna2Tqzq45yq5UccjYkDBVN9NYNBxrPXKmKjNv */}
          {/* https://gateway.ipfs.io/ipfs/QmaSwvR434nGXrTtQShkypBHYkEn5xp9VHB6ycURYwpm8A */}

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