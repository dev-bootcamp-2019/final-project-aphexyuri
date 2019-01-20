import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Blockies from 'react-blockies';

import {
  Container,
  Label
} from 'semantic-ui-react'

class MyLAF extends Component {
  render () {
    if(this.props.app.accounts) {
      console.log(this.props.app.accounts[0])
      return (
        <div>
          <Container text textAlign='center' style={{ paddingTop: '4em', paddingBottom: '1em'}}>
            <Blockies
              seed={this.props.app.accounts[0]} 
              size={10}
              scale={15}/>
          </Container>

          <Container text textAlign='center'>
            <Label circular size='big'>
              { this.props.app.accounts[0] }
            </Label>
          </Container>
        </div>
      )
    }
    else {
      return (<div></div>)
    }
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
) (MyLAF)