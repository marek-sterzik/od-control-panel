metrix.onChange("switch", function(mev) {
    for (var part of mev.state.parts) {
        mev.element.find("input").each(function(){
            const part = $(this).attr("data-part")
            $(this).prop("checked", mev.state[part])
        })
    }
})

metrix.onLoad("switch", function(mev) {
    mev.element.find("input").bind("click", function(ev) {
        const part = $(this).attr("data-part")
        if ($(this).prop("checked")) {
            mev.component.setPart(part)
        } else {
            mev.component.clearPart(part)
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
    } else if (text === "") {
        text = " "
    }
    const oldText = element.attr("data-expected-value")
    if (oldText !== text) {
        element.attr("data-expected-value", text)
        element.prop("value", text)
    }
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
        const segmentInput = mev.element.find("div.segment-text input[data-digit=\"" + i + "\"]")
        const submitText = function() {
            const value = $(this).prop("value")
            const digit = parseInt($(this).attr("data-digit"))
            const originalValue = $(this).prop("data-expected-value")
            if (value !== "" && value !== originalValue) {
                mev.component.digit(digit).write(value)
            }
        }
        segmentInput.bind("blur", submitText)
        segmentInput.bind("keydown", function (ev) {
            if (ev.keyCode == 13) {
                submitText.call(this)
            }
        })
        updateSegmentText(segmentInput, mev.state.state[i])
    }
    mev.element.find("button").bind("click", function (ev) {
        const direction = $(this).attr("data-direction")
        const digit = parseInt($(this).attr("data-digit"))
        var category = mev.element.find("select.cycle-category").prop("value")
        if (category == "") {
            category = null
        }
        if (direction === "prev") {
            mev.component.digit(digit).prev(category)
        } else if (direction === "next") {
            mev.component.digit(digit).next(category)
        } else if (direction === "wipe") {
            mev.component.digit(digit).wipe()
        } else {
            console.error("invalid direction: " + direction)
        }
    })
})

metsv = metrix.onChange("segment", function(mev) {
    for (var i = 0; i < mev.state.state.length; i++) {
        const el = mev.element.find("section[data-digit=\""+i+"\"]")
        el.attr("data-value", mev.state.segment_state[i])
        updateSegment(el)
        updateSegmentText(mev.element.find("div.segment-text input[data-digit=\"" + i + "\"]"), mev.state.state[i])
    }
})