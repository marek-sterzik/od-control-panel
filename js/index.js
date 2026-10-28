import $ from "jquery"
import "./submit-on-change"
import metrix from "./metrix-wrapper"

$(() => {
    const page = $("script#main-script").attr("data-page")
    if (page === "main") {
        import("./main.js")
    }
})

export default metrix
