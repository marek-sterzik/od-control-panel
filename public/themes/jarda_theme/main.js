function updateSwitch(mev) {
    mev.element.find("input[data-part]").each(function () {
        var part = $(this).attr("data-part")
        $(this).prop("checked", mev.state[part])
    })
    mev.element.toggleClass("is-on", Boolean(mev.state.state))
    mev.element.toggleClass("is-blinking", Boolean(mev.state.blink))
}

metrix.onLoad("switch", function (mev) {
    mev.element.find("input[data-part]").on("click", function (event) {
        var part = $(this).attr("data-part")
        if ($(this).prop("checked")) {
            mev.component.setPart(part)
        } else {
            mev.component.clearPart(part)
        }
        event.preventDefault()
    })
    updateSwitch(mev)
})

metrix.onChange("switch", updateSwitch)

function updateSegment(digitElement) {
    var value = digitElement.attr("data-value")
    for (var i = 0; i < 8; i++) {
        digitElement.find('[data-segment="' + i + '"]').attr("data-value", value.charAt(i))
    }
}

function updateSegmentText(input, text) {
    var value = text === null ? "" : text
    if (input.attr("data-expected-value") !== value) {
        input.attr("data-expected-value", value)
        input.val(value)
    }
}

function updateSegmentDisplay(mev) {
    for (var i = 0; i < mev.state.state.length; i++) {
        var digitElement = mev.element.find('section.segment[data-digit="' + i + '"]')
        digitElement.attr("data-value", mev.state.segment_state[i])
        updateSegment(digitElement)

        var input = mev.element.find('.segment-text input[data-digit="' + i + '"]')
        updateSegmentText(input, mev.state.state[i])
    }
}

metrix.onLoad("segment", function (mev) {
    mev.element.find("section.segment [data-segment]").on("click", function () {
        var digit = parseInt($(this).parent().attr("data-digit"), 10)
        var segment = parseInt($(this).attr("data-segment"), 10)
        mev.component.digit(digit).toggle(segment)
    })

    mev.element.find(".segment-text input").on("blur", function () {
        var input = $(this)
        var digit = parseInt(input.attr("data-digit"), 10)
        var value = input.val()
        if (value === input.attr("data-expected-value")) {
            return
        }
        if (value === "") {
            mev.component.digit(digit).wipe()
        } else {
            mev.component.digit(digit).write(value)
        }
    }).on("keydown", function (event) {
        if (event.keyCode === 13) {
            $(this).trigger("blur")
        }
    })

    mev.element.find("button[data-direction]").on("click", function () {
        var button = $(this)
        var direction = button.attr("data-direction")
        var digit = parseInt(button.attr("data-digit"), 10)
        var category = mev.element.find("select.cycle-category").val() || null

        if (direction === "prev") {
            mev.component.digit(digit).prev(category)
        } else if (direction === "next") {
            mev.component.digit(digit).next(category)
        } else if (direction === "wipe") {
            mev.component.digit(digit).wipe()
        }
    })

    updateSegmentDisplay(mev)
})

metrix.onChange("segment", updateSegmentDisplay)

