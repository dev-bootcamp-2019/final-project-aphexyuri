import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';

import {
  Container,
  Message,
  Button,
  Grid,
  Image,
  Modal,
  Form,
  TextArea
} from 'semantic-ui-react'

import {
  cancelItem,
  matchConfirmed,
  matchInvalid,
  itemRecovered,
  itemRecoveryFailed
} from '../../modules/items'

import { ItemStatus } from '../../utils/app.js'
import { getMultihashFromBytes32 } from '../../utils/multihash'

class CreatorUI extends Component {
  state = {
    modalOpen: false,
    exchangeDetails: ''
  }

  onCancelBtnClick = () => {
    this.props.cancelItem(this.props.itemId)
  }

  onMatchConfirmedSubmitBtnClick = () => {
    this.props.matchConfirmed(this.props.itemId, this.state.exchangeDetails)
    this.setState({ modalOpen: false })
  }

  onMatchInvalidBtnClick = () => {
    this.props.matchInvalid(this.props.itemId)
  }

  closeModalBtnClick = () => {
    this.setState({ modalOpen: false })
  }

  handleExchangeFieldChange = (name, value) => {
    this.setState({ exchangeDetails: value.value})
  }

  onRecoveredBtnClick = () => {
    this.props.itemRecovered(this.props.itemId)
  }

  onRecoveryFailedBtnClick = () => {
    this.props.itemRecoveryFailed(this.props.itemId)
  }

  render () {
    let ipfsHash = null
    let { item, itemMetadata } = this.props.items
    const { modalOpen, dimmer } = this.state

    if(parseInt(item.itemStatus) === ItemStatus.Posted) {
      return (
        <Container textAlign='right' style={{ paddingTop: '1em'}}>
          <Message attached warning
              header='Your item has not been found'
              content='Choose from the actions below' />
          <br/>
          <Button fluid negative onClick={ this.onCancelBtnClick }>Cancel Item</Button>
        </Container>
      )
    }
    else if(parseInt(item.itemStatus) === ItemStatus.PotentialMatch) {
      ipfsHash =  getMultihashFromBytes32({
        digest: itemMetadata.secondaryIpfsDigest,
        hashFunction: itemMetadata.secondaryIpfsHashFunction,
        size: itemMetadata.secondaryIpfsSize
      })

      return (
        <div>
          <Container textAlign='right' style={{ paddingTop: '1em'}}>
            <Message attached warning
                header='Yay, someone has potentially found your lost item!'
                content='Choose from the actions below' />
            <br/>

            <Grid>
              <Grid.Row>
                <Grid.Column width={12}>
                  <Grid.Row>
                    { itemMetadata.foundDetails }
                  </Grid.Row>
                </Grid.Column>

                <Grid.Column width={4}>
                  {
                    ipfsHash ?
                      <Image rounded src={ 'https://gateway.ipfs.io/ipfs/' + ipfsHash } size='medium'/>
                    : null
                    // TODO add IPFS image load redundancy?
                  }
                </Grid.Column>
              </Grid.Row>
            </Grid>

            <Grid columns='equal'>
              <Grid.Column>
                <Button primary fluid onClick={ () => { this.setState({ modalOpen: true })} }>Yes, this is my item</Button>
              </Grid.Column>

              <Grid.Column>
                <Button color='orange' fluid onClick={ this.onMatchInvalidBtnClick }>No, not my item</Button>
              </Grid.Column>

              <Grid.Column>
                <Button fluid negative onClick={ this.onCancelBtnClick }>Cancel Item</Button>
              </Grid.Column>
            </Grid>
          </Container>

          <Modal dimmer={dimmer} open={modalOpen} size='small' onClose={this.closeModalBtnClick} closeIcon>
            <Modal.Header>
              Please provide exchange location & details. We recommend a public location such as a coffee shop.
            </Modal.Header>
            <Modal.Content>
              <Container>
                <Grid>
                  <Grid.Row>
                    <Grid.Column width={16}>
                      <Form>
                        <Form.Field>
                          <TextArea autoHeight
                            style={{ minHeight: 150 }}
                            rows={1}
                            placeholder='Please provide exchange details here'
                            onChange={this.handleExchangeFieldChange}/>
                        </Form.Field>
                      </Form>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Container>
            </Modal.Content>
            <Modal.Actions>
              <Button positive
                icon='arrow right'
                labelPosition='right'
                content="Submit"
                onClick={this.onMatchConfirmedSubmitBtnClick}/>
            </Modal.Actions>
          </Modal>
        </div>
      )
    }
    else if(parseInt(item.itemStatus) === ItemStatus.MatchConfirmed) {
      return (
        <Container textAlign='right' style={{ paddingTop: '1em'}}>
          <Message attached warning
            header='Go collect your item!'
            content='Once collected, please mark it as recovered below' />
          <br/>
          <Grid columns='equal'>
            <Grid.Column>
              <Button fluid negative onClick={ this.onRecoveryFailedBtnClick }>Recovery Failed</Button>
            </Grid.Column>
            <Grid.Column>
              <Button fluid positive onClick={ this.onRecoveredBtnClick }>Set item as recovered</Button>
            </Grid.Column>
          </Grid>
        </Container>
      )
    }

    else if(parseInt(item.itemStatus) === ItemStatus.Recovered) {
      return (
        <Container textAlign='right' style={{ paddingTop: '1em'}}>
          <Message attached positive
            header='This item has been recovered'
            content='No actions available' />
        </Container>
      )
    }
  }
}

CreatorUI.contextTypes = {
  itemId: PropTypes.number
}

const mapStateToProps = state => ({
  app: state.app,
  items: state.items
})

const mapDispatchToProps = dispatch => bindActionCreators({
  cancelItem,
  matchConfirmed,
  matchInvalid,
  itemRecovered,
  itemRecoveryFailed
}, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps
) (CreatorUI)