import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Scroller from "./Scroller"

class ScrollMonitor extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeID: null,
            next: false,
            prev: false
        }
    }

    componentDidMount() {
        this.monitorToScroller()
    }

    componentWillUnmount() {
        const { monitorID, scroller } = this.props
        scroller.unmonitor(monitorID)
    }

    monitorToScroller = () => {
        const { scroller, monitorID } = this.props
        scroller.monitor(monitorID, state => this.setState(state))
    }

    render() {
        const { children } = this.props
        return children({...this.state})
    }
}

export default ScrollMonitor

ScrollMonitor.propTypes = {
    scroller: PropTypes.instanceOf(Scroller).isRequired,
    monitorID: PropTypes.any.isRequired
}
