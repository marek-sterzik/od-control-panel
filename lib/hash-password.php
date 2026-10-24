#!/usr/bin/env php
<?php

use Symfony\Component\PasswordHasher\Hasher\PasswordHasherFactory;

require_once dirname(__DIR__) . "/vendor/autoload.php";

$factory = new PasswordHasherFactory([
    'common' => ['algorithm' => 'auto'],
]);

$hasher = $factory->getPasswordHasher("common");

$hash = $hasher->hash($argv[1] ?? '');

echo "$hash\n";
