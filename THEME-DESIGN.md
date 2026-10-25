# Design témat

## Obecný postup

* Vytvořte v adresáři `templates/themes` podadresář. Název smí používat jenom malá písmena abecedy, čísla a podtržítka. Název adresáře bude identifikátorem tématu
  napříč celým systémem.
* V adresáři tématu `templates/themes/<id-tématu>` vytvořte soubor `theme.json` kde můžete uvést podrobnosti o tématu (název tématu, jak ho uvidí uživatel a autor tématu):
```json
{
    "description": "Skvělé téma",
    "author": "František Vomáčka"
}
```
* Vytvořte v adresáři tématu nejméně dva soubory `login.html.twig` a `main.html.twig`. S tím, že `login.html.twig` bude reprezentovat přihlašovací stránku a `main.html.twig`
  bude reprezentovat hlavní stránku aplikace.

## Co musí splňovat každá šablona

* Přepínač šablon je na všech stránkách v pravém horním rohu.
* Každá šablona musí vkládat do sekce `<head>` šablonu `header.html.twig` jako:  `{% include "header.html.twig" %}` (pozor, neměnit proměnné vnořené šablony pomocí `with`!)
* Pokud se šablona odkazuje na jinou šablonu (například při dědičnosti šablon), je potřeba uvádět plnou cestu šablony v adresáři `templates/`. Tj. mám-li téma `test` a
  šablona
