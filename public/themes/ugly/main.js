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
