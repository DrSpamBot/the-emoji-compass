import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Emoji from './Emoji'
import FlavorText from './FlavorText'
import { resetAppState } from '../store/actions/app'

import shareButton from '../img/share_button_v01.svg'
import closeButton from '../img/close_button_v01.svg'

// Note: the following is broken. It displays as all black.
// import { ReactComponent as Arc1 } from '../img/arc_02_1.svg'
// import { ReactComponent as Arc2 } from '../img/arc_02_2.svg'
// To workaround it, we import components manually ported via SVGR.
import Arc1 from './Arc1'
import Arc2 from './Arc2'

import './AnswerScreen.css'

class AnswerScreen extends React.Component {
  static propTypes = {
    requestEmojis: PropTypes.array,
    responseEmojis: PropTypes.array,
    resetAppState: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.state = {
      activeArc: null,
      activeEmoji: null,
      text: null
    }
  }

  handleSelectRequestEmoji = (index) => {
    this.setState({
      activeArc: 1,
      activeEmoji: index,
      text: this.props.requestEmojis[index].text
    })
  }

  handleSelectResponseEmoji = (index) => {
    this.setState({
      activeArc: 2,
      activeEmoji: index,
      text: this.props.responseEmojis[index].text
    })
  }

  renderEmojiResultRow (emoji) {
    return (
      <tr key={emoji.emoji} className="emoji-table-row">
        <td className="emoji-table-cell">
          <span className="emoji-table-symbol" title={emoji.title}>{emoji.emoji}</span>
        </td>
        <td className="emoji-table-cell emoji-table-description">
          {emoji.text}
        </td>
      </tr>
    )
  }

  render () {
    const { requestEmojis, responseEmojis, resetAppState } = this.props

    // Bail if nothing to show
    if (requestEmojis.length === 0 || responseEmojis.length === 0) return null

    const { activeArc, activeEmoji } = this.state

    return (
      <div className="container container-answer-screen">
        <div className="answer-arc-container">
          <Arc1 active={(activeArc === 1) ? activeEmoji : null} handleSelect={this.handleSelectRequestEmoji} />
          <div className="answer-emojis">
            {requestEmojis.map((emoji, i) => (
              <Emoji symbol={emoji} key={i} />
            ))}
          </div>
        </div>

        <div className="answer-arc-container">
          <Arc2 active={(activeArc === 2) ? activeEmoji : null} handleSelect={this.handleSelectResponseEmoji} />
          <div className="answer-emojis">
            {responseEmojis.map((emoji, i) => (
              <Emoji symbol={emoji} key={i} />
            ))}
          </div>
        </div>

        <div className="answer-text">
          {this.state.text && <FlavorText text={this.state.text} />}
        </div>

        <div className="final-buttons">
          <button id="share" title="Share this">
            <img src={shareButton} alt="" />
          </button>
          <button id="ask-another" title="Ask again" onClick={resetAppState}>
            <img src={closeButton} alt="" />
          </button>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    requestEmojis: state.app.requestEmojis,
    responseEmojis: state.app.responseEmojis
  }
}

function mapDispatchToProps (dispatch) {
  return {
    resetAppState: () => { dispatch(resetAppState()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AnswerScreen)
