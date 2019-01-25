import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';

import {
  Segment,
  Container,
  Header,
  Form,
  Message,
  TextArea,
  Icon,
  Image,
  Button
} from 'semantic-ui-react'

import classNames from 'classnames'
import Dropzone from 'react-dropzone'

import {
  foundLostItem
} from '../../modules/items'

var ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient('ipfs.infura.io', '5001', { protocol: 'https' })
var multihash = require('../../utils/multihash')
var that

const clearState = {
  minimized: true,
  title: '',
  details: '',
  ipfsDigest: null,
  ipfsHashFunction: null,
  ipfsSize: null
}

class MatcherUI extends Component {
  state = clearState

  constructor (props) {
    super(props)
    that = this
}

  handleDetailsFieldChange = e => {
    this.setState({
      details: e.target.value
    })
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
    const stream = ipfs.addReadableStream()
    stream.on('data', function (data) {
      console.log(`Added hash: ${data.hash}`)

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

  handlePostItemClicked = async () => {
    this.props.foundLostItem(
      this.props.itemId,
      this.state.details,
      this.state.ipfsDigest,
      this.state.ipfsHashFunction,
      this.state.ipfsSize)
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

  render () {
    return (
      <Container textAlign='right' style={{ paddingTop: '1em'}}>
        <Message attached warning
          header='Have you found this?'
          content='Submit a picture and details as proof' />
        <Form className='attached fluid segment'>
          <Form.Field>
            <TextArea autoHeight
              rows={2}
              placeholder='Details of item and where, when, how it was found'
              value={this.state.details}
              onChange={this.handleDetailsFieldChange} />
          </Form.Field>
          { this.renderDropZone() }

          {
            this.state.details !== '' && this.state.ipfsDigest ?
              <Button fluid positive type='submit' onClick={this.handlePostItemClicked}>Submit</Button>
            : null
          }
        </Form>
      </Container>
    )
  }
}

MatcherUI.contextTypes = {
  itemId: PropTypes.number
}

const mapStateToProps = state => ({
  app: state.app,
  listings: state.listings
})

const mapDispatchToProps = dispatch => bindActionCreators({
  foundLostItem
}, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps
) (MatcherUI)