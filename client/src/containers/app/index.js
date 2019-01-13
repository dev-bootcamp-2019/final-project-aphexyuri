import React, { Component } from 'react'

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import {
  Menu,
  Segment
} from 'semantic-ui-react';

import Listings from '../listings'
import AddItem from '../additem'

import { initApp } from '../../modules/app'

class App extends Component {
  componentDidMount = async () => {
    this.props.initApp()
  }

  render() {
    return (
      <div>
        <Router>
          <div>
            <Menu>
              <Menu.Item name='listing' as={Link} to={'/'}>
                Listing
              </Menu.Item>
          
              <Menu.Item name='listing' as={Link} to={'/lost'}>
                I lost something
              </Menu.Item>
            </Menu>
            <Segment style={{ padding: '0em 0em' }} vertical>
              <Route exact path='/' component={Listings} />
              <Route path={'/lost'} component={AddItem} />
            </Segment>
          </div>
        </Router>
      </div>
    )
  }
}

const mapStateToProps = state => ({
    // sale: state.sale
})
  
const mapDispatchToProps = dispatch => bindActionCreators({
  initApp
}, dispatch)
  
  
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)