from .state_driver.switch import SwitchDriver
from metrix import check, logger
from schema import Optional

drivers = {
    "switch": SwitchDriver(),
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
            
            self.components.append(component)
            self.componentsById[id] = component


    def generate(self, relaystate):
        state = []
        for component in self.components:
            driverType = component['type']
            driver = drivers[driverType]
            componentState = driver.generate(component, relaystate)
            base = {"id": component['id'], "type": component["type"]}
            componentState = {**base, **componentState}
            state.append(componentState)
        return state

    def generate_write_command(self, commands):
        if not check([object], commands):
            commands = [commands]
        final_commands = []
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

            final_commands += driver.generate_write_command(component, command)
        return final_commands
