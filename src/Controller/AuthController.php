<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

use App\Metrix\Client as MetrixClient;

class AuthController extends AbstractController
{
    #[Route("/auth", name: "auth")]
    #[Route("/metrix")]
    public function auth(): Response
    {
        if ($this->isGranted("ROLE_USER")) {
            return new Response("ok");
        } else {
            return new Response("denied", 401);
        }
    }
}
