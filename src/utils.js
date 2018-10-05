export const enums = {
    TOP_MAX: 'TOP_MAX',
}

export const enumsFunc = {
    [enums.TOP_MAX]: () => document.body.scrollHeight - document.body.clientHeight
}

export const getOffsetTop = el => {
    return el.offsetTop
}

export const getClientHeight = el => {
    return el.clientHeight
}

export const getCurrentScrollY = () => {
    return window.scrollY
}

export const smoothScroll = (distance, speed, cb) => {
    const initial = getCurrentScrollY()
    let moved = 0
    const step = distance/Math.abs(distance)*speed
    const oneStepScroll = () => {
        moved += step
        if(Math.abs(moved) < Math.abs(distance)) {
            window.scrollBy(0, step)
            window.requestAnimationFrame(oneStepScroll)
        } else {
            window.scrollBy(0, step-moved+distance)
            cb(initial+distance)
        }
    }
    window.requestAnimationFrame(oneStepScroll)
}

export const getPxNumber = param => {
    if(typeof param === 'number') return param
    if(param.includes('px')) return Math.round(param.split('px')[0])
    if(param.includes('vh')) return Math.round(param.split('vh')[0]/100 * document.body.clientHeight)
}

export const debounce = (fn, delay=0) => {
    let timer;
    return (...args) => {
        const later = () => {
            timer = null
            fn(...args)
        }
        clearTimeout(timer)
        timer = setTimeout(later, delay)
    }
}

export const throttle = (fn, period=0) => {
    let timer, last=0
    return (...args) => {
        const later = () => {
            timer = null
            last = new Date()
            fn(...args)
        }
        const now = new Date()
        let left = period - (now - last)
        if(left <= 0) {
            if(timer) {
                clearTimeout(timer)
                timer = null
            }
            last = now
            fn(...args)
        } else if(!timer) {
            timer = setTimeout(later, left)
        }
    }
}