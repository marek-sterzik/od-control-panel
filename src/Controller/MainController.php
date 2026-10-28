<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

use App\Metrix\Client as MetrixClient;

class MainController extends AbstractController
{
    public function __construct(private MetrixClient $metrixClient)
    {
    }

    protected function getPageId(): string
    {
        return "main";
    }

    #[Route("/", name: "main")]
    #[IsGranted("ROLE_USER")]
    public function index(): Response
    {
        $controls = $this->metrixClient->queryStatus();

        if ($controls !== null) {
            $template = 'main.html.twig';
        } else {
            $template = 'backend-error.html.twig';
        }
        return $this->render($template, [
            "controls" => $controls,
        ]);
    }
}
