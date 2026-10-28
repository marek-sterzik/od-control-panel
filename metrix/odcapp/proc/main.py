"""od-control-app-backend — main entry point.

"""

from metrix import client, logger, message_type

from ..state import State

state = None

def metrix_init():
    global state
    state = State(client.get_config("components", [], [object]))
    client.start("odcapp.proc.modbus")
    client.listen(message_type.BROADCAST, "relaystate")
    client.listen(message_type.QUERY, "state")
    client.listen(message_type.WRITE, "state")
    client.schedule_loop(timeout=10)

def metrix_loop():
    client.query("relaystate")



def metrix_recv(msg):
    global state
    if msg.has_type(message_type.BROADCAST) and msg.has_topic("relaystate"):
        client.broadcast("state", state.generate(msg.payload))
    elif msg.has_type(message_type.QUERY) and msg.has_topic("state"):
        client.query("relaystate")
    elif msg.has_type(message_type.WRITE) and msg.has_topic("state"):
        try:
            command = state.generate_write_command(msg.payload)
        except Exception as e:
            logger(f"invalid state write operation: {e}", lev=logger.ERR)
            return
        client.write("relaystate", command)
    else:
        logger(f"got invalid message: {msg.to_string()}", lev=logger.WARN)

