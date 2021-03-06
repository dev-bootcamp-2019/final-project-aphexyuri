import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';

import {
  Segment,
  Container,
  Button,
  Form,
  Image,
  Header,
  Icon,
  TextArea,
  Modal
} from 'semantic-ui-react'

import classNames from 'classnames'
import Dropzone from 'react-dropzone'

import {
  clearAddItemTxtHash,
  addItem,
  getItem,
  getItemMetadata
} from '../../modules/items'

import {
  ETHERSCAN_TX_BASE_URL
} from '../../LAFConstants'

var ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient('ipfs.infura.io', '5001', { protocol: 'https' })
var multihash = require('../../utils/multihash')
var lafConstants = require('../../LAFConstants.js')
var that

const clearState = {
  title: '',
  details: '',
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

  handleDetailsFieldChange = e => {
    this.setState({
      details: e.target.value
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
    return (
      <Form.Field required>
        <label>Nearest City/Landmark</label>
        <input placeholder='City or Landmark' onChange={this.handleCityFieldChange}/>
      </Form.Field>
    )
  }

  renderRewardAmountField = e => {
    return (
      <Form.Field required>
        <label>Reward amount</label>
        <input placeholder='Amount of ETH' onChange={this.handleRewardAmountFieldChange}/>
      </Form.Field>
    )
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

  renderSubmitBtn = e => {
    if(this.state.selectedCountry &&
      this.state.selectedStateProvince &&
      this.state.city &&
      this.state.rewardAmount &&
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
    //TODO valdiate form fields

    this.props.addItem(
      this.state.title,
      this.state.details,
      this.state.selectedCountry,
      this.state.selectedStateProvince,
      this.state.city,
      this.state.ipfsDigest,
      this.state.ipfsHashFunction,
      this.state.ipfsSize,
      this.state.rewardAmount)
  }

  modalCloseClicked = () => {
    this.props.clearAddItemTxtHash()
    this.setState(clearState)
  }

  gotoItemListingClicked = () => {
    this.props.clearAddItemTxtHash()
    this.setState(clearState)

    let itemId = this.props.items.addItemTxResult.events.ItemStored.returnValues.itemId

    this.props.getItem(itemId)
    this.props.getItemMetadata(itemId)

    this.props.notifyAppOfNavChange('items')
    this.props.history.push('items/' + itemId)
  }

  renderTxModal = () => {

    if(this.props.items.addItemTxHash || this.props.items.addItemTxResult) {
      return (
        <Modal dimmer='blurring' open={ this.props.items.addItemTxHash != null } onClose={this.modalCloseClicked} closeIcon closeOnDimmerClick={false}>
          <Modal.Content>
            <Segment vertical textAlign='center' style={{ padding: '1em 1em' }} >
              {
                this.props.items.addItemTxResult ?
                  <Container>
                    <p style={{ fontSize: '1.75em', marginTop: '0em', marginBottom: '1em' }}>
                      Transaction complete
                    </p>

                    <p style={{ fontSize: '1em', marginTop: '1em', marginBottom: '0em' }}>
                      Would you like to view the item listing now?    
                    </p>
                  </Container>
                :
                  <div>
                    <Container>
                      <p style={{ fontSize: '1.75em', marginTop: '0em', marginBottom: '1em' }}>
                          Item transaction pending...
                      </p>

                      <p style={{ fontSize: '1em', marginTop: '1em', marginBottom: '2em' }}>
                        The transaction needs to be verified on the blockchain before your item will be available in the registry. This may take a number of minutes, depending on Ethereum network load &amp; congestion.
                      </p>
                    </Container>
                    <Container>
                        <Header as='h4' style={{ fontSize: '1em' }}>View transaction on Etherscan:</Header>
                        <a style={{ fontSize: '0.9em' }} href={ETHERSCAN_TX_BASE_URL + this.props.items.addItemTxHash} target='_blank'>{ this.props.items.addItemTxHash }</a>
                    </Container>
                  </div>
              }
            </Segment>
          </Modal.Content>
          
          {
            this.props.items.addItemTxResult ?
              <Modal.Actions>
                <Button color='black' onClick={this.modalCloseClicked}>
                  No
                </Button>
                <Button positive onClick={this.gotoItemListingClicked}>
                  Yes
                </Button>
              </Modal.Actions>
            : null
          }
        </Modal>
      )
    }
  }

  render () {
    return (
      <div>
        <Container>
          <Header as='h2'>Submit details about your lost item</Header>
          <Form>
            <Form.Field required>
              <label>Title</label>
              <input placeholder='Title of item' value={this.state.title} onChange={this.handleTitleFieldChange}/>
            </Form.Field>
            <Form.Field required>
              <label>Details</label>
              <TextArea autoHeight rows={2}
                placeholder='Details about item and where, how when it got lost' value={this.state.details} onChange={this.handleDetailsFieldChange} />
            </Form.Field>
            <Form.Group widths='equal' required>
              <Form.Select fluid required
                value= {this.state.selectedCountry}
                label='Country'
                options={lafConstants.countries}
                placeholder='Country'
                onChange={this.handleCountrySelectionChange} />
              
              {
                this.state.stateProvinceOptions ?
                  <Form.Select fluid required
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

        { this.renderTxModal() }
      </div>
    )
  }
}

AddItem.contextTypes = {
  notifyAppOfNavChange: PropTypes.func
}

const mapStateToProps = state => ({
  app: state.app,
  items: state.items
})

const mapDispatchToProps = dispatch => bindActionCreators({
  clearAddItemTxtHash,
  addItem,
  getItem,
  getItemMetadata
}, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps
) (AddItem)