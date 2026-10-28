<?php

namespace App\Metrix;

use function Amp\Websocket\Client\connect;

class Client
{
    public function __construct(private string $metrixUrl = "")
    {
    }

    public function queryStatus(): ?array
    {
        $connection = connect('ws://metrix:8765/');

        $this->send($connection, "core", "listen", ["msg_type" => "broadcast", "topic" => "state"]);
        $this->send($connection, "query", "state");

        foreach ($connection as $message) {
            $data = json_decode($message->buffer(), true);
            if (!is_array($data) || !isset($data[0]) || !isset($data[1]) || !isset($data[2])) {
                continue;
            }
            if ($data[0] !== "broadcast" || $data[1] !== "state") {
                continue;
            }
            $state = $data[2];
            $connection->close();

            return $state;
        }

        $connection->close();

        return null;
    }

    private function send($connection, string $msgType, string $topic, mixed $payload = null, ?string $reference = null)
    {
        $message = [$msgType, $topic, $payload, $reference];
        if ($message[3] === null) {
            array_pop($message);
            if ($message[2] === null) {
                array_pop($message);
            }
        }
        $text = json_encode($message);
        $connection->sendText($text);
    }

}
