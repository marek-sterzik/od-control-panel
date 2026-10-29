<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as AbstractControllerBase;
use App\Framework\ThemeManager;

class AbstractController extends AbstractControllerBase
{
    protected ThemeManager $themeManager;

    public function setServices(ThemeManager $themeManager)
    {
        $this->themeManager = $themeManager;
    }

    protected function getPageId(): string
    {
        return "other";
    }

    protected function getDefaultParameters(): array
    {
        return [
            "currentTheme" => $this->themeManager->getCurrentTheme(),
            "themes" => $this->themeManager->getAllThemes(),
            "pageId" => $this->getPageId(),
        ];
    }

    protected function renderView(string $view, array $parameters = []): string
    {
        $view = sprintf("themes/%s/%s", $this->themeManager->getCurrentTheme(), $view);
        $parameters = array_merge($this->getDefaultParameters(), $parameters);
        return parent::renderView($view, $parameters);
    }

    protected function render(
        string $view,
        array $parameters = [],
        ?Response $response = null
    ): Response {
        $view = sprintf("themes/%s/%s", $this->themeManager->getCurrentTheme(), $view);
        $parameters = array_merge($this->getDefaultParameters(), $parameters);
        return parent::render($view, $parameters, $response);
    }
}
