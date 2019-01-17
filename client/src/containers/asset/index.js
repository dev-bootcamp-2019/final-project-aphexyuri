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
  Label
} from 'semantic-ui-react'

import {
  getAsset,
  clearAsset
} from '../../modules/listings'

var multihash = require('../../utils/multihash')
var appUtils = require('../../utils/app.js')

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

  render () {
    let ipfsHash = null
    if(this.props.listings.asset) {
      ipfsHash =  multihash.getMultihashFromBytes32({
        digest: this.props.listings.asset.ipfsDigest,
        hashFunction: this.props.listings.asset.ipfsHashFunction,
        size: this.props.listings.asset.ipfsSize
      })
    }

    return (
      <div>
        {
          this.props.listings.asset ?
            <Breadcrumb style={{ paddingLeft: '1em'}}>
              <Breadcrumb.Section link onClick={ this.onBreakCrumbBackClick }>Item Listings</Breadcrumb.Section>
              <Breadcrumb.Divider icon='right angle' />
              <Breadcrumb.Section active>{this.props.listings.asset.title}</Breadcrumb.Section>
            </Breadcrumb>
          : null
        }

        <Container style={{ paddingTop: '2em'}}>
          <Grid>
            {
              this.props.listings.asset ?
                <Grid.Row>
                  <Grid.Column width={14}>
                    <Header as='h2' content={this.props.listings.asset.title}/>
                  </Grid.Column>
                  <Grid.Column width={2}>
                    <Label color='red' tag>
                      {appUtils.assetStatusToString(this.props.listings.asset.assetStatus)}
                    </Label>
                  </Grid.Column>
                </Grid.Row>
              : null
            }
            
            <Grid.Row>
              <Grid.Column width={4}>
                {
                  ipfsHash ?
                    <Image rounded src={ 'https://gateway.ipfs.io/ipfs/' + ipfsHash } size='medium'/>
                  : null
                  // TODO add IPFS image load redundancy?
                }
              </Grid.Column>
              {
                this.props.listings.asset ?
                  <Grid.Column width={12}>
                    <Grid.Row>
                      <p>Phasellus ac imperdiet diam. Mauris tincidunt tortor et erat interdum gravida. Ut eget tristique turpis. Sed posuere lorem id ipsum ullamcorper, nec fermentum leo pretium. Proin lacinia dolor quis pretium porttitor. Donec malesuada odio vitae pharetra vehicula. Praesent in dapibus neque. Nam consectetur diam mi, ut faucibus libero pharetra vitae.</p>
                    </Grid.Row>
                  </Grid.Column>
                : null
              }
            </Grid.Row>
          </Grid>
        </Container>
      </div>
    )
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