"""od-control-app-backend — main entry point.

"""

from metrix import client, logger, message_type

from ..state import State

state = None
relaystate = 0

def metrix_init():
    global state
    state = State(client.get_config("components", [], [object]))
    client.start("odcapp.proc.modbus")
    client.listen(message_type.BROADCAST, "relaystate")
    client.listen(message_type.QUERY, "state")
    client.listen(message_type.WRITE, "state")
    client.schedule_loop(timeout=10)

    final_state = state.generate(0)
    for key in final_state['watch'].keys():
        client.publisher.publish("state." + key)

def metrix_loop():
    client.query("relaystate")



def metrix_recv(msg):
    global state, relaystate
    if msg.has_type(message_type.BROADCAST) and msg.has_topic("relaystate"):
        relaystate = msg.payload
        final_state = state.generate(msg.payload)
        client.broadcast("state", final_state['global'])
        for key, value in final_state['watch'].items():
            client.broadcast("state." + key, value)
    elif msg.has_type(message_type.QUERY) and (msg.has_topic("state") or msg.topic.startswith("state.")):
        client.query("relaystate")
    elif msg.has_type(message_type.WRITE) and msg.has_topic("state"):
        try:
            command = state.generate_write_command(msg.payload, relaystate)
        except Exception as e:
            logger(f"invalid state write operation: {e}", lev=logger.ERR)
            return
        client.write("relaystate", command)
    else:
        logger(f"got invalid message: {msg.to_string()}", lev=logger.WARN)

