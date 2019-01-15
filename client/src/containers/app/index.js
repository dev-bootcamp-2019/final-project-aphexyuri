import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import {
  Menu,
  Segment
} from 'semantic-ui-react';

import Listings from '../listings'
import AddItem from '../additem'
import Asset from '../asset'

import { initWeb3 } from '../../modules/app'

class App extends Component {
  componentDidMount = async () => {
    // console.log('App componentDidMount', this.props)
    this.props.initWeb3()
  }

  // componentDidUpdate = async () => {
  //   console.log('App componentDidUpdate', this.props) 
  // }

  render() {
    return (
      <div>
        <Router>
          <div>
            <Menu>
              <Menu.Item name='listing' as={Link} to={'/'}>
                Lost & Found Stuff
              </Menu.Item>
          
              <Menu.Item name='listing' as={Link} to={'/lost'}>
                I lost something
              </Menu.Item>
            </Menu>
            <Segment style={{ padding: '0em 0em' }} vertical loading={ this.props.app.web3 == null }>
              <Route exact path='/'
                render={ (props) =>
                  <Listings
                    {...props}/>
                }
              />
              <Route exact path={'/lost'}
                render={ (props) => 
                  <AddItem
                    {...props}/>    
                }
              />

              <Route exact path={'/listings/:id'} component={Asset} />
            </Segment>
          </div>
        </Router>
      </div>
    )
  }
}

const mapStateToProps = state => ({
    app: state.app
})
  
const mapDispatchToProps = dispatch => bindActionCreators({
  initWeb3
}, dispatch)
  
  
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)