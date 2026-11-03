from metrix import check, validation, logger

command_check = validation.polymorphic("command", {
    "toggle": {},
    "set": {},
    "reset": {},
    "clear": {}
}, ["id"])

class SwitchDriver:
    def watch_values(self, component, state):
        yield component['id'], state['state']

    def get_register(self, component):
        if "register" in component and isinstance(component["register"], str):
            return component["register"]
        else:
            return "relaystate"

    def get_mask(self, component):
        return 1 << component['bit']

    def generate(self, component, registers):
        register = self.get_register(component)
        relaystate = registers['relaystate']
        state = False
        if register in registers:
            mask = self.get_mask(component)
            result = registers[register] & mask
            if result == mask:
                state = True
            elif result != 0:
                state = None

        return {
            "caption": component['caption'] if "caption" in component else None,
            "color": component['color'] if "color" in component else None,
            "state": state
        }

    def generate_write_command(self, component, command, registers):
        register = self.get_register(component)
        relaystate = registers['relaystate']
        if not check(command_check, command):
            logger("got invalid switch command, ignoring", lev = logger.WARN)
            return []
        mask = self.get_mask(component)
        if command['command'] == 'set':
            return [{"register": register, "op": "set", "val": mask}]
        elif command['command'] in ['reset', 'clear']:
            return [{"register": register, "op": "clear", "val": mask}]
        elif command['command'] == 'toggle':
            return [{"register": register, "op": "toggleall", "val": mask}]
        else:
            logger(f"got invalid switch command '{command['command']}', ignoring", lev = logger.WARN)
            return []
