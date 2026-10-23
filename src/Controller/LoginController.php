<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class LoginController extends AbstractController
{
    const USERS = [
        "user" => "Uživatel",
        "admin" => "Administrátor",
    ];
    public function __construct(private AuthenticationUtils $authenticationUtils)
    {
    }

    #[Route("/login", name: "app.login")]
    public function login(): Response
    {
        $errorMessage = $this->authenticationUtils->getLastAuthenticationError();

        $users = self::USERS;

        $lastUsername = $this->authenticationUtils->getLastUsername();

        if (is_string($lastUsername) && isset($users[$lastUsername])) {
            $selectedUser = $lastUsername;
        } else {
            $selectedUser = array_key_first($users);
        }

        return $this->render('login.html.twig', [
            "loginError" => ($errorMessage !== null) ? true : false,
            "loginErrorMessage" => $errorMessage,
            "users" => $users,
            "selectedUser" => $selectedUser,
        ]);
    }

    #[Route("/logout", name: "app.logout")]
    public function logout(): Response
    {
        return $tihs->redirectToRoute("main");
    }
}
