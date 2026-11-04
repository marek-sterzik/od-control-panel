from metrix import check, validation, logger

command_check = validation.polymorphic("command", {
    "toggle": {},
    "set": {},
    "reset": {},
    "clear": {}
}, ["id", "part"])

class SwitchDriver:
    def watch_values(self, component, state):
        yield component['id'], state['state']

    def parse_bitinfo(self, bitinfo):
        if isinstance(bitinfo, int):
            bitinfo = ["relaystate", bitinfo]
        if not isinstance(bitinfo, list) or len(bitinfo) != 2:
            bitinfo = ["relaystate", 0]
        if not isinstance(bitinfo[0], str): 
            bitinfo[0] = "relaystate"
        if not isinstance(bitinfo[1], int) or bitinfo[1] < 0 or bitinfo[1] >= 32: 
            bitinfo[1] = 0
        return {"mask": 1 << bitinfo[1], "register": bitinfo[0]}


    def generate(self, component, registers):
        data = {
            "caption": component['caption'] if "caption" in component else None,
            "color": component['color'] if "color" in component else None,
            "parts": list(component['map'].keys()),
        }
        for key, bitinfo in component["map"].items():
            bitinfo_parsed = self.parse_bitinfo(bitinfo)
            mask = bitinfo_parsed["mask"]
            register = bitinfo_parsed["register"]
            state = False
            if register in registers:
                result = registers[register] & mask
                if result == mask:
                    state = True
                elif result != 0:
                    state = None
            data[key] = state
        return data

    def parse_part(self, command, component):
        part = command["part"] if "part" in command else None
        if part is None and len(component["map"]) == 1:
            part = next(iter(component["map"]))
        if not isinstance(part, str):
            return None
        if part not in component["map"]:
            return None
        return part
            

    def generate_write_command(self, component, command, registers):
        if not check(command_check, command):
            logger("got invalid switch command, ignoring", lev = logger.WARN)
            return []
        part = self.parse_part(command, component)
        if part is None:
            logger("got invalid switch part, ignoring", lev = logger.WARN)
            return []
        bitinfo = component['map'][part]
        bitinfo_parsed = self.parse_bitinfo(bitinfo)
        mask = bitinfo_parsed["mask"]
        register = bitinfo_parsed["register"]

        if command['command'] == 'set':
            return [{"register": register, "op": "set", "val": mask}]
        elif command['command'] in ['reset', 'clear']:
            return [{"register": register, "op": "clear", "val": mask}]
        elif command['command'] == 'toggle':
            return [{"register": register, "op": "toggleall", "val": mask}]
        else:
            logger(f"got invalid switch command '{command['command']}', ignoring", lev = logger.WARN)
            return []
