#!/usr/bin/env php
<?php

use Symfony\Component\PasswordHasher\Hasher\PasswordHasherFactory;
use Symfony\Component\Yaml\Yaml;

$autoloader = dirname(__DIR__) . "/vendor/autoload.php";
if (!file_exists($autoloader)) {
    exit(0);
}

require_once $autoloader;

$config = dirname(__DIR__) . "/config/passwords.yaml";

try {
    $originalConfig = Yaml::parseFile($config);
    if (
        !is_array($originalConfig) ||
        !isset($originalConfig['parameters']) ||
        !is_array($originalConfig['parameters'])
    ) {
        throw new Exception("invalid original config");
    }
} catch (Exception $e) {
    $originalConfig = ["parameters" => []];
}

$hashTemplate = [
    "admin_password_hash" => "ADMIN_PASSWORD",
    "user_password_hash" => "USER_PASSWORD",
];

$factory = new PasswordHasherFactory([
    'common' => ['algorithm' => 'auto'],
]);

$hasher = $factory->getPasswordHasher("common");

$params = [];

foreach ($hashTemplate as $key => $env) {
    $password = @getenv($env);
    if (!is_string($password) || $password == "") {
        $password = "";
    }
    if ($password !== "") {
        $originalHash = $originalConfig['parameters'][$key] ?? null;
        if (is_string($originalHash) && $hasher->verify($originalHash, $password)) {
            $password = $originalHash;   
        } else {
            $password = $hasher->hash($password);
        }
    }
    $params[$key] = $password;
}

$configData = ["parameters" => $params];

$yaml = Yaml::dump($configData) . "\n";
file_put_contents($config, $yaml);

