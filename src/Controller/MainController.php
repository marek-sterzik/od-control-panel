<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

use App\Metrix\Client as MetrixClient;

class MainController extends AbstractController
{
    public function __construct(
        private MetrixClient $metrixClient,
        private ?string $backendDisabledFile = null
    ) {
    }

    protected function getPageId(): string
    {
        return "main";
    }

    #[Route("/", name: "main")]
    #[IsGranted("ROLE_USER")]
    public function index(Request $request): Response
    {
        $controls = $this->queryStatus();

        if ($controls !== null) {
            $controls = $this->finalizeControls($controls);
            return $this->render("main.html.twig", ["controls" => $controls]);
        } else {
            return $this->render("error.html.twig", [
                "errorCaption" => "Metrix nedostupný",
                "errorMessage" => "Řídící služba Metrix není k dispozici. Zkuste to prosím znovu.",
                "retryUrl" => $request->getUri(),
                "backUrl" => null,
                "metaRefresh" => 10,
                "pageId" => "error",
            ]);
        }
    }

    private function finalizeControls(array $controls): array
    {
        return $controls;
    }

    private function queryStatus(): ?array
    {
        if ($this->backendDisabledFile !== null && file_exists($this->backendDisabledFile)) {
            return null;
        }
        return $this->metrixClient->queryStatus();
    }
}
