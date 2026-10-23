import $ from "jquery"

$(() => {
    $(".submit-on-change").bind("change", function() {
        var el = $(this)
        while (el !== null && el.length > 0 && el.prop("tagName") !== "FORM") {
            el = el.parent()
        }
        if (el === null || el.length == 0) {
            el = null
        }
        if (el !== null) {
            el.submit()
        }
    })
})
