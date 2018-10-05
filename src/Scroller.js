import * as utils from "./utils"

const _anchors = Symbol('anchors')
const _activeID = Symbol('activeID')
const _activate = Symbol('activate')
const _sortedIDs = Symbol('sortedIDs')
const _monitors = Symbol('monitors')
const _hasPrev = Symbol('hasPrev')
const _hasNext = Symbol('hasNext')
const _scrollListener = Symbol('scrollListener')
const _resizeListener = Symbol('resizeListener')
const _getComparableTop = Symbol('getComparableTop')
const _sortAnchorsByTop = Symbol('sortAnchorsByTop')
const _setAttrForAnchor = Symbol('setAttrForAnchor')

class Scroller {
    constructor(config) {
        this.offset = (config&&config.offset) || 0
        this.disabled = config&&config.disabled
        this.speed = (config&&config.speed) || 20
        this[_anchors] = {}
        this[_activeID] = null
        this[_sortedIDs] = []
        this[_monitors] = {}
        window.addEventListener('scroll', utils.throttle(this[_scrollListener], 0))
        window.addEventListener('resize', utils.debounce(this[_resizeListener], 300))
    }

    [_activate] = id => {
        if(this[_activeID] === id) return
        if(this[_activeID] !== null) this[_anchors][this[_activeID]].toggle(false)
        this[_anchors][id].toggle(true)
        this[_activeID] = id
        Object.values(this[_monitors]).forEach(cb => {
            const next = this[_hasNext]()
            const prev = this[_hasPrev]()
            cb({
                activeID: this[_activeID],
                next,
                prev
            })
        })
    }

    [_setAttrForAnchor] = a => {
        if(a.el) {
            a.top = utils.getOffsetTop(a.el)
            a.height = utils.getClientHeight(a.el)
        }
        else if(a.funcTop) {
            a.top = utils.enumsFunc[a.funcTop]()
        }
    }

    [_resizeListener] = () => {
        Object.values(this[_anchors]).forEach(a => {
            this[_setAttrForAnchor](a)
        })
    }

    [_scrollListener] = () => {
        if(this.disabled) return
        const current = utils.getCurrentScrollY()
        const anchorsWithScrollListener = Object.values(this[_anchors]).filter(a => a.onScroll&&typeof a.top==='number')
        anchorsWithScrollListener.forEach(a => a.onScroll({
            activeID: this[_activeID],
            anchors: this[_sortedIDs].map(id => this[_anchors][id]),
            scrollY: current,
        }))
        let targetID = null
        //todo optimize searching
        for(let id of this[_sortedIDs]) {
            if(this[_getComparableTop](id) <= current + utils.getPxNumber(this.offset)) {
                targetID = id
            } else {
                break
            }
        }
        if(targetID !== null) this[_activate](targetID)
    }

    [_hasPrev] = () => {
        if(this[_activeID] !== null) {
            const index = this[_sortedIDs].indexOf(this[_activeID])
            return index > 0
        }
        return false
    }

    [_hasNext] = () => {
        if(this[_activeID] !== null) {
            const index = this[_sortedIDs].indexOf(this[_activeID])
            return index < this[_sortedIDs].length-1
        }
        return false
    }

    [_getComparableTop] = id => {
        return this[_anchors][id].funcTop ? this[_anchors][id].top + this[_anchors][this[_sortedIDs][0]].top : this[_anchors][id].top
    }

    [_sortAnchorsByTop] = () => {
        const tempIDs = []
        Object.entries(this[_anchors]).forEach(([id, a]) => {
            this[_setAttrForAnchor](a)
            if(a.funcTop) {
                tempIDs.push(id)
            } else {
                this[_sortedIDs].push(id)
            }
        })
        this[_sortedIDs].sort((a, b) => this[_anchors][a].top - this[_anchors][b].top)
        //todo optimize sorting
        const allIDs = [...this[_sortedIDs], ...tempIDs]
        this[_sortedIDs] = allIDs.sort((a, b) => this[_getComparableTop](a) - this[_getComparableTop](b))
    }

    config = config => {
        this.offset = (config&&config.offset) || this.offset
        this.disabled = config&&config.disabled || this.disabled
        this.speed = (config&&config.speed) || this.speed
    }

    subscribe = (id, {el, toggle, onScroll, offsetTop, clientHeight}) => {
        if(!Object.keys(this[_anchors]).length) {
            setTimeout(() => {
                this[_sortAnchorsByTop]()
                this[_scrollListener]()
            }, 0)
        }
        if(offsetTop!==undefined && clientHeight!==undefined) el = null
        const isFuncTop = Object.values(Scroller.offsetTop).includes(offsetTop)
        const top = el ? null : (isFuncTop ? null : utils.getPxNumber(offsetTop))
        const height = el ? null : utils.getPxNumber(clientHeight)
        this[_anchors][id] = {el, toggle, top, height, onScroll}
        if(isFuncTop) this[_anchors][id].funcTop = offsetTop
    }

    unsubscribe = id => {
        delete this[_anchors][id]
        const index = this[_sortedIDs].indexOf(id)
        this[_sortedIDs].splice(index, 1)
    }

    monitor = (id, cb) => {
        if(this[_monitors][id]) return
        this[_monitors][id] = cb
    }

    unmonitor = id => {
        delete this[_monitors][id]
    }

    toAnchor = utils.debounce(id => {
        if(this.disabled) return
        const distance = this[_anchors][id].funcTop
            ? this[_anchors][id].top - utils.getCurrentScrollY()
            : this[_anchors][id].top - this[_anchors][this[_sortedIDs][0]].top - utils.getCurrentScrollY()
        if(!distance) return
        const anchorsWithScrollListener = Object.values(this[_anchors]).filter(a => a.onScroll)
        const onLastScroll = current => {
            this[_activate](id)
            anchorsWithScrollListener.forEach(a => a.onScroll({
                anchors: this[_sortedIDs].map(id => this[_anchors][id]),
                scrollY: current,
            }))
        }
        utils.smoothScroll(distance, this.speed, onLastScroll)
    }, 100)

    moveAnchor = utils.debounce(num => {
        if(this.disabled) return
        if(this[_activeID] !== null) {
            const index = this[_sortedIDs].indexOf(this[_activeID])
            let movedIndex = index + num
            if(movedIndex < 0) movedIndex = 0
            if(movedIndex > this[_sortedIDs].length-1) movedIndex = this[_sortedIDs].length-1
            this.toAnchor(this[_sortedIDs][movedIndex])
        }
    }, 100)
}
Scroller.offsetTop = {
    MAX: utils.enums.TOP_MAX,
}

export default Scroller