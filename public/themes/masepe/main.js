/*
 * Téma "panel" – integrace s backendem (metrix) a jQuery.
 *
 * Postup změny stavu (scénář 1 z dokumentace):
 *   klik -> požadavek přes metrix.component(...) -> ovládací prvek se změní
 *   až v callbacku metrix.onChange(). Díky tomu panel ukazuje vždy skutečný
 *   stav, i když ho zároveň mění jiný uživatel.
 */
(function ($, metrix) {
    "use strict";

    /* ---------- přepínače (kontrolky) ---------- */

    function renderSwitch(mev) {
        var state = mev.state;
        var $lamp = mev.element.find(".lamp");

        $lamp.toggleClass("on", !!state.state);
        $lamp.toggleClass("blinking", !!state.state && !!state.blink);

        var status = !state.state ? "Vypnuto" : (state.blink ? "Zapnuto · bliká" : "Zapnuto");
        mev.element.find("[data-role=switch-status]").text(status);

        mev.element.find("[data-part]").each(function () {
            var $button = $(this);
            var active = !!state[$button.attr("data-part")];
            $button.toggleClass("active", active);
            $button.attr("aria-pressed", active ? "true" : "false");
        });
    }

    metrix.onLoad("switch", function (mev) {
        mev.element.find("[data-part]").on("click", function (event) {
            event.preventDefault();
            var part = $(this).attr("data-part");
            if (part === "state" || part === "blink") {
                mev.component.togglePart(part);
            }
        });
        renderSwitch(mev);
    });

    metrix.onChange("switch", renderSwitch);

    /* ---------- segmentový displej ---------- */

    function renderSegment(mev) {
        var state = mev.state;

        mev.element.find("[data-digit]").each(function () {
            var $unit = $(this);
            var index = parseInt($unit.attr("data-digit"), 10);
            var bits = state.segment_state[index] || "00000000";
            var character = state.state[index];

            $unit.find(".seg").each(function () {
                var $segment = $(this);
                var segmentIndex = parseInt($segment.attr("data-seg"), 10);
                $segment.toggleClass("lit", bits.charAt(segmentIndex) === "1");
            });

            var text;
            if (character === null || character === undefined) {
                text = "?";
            } else if (character === "") {
                text = "–";
            } else {
                text = character;
            }
            $unit.find("[data-role=readout]").text(text);
        });
    }

    metrix.onLoad("segment", function (mev) {
        function category() {
            var value = mev.element.find("[data-role=category]").val();
            return value ? value : null;
        }

        function digitOf(element) {
            var index = parseInt($(element).closest("[data-digit]").attr("data-digit"), 10);
            return mev.component.digit(index);
        }

        // klik na segment = přepnutí segmentu
        mev.element.on("click", ".seg", function () {
            digitOf(this).toggle(parseInt($(this).attr("data-seg"), 10));
        });

        mev.element.on("keydown", ".seg", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                digitOf(this).toggle(parseInt($(this).attr("data-seg"), 10));
            }
        });

        // tlačítka předchozí / další / zhasnout
        mev.element.on("click", "[data-action]", function () {
            var digit = digitOf(this);
            var action = $(this).attr("data-action");

            if (action === "next") {
                digit.next(category());
            } else if (action === "prev") {
                digit.prev(category());
            } else if (action === "clear") {
                digit.write("");
            }
        });

        renderSegment(mev);
    });

    metrix.onChange("segment", renderSegment);

})(jQuery, metrix);