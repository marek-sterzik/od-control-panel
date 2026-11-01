<?php

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;
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

    public function getFunctions()
    {
        $twigFunctions = [];
        foreach ($this->getAllFunctions() as $twigFunction => $method) {
            $twigFunctions[] = new TwigFunction($twigFunction, [$this, $method]);
        }
        return $twigFunctions;
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
}
