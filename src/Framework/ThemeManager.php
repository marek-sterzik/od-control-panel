<?php

namespace App\Framework;

use Exception;
use Symfony\Component\HttpFoundation\RequestStack;

class ThemeManager
{
    const PREFERED_THEME = "ugly";

    public function __construct(private RequestStack $requestStack, private string $themeDir)
    {
    }

    private ?array $themes = null;
    private ?string $currentTheme = null;

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

    public function themeExists(string $theme): bool
    {
        $themes = $this->listThemes();
        if (isset($themes[$theme])) {
            return true;
        } else {
            return false;
        }
    }

    private function existingTheme(?string $theme): ?string
    {
        if ($theme === null) {
            return null;
        }
        if (!$this->themeExists($theme)) {
            return null;
        }
        return $theme;
    }

    public function getCurrentTheme(): string
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

    public function getCurrentThemeDescriptor(): ?array
    {
        $theme = $this->getCurrentTheme();
        $themes = $this->listThemes();
        return $themes[$theme] ?? null;
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
        if (isset($data["features"])) {
            if (!is_array($data["features"])) {
                throw new Exception("theme $theme contains invalid data in manifest file theme.json: invalid feautre field");
            }
            foreach ($data["features"] as $feature) {
                if (!is_string($feature)) {
                    throw new Exception("theme $theme contains invalid data in manifest file theme.json: invalid feautre field");
                }
            }
            $data["features"] = array_values($data["features"]);
        } else {
            $data["features"] = [];
        }
        return $data;
    }

    public function listThemes(): array
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
                        "features" => $data["features"],
                    ];
                }
            }
            closedir($dd);
        }
        asort($themes);
        $this->themes = $themes;
        return $themes;
    }

    public function getAllThemes(): array
    {
        $currentTheme = $this->getCurrentTheme();
        return array_map(
            fn ($theme) => array_merge($theme, ["active" => ($theme["theme"] === $currentTheme) ? true : false]),
            array_values($this->listThemes())
        );
    }
}
