(function ($) {
    "use strict";
 
    const SEGMENT_COUNT = 8;
 
    function syncBlinkAvailability(element) {
        const isOn = element.find('input[data-part="state"]').prop("checked");
        element.find('input[data-part="blink"]').prop("disabled", !isOn);
    }
 
    metrix.onLoad("switch", function (mev) {
        mev.element.find("input[data-part]").on("change", function () {
            const part = $(this).attr("data-part");
            if ($(this).prop("checked")) {
                mev.component.setPart(part);
            } else {
                mev.component.clearPart(part);
            }
            syncBlinkAvailability(mev.element);
        });
        syncBlinkAvailability(mev.element);
    });
 
    metrix.onChange("switch", function (mev) {
        mev.element.find("input[data-part]").each(function () {
            const part = $(this).attr("data-part");
            $(this).prop("checked", !!mev.state[part]);
        });
        syncBlinkAvailability(mev.element);
    });

    function updateSegment(element) {
        const value = String(element.attr("data-value") || "");
        for (let i = 0; i < SEGMENT_COUNT; i++) {
            element.find('[data-segment="' + i + '"]')
                .attr("data-value", value.charAt(i));
        }
    }
 
    function updateSegmentText(input, text) {
        if (text === null || text === undefined || text === "") {
            text = " ";
        }
        if (input.attr("data-expected-value") === text) {
            return;
        }
        input.attr("data-expected-value", text);

        if (!input.is(":focus")) {
            input.val(text.trim());
        }
    }

    metrix.onLoad("segment", function (mev) {
        const el = mev.element;
 
        // Toggle a single segment.
        el.on("click", ".segment [data-segment]", function () {
            const digit = parseInt($(this).closest(".segment").attr("data-digit"), 10);
            const segment = parseInt($(this).attr("data-segment"), 10);
            mev.component.digit(digit).toggle(segment);
        });
 
        // Write typed text. Single submit path: focusout (Enter just blurs the field).
        function submitText(input) {
            const value = input.val();
            const expected = input.attr("data-expected-value");
            const digit = parseInt(input.attr("data-digit"), 10);
            if (value !== "" && value !== expected) {
                mev.component.digit(digit).write(value);
            }
        }
 
        el.on("focusout", ".segment-text input", function () {
            submitText($(this));
        });
        el.on("keydown", ".segment-text input", function (ev) {
            if (ev.key === "Enter") {
                ev.preventDefault();
                this.blur();
            }
        });
        el.on("focusin", ".segment-text input", function () {
            this.select(); // typing replaces the old character
        });
 
        // prev / next / wipe buttons.
        el.on("click", "button[data-direction]", function (ev) {
            ev.preventDefault();
            const direction = $(this).attr("data-direction");
            const digit = parseInt($(this).attr("data-digit"), 10);
            const category = el.find(".cycle-category").val() || null;
 
            if (direction === "prev") {
                mev.component.digit(digit).prev(category);
            } else if (direction === "next") {
                mev.component.digit(digit).next(category);
            } else if (direction === "wipe") {
                mev.component.digit(digit).wipe();
            } else {
                console.error("Neznámý směr:", direction);
            }
        });
        for (let i = 0; i < mev.state.state.length; i++) {
            updateSegment(el.find('.segment[data-digit="' + i + '"]'));
            updateSegmentText(
                el.find('.segment-text input[data-digit="' + i + '"]'),
                mev.state.state[i]
            );
        }
    });
    metrix.onChange("segment", function (mev) {
        for (let i = 0; i < mev.state.state.length; i++) {
            const segment = mev.element.find('.segment[data-digit="' + i + '"]');
            segment.attr("data-value", mev.state.segment_state[i]);
            updateSegment(segment);
            updateSegmentText(
                mev.element.find('.segment-text input[data-digit="' + i + '"]'),
                mev.state.state[i]
            );
        }
    });
})(jQuery);