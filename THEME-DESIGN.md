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
  Vložení šablony `header.html.twig` má přitom (kromě jiného) dva důležité následky:
    - za tímto blokem lze používat knihovnu `jQuery`
    - za tímto blokem lze používat objekt `metrix` (integrace s backendem aplikace)


# API

V twigových šablonách je možné využívat různé funkce a dodržovat různé standardy.

## Obecné standardy

* Přepínač šablon je na všech stránkách a vždy v pravém horním rohu.
* Odkaz na jiné šablony tématu probíhá zásadně přes funkci `theme_template`. Např.: `{% extends theme_template("base.html.twig") %}`. Toto se netýká vložení šablony
  `header.html.twig`, která není součástí žádného tématu a vkládá se do všech témat stejně.
* Do každé stránky je potřeba vložit šablonu `header.html.twig` jako: `{% include "header.html.twig" %}`. Tento blok musí být vložen do sekce `<head>`. Tento blok přitom zároveň
  vkládá do stránky knihovnu pro práci s metrixem (backend aplikace, knihovna je popsána dále) a knihovnu jQuery.
* k dispozici je obecná twigová funkce `theme_template(path)` na odkaz na šablonu z daného tématu.
* k dispozici je obecná twigová funkce `theme_asset(path)` chovající se podobně jako standardní funkce `asset(path)`, ale odkazuje se na statické soubory z tématu, které jsou
  v adresáři `public/themes/<id-tématu>/`.

## Přepínání tématu

Přepínač tématu předpokládá formulář s akcí nastavenou na `path("app.set-theme")`, metodu GET, a s dvěma hodnotami:

1. hodnota `back` nastavená na `{{ app.request.requesturi }}` (může být realizovaná přes `<input type="hidden">`, který není viditelný pro uživatele)
2. hodnota `theme` musí obsahovat id tématu, na které se má přepnout.

K přepnutí tématu pak dojde odesláním formuláře. Toho lze dosáhnout několika způsoby:

* přidáním odesílacího tlačítka do formuláře (`<input type="submit" value="Změnit téma">` - odesílací tlačítko bez atributu `name`)
* Pokud je na výběr tématu použit `<select>`, lze selectu přiřadit css třídu `submit-on-change`, díky které se vložený javascript automaticky postará o odeslání formuláře při
  přepnutí `<select>` boxu na jinou hodnotu.
* ručním odesláním formuláře manuálně javascriptem (`form.submit()` kde `form` je jQuery element reprezentující příslušný element `<form>`)

K dispozici je také v každé šabloně proměnná `themes`, která obsahuje pole všech témat. Každé téma obsahuje aspoň tyto informace:

* `theme` - unikátní id tématu
* `description` - lidsky čitelný název tématu (vyčten z `theme.json`)
* `author` - autor tématu (vyčten z `theme.json`)
* `active` - true/false informace, zda je dané téma právě aktivní

Kompletní html kód (twigová šablona) pro výběr tématu může vypadat například takto:

```twig
<form action="{{ path("app.set-theme") }}" method="get">
    <input type="hidden" name="back" value="{{ app.request.requesturi }}">
    <select class="submit-on-change" name="theme">
        {% for theme in themes %}
            <option value="{{ theme.theme }}"{% if theme.active %} selected="selected"{% endif %}>{{ theme.description }} ({{ theme.author }})</option>
        {% endfor %}
    </select>
</form>
```

## Login

Login stránka předpokládá existenci jenom několika málo uživatelů, kteří jsou dopředu známí a uživatel jenom vybírá, jako který uživatel se chce přihlásit. K příslušnému
uživateli je potřeba zadat heslo.

Proměnné dostupné na login stránce:

* `loginError` - true/false informace zda nastala chyba při přihlášení (nejspíše chybné heslo)
* `users` - asociativní pole, kde klíče jsou uživatelská jména a hodnoty jsou lidsky čitelná jména uživatelů (seznam dostupných uživatelů)
* `selectedUser` - uživatelské jméno uživatele, který má být zrovna vybrán

Odesílání dat probíhá formulářem. Formulář má tyto vlastnosti:

* odesílá se sám na sebe (nemá atribut `action`)
* odesílá se metodou post (atribut `method="post"`)
* obsahuje pojmenovanou hodnotu `username` která musí při odeslání obsahovat uživatelské jméno přihlašovaného uživatele
* obsahuje pojmenovanou hodnotu `password` která obsahuje heslo přihlašovaného uživatele

Kompletní html kód pro tento formulář může vypadat například takto:

```twig
<form method="post">
    {% if loginError %}
    <div>
        Chyba: přihlášení se nezdařilo, zadali jste správné heslo?
    </div>
    {% endif %}
    <select name="username">
        {% for username, name in users %}
            <option value="{{ username }}"{% if username == selectedUser %} selected="selected"{% endif %}>{{ name }}</option>
        {% endfor %}
    </select>
    <input type="password" name="password">
    <input type="submit" value="Přihlásit se">
</form>
```
