import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { TweenLite } from 'gsap'
import Draggable from 'gsap/Draggable'
import { addRequestEmoji, updateHandPosition, setActiveHand } from '../store/actions/app'
import { random, getEmojiPosition } from '../utils'
import { autoRotateHand } from '../scripts'

class CompassHand extends React.Component {
  static propTypes = {
    id: PropTypes.number,
    enabled: PropTypes.bool,

    // Provided by Redux
    symbols: PropTypes.arrayOf(PropTypes.shape({
      emoji: PropTypes.string,
      title: PropTypes.string,
      text: PropTypes.string
    })),
    activeHand: PropTypes.number,
    addRequestEmoji: PropTypes.func,
    updateHandPosition: PropTypes.func
  }

  static defaultProps = {
    addRequestEmoji: () => {}
  }

  constructor (props) {
    super(props)

    this.el = React.createRef()
    this.draggable = null
  }

  componentDidMount () {
    const el = this.el.current

    // Set hand width according to actual circle dimensions
    this.setElementSize()
    window.addEventListener('resize', this.setElementSize)
  
    // Make hands draggable
    TweenLite.set(el, {
      transformOrigin: '2.5vmin',
      rotation: random() * 360 // Set at random start position
    })

    this.draggable = Draggable.create(el, {
      type: 'rotation',
      sticky: true,
      throwProps: true,
      // Only if ThrowProps is available
      snap: {
        rotation: (value) => {
          const increment = 360 / this.props.symbols.length
          return Math.round(value / increment) * increment
        }
      },
      // Set scope of Draggable callback functions to this component.
      callbackScope: this,
      onDragStart: (event) => {
        window.dispatchEvent(new CustomEvent('compass:hand_drag_start'))
      },
      onDrag: (event) => {
        this.props.updateHandPosition(this.draggable[0].rotation)
      },
      onDragEnd: (event) => {
        this.props.updateHandPosition(this.draggable[0].rotation)
  
        // Select the emoji it's pointing at.
        const position = getEmojiPosition(this.draggable[0].rotation, this.props.symbols)

        this.props.addRequestEmoji(this.props.symbols[position])
  
        // Disable this when it's done dragging.
        this.disable()
  
        // Set the active hand to the next hand.
        this.props.setActiveHand(this.props.id + 1)
      },
      onThrowUpdate: (event) => {
        this.props.updateHandPosition(this.rotation)
      }
    })
  
    // Activate if this is the currently active hand.
    if (this.props.activeHand === this.props.id) {
      this.enable()
    } else {
      this.disable()
    }
  }

  componentDidUpdate (prevProps) {
    // Activate if this is the currently active hand.
    if (this.props.activeHand === this.props.id) {
      // special case the last one
      if (this.props.id === 4) {
        autoRotateHand(this)
      } else {
        this.enable()
      }
    } else {
      this.disable()
    }
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.setElementSize)
    this.draggable[0].kill()
  }

  setElementSize = () => {
    const circleSize = document.getElementById('ring').getBoundingClientRect().width
    this.el.current.style.width = (0.5 * circleSize) + 'px'
  }
  
  // Wrap Draggable object's `enable()` to make element take z-index priority
  enable = () => {
    const el = this.el.current

    el.classList.add('active')
    TweenLite.set(el, { zIndex: 1 })

    this.draggable[0].enable()
  }

  disable = () => {
    const el = this.el.current

    el.classList.remove('active')
    TweenLite.set(el, { zIndex: 0 })

    this.draggable[0].disable()
    el.style.userSelect = 'none'
    el.style.touchAction = 'none'
  }

  render () {
    return (
      <div className={`hand hand-${this.props.id}`} ref={this.el } />
    )
  }
}

function mapStateToProps (state) {
  return {
    symbols: state.app.symbols,
    activeHand: state.app.activeHand
  }
}

function mapDispatchToProps (dispatch) {
  return {
    addRequestEmoji: (emoji) => { dispatch(addRequestEmoji(emoji)) },
    updateHandPosition: (rotation) => { dispatch(updateHandPosition(rotation)) },
    setActiveHand: (hand) => { dispatch(setActiveHand(hand)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CompassHand)