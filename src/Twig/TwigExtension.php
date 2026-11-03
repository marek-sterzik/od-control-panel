<?php

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;
use Twig\TwigFilter;
use Symfony\Component\Asset\Packages;
use App\Framework\ThemeManager;

class TwigExtension extends AbstractExtension
{
    public function __construct(private Packages $packages, private ThemeManager $themeManager)
    {
    }

    private function getAllFunctions(): array
    {
        return [
            'theme_asset' => 'themeAsset',
            'theme_template' => 'themeTemplate',
        ];
    }

    private function getAllFilters(): array
    {
        return [
            'array_values' => 'arrayValues',
        ];
    }

    public function getFunctions()
    {
        $twigFunctions = [];
        foreach ($this->getAllFunctions() as $twigFunction => $method) {
            $twigFunctions[] = new TwigFunction($twigFunction, [$this, $method]);
        }
        return $twigFunctions;
    }

    public function getFilters()
    {
        $twigFilters = [];
        foreach ($this->getAllFilters() as $twigFilter => $method) {
            $twigFilters[] = new TwigFilter($twigFilter, [$this, $method]);
        }
        return $twigFilters;
    }

    public function themeAsset(string $path): string
    {
        if ($path === "") {
            return "";
        }
        if (substr($path, 0, 1) !== "/") {
            $path = '/' . $path;
        }
        
        return $this->packages->getUrl(sprintf("themes/%s%s", $this->themeManager->getCurrentTheme(), $path), null);
    }

    public function themeTemplate(string $path): string
    {
        if ($path === "") {
            return "";
        }
        if (substr($path, 0, 1) !== "/") {
            $path = '/' . $path;
        }
        return sprintf("themes/%s%s", $this->themeManager->getCurrentTheme(), $path);
    }

    public function arrayValues(array $array): array
    {
        return array_values($array);
    }
}
