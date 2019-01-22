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
} from 'semantic-ui-react'

import Loadable from 'react-loadable';

import { initWeb3 } from '../../modules/app'

import {
  getMyLAFs,
  getClaimableRewards
} from '../../modules/listings'

const Loading = () => <Segment style={{ padding: '4em 0em' }} vertical loading/>;

const Listings = Loadable({
  loader: () => import('../listings'),
  loading: Loading
})

const AddItem = Loadable({
  loader: () => import('../additem'),
  loading: Loading
})

const Asset = Loadable({
  loader: () => import('../asset'),
  loading: Loading
})

const MyLAF = Loadable({
  loader: () => import('../mylaf'),
  loading: Loading
})

class App extends Component {
  state = { activeItem: 'home' }

  // componentDidUpdate() {
  //   var routerPath = this.context.router.route.location.pathname
  //   console.log('app componentDidUpdate, routerPath', routerPath)
  // }

  componentDidMount = async () => {
    var routerPath = this.context.router.route.location.pathname

    if(routerPath === '/') {
      this.setState({ activeItem: 'home' })
    }
    else if(routerPath === '/newlost') {
      this.setState({ activeItem: 'newlost' })
    }
    else if(routerPath === '/mylaf') {
      this.setState({ activeItem: 'mylaf' })
    }

    this.props.initWeb3()
  }

  notifyAppOfNavChange = (navTarget) => {
    // TODO better way to manage nav
    this.setState({ activeItem: 'home' })
  }

  handleMenuItemClick = (e, { name }) => {
    this.setState({ activeItem: name })

    if(name === 'mylaf') {
      this.props.getMyLAFs()
      this.props.getClaimableRewards()
    }
  }

  render() {
    return (
      <div>
        <Router>
          <div>
            <Menu fixed='top' inverted pointing style={{borderWidth: '0px'}} >
              <Menu.Item name='home' as={Link} to={'/'} active={this.state.activeItem === 'home'}  onClick={this.handleMenuItemClick}>
                <Icon name='home' size='large'/>
              </Menu.Item>
          
              <Menu.Item name='newlost' as={Link} to={'/newlost'} active={this.state.activeItem === 'newlost'} onClick={this.handleMenuItemClick}>
                I lost something
              </Menu.Item>

              <Menu.Menu position='right' style={{paddingBottom: '0em'}}>
                <Menu.Item name='mylaf' as={Link} to={'/mylaf'} active={this.state.activeItem === 'mylaf'} onClick={this.handleMenuItemClick}>
                  My LAF
                </Menu.Item>
              </Menu.Menu>
            </Menu>

            <Segment style={{ padding: '0em 0em', paddingTop: '5em' }} vertical loading={ this.props.app.web3 == null }>
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
              <Route exact path={'/mylaf'}
                render={ (props) => 
                  <MyLAF
                    {...props }
                      notifyAppOfNavChange={this.notifyAppOfNavChange}/>    
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
  initWeb3,
  getMyLAFs,
  getClaimableRewards
}, dispatch)
  
  
export default connect(
  mapStateToProps,
  mapDispatchToProps
) (App)