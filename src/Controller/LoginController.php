<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class LoginController extends AbstractController
{
    #[Route("/login", name: "app.login")]
    public function login(): Response
    {
        return $this->render('login.html.twig', []);
    }

    #[Route("/logout", name: "app.logout")]
    public function logout(): Response
    {
        return $tihs->redirectToRoute("main");
    }
}
