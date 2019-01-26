import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';

import Blockies from 'react-blockies';

import {
  Segment,
  Container,
  Label,
  Grid,
  Button,
  Header,
  Icon
} from 'semantic-ui-react'

import Loadable from 'react-loadable';

import {
  getMyLAFs,
  getClaimableRewards,
  withdrawRewards
} from '../../modules/listings'

import {
  getItem,
  getItemMetadata
} from '../../modules/items'

const Loading = () => <Segment style={{ padding: '4em 0em' }} vertical loading/>;

const ListingItem = Loadable({
  loader: () => import('../listings/listingItem'),
  loading: Loading
})

var loadFromUrl

class MyLAF extends Component {
  constructor(props) {
    super(props)

    if(!this.props.app.web3) {
      loadFromUrl = true
    }
  }

  // componentDidMount() {
  //   console.log('MyLAF- conponentDidMoumnt')
  //   this.props.getMyLAFs()
  // }

  componentDidUpdate = async () => {
    if(loadFromUrl) {
      this.props.getMyLAFs()
      this.props.getClaimableRewards()
      loadFromUrl = false
    }
  }

  handleItemSelect = (itemId) => {
    this.props.notifyAppOfNavChange('items')
    
    this.props.getItem(itemId)
    this.props.getItemMetadata(itemId)

    this.props.history.push('items/' + itemId)
  }

  renderEntry = item => {
    return (
      // <div>foop!</div>
      <ListingItem
        key={item.itemId}
        item={item}
        itemSelectHandler={this.handleItemSelect}/>
    )
  }

  render () {
    if(this.props.app.accounts) {
      // console.log(this.props.app.accounts[0])

      return (
        <div>
          <Container text textAlign='center' style={{ paddingTop: '2em', paddingBottom: '1em'}}>
            <Blockies
              seed={this.props.app.accounts[0]} 
              size={10}
              scale={15}/>
          </Container>

          <Container text textAlign='center'>
            <Label circular size='huge'>
              { this.props.app.accounts[0] }
            </Label>
          </Container>

          {
            this.props.listings.myClaimableRewards > 0 ?
              <Container style={{ paddingTop: '2em'}}>
                <Segment placeholder inverted secondary color='red'>
                  <Header icon>
                    <Icon name='ethereum'/>
                    You have {this.props.app.web3.utils.fromWei(this.props.listings.myClaimableRewards, 'ether')} ETH claimable rewards!
                  </Header>
                  <Segment.Inline>
                    <Button positive onClick={ () => { this.props.withdrawRewards() }}>Withdraw Now</Button>
                  </Segment.Inline>
                </Segment>
              </Container>
            : null
          }

          {
            this.props.listings.myLafItems ?
              <Container textAlign='left' style={{ paddingTop: '3em', paddingBottom: '1em'}}>
                <Grid>
                  { this.props.listings.myLafItems.map(this.renderEntry) }
                </Grid>
              </Container>
            : null
          }
        </div>
      )
    }
    else {
      return (<div></div>)
    }
  }
}

MyLAF.contextTypes = {
  notifyAppOfNavChange: PropTypes.func
}

const mapStateToProps = state => ({
  app: state.app,
  listings: state.listings
})

const mapDispatchToProps = dispatch => bindActionCreators({
  getMyLAFs,
  getClaimableRewards,
  withdrawRewards,
  getItem,
  getItemMetadata
}, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps
) (MyLAF)