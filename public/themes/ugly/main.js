metrix.onChange("switch", function(mev) {
    mev.element.find("input").prop("checked", mev.state.state)
})

metrix.onLoad("switch", function(mev) {
    mev.element.find("input").bind("click", function(ev) {
        if ($(this).prop("checked")) {
            mev.component.set()
        } else {
            mev.component.clear()
        }
        ev.preventDefault()
        return false
    })
})

function updateSegment(element)
{
    const value = element.attr("data-value")
    for (var i = 0; i < 8; i++) {
        const enabled = value.substr(i, 1)
        const el = element.find("[data-segment=\""+ i +"\"]").attr("data-value", enabled)
    }
}

function updateSegmentText(element, text)
{
    if (text === null) {
        text = ""
    }
    element.text(text)
}

metrix.onLoad("segment", function(mev) {
    for (var i = 0; i < mev.state.state.length; i++) {
        const el = mev.element.find("section[data-digit=\"" + i + "\"]")
        el.find("div, span").bind("click", function(ev) {
            const digit = parseInt($(this).parent().attr("data-digit"))
            const segment = parseInt($(this).attr("data-segment"))
            mev.component.digit(digit).toggle(segment)
        })
        updateSegment(el)
        updateSegmentText(mev.element.find("div.segment-text span[data-digit=\"" + i + "\"]"), mev.state.state[i])

    }
})

metrix.onChange("segment", function(mev) {
    for (var i = 0; i < mev.state.state.length; i++) {
        const el = mev.element.find("section[data-digit=\""+i+"\"]")
        el.attr("data-value", mev.state.segment_state[i])
        updateSegment(el)
        updateSegmentText(mev.element.find("div.segment-text span[data-digit=\"" + i + "\"]"), mev.state.state[i])
    }
})

