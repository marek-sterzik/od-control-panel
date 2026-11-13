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



metrix.onChange("segment", function(mev) {

    for (var i = 0; i < mev.state.state.length; i++) {

        const el = mev.element.find("section[data-digit=\""+i+"\"]")

        el.attr("data-value", mev.state.segment_state[i])

        updateSegment(el)

        updateSegmentText(mev.element.find("div.segment-text input[data-digit=\"" + i + "\"]"), mev.state.state[i])

    }

})



// ===================================================
// EASTER EGG LOGIC
// ===================================================

window.runRainbow = function() {
    // 1. Spuštění Konfet
    if (typeof confetti === "function") {
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 }
        });
        setTimeout(function() {
            confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } });
            confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } });
        }, 200);
    }

    // 2. Duhová karta
    var card = document.querySelector('.main-card');
    if (card) {
        card.style.transition = 'all 0.5s ease';
        card.style.boxShadow = '0 0 50px #ff007f, 0 0 50px #00c8ff, 0 0 50px #ffaa00';
    }

    // 3. Protočení křečka přes CSS třídu
    var mascot = document.querySelector('.mascot-img');
    if (mascot) {
        mascot.classList.add('spin-rainbow');
        setTimeout(function() {
            mascot.classList.remove('spin-rainbow');
        }, 1200);
    }

    // 4. Alert okno
    setTimeout(function() {
        alert('🌈 Nalezl jsi tajný duhový režim Sunshine & Rainbows! ✨');
    }, 400);
};

// Sledování napsání slova "rainbow"
var inputHistory = '';
document.addEventListener('keydown', function(e) {
    inputHistory += e.key.toLowerCase();
    if (inputHistory.length > 15) {
        inputHistory = inputHistory.substring(inputHistory.length - 15);
    }
    if (inputHistory.endsWith('rainbow')) {
        window.runRainbow();
        inputHistory = '';
    }
});