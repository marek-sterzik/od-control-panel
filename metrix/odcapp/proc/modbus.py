"""Modbus counter — main entry point.

"""

import asyncio
from metrix import client, logger, message_type, check
from schema import Or

written_state = None
state = 0
blink_state = 0
blink_bit = 0

def broadcast_state():
    global state
    client.broadcast("relaystate", state)

def broadcast_blinkstate():
    global blink_state
    client.broadcast("blinkstate", blink_state)

def broadcast_regstate():
    global state, blink_state
    client.broadcast("regstate", {"relaystate": state, "blinkstate": blink_state})

def write_state():
    global written_state, blink_bit, state, blink_state
    new_written_state = state
    if blink_bit != 0:
        new_written_state = new_written_state & ~blink_state
    if new_written_state != written_state:
        written_state = new_written_state
        client.write("relays", written_state)

async def metrix_init():
    client.listen(message_type.WRITE, "relaystate")
    client.listen(message_type.QUERY, "relaystate")
    client.listen(message_type.WRITE, "blinkstate")
    client.listen(message_type.QUERY, "blinkstate")
    client.listen(message_type.WRITE, "regstate")
    client.listen(message_type.QUERY, "regstate")
    port = client.get_config("port", None, Or(None, str))
    if port is not None:
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
        await asyncio.sleep(1)
    else:
        logger(f"running without device")

    write_state()
    broadcast_state()
    broadcast_regstate()
    client.schedule_loop(timeout = 0.3)


def metrix_loop():
    global blink_bit
    blink_bit = 0 if blink_bit == 1 else 1
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
    
def apply_commands(st, payload):
    for command in parse_payload_commands(payload):
        if command['op'] == 'write':
            st = command['val'] & 0xffffffff
        elif command['op'] == 'set':
            st = (st | command['val']) & 0xffffffff
        elif command['op'] == 'clear':
            st = (st & (~ command['val'])) & 0xffffffff
        elif command['op'] == 'toggle':
            st = (st ^ command['val']) & 0xffffffff
        elif command['op'] == 'toggleall':
            mask = command['val'] & 0xffffffff
            if st & mask == mask:
                st = (st & (~ mask)) & 0xffffffff
            else:
                st = st | mask
        else:
            logger(f"invalid write command to relaystate: {command['op']}", lev=logger.WARN)
    return st

def modify_blinkstate(payload):
    global blink_state
    blink_state = apply_commands(blink_state, payload)
    write_state()
    broadcast_blinkstate()
    broadcast_regstate()

def modify_state(payload):
    global state
    state = apply_commands(state, payload)
    write_state()
    broadcast_state()
    broadcast_regstate()

def metrix_recv(msg):
    if msg.has_type(message_type.WRITE) and msg.has_topic("relaystate"):
        modify_state(msg.payload)
    elif msg.has_type(message_type.QUERY) and msg.has_topic("relaystate"):
        broadcast_state()
    elif msg.has_type(message_type.WRITE) and msg.has_topic("blinkstate"):
        modify_blinkstate(msg.payload)
    elif msg.has_type(message_type.QUERY) and msg.has_topic("blinkstate"):
        broadcast_blinkstate()
    elif msg.has_type(message_type.WRITE) and msg.has_topic("regstate"):
        logger("cannot modify regstate, try modyfing either relaystate or blinkstate", lev=logger.WARN)
    elif msg.has_type(message_type.QUERY) and msg.has_topic("regstate"):
        broadcast_regstate()
    else:
        logger(f"got invalid message: {msg.to_string()}", lev=logger.WARN)

