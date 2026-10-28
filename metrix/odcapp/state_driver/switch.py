from metrix import check, validation, logger

command_check = validation.polymorphic("command", {
    "toggle": {},
    "set": {},
    "reset": {},
    "clear": {}
}, ["id"])

class SwitchDriver:
    def generate(self, component, relaystate):
        state = False
        if (relaystate & (1 << component['bit'])) != 0:
            state = True
        return {
            "caption": component['caption'] if "caption" in component else None,
            "color": component['color'] if "color" in component else None,
            "state": state
        }

    def generate_write_command(self, component, command):
        if not check(command_check, command):
            logger("got invalid switch command, ignoring", lev = logger.WARN)
            return []
        num = 1 << component['bit']
        if command['command'] == 'set':
            return [{"op": "set", "val": num}]
        elif command['command'] in ['reset', 'clear']:
            return [{"op": "clear", "val": num}]
        elif command['command'] == 'toggle':
            return [{"op": "toggle", "val": num}]
        else:
            logger(f"got invalid switch command '{command['command']}', ignoring", lev = logger.WARN)
            return []
