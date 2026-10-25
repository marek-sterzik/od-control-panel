"""od-control-app-backend — main entry point.

"""

from metrix import client, logger


def metrix_init():
    client.schedule_loop(timeout=1)

def metrix_loop():
    logger("Hello world!")
    client.broadcast("hello.world", "Hello world!")

