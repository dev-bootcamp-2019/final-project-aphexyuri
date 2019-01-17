import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';

import {
  Breadcrumb,
  Container,
  Header,
  Image,
  Grid,
  Step,
  Icon
} from 'semantic-ui-react'

import {
  getAsset,
  clearAsset
} from '../../modules/listings'

import { AssetStatus, assetStatusToString } from '../../utils/app.js'
import { getMultihashFromBytes32 } from '../../utils/multihash'

var loadFromUrl

class Asset extends Component {
  state = { ipfsHash: null }

  constructor(props) {
    super(props)

    if(!this.props.app.web3) {
      loadFromUrl = true
    }
  }

  componentDidUpdate = async () => {
    if(loadFromUrl) {
      let assetId = this.props.history.location.pathname.replace('/listings/', '')
      this.props.getAsset(assetId)
      loadFromUrl = false
    }
  }

  onBreakCrumbBackClick = () => {
    this.props.history.push('/')
    this.props.clearAsset()
  }

  renderInteractionsUI = () => {
    let { asset } = this.props.listings

    console.log('this.props', this.props)

    if(asset.creator === this.props.app.accounts[0]) {
      // creator is viewing
      console.log('viewing as creator')

      // cancel button
      if(asset.assetStatus == AssetStatus.Posted || asset.assetStatus == AssetStatus.PotentialMatch) {
        
      }

      // confirm find btn
      if(asset.assetStatus == AssetStatus.PotentialMatch) {

      }

      // mark as recovered btn
      if(asset.assetStatus == AssetStatus.MatchConfirmed) {

      }
    }
    else {
      console.log('viewing as 2nd party')

      // i found it button
      if(asset.assetStatus == AssetStatus.Posted) {

      }
    }
  }

  render () {
    let ipfsHash = null

    if(!this.props.listings.asset) {
      return (
        <div>Waiting for asset data...</div>
      )
    }
    else {
      let { asset } = this.props.listings

      console.log('asset', asset)

      ipfsHash =  getMultihashFromBytes32({
        digest: asset.ipfsDigest,
        hashFunction: asset.ipfsHashFunction,
        size: asset.ipfsSize
      })

      return (
        <div>
          <Breadcrumb style={{ paddingLeft: '1em'}}>
            <Breadcrumb.Section link onClick={ this.onBreakCrumbBackClick }>Item Listings</Breadcrumb.Section>
            <Breadcrumb.Divider icon='right angle' />
            <Breadcrumb.Section active>Item Details:</Breadcrumb.Section>
          </Breadcrumb>

          <Container style={{ paddingTop: '2em'}}>
            <Grid>
              <Grid.Row>
                <Grid.Column width={16}>
                  <Header as='h2' content={asset.title}/>
                </Grid.Column>
              </Grid.Row>

              <Grid.Row>
                <Step.Group widths={4} size='mini'>
                  <Step active={ asset.assetStatus == AssetStatus.Posted }>
                    <Icon name='find'/>
                    <Step.Content>
                      <Step.Title>Lost</Step.Title>
                      <Step.Description>This item is still lost</Step.Description>
                    </Step.Content>
                  </Step>
                  <Step
                    active={ asset.assetStatus == AssetStatus.PotentialMatch }
                    disabled={ asset.assetStatus < AssetStatus.PotentialMatch }>
                    <Icon name='question'/>
                    <Step.Content>
                      <Step.Title>Potentially Found</Step.Title>
                      <Step.Description>Someone potentially found it</Step.Description>
                    </Step.Content>
                  </Step>
                  <Step
                    active={ asset.assetStatus == AssetStatus.MatchConfirmed }
                    disabled={ asset.assetStatus < AssetStatus.MatchConfirmed }>
                    <Icon name='smile outline'/>
                    <Step.Content>
                      <Step.Title>Confirmed Found</Step.Title>
                      <Step.Description>Found item confirmed</Step.Description>
                    </Step.Content>
                  </Step>
                  <Step
                    active={ asset.assetStatus == AssetStatus.Recovered }
                    disabled={ asset.assetStatus < AssetStatus.Recovered }>
                    <Icon name='check'/>
                    <Step.Content>
                      <Step.Title>Recovered</Step.Title>
                      <Step.Description>Item successfully recovered</Step.Description>
                    </Step.Content>
                  </Step>
                </Step.Group>
              </Grid.Row>
              
              <Grid.Row>
                <Grid.Column width={4}>
                  {
                    ipfsHash ?
                      <Image rounded src={ 'https://gateway.ipfs.io/ipfs/' + ipfsHash } size='medium'/>
                    : null
                    // TODO add IPFS image load redundancy?
                  }
                </Grid.Column>

                <Grid.Column width={12}>
                  <Grid.Row>
                    <p>Phasellus ac imperdiet diam. Mauris tincidunt tortor et erat interdum gravida. Ut eget tristique turpis. Sed posuere lorem id ipsum ullamcorper, nec fermentum leo pretium. Proin lacinia dolor quis pretium porttitor. Donec malesuada odio vitae pharetra vehicula. Praesent in dapibus neque. Nam consectetur diam mi, ut faucibus libero pharetra vitae.</p>
                  </Grid.Row>
                  <Grid.Row>
                    { this.renderInteractionsUI() }
                  </Grid.Row>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Container>
        </div>
      )
    }
  }
}

Asset.contextTypes = {
  store: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  app: state.app,
  listings: state.listings
})

const mapDispatchToProps = dispatch => bindActionCreators({
  getAsset,
  clearAsset
}, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps
) (Asset)