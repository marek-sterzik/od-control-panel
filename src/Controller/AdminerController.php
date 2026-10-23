<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class AdminerController extends AbstractController
{
    public function __construct(
        private string $databaseUrl,
        private bool $adminerEnabled,
        private string $adminerBootFile
    ) {
    }

    #[Route("/adminer", name: "app.adminer")]
    #[IsGranted("ROLE_ADMIN")]
    public function pageAdminer(): Response
    {
        if (!$this->adminerEnabled) {
            throw new NotFoundHttpException("File not found.");
        }

        return new StreamedResponse(
            function () {
                $httpAuth = null;
                $dbConf = $this->databaseUrl;
                include $this->adminerBootFile;
            }
        );
    }
}
