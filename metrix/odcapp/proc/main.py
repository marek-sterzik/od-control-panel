"""od-control-app-backend — main entry point.

"""

from metrix import client, logger


def metrix_init():
    client.schedule_loop(timeout=1)
    client.start("odcapp.proc.modbus")

def metrix_loop():
    client.broadcast("hello.world", "Hello world!")

