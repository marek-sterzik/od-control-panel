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
            $controls = $this->filterControls($controls);
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

    private function getFeatures(): array
    {
        $descriptor = $this->themeManager->getCurrentThemeDescriptor();
        if ($descriptor === null || !isset($descriptor["features"])) {
            return [];
        }
        return array_fill_keys($descriptor["features"], true);
    }

    private function extractTag(array $control): ?array
    {
        if (!isset($control['tags']) || !is_array($control['tags'])) {
            return null;
        }
        foreach($control["tags"] as $tag) {
            if (is_array($tag) && isset($tag['category']) && is_string($tag["category"])) {
                return $tag;
            }
        }
        return null;
    }

    private function tagMatchFeatures(?array $tag, array $features): bool
    {
        if ($tag === null) {
            return true;
        }
        if (isset($features["blink"])) {
            return true;
        }
        if ($tag["category"] !== "blink") {
            return true;
        }
        return false;
    }

    private function generateXInfo(array $control, ?array $tag, array $features): ?array
    {
        if (!isset($features["blink"])) {
            return null;
        }
        return [
            "category" => $tag['category'] ?? null,
            "related" => $tag["relation"] ?? null,
        ];
    }

    private function filterControls(array $controls): array
    {
        $features = $this->getFeatures();
        $finalControls = [];
        foreach ($controls as $control) {
            $tag = $this->extractTag($control);
            unset($control["tags"]);
            if ($this->tagMatchFeatures($tag, $features)) {
                $xInfo = $this->generateXInfo($control, $tag, $features);
                if ($xInfo !== null) {
                    $control["xinfo"] = $xInfo;
                }
                $finalControls[$control["id"]] = $control;
            }
        }
        return $finalControls;
    }

    private function queryStatus(): ?array
    {
        if ($this->backendDisabledFile !== null && file_exists($this->backendDisabledFile)) {
            return null;
        }
        return $this->metrixClient->queryStatus();
    }
}
