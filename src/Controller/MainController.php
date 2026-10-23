<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class MainController extends AbstractController
{
    #[Route("/", name: "main")]
    #[IsGranted("ROLE_USER")]
    public function index(): Response
    {
        return $this->render('main.html.twig', [
        ]);
    }
}
