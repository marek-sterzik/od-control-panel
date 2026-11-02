<?php

namespace App\Metrix;

use Exception;
use WebSocket\Middleware\CloseHandler;
use WebSocket\Middleware\PingResponder;
use WebSocket\Client as WebSocketClient;

class Client
{
    public function __construct(private string $metrixUrl = "")
    {
    }

    public function queryStatus(): ?array
    {
        $data = null;
        try {
            $client = new WebSocketClient("ws://metrix:8765");
            $client
                ->addMiddleware(new CloseHandler())
                ->addMiddleware(new PingResponder())
            ;

            $this->send($client, "core", "listen", ["msg_type" => "broadcast", "topic" => "state"]);
            $this->send($client, "query", "state");
            $client->onTick(function($client) {
                $client->close();
            });

            $client->onText(function($client, $connection, $message) use (&$data) {
                $message = json_decode($message->getContent(), true);
                if (!is_array($message) || !isset($message[0]) || !isset($message[1]) || !isset($message[2])) {
                    return;
                }
                if ($message[0] !== "broadcast" || $message[1] !== "state") {
                    return;
                }
                $data = $message[2];
                $client->close();
            });

            $client->start(5);
        } catch (Exception $e) {
        }

        return $data;
    }

    private function send(WebSocketClient $connection, string $msgType, string $topic, mixed $payload = null, ?string $reference = null)
    {
        $message = [$msgType, $topic, $payload, $reference];
        if ($message[3] === null) {
            array_pop($message);
            if ($message[2] === null) {
                array_pop($message);
            }
        }
        $text = json_encode($message);
        $connection->text($text);
    }

}
