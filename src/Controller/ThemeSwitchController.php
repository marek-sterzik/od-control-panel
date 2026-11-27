<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class ThemeSwitchController extends AbstractController
{
    #[Route("/set-theme", name: "app.set-theme")]
    public function setTheme(Request $request): Response
    {
        $theme = $request->query->get("theme", null);
        if ($theme !== null && !$this->themeManager->themeExists($theme)) {
            $theme = null;
        }
        $back = $request->query->get("back", null);
        if ($back === null || $back === "") {
            $response = $this->redirectToRoute("main");
        } else {
            $response = $this->redirect($back);
        }
        if ($theme !== null) {
            $this->themeManager->setTheme($theme, $response);
        }
        return $response;
    }
}
