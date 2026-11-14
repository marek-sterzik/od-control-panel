// ==========================================
// SWITCH KOMPONENTY
// ==========================================

metrix.onChange("switch", function(mev) {
    mev.element.find("input").each(function() {
        const part = $(this).attr("data-part");
        if (part && mev.state[part] !== undefined) {
            $(this).prop("checked", mev.state[part]);
        }
    });
});

metrix.onLoad("switch", function(mev) {
    mev.element.find("input").on("click", function(ev) {
        const part = $(this).attr("data-part");
        if ($(this).prop("checked")) {
            mev.component.setPart(part);
        } else {
            mev.component.clearPart(part);
        }
        ev.preventDefault();
        return false;
    });
});

// ==========================================
// SEGMENTOVÝ DISPLEJ (Aero Realtime)
// ==========================================

function updateSegment(element, segmentStateStr) {
    if (!segmentStateStr) return;
    element.attr("data-value", segmentStateStr);
    for (var i = 0; i < 8; i++) {
        const enabled = segmentStateStr.substr(i, 1);
        element.find('[data-segment="' + i + '"]').attr("data-value", enabled);
    }
}

function updateSegmentText(element, text) {
    if (text === null) {
        text = "";
    } else if (text === "") {
        text = " ";
    }
    const oldText = element.attr("data-expected-value");
    if (oldText !== text) {
        element.attr("data-expected-value", text);
        element.val(text);
    }
}

metrix.onLoad("segment", function(mev) {
    for (var i = 0; i < mev.state.state.length; i++) {
        const el = mev.element.find('section[data-digit="' + i + '"]');
        
        // Kliknutí na jednotlivé dílky 7-segmentovky
        el.find("div, span").on("click", function() {
            const digit = parseInt($(this).closest("section").attr("data-digit"));
            const segment = parseInt($(this).attr("data-segment"));
            if (!isNaN(digit) && !isNaN(segment)) {
                mev.component.digit(digit).toggle(segment);
            }
        });

        // Inicializace stavu segmentu
        if (mev.state.segment_state && mev.state.segment_state[i]) {
            updateSegment(el, mev.state.segment_state[i]);
        }

        // Textové políčko pro přímý zápis
        const segmentInput = mev.element.find('div.segment-text input[data-digit="' + i + '"]');
        const submitText = function() {
            const value = $(this).val();
            const digit = parseInt($(this).attr("data-digit"));
            const originalValue = $(this).attr("data-expected-value");
            if (value !== "" && value !== originalValue) {
                mev.component.digit(digit).write(value);
            }
        };

        // Opraveno: submitText (dříve zde byl překlep submitTest)
        segmentInput.on("blur", submitText);
        segmentInput.on("keydown", function(ev) {
            if (ev.keyCode === 13) {
                submitText.call(this);
            }
        });

        updateSegmentText(segmentInput, mev.state.state[i]);
    }

    // Ovládací tlačítka (-, koš, +)
    mev.element.find("button[data-direction]").on("click", function() {
        const direction = $(this).attr("data-direction");
        const digit = parseInt($(this).attr("data-digit"));
        var category = mev.element.find("select.cycle-category").val();
        if (category === "") {
            category = null;
        }
        if (direction === "prev") {
            mev.component.digit(digit).prev(category);
        } else if (direction === "next") {
            mev.component.digit(digit).next(category);
        } else if (direction === "wipe") {
            mev.component.digit(digit).wipe();
        } else {
            console.error("Invalid direction: " + direction);
        }
    });
});

metrix.onChange("segment", function(mev) {
    for (var i = 0; i < mev.state.state.length; i++) {
        const el = mev.element.find('section[data-digit="' + i + '"]');
        if (el.length && mev.state.segment_state && mev.state.segment_state[i]) {
            updateSegment(el, mev.state.segment_state[i]);
        }
        const inputEl = mev.element.find('div.segment-text input[data-digit="' + i + '"]');
        if (inputEl.length) {
            updateSegmentText(inputEl, mev.state.state[i]);
        }
    }
});