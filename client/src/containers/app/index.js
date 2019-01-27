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
  Icon,
  Popup,
  Grid
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

const Item = Loadable({
  loader: () => import('../item'),
  loading: Loading
})

const MyLAF = Loadable({
  loader: () => import('../mylaf'),
  loading: Loading
})

const Admin = Loadable({
  loader: () => import('../admin'),
  loading: Loading
})

class App extends Component {
  state = { activeItem: 'home' }

  // componentDidUpdate() {
  //   if(this.props.app.web3) {
  //     console.log(this.props.app.web3.currentProvider) //.publicConfigStore.on('update', callback);

  //     web3.currentProvider.publicConfigStore.on('update', callback);
  //   }
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
    let accountPopupText = 'Waiting for active account'
    let shortAccount = ''
    if(this.props.app.accounts && this.props.app.accounts[0]) {
      accountPopupText = this.props.app.accounts[0]
      shortAccount = accountPopupText.substr(0, 6) + '...' + accountPopupText.substr(accountPopupText.length - 4, accountPopupText.length - 1)
    }
    return (
      <div>
        <Router>
          <div>
            <Menu fixed='top' inverted pointing style={{borderWidth: '0px'}} >
              <Menu.Item name='home' as={Link} to={'/'} active={this.state.activeItem === 'home'}  onClick={this.handleMenuItemClick}>
                <Icon name='home' size='large'/>
              </Menu.Item>
          
              <Menu.Item name='newlost' as={Link} to={'/newlost'} active={this.state.activeItem === 'newlost'} onClick={this.handleMenuItemClick}>
                I Lost Something
              </Menu.Item>

              <Menu.Menu position='right'>
                <Popup
                  trigger={
                    <Menu.Item name='mylaf' as={Link} to={'/mylaf'} active={this.state.activeItem === 'mylaf'} onClick={this.handleMenuItemClick}>
                      <Grid style={{ paddingTop: '0em', paddingBottom: '0em' }} textAlign='center'>
                        <Grid.Row style={{ paddingTop: '0em', paddingBottom: '0em' }} textAlign='center'>
                          My LAF
                        </Grid.Row>

                        {
                          shortAccount !== '' ?
                            <Grid.Row style={{ paddingTop: '0em', paddingBottom: '0em' }} textAlign='center'>
                              <span style={{ fontSize: '11px'}}> { shortAccount }</span>
                            </Grid.Row>
                          : null
                        }
                        
                      </Grid>
                    </Menu.Item>
                  }
                  content={ accountPopupText }
                  position='bottom right'
                  inverted
                />
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
                    {...props}
                    notifyAppOfNavChange={this.notifyAppOfNavChange}/>    
                }
              />
              <Route exact path={'/mylaf'}
                render={ (props) => 
                  <MyLAF
                    {...props }
                      notifyAppOfNavChange={this.notifyAppOfNavChange}/>    
                }
              />
              <Route exact path={'/admin'}
                render={ (props) => 
                  <Admin
                    {...props }/>    
                }
              />
              <Route exact path={'/items/:id'} component={Item} />
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