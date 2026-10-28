"""Modbus counter — main entry point.

"""

import asyncio
from metrix import client, logger, message_type, check


state = 0

def broadcast_state():
    client.broadcast("relaystate", state)

def write_state():
    client.write("relays", state)
    broadcast_state()

async def metrix_init():
    port = client.get_config("port", None, str)
    if port is None:
        logger("cannot find proper port", lev = logger.WARN)
        client.terminate()
    logger(f"running at device {port}")
    client.schedule_loop(timeout=1)
    client.message("_modbus", {
        "command": "busadd",
        "busid": "relays",
        "type": "serial",
        "port": port,
        "baudrate": 9600,
    })
    client.message("_modbus", {
        "command": "add",
        "busid": "relays",
        "topic": "relays",
        "device": 0x01,
        "type": {"type": "coils_num", "count": 32},
        "write_mode": "w",
        "addr": 0,
        "read_interval": None,
    })
    client.listen(message_type.WRITE, "relaystate")
    client.listen(message_type.QUERY, "relaystate")
    await asyncio.sleep(1)


    write_state()

def parse_payload_commands(payload):
    if not check([object], payload):
        payload = [payload]
    for command in payload:
        if check(int, command):
            command = {"op": "write", "val": command}

        if not check({"op": str, "val": int}, command) or command['val'] < 0 or command['val'] > 0xffffffff:
            logger("got invalid write command to relaystate", lev=logger.WARN)
            continue

        yield command
    

def modify_state(payload):
    global state

    for command in parse_payload_commands(payload):
        if command['op'] == 'write':
            state = command['val'] & 0xffffffff
        elif command['op'] == 'set':
            state = (state | command['val']) & 0xffffffff
        elif command['op'] == 'clear':
            state = (state & (~ command['val'])) & 0xffffffff
        elif command['op'] == 'toggle':
            state = (state ^ command['val']) & 0xffffffff
        else:
            logger(f"invalid write command to relaystate: {command['op']}", lev=logger.WARN)
            
    write_state()

def metrix_recv(msg):
    if msg.has_type(message_type.WRITE) and msg.has_topic("relaystate"):
        modify_state(msg.payload)
    elif msg.has_type(message_type.QUERY) and msg.has_topic("relaystate"):
        broadcast_state()
    else:
        logger(f"got invalid message: {msg.to_string()}", lev=logger.WARN)

