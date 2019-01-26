import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import {
  Button
} from 'semantic-ui-react'

class Admin extends Component {
  componentDidUpdate() {
    console.log('this.props.app.storageContract.options.address', this.props.app.storageContract.options.address)
    console.log('this.props.app.registryContract.options.address', this.props.app.registryContract.options.address)
  }

  addAllowedSenderClicked = () => {
    this.props.app.storageContract.methods.addAllowedSender(this.props.app.registryContract.options.address).send({ from: this.props.app.accounts[0] })
    .then((result) => {
      console.log(result)
    })
  }

  setItemStorageAddressClicked = () => {
    this.props.app.storageContract.methods.setItemStorageAddress(this.props.app.storageContract.options.address).send({ from: this.props.app.accounts[0] })
    .then((result) => {
      console.log(result)
    })
  }

  render () {
    if(this.props.app.storageContract && this.props.app.registryContract) {
      return (
        <div>
          <p>storageContract address: { this.props.app.storageContract.options.address }</p>
          <p>registryContract address: { this.props.app.registryContract.options.address }</p>
          {
            this.props.app.storageContract ?
              <Button fluid positive type='submit' onClick={this.addAllowedSenderClicked}>1. storage.addAllowedSender</Button>
            : null
          }
          <br/>
          {
            this.props.app.registryContract ?
              <Button fluid positive type='submit' onClick={this.addAllowedSenderClicked}>2. registry.setItemStorageAddress</Button>
            : null
          }
        </div>
      )
    }
    else {
      return (
        <div>
          Waiting...
        </div>
      )
    }
    
  }
}

Admin.contextTypes = {
    
  }
  
  const mapStateToProps = state => ({
    app: state.app
  })
  
  const mapDispatchToProps = dispatch => bindActionCreators({

  }, dispatch)
  
  export default connect(
    mapStateToProps,
    mapDispatchToProps
  ) (Admin)