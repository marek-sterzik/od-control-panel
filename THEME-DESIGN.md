# Design témat

## Obecný postup

* Vyberte si jednoznačný identifikátor vašeho tématu. Identifikátor se může skládat jenom z malých písmen abecedy, číslic a podtržítek. Tímto identifikátorem bude
  téma jednoznačně identifikováno napříč systémem.
* Vytvořte v adresáři `templates/themes` podadresář. Název adresáře má být přesně identifikátor tématu. Je-li identifikátor tématu `test`, vytvoří se adresář `templates/themes/test`.
* V adresáři tématu `templates/themes/<id-tématu>` vytvořte soubor `theme.json` kde můžete uvést podrobnosti o tématu (název tématu, jak ho uvidí uživatel a autor tématu):
```json
{
    "description": "Skvělé téma",
    "author": "František Vomáčka"
}
```
* Vytvořte v adresáři tématu nejméně soubory `login.html.twig`, `main.html.twig` a `backend-error.html.twig`. S tím, že význam šablon je následující:
    - `login.html.twig` reprezentuje přihlašovací stránku
    - `main.html.twig` reprezentuje hlavní ovládací panel
    - `backend-error.html.twig` reprezentuje systémovou chybu, kdy metrix backend systému není dostupný
* Vytvořte adresář `public/themes/<id-tématu>`. Tento adresář bude obsahovat statické soubory spojené s tématem (zejména css soubory a javascript).
  Na tyto soubory se lze odkázat pomocí přidané (tj. nestandardní, platné jenom pro tuto aplikaci) funkce `theme_asset(path)`. Např.
  `{{ theme_asset('style.css') }}` odkáže soubor umístěný na `public/themes/<id-tématu/style.css`.
* Pokud se chce jedna šablona odkazovat na druhou (například při dědičnosti šablon, nebo při rozkladu na menší bloky), musí se na něj odkazovat pomocí funkce `theme_template(path)`.
  Například pokud chci v tématu dědit od šablony `base.html.twig`, udělá se to příkazem `{% extends theme_template("base.html.twig") %}`. Funkce `theme_template(path)` je taktéž
  nestandardní funkce, která je platná jenom pro tuto aplikaci.
* Je k dispozici téma `ugly`, které splňuje všechny náležitosti, schválně má ale naprosto minimální a neestetický design. Je nicméně plně funkční. Téma `ugly` může sloužit jako
  reference, jak správně používat API šablon.


## Co musí splňovat každá šablona

* Přepínač šablon je na všech stránkách v pravém horním rohu.
* Každá šablona musí vkládat do sekce `<head>` šablonu `header.html.twig` jako:  `{% include "header.html.twig" %}` (pozor, neměnit proměnné vnořené šablony pomocí `with`!)
  Vložení šablony `header.html.twig` má dva následky:
    - za tímto blokem lze používat knihovnu `jQuery`
    - za tímto blokem lze používat objekt `metrix` (integrace s backendem aplikace)
