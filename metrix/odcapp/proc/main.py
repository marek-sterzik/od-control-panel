"""od-control-app-backend — main entry point.

"""

from metrix import client, logger, message_type

from ..state import State

state = None
registers = {"relaystate": 0, "blinkstate": 0}

def metrix_init():
    global state, registers
    state = State(client.get_config("components", [], [object]))
    client.start("odcapp.proc.modbus")
    client.listen(message_type.BROADCAST, "regstate")
    client.listen(message_type.QUERY, "state")
    client.listen(message_type.WRITE, "state")
    client.schedule_loop(timeout=10)

    final_state = state.generate(registers)
    for key in final_state['watch'].keys():
        client.publisher.publish("state." + key)

def metrix_loop():
    client.query("regstate")


def procstate():
    global state, registers
    final_state = state.generate(registers)
    client.broadcast("state", final_state['global'])
    for key, value in final_state['watch'].items():
        client.broadcast("state." + key, value)

def metrix_recv(msg):
    global state, registers
    if msg.has_type(message_type.BROADCAST) and msg.has_topic("regstate"):
        registers = msg.payload
        procstate()
    elif msg.has_type(message_type.QUERY) and (msg.has_topic("state") or msg.topic.startswith("state.")):
        client.query("regstate")
    elif msg.has_type(message_type.WRITE) and msg.has_topic("state"):
        try:
            commands = state.generate_write_command(msg.payload, registers)
        except Exception as e:
            logger(f"invalid state write operation: {e}", lev=logger.ERR)
            return
        for register, command in commands.items():
            if len(command) > 0:
                client.write(register, command)
    else:
        logger(f"got invalid message: {msg.to_string()}", lev=logger.WARN)

