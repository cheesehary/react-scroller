import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import Scroller from './Scroller'

class ScrollAnchor extends Component {
    constructor(props) {
        super(props)
        this.state = {
            active: false
        }
    }

    componentDidMount() {
        this.subscribeToScroller()
    }

    componentWillUnmount() {
        const { anchorID, scroller } = this.props
        scroller.unsubscribe(anchorID)
    }

    subscribeToScroller = () => {
        const { scroller, anchorID, onScroll, offsetTop, clientHeight } = this.props
        const el = ReactDOM.findDOMNode(this)
        scroller.subscribe(anchorID, {
            el,
            offsetTop,
            clientHeight,
            toggle: active => {
                if(active !== this.state.active) this.setState({active})
            },
            onScroll
        })
    }

    render() {
        const { children } = this.props
        if(!children) return null
        return children(this.state.active)
    }
}

export default ScrollAnchor

ScrollAnchor.propTypes = {
    scroller: PropTypes.instanceOf(Scroller).isRequired,
    anchorID: PropTypes.any.isRequired,
    onScroll: PropTypes.func,
    offsetTop: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    clientHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}
