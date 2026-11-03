from metrix import check, validation, logger
from schema import And, Or, Optional

segment_validator = And(int, validation.range(0, 7))

command_check = validation.polymorphic("command", {
    "toggle": {"segment": segment_validator},
    "set": {"segment": segment_validator},
    "reset": {"segment": segment_validator},
    "clear": {"segment": segment_validator},
    "write": {"string": str},
    "next": {Optional("category"): Or(None, str)},
    "prev": {Optional("category"): Or(None, str)},
    "wipe": {}
}, ["id", "digit"])

characters = [
    ("0", "1110111", ["digit", "hex"]),
    ("1", "0010010", ["digit", "hex"]),
    ("2", "1011101", ["digit", "hex"]),
    ("3", "1011011", ["digit", "hex"]),
    ("4", "0111010", ["digit", "hex"]),
    ("5", "1101011", ["digit", "hex"]),
    ("6", "1101111", ["digit", "hex"]),
    ("7", "1010010", ["digit", "hex"]),
    ("8", "1111111", ["digit", "hex"]),
    ("9", "1111011", ["digit", "hex"]),
    ("A", "1111110", ["letter", "upper", "hex", "letteropt"]),
    ("a", "1011111", ["letter", "lower"]),
    ("b", "0101111", ["letter", "lower", "hex", "letteropt"]),
    ("c", "0001101", ["letter", "lower", "hex", "letteropt"]),
    ("C", "1100101", ["letter", "upper"]),
    ("d", "0011111", ["letter", "lower", "hex", "letteropt"]),
    ("E", "1101101", ["letter", "upper", "hex", "letteropt"]),
    ("F", "1101100", ["letter", "upper", "hex", "letteropt"]),
    ("G", "1100111", ["letter", "upper", "letteropt"]),
    ("H", "0111110", ["letter", "upper", "letteropt"]),
    ("h", "0101110", ["letter", "lower"]),
    ("I", "0100100", ["letter", "upper", "letteropt"]),
    ("i", "0000100", ["letter", "lower"]),
    ("J", "0010111", ["letter", "upper", "letteropt"]),
    ("L", "0100101", ["letter", "upper", "letteropt"]),
    ("n", "0001110", ["letter", "lower", "letteropt"]),
    ("o", "0001111", ["letter", "lower", "letteropt"]),
    ("P", "1111100", ["letter", "upper", "letteropt"]),
    ("r", "0001100", ["letter", "lower", "letteropt"]),
    ("t", "0101101", ["letter", "lower", "letteropt"]),
    ("U", "0110111", ["letter", "upper", "letteropt"]),
    ("u", "0000111", ["letter", "lower"]),
    ("Y", "0111100", ["letter", "upper", "letteropt"]),
]

characters_info = {}
segment_to_characters = {}
first_char = None

old_char = None
for character, segment, category in characters:
    segment_to_characters[segment] = character
    characters_info[character] = {"segment": segment, "next": None, "prev": old_char, "category": category}
    if old_char is None:
        first_char = character
    else:
        characters_info[old_char]["next"] = character
    old_char = character
if old_char is not None:
    characters_info[old_char]["next"] = first_char
    characters_info[first_char]["prev"] = old_char

def relaystate_to_segment(relaystate, segment_def):
    segment = ""
    for bit in segment_def:
        segment += "1" if (((1 << bit) & relaystate) != 0) else "0"
    return segment
        
def segstate_to_state(segstate):
    main_segment = segstate[0:7]
    point = segstate[7:8]
    if len(main_segment) != 7 or len(point) != 1:
        return None
    if main_segment == "0000000":
        char = ""
    elif main_segment in segment_to_characters:
        char = segment_to_characters[main_segment]
    else:
        return None
    if point != "0":
        char += "."
    return char

def lookup_character(char):
    if char in characters_info:
        return char
    if char.lower() in characters_info:
        return char.lower()
    if char.upper() in characters_info:
        return char.upper()
    return char

def segstate_from_string(string):
    string = string.strip()
    if (len(string) > 2):
        return None
    if (string == ""):
        return "00000000"
    elif string == ".":
        return "00000001"
    dot = "0"
    if (len(string) == 2):
        if (string[1:2] != "."):
            return None
        dot = "1"
        string = string[0:1]
    string = lookup_character(string)
    if string not in characters_info:
        return None
    return characters_info[string]["segment"] + dot

def segstate_to_numbers(segstate, bits):
    numSet = 0
    numClear = 0
    for i in range(0, 8):
        bit = bits[i]
        state = True if segstate[i:i+1] == "1" else False
        if state:
            numSet = numSet | (1 << bit)
        else:
            numClear = numClear | (1 << bit)
    return numSet, numClear

def cycle_char(char, direction):
    if char is None:
        return first_char
    if char == "":
        return first_char
    if char == ".":
        return first_char + "."
    suffix = char[1:]
    char = lookup_character(char[0:1])
    if char not in characters_info:
        return first_char + suffix
    return characters_info[char][direction] + suffix

def has_category(char, category):
    if char == "" or char == ".":
        return False
    char = char[0:1]
    if char not in characters_info:
        return False
    if category not in characters_info[char]["category"]:
        return False
    return True

def cycle_char_category(char, direction, category):
    char = cycle_char(char, direction)
    if char is None:
        return None
    original_char = char
    while not has_category(char, category):
        char = cycle_char(char, direction)
        if char == original_char:
            return None
    return char


class SegmentDriver:
    def watch_values(self, component, state):
        i = 0
        for segment_def in component['segments']:
            id_base = component["id"] + "." + str(i + 1) + "."
            yield id_base + "segstate", state["segment_state"][i]
            yield id_base + "character", state["state"][i]
            i += 1


    def generate(self, component, registers):
        relaystate = registers['relaystate']
        segment_state = []
        state = []
        for segment_def in component["segments"]:
            segstate = relaystate_to_segment(relaystate, segment_def)
            segment_state.append(segstate)
            state.append(segstate_to_state(segstate))
        return {
            "caption": component['caption'] if "caption" in component else None,
            "state": state,
            "segment_state": segment_state
        }

    def check_valid_command(self, command, component):
        if not check(command_check, command):
            return False
        if not check(int, command.get("digit", None)):
            return False
        if command["digit"] < 0 or command["digit"] >= len(component["segments"]):
            return False
        return True

    def generate_write_command(self, component, command, registers):
        relaystate = registers['relaystate']
        if not self.check_valid_command(command, component):
            logger("got invalid switch command, ignoring", lev = logger.WARN)
            return []
        digit = command['digit']
        if command['command'] in ["set", "reset", "clear", "toggle"]:
            segment = command['segment']
            bit = component['segments'][digit][segment]
            num = 1 << bit
            if command['command'] == 'set':
                return [{"op": "set", "val": num}]
            elif command['command'] in ['reset', 'clear']:
                return [{"op": "clear", "val": num}]
            elif command['command'] == 'toggle':
                return [{"op": "toggle", "val": num}]
            else:
                logger(f"got invalid segment command '{command['command']}', ignoring", lev = logger.WARN)
                return []
        elif command['command'] == 'write':
            segment_state = segstate_from_string(command['string'])
            if segment_state is None:
                return []
            numSet, numClear = segstate_to_numbers(segment_state, component["segments"][digit])
            return [{"op": "set", "val": numSet}, {"op": "clear", "val": numClear}]
        elif command['command'] in ['next', "prev"]:
            segstate = relaystate_to_segment(relaystate, component["segments"][digit])
            char = segstate_to_state(segstate)
            category = command['category'] if ('category' in command) and command['category'] is not None else 'hex'
            char = cycle_char_category(char, command["command"], category)
            if char is None:
                return []
            segstate = segstate_from_string(char)
            if segstate is None:
                return []
            numSet, numClear = segstate_to_numbers(segstate, component["segments"][digit])
            return [{"op": "set", "val": numSet}, {"op": "clear", "val": numClear}]
        elif command['command'] == 'wipe':
            segstate = "00000000"
            numSet, numClear = segstate_to_numbers(segstate, component["segments"][digit])
            return [{"op": "clear", "val": numClear}]
        else:
            logger(f"got invalid segment command '{command['command']}', ignoring", lev = logger.WARN)
            return []
