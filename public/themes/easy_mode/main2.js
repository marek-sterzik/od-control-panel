function getSwitchId(mev, $el) {
    return ($el && $el.attr("data-part")) || (mev.state && mev.state.id) || mev.componentId;
}

function getLampColorClass(partName) {
    if (partName === "blue") return "active-blue";
    if (partName === "red") return "active-red";
    if (partName === "green") return "active-green";
    if (partName === "yellow") return "active-yellow";
    return "active-default";
}

function shouldLampBlink(stateObj) {
    if (!stateObj) return false;
    return Boolean(
        stateObj.blink ||
        stateObj.blinking ||
        stateObj.pulse ||
        stateObj.flash ||
        stateObj.mode === "blink"
    );
}

function syncBlinkButton(mev, partName, blinkEnabled) {
    const btn = mev.element.find('.blink-toggle[data-part="' + partName + '"]');
    if (!btn.length) return;
    btn.attr("data-blink", blinkEnabled ? "1" : "0");
    btn.toggleClass("active is-blinking btn-warning", blinkEnabled);
    btn.toggleClass("btn-outline-secondary", !blinkEnabled);
}

function applySwitchState(mev, stateOverride) {
    const stateObj = stateOverride || mev.state;
    if (!stateObj) return;

    const isChecked = Boolean(stateObj.state);
    const blinkEnabled = shouldLampBlink(stateObj);
    const customColor = stateObj.color || null;

    mev.element.find("input.switch-input").each(function() {
        const $input = $(this);
        const partName = getSwitchId(mev, $input);
        $input.prop("checked", isChecked);
        syncBlinkButton(mev, partName, blinkEnabled);

        const indicator = mev.element.find('.indicator-lamp[data-switch-id="' + partName + '"]');
        if (indicator.length) {
            indicator.removeClass("active-blue active-red active-green active-yellow active-default blink");
            indicator.css({
                "background-color": "",
                "box-shadow": ""
            });

            if (isChecked) {
                indicator.addClass(getLampColorClass(partName));
                if (customColor) {
                    indicator.css({
                        "background-color": customColor,
                        "box-shadow": "0 0 10px " + customColor + ", inset 0 0 3px rgba(255, 255, 255, 0.5)"
                    });
                }
                if (blinkEnabled) {
                    indicator.addClass("blink");
                }
            }
        }
    });
}

function sendSwitchState(mev, checked) {
    if (!mev.component) return;
    if (checked) {
        if (typeof mev.component.setPart === "function") mev.component.setPart("state");
        else if (typeof mev.component.set === "function") mev.component.set();
        else if (typeof mev.component.toggle === "function") mev.component.toggle();
    } else {
        if (typeof mev.component.clearPart === "function") mev.component.clearPart("state");
        else if (typeof mev.component.clear === "function") mev.component.clear();
        else if (typeof mev.component.toggle === "function") mev.component.toggle();
    }
}

function sendBlinkState(mev, blinkEnabled) {
    if (!mev.component) return;
    if (blinkEnabled) {
        if (typeof mev.component.setPart === "function") mev.component.setPart("blink");
    } else {
        if (typeof mev.component.clearPart === "function") mev.component.clearPart("blink");
    }
}

metrix.onLoad("switch", function(mev) {
    const compId = getSwitchId(mev);
    console.log("onLoad switch:", compId, mev.state);
    applySwitchState(mev);

    mev.element.find("input.switch-input").off("click change").on("change", function() {
        const checked = $(this).prop("checked");
        const partName = getSwitchId(mev, $(this));
        const currentBlink = mev.element.find('.blink-toggle[data-part="' + partName + '"]').attr("data-blink") === "1";
        console.log("switch change:", partName, "checked =", checked);
        applySwitchState(mev, {
            state: checked,
            blink: currentBlink,
            color: mev.state ? mev.state.color : null
        });
        sendSwitchState(mev, checked);
    });

    mev.element.find(".blink-toggle").off("click").on("click", function() {
        const $btn = $(this);
        const partName = getSwitchId(mev, $btn);
        const nextBlink = $btn.attr("data-blink") !== "1";
        const isChecked = mev.element.find('input.switch-input[data-part="' + partName + '"]').prop("checked");
        console.log("blink toggle click:", partName, "blink =", nextBlink);
        applySwitchState(mev, {
            state: isChecked,
            blink: nextBlink,
            color: mev.state ? mev.state.color : null
        });
        sendBlinkState(mev, nextBlink);
    });
});

metrix.onChange("switch", function(mev) {
    console.log("onChange switch:", getSwitchId(mev), mev.state);
    applySwitchState(mev);
});

function updateSegment(element, explicitValue) {
    const value = (typeof explicitValue === "string" && explicitValue.length >= 8)
        ? explicitValue
        : (element.attr("data-value") || "00000000");

    element.attr("data-value", value);

    for (var i = 0; i < 8; i++) {
        const bit = value.substr(i, 1) === "1" ? "1" : "0";
        element.find('[data-segment="' + i + '"]').attr("data-value", bit);
    }
}

function updateSegmentText(element, text) {
    if (text === null || text === undefined) {
        text = "";
    } else if (text === "") {
        text = " ";
    }
    const oldText = element.attr("data-expected-value");
    if (oldText !== text) {
        element.attr("data-expected-value", text);
        element.prop("value", text);
    }
}

metrix.onLoad("segment", function(mev) {
    console.log("onLoad segment:", mev.state && mev.state.id, mev.state);
    const stateObj = mev.state || {};
    const stateList = Array.isArray(stateObj.state) ? stateObj.state : [];
    const segStateList = Array.isArray(stateObj.segment_state) ? stateObj.segment_state : [];
    const digitCount = Math.max(stateList.length, segStateList.length, mev.element.find("section.segment").length);

    for (var i = 0; i < digitCount; i++) {
        const el = mev.element.find('section[data-digit="' + i + '"]');
        el.find("div, span").off("click").on("click", function(ev) {
            ev.stopPropagation();
            const digit = parseInt($(this).closest("section.segment").attr("data-digit"), 10);
            const segment = parseInt($(this).attr("data-segment"), 10);
            console.log("segment click:", { digit, segment });
            if (!Number.isNaN(digit) && !Number.isNaN(segment) && mev.component && typeof mev.component.digit === "function") {
                mev.component.digit(digit).toggle(segment);
            }
        });
        updateSegment(el, segStateList[i]);

        const segmentInput = mev.element.find('div.segment-text input[data-digit="' + i + '"]');
        const submitText = function() {
            const value = $(this).prop("value");
            const digit = parseInt($(this).attr("data-digit"), 10);
            const originalValue = $(this).attr("data-expected-value");
            if (value !== "" && value !== originalValue && mev.component && typeof mev.component.digit === "function") {
                mev.component.digit(digit).write(value);
            }
        };
        segmentInput.off("blur keydown").on("blur", submitText).on("keydown", function(ev) {
            if (ev.keyCode === 13) {
                submitText.call(this);
            }
        });
        updateSegmentText(segmentInput, stateList[i]);
    }

    mev.element.find("button").not(".blink-toggle").off("click").on("click", function() {
        const direction = $(this).attr("data-direction");
        const digit = parseInt($(this).attr("data-digit"), 10);
        console.log("segment button click:", { direction, digit });
        var category = mev.element.find("select.cycle-category").prop("value");
        if (!category) {
            category = null;
        }
        if (!mev.component || typeof mev.component.digit !== "function") return;
        if (direction === "prev") {
            mev.component.digit(digit).prev(category);
        } else if (direction === "next") {
            mev.component.digit(digit).next(category);
        } else if (direction === "wipe") {
            mev.component.digit(digit).wipe();
        } else {
            console.error("invalid direction: " + direction);
        }
    });
});

metrix.onChange("segment", function(mev) {
    console.log("onChange segment:", mev.state && mev.state.id, mev.state);
    const stateObj = mev.state || {};
    const stateList = Array.isArray(stateObj.state) ? stateObj.state : [];
    const segStateList = Array.isArray(stateObj.segment_state) ? stateObj.segment_state : [];
    const digitCount = Math.max(stateList.length, segStateList.length, mev.element.find("section.segment").length);

    for (var i = 0; i < digitCount; i++) {
        const el = mev.element.find('section[data-digit="' + i + '"]');
        updateSegment(el, segStateList[i]);
        updateSegmentText(
            mev.element.find('div.segment-text input[data-digit="' + i + '"]'),
            stateList[i]
        );
    }
});