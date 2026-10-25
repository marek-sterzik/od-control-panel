<?php

namespace App\Controller;

use Exception;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as AbstractControllerBase;

class AbstractController extends AbstractControllerBase
{
    const PREFERED_THEME = "ugly";

    private string $themeDir;
    private ?array $themes = null;
    private ?string $currentTheme = null;
    private RequestStack $requestStack;

    public function setServices(RequestStack $requestStack)
    {
        $this->requestStack = $requestStack;
    }

    public function setThemeDir(string $themeDir): void
    {
        $this->themeDir = $themeDir;
    }

    private function getStoredTheme(): ?string
    {
        $session = $this->requestStack->getSession();
        $theme = $session->get("theme", null);
        if (is_string($theme)) {
            return $theme;
        }
        return null;
    }

    private function getPreferedTheme(): ?string
    {
        return self::PREFERED_THEME;
    }

    protected function existingTheme(?string $theme): ?string
    {
        if ($theme === null) {
            return null;
        }
        $themes = $this->listThemes();
        if (!isset($themes[$theme])) {
            return null;
        }
        return $theme;
    }

    protected function getCurrentTheme(): string
    {
        $theme = $this->existingTheme($this->getStoredTheme());
        if ($theme === null) {
            $theme = $this->existingTheme($this->getPreferedTheme());
        }
        if ($theme === null) {
            $theme = array_key_first($this->listThemes());
        }
        if ($theme === null) {
            throw new Exception("No theme is defined");
        }
        return $theme;
    }

    private function checkManifestData(string $theme, mixed $data): array
    {
        if (!is_array($data)) {
            throw new Exception("theme $theme contains invalid manifest file theme.json");
        }
        if (isset($data["description"]) && !is_string($data["description"])) {
            throw new Exception("theme $theme contains invalid data in manifest file theme.json: invalid description field");
        }
        if (isset($data["author"]) && !is_string($data["author"])) {
            throw new Exception("theme $theme contains invalid data in manifest file theme.json: invalid author field");
        }
        return $data;
    }

    protected function listThemes(): array
    {
        if ($this->themes !== null) {
            return $this->themes;
        }
        $themes = [];
        $dd = opendir($this->themeDir);
        if ($dd) {
            while (($file = readdir($dd)) !== false) {
                if (in_array($file, [".", ".."])) {
                    continue;
                }
                if (!is_dir(sprintf("%s/%s", $this->themeDir, $file))) {
                    continue;
                }
                $manifest = sprintf("%s/%s/theme.json", $this->themeDir, $file);
                $data = @file_get_contents($manifest);
                if (is_string($data)) {
                    $data = @json_decode($data, true);
                    $data = $this->checkManifestData($file, $data);
                    if (!preg_match('/^[a-z0-9_]+$/', $file)) {
                        throw new Exception("theme names must contain only small letters, digits or underscores");
                    }
                    $themes[$file] = [
                        "theme" => $file,
                        "description" => $data['description'] ?? $file,
                        "author" => $data['author'] ?? 'unknown',
                    ];
                }
            }
            closedir($dd);
        }
        asort($themes);
        $this->themes = $themes;
        return $themes;
    }

    protected function getAllThemes(): array
    {
        $currentTheme = $this->getCurrentTheme();
        return array_map(
            fn ($theme) => array_merge($theme, ["active" => ($theme["theme"] === $currentTheme) ? true : false]),
            array_values($this->listThemes())
        );
    }

    protected function getPageId(): string
    {
        return "other";
    }

    protected function getDefaultParameters(): array
    {
        return [
            "currentTheme" => $this->getCurrentTheme(),
            "themes" => $this->getAllThemes(),
            "pageId" => $this->getPageId(),
        ];
    }

    protected function renderView(string $view, array $parameters = []): string
    {
        $view = sprintf("themes/%s/%s", $this->getCurrentTheme(), $view);
        $parameters = array_merge($this->getDefaultParameters(), $parameters);
        return parent::renderView($view, $parameters);
    }

    protected function render(
        string $view,
        array $parameters = [],
        ?Response $response = null
    ): Response {
        $view = sprintf("themes/%s/%s", $this->getCurrentTheme(), $view);
        $parameters = array_merge($this->getDefaultParameters(), $parameters);
        return parent::render($view, $parameters, $response);
    }

}
