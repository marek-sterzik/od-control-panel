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
        $theme = $this->existingTheme($request->query->get("theme", null));
        if ($theme !== null) {
            $oldTheme = $request->getSession()->get("theme", "???");
            $request->getSession()->set("theme", $theme);
        }
        $back = $request->query->get("back", null);
        if ($back === null || $back === "") {
            return $this->redirectToRoute("main");
        }
        return $this->redirect($back);
    }
}
