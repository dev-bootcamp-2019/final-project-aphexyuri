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
  Icon,
  Button
} from 'semantic-ui-react'

import {
  getAsset,
  getAssetMetadata,
  clearAsset
} from '../../modules/listings'

import { AssetStatus } from '../../utils/app.js'
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
      this.props.getAssetMetadata(assetId)
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
      return (
        <div>
          {/* cancel button */}
          {
            asset.assetStatus == AssetStatus.Posted || asset.assetStatus == AssetStatus.PotentialMatch ?
              <Button fluid negative>Cancel</Button>
            : null
          }

          {/* confirm find btn */}
          {
            asset.assetStatus == AssetStatus.PotentialMatch ?
              <Button fluid>Yes, that is my item</Button>
            : null
          }
          
          {/* mark as recovered btn */}
          {
            asset.assetStatus == AssetStatus.MatchConfirmed ?
              <Button fluid>Item recovered</Button>
            : null
          }
        </div>
      )
    }
    else {
      console.log('viewing as 2nd party')
      return (
        <div>
          {/* i found it button */}
          {
            asset.assetStatus == AssetStatus.Posted ?
              <Button fluid>I found this item</Button>
            : null
          }
        </div>
      )
    }
  }

  render () {
    let ipfsHash = null

    if(!this.props.listings.asset || !this.props.listings.assetMetadata) {
      return (
        <div>Waiting for asset data...</div>
      )
    }
    else {
      let { asset, assetMetadata } = this.props.listings

      console.log('asset', asset)
      console.log('assetMetadata', assetMetadata)

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
                  <Step active={ asset.assetStatus === AssetStatus.Posted }>
                    <Icon name='find'/>
                    <Step.Content>
                      <Step.Title>Lost</Step.Title>
                      <Step.Description>This item is still lost</Step.Description>
                    </Step.Content>
                  </Step>
                  <Step
                    active={ asset.assetStatus === AssetStatus.PotentialMatch }
                    disabled={ asset.assetStatus < AssetStatus.PotentialMatch }>
                    <Icon name='question'/>
                    <Step.Content>
                      <Step.Title>Potentially Found</Step.Title>
                      <Step.Description>Someone potentially found it</Step.Description>
                    </Step.Content>
                  </Step>
                  <Step
                    active={ asset.assetStatus === AssetStatus.MatchConfirmed }
                    disabled={ asset.assetStatus < AssetStatus.MatchConfirmed }>
                    <Icon name='smile outline'/>
                    <Step.Content>
                      <Step.Title>Confirmed Found</Step.Title>
                      <Step.Description>Found item confirmed</Step.Description>
                    </Step.Content>
                  </Step>
                  <Step
                    active={ asset.assetStatus === AssetStatus.Recovered }
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
                    { assetMetadata.description }
                  </Grid.Row>
                  <Grid.Row style={{ paddingTop: '1em'}}>
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
  getAssetMetadata,
  clearAsset
}, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps
) (Asset)