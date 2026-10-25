"""Modbus counter — main entry point.

"""

import asyncio
from metrix import client, logger, message


state = 0

def write_state():
    client.write("relays", state)

async def metrix_init():
    client.schedule_loop(timeout=1)
    client.message("_modbus", {
        "command": "busadd",
        "busid": "relays",
        "type": "serial",
        "port": "/dev/ttyACM0",
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
    client.listen(message.WRITE, "relaystate")
    client.listen(message.QUERY, "relaystate")

    await asyncio.sleep(1)

    write_state()


#num = 0

#def metrix_loop():
#    global num
#    logger(f"write: {num}")
#    client.write("relays", num | 0x80000000)
#    num += 1

