import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';

import Flag from "react-flags";

import {
  Breadcrumb,
  Container,
  Header,
  Image,
  Grid,
  Step,
  Icon,
  Segment,
  Message
} from 'semantic-ui-react'

import Loadable from 'react-loadable';

import {
  getAsset,
  getAssetMetadata,
  clearAsset
} from '../../modules/listings'

import { AssetStatus, longLocationString } from '../../utils/app.js'
import { getMultihashFromBytes32 } from '../../utils/multihash'

const Loading = () => <Segment style={{ padding: '4em 0em' }} vertical loading/>;

const CreatorUI = Loadable({
  loader: () => import('./creatorUI'),
  loading: Loading
})

const FoundAssetUI = Loadable({
  loader: () => import('./foundAssetUI'),
  loading: Loading
})

var loadFromUrl

class Asset extends Component {
  state = { ipfsHash: null }

  constructor(props) {
    super(props)

    this.state = { assetId: this.props.history.location.pathname.replace('/listings/', '') }

    if(!this.props.app.web3) {
      loadFromUrl = true
    }
  }

  componentDidUpdate = async () => {
    if(loadFromUrl) {
      this.props.getAsset(this.state.assetId)
      this.props.getAssetMetadata(this.state.assetId)
      loadFromUrl = false
    }
  }

  onBreakCrumbBackClick = () => {
    this.props.history.push('/')
    this.props.clearAsset()
  }

  renderInteractionsUI = () => {
    let { asset, assetMetadata } = this.props.listings

    console.log('asset', asset)
    // console.log('assetMetadata', assetMetadata)

    if(asset.assetStatus == AssetStatus.Cancelled) {
      return (
        <Container textAlign='right' style={{ paddingTop: '1em'}}>
          <Message attached negative
            header='This item has been cancelled'
            content='No actions available' />
        </Container>
      )
    }
    else {
      if(asset.creator === this.props.app.accounts[0]) {
        // creator is viewing
        console.log('viewing as creator, assetId: ', this.state.assetId)
        return (
          <CreatorUI assetId={ this.state.assetId } />
        )
      }
      else {
        // non-creator is viewing
        console.log('viewing as non-creator, assetId: ', this.state.assetId)

        if(asset.assetStatus == AssetStatus.Cancelled) {
          return (
            <Container textAlign='right' style={{ paddingTop: '1em'}}>
              <Message attached warning
                header='This item has been cancelled'
                content='No actions available' />
            </Container>
          )
        }
        else if(asset.assetStatus == AssetStatus.Posted) {
          return (
            <FoundAssetUI assetId={ this.state.assetId } />
          )
        }
        else {
          if(assetMetadata.matcher === this.props.app.accounts[0]) {
            if(asset.assetStatus == AssetStatus.PotentialMatch) {
              return (
                <Container textAlign='right' style={{ paddingTop: '1em'}}>
                  <Message attached warning
                    header='Waiting for response from owner'
                    content='Thank you for letting us know that you found this. Waiting for owner confirmation - check back soon!' />
                </Container>
              )
            }
            else if(asset.assetStatus == AssetStatus.MatchConfirmed) {
              return (
                <Container textAlign='right' style={{ paddingTop: '1em'}}>
                <Message attached warning
                    header='Fantastic - the item you found has been verified found!'
                    content='Follow the instructions below to return it to the owner' />
                <p>{ assetMetadata.exchangeDetails }</p>
                </Container>
              )
            }
            else if(asset.assetStatus == AssetStatus.Recovered) {
              return (
                <Container textAlign='right' style={{ paddingTop: '1em'}}>
                  <Message attached positive
                    header='This item has been recovered'
                    content='No actions available' />
                </Container>
              )
            }
          }
          else {
            if(asset.assetStatus == AssetStatus.Recovered) {
              return (
                <Container textAlign='right' style={{ paddingTop: '1em'}}>
                  <Message attached positive
                    header='This item has been recovered'
                    content='No actions available' />
                </Container>
              )
            }
            else {
              return (
                <Container textAlign='right' style={{ paddingTop: '1em'}}>
                  <Message attached warning
                    header='Somebody already claimed to have found this'
                    content='Check back soon for more info or find something else?' />
                </Container>
              )
            }
          }
        }
      }
    }
  }

  render () {
    let ipfsHash = null

    if(!this.props.listings.asset || !this.props.listings.assetMetadata) {
      return (
        <Container style={{ paddingTop: '2em', paddingBottom: '1em'}}>
          Waiting for asset data...
        </Container>
      )
    }
    else {
      let { asset, assetMetadata } = this.props.listings

      // console.log('asset', asset)
      // console.log('assetMetadata', assetMetadata)

      ipfsHash =  getMultihashFromBytes32({
        digest: asset.primaryIpfsDigest,
        hashFunction: asset.primaryIpfsHashFunction,
        size: asset.primaryIpfsSize
      })

      let isoCountryCode = this.props.app.web3.utils.hexToUtf8(asset.isoCountryCode)
      let stateProvince = this.props.app.web3.utils.hexToUtf8(asset.stateProvince)
      let city = this.props.app.web3.utils.hexToUtf8(assetMetadata.city)
      let longLocation = longLocationString(isoCountryCode, stateProvince)
      let location = longLocation[0] + ', ' + longLocation[1] + ', ' + city

      return (
        <div>
          <Breadcrumb style={{ paddingLeft: '1em'}}>
            <Breadcrumb.Section link onClick={ this.onBreakCrumbBackClick }>Item Listings</Breadcrumb.Section>
            <Breadcrumb.Divider icon='right angle' />
            <Breadcrumb.Section active>Item Details:</Breadcrumb.Section>
          </Breadcrumb>

          <Container style={{ paddingTop: '2em', paddingBottom: '1em'}}>
            <Grid>
              <Grid.Row style={{ paddingBottom: '0em'}}>
                <Grid.Column width={16}>
                  <Header as='h2' content={asset.title}/>
                </Grid.Column>
              </Grid.Row>

              <Grid.Row style={{ paddingTop: '0.25em', paddingBottom: '0.0em'}}>
                <Grid.Column width={12}>
                  <Flag
                    name={isoCountryCode}
                    format='png'
                    pngSize={16}
                    basePath='../images/flags'
                  />
                  { ' ' + location }
                </Grid.Column>
                <Grid.Column width={4} textAlign='right'>
                  <Icon name='ethereum' />
                  <b>{ this.props.app.web3.utils.fromWei(asset.reward, 'ether') } </b>
                  Reward
                </Grid.Column>
              </Grid.Row>

              <Grid.Row>
                <Step.Group widths={4} size='mini'>
                  <Step active={ asset.assetStatus == AssetStatus.Posted }
                    disabled={ asset.assetStatus == AssetStatus.Cancelled }>
                    <Icon name='find'/>
                    <Step.Content>
                      <Step.Title>Lost</Step.Title>
                      <Step.Description>This item is still lost</Step.Description>
                    </Step.Content>
                  </Step>
                  <Step
                    active={ asset.assetStatus == AssetStatus.PotentialMatch }
                    disabled={ asset.assetStatus < AssetStatus.PotentialMatch || asset.assetStatus == AssetStatus.Cancelled }>
                    <Icon name='question'/>
                    <Step.Content>
                      <Step.Title>Potentially Found</Step.Title>
                      <Step.Description>Someone potentially found it</Step.Description>
                    </Step.Content>
                  </Step>
                  <Step
                    active={ asset.assetStatus == AssetStatus.MatchConfirmed }
                    disabled={ asset.assetStatus < AssetStatus.MatchConfirmed || asset.assetStatus == AssetStatus.Cancelled }>
                    <Icon name='smile outline'/>
                    <Step.Content>
                      <Step.Title>Confirmed Found</Step.Title>
                      <Step.Description>Found item confirmed</Step.Description>
                    </Step.Content>
                  </Step>
                  <Step
                    active={ asset.assetStatus == AssetStatus.Recovered }
                    disabled={ asset.assetStatus < AssetStatus.Recovered || asset.assetStatus == AssetStatus.Cancelled }>
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
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Container>

          { this.renderInteractionsUI() }
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