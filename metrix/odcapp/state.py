from .state_driver.switch import SwitchDriver
from .state_driver.segment import SegmentDriver
from metrix import check, logger
from schema import Optional

drivers = {
    "switch": SwitchDriver(),
    "segment": SegmentDriver(),
}

class State:
    def __init__(self, components):
        self.components = []
        self.componentsById = {}

        for component in components:
            if not check({"type": str, "id": str, Optional(str): object}, component):
                logger("invalid component, ignoring", lev = logger.WARN)
                continue

            driverType = component['type']
            if driverType not in drivers:
                logger(f"missing driver type {driverType}, ignoring component", lev = logger.WARN)
                continue

            id = component['id']
            if id in self.componentsById:
                logger(f"duplicite component id '{id}', ignoring", lev = logger.WARN)
                continue

            if "enabled" in component and component["enabled"] is not True:
                continue
            
            self.components.append(component)
            self.componentsById[id] = component


    def generate(self, registers):
        state = []
        watch_values = {}
        for component in self.components:
            driverType = component['type']
            driver = drivers[driverType]
            componentState = driver.generate(component, registers)
            base = {"id": component['id'], "type": component["type"]}
            componentState = {**base, **componentState}
            state.append(componentState)
            for key, value in driver.watch_values(component, componentState):
                watch_values[key] = value
        return {"global": state, "watch": watch_values}

    def generate_write_command(self, commands, registers):
        if not check([object], commands):
            commands = [commands]
        final_commands = {}
        for command in commands:
            if not check({"id": str, Optional(str): object}, command):
                logger("invalid state command, ignoring", lev = logger.WARN)
                continue
            id = command['id']
            if not id in self.componentsById:
                logger(f"invalid component id '{id}' in state command, ignoring", lev = logger.WARN)
                continue
            component = self.componentsById[id]
            driverType = component['type']
            driver = drivers[driverType]

            for command in driver.generate_write_command(component, command, registers):
                register = command["register"] if ("register" in command) and (command["register"] is not None) else "relaystate"
                if "register" in command:
                    del command["register"]
                if register in registers:
                    if register not in final_commands:
                        final_commands[register] = []
                    final_commands[register].append(command)
        return final_commands
