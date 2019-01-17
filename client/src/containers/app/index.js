import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import {
  Menu,
  Segment,
  Icon
} from 'semantic-ui-react';

import Listings from '../listings'
import AddItem from '../additem'
import Asset from '../asset'

import { initWeb3 } from '../../modules/app'

class App extends Component {
  state = { activeItem: 'home' }

  componentDidMount = async () => {
    var routerPath = this.context.router.route.location.pathname

    if(routerPath === '/') {
      this.setState({ activeItem: 'home' })
    }
    else if(routerPath === '/newlost') {
      this.setState({ activeItem: 'newlost' })
    }

    this.props.initWeb3()
  }

  handleMenuItemClick = (e, { name }) => this.setState({ activeItem: name })

  render() {
    return (
      <div>
        <Router>
          <div>
            <Menu pointing style={{borderWidth: '0px'}} >
              <Menu.Item name='home' as={Link} to={'/'} active={this.state.activeItem === 'home'}  onClick={this.handleMenuItemClick}>
                <Icon name='home' size='large'/>
              </Menu.Item>
          
              <Menu.Item name='newlost' as={Link} to={'/newlost'} active={this.state.activeItem === 'newlost'} onClick={this.handleMenuItemClick}>
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
              <Route exact path={'/newlost'}
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

App.contextTypes = {
  router: PropTypes.object,
  store: PropTypes.object
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
) (App)