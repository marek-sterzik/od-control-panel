import "./submit-on-change"
import $ from "jquery"

$(() => {
    const page = $("script#main-script").attr("data-page")
    if (page === "main") {
        import("./main.js")
    }
})

