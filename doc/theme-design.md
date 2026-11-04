# Design témat

## Obecný postup

* Vyberte si jednoznačný identifikátor vašeho tématu. Identifikátor se může skládat jenom z malých písmen abecedy, číslic a podtržítek. Tímto identifikátorem bude
  téma jednoznačně identifikováno napříč systémem.
* Vytvořte v adresáři `templates/themes` podadresář. Název adresáře má být přesně identifikátor tématu. Je-li identifikátor tématu `test`, vytvoří se adresář `templates/themes/test`.
* V adresáři tématu `templates/themes/<id-tématu>` vytvořte soubor `theme.json` kde můžete uvést podrobnosti o tématu (název tématu, jak ho uvidí uživatel a autora tématu):
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
* Pokud je uživatel přihlášen, musí stránka (v pravém horním rohu vedle přepínače tématu) obsahovat i informace o přihlášeném uživateli a možnost se odhlásit.
* Každá šablona musí vkládat do sekce `<head>` šablonu `header.html.twig` jako:  `{% include "header.html.twig" %}` (pozor, neměnit proměnné vnořené šablony pomocí `with`!)
  Vložení šablony `header.html.twig` má přitom (kromě jiného) dva důležité následky:
    - za tímto blokem lze používat knihovnu `jQuery`
    - za tímto blokem lze používat objekt `metrix` (integrace s backendem aplikace)

# API

V twigových šablonách je možné využívat různé funkce a dodržovat různé standardy.

## Obecné standardy

* Přepínač šablon je na všech stránkách a vždy v pravém horním rohu.
* Všechny šablony obsahují informaci o přihlášeném uživateli a možnost se odhlásit, pokud je uživatel přihlášen. Pokud je uživatel odhlášen, informace o přihlášeném uživateli
  se nezobrazuje.
* Odkaz na jiné šablony tématu probíhá zásadně přes funkci `theme_template`. Např.: `{% extends theme_template("base.html.twig") %}`. Toto se netýká vložení šablony
  `header.html.twig`, která není součástí žádného tématu a vkládá se do všech témat stejně.
* Do každé stránky je potřeba vložit šablonu `header.html.twig` jako: `{% include "header.html.twig" %}`. Tento blok musí být vložen do sekce `<head>`. Tento blok přitom zároveň
  vkládá do stránky knihovnu pro práci s metrixem (backend aplikace, knihovna je popsána dále) a knihovnu jQuery.
* k dispozici je obecná twigová funkce `theme_template(path)` na odkaz na šablonu z daného tématu.
* k dispozici je obecná twigová funkce `theme_asset(path)` chovající se podobně jako standardní funkce `asset(path)`, ale odkazuje se na statické soubory z tématu, které jsou
  v adresáři `public/themes/<id-tématu>/`.

## Přepínání tématu (všechny stránky)

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

## Informace o přihlášeném uživateli (všechny stránky)

Informace o přihlášeném uživateli jsou k dispozici pro všechny stránky v proměnné `user`. Proměnná `user` je `null`, pokud žádný uživatel není přihlášen a obsahuje
tyto další pod informace, pokud uživatel přihlášen je:

* `username` - uživatelské jméno uživatele (`user` nebo `admin`)
* `name` - lidsky čitelné jméno uživatele (`Uživatel` nebo `Adminitstrátor`)
* `admin` - true/false hodnota, zda má uživatel administrátorská oprávnění

Pro odhlášení je potřeba odkázat na url `{{ path("app.logout") }}`.

Kompletní html kód (twigová šablona) pro zobrazení informací o přihlášeném uživateli by mohla vypadat například takto:

```twig
{% if user is not null %}
    <div class="userinfo">
        Přihlášený uživatel:
        <span{% if user.admin %} class="admin"{% endif %}>{{ user.name }}</span>
        (<a href="{{ path("app.logout") }}">odhlásit se</a>)
    </div>
{% endif %}
```

## Login (login.html.twig)

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

## Chybová stránka (error.html.twig)

Chybová stránka slouží k zobrazování různých druhů chyb. Chybová stránka by stejně, jako všechny ostatní stránky měla obsahovat kód pro přepnutí tématu a kód pro zobrazení
přihlášeného uživatele.

Dále jsou pak v chybové stránce dostupné tyto proměnné:

* `errorCaption` - nadpis chyby
* `errorMessage` - podorbný text jako popis chyby
* `retryUrl` - url, na které má vést odkaz/tlačítko "zkusit znovu" (pokud je hodnota null, odkaz/tlačítko "zkusit znovu" se vůbec nemá zobrazovat)
* `backUrl` - url, na které má vést odkaz/tlačítko "jít zpět" (pokud je hodnota null, odkaz/tlačítko "jít zpět" se vůbec nemá zobrazovat)

Příklad kódu chybové stránky:

```twig
<h1>Chyba: {{ errorCaption }}</h1>
<p>{{ errorMessage }}</p>
<div>
    {% if retryUrl is not null %}<a class="button" href="{{ retryUrl }}">zkusit znovu</a>{% endif %}
    {% if backUrl is not null %}<a class="button" href="{{ backUrl }}">zpět</a>{% endif %}
</div>
```

## Hlavní aplikační stránka (main.html.twig)

Hlavní aplikační stránka slouží pro zobrazení hlavního ovládacího panelu aplikace. Hlavní aplikační stránka musí zcela nutně používat JavaScript pro online propojení ovládání
s backenem. Pro to je v JavaScriptu k dispozici speciální knihovna `metrix`.

### proměnné

Kromě univerzálních proměnných zmíněných výše je v šabloně hlavní stránky dostupná jediná proměnná, kterou je proměnná `components`, která obsahuje kompletní stav všech
ovládaných komponent. Jako json může být obsah komponenty vyjádřen jako:

```json
[
    {
        "id": "red",
        "type": "switch",
        "caption": "Červená kontrolka",
        "color": "#f00",
        "parts": ["state", "blink"],
        "state": false,
        "blink": false
    },
    {
        "id": "yellow",
        "type": "switch",
        "caption": "Žlutá kontrolka",
        "color": "#aa0",
        "parts": ["state", "blink"],
        "state": false,
        "blink": false
    },
    {
        "id": "green",
        "type": "switch",
        "caption": "Zelená kontrolka",
        "color": "#0f0",
        "parts": ["state", "blink"],
        "state": false,
        "blink": false
    },
    {
        "id": "white",
        "type": "switch",
        "caption": "Bílá kontrolka",
        "color": "#fff",
        "parts": ["state", "blink"],
        "state": false,
        "blink": false
    },
    {
        "id": "blue",
        "type": "switch",
        "caption": "Modrá kontrolka",
        "color": "#00f",
        "parts": ["state", "blink"],
        "state": false,
        "blink": false
    },
    {
        "id": "segment",
        "type": "segment",
        "caption": "Segmentový displej",
        "state": ["", ""],
        "segment_state": ["00000000", "00000000"]
    }
]
```

Každý objekt reprezentující komponentu obsahuje zcela nutně tyto údaje:

* `id` - jednoznačný identifikátor komponenty (je spoleh na to, že identifikátor obsahuje jenom písmena, číslice, podtržítka a pomlčky)
* `type` - typ komponenty (v našem případě jenom buď `switch` - přepínač, nebo `segment` - komponenta pro ovládání segmentového displeje)
* `caption` - lidsky čitelný název komponenty

Komponenta typu `switch` potom dále obsahuje údaje:

* `color` - barva přiřazená ovládané kontrolce, barva je ve formátu, který je použitelný kdekoliv v html/css standardu
* `parts` - samostatně ovládané části přepínače, které jsou k dispozici - v tuto chvíli může toto pole obsahovat buď `state` (vlastní přepínač) a `blink` (stav blikání)
* `state` - informace, zda je aktuálně kontrolka zapnutá nebo vypnutá (tato jediná hodnota se může v průběhu času měnit, ostatní zůstávají po celou dobu neměnné)
* `blink` - informace, zda je na dané kontrolce zapnuto blikání (hodnota je k dispozici pouze, pokud proměnná `parts` obsahuje `blink`)

Komponenta typu `segment` dále obsahuje tyto údaje:

* `state` - pole reprezentující stav všech segmentových číslic vyjádřených jako znak. Může tedy obsahovat hodnotu `5` (znamená na segmentu svítí číslo 5),
  `A` (na segmentu svítí písmeno A), ale může také obsahovat prázdný řetězec (segment vůbec nesvítí) nebo `null` (segment obsahuje kombinaci, která neodpovídá
  žádnému známému znaku). Řetězec může obsahovat až dva znaky, přičemž druhý znak je v takovém případě vždy `.`, což značí, že na segmentovém displeji
  svítí i tečka. Např. obsahuje-li údaj `state` hodnotu `["5.", null]`, znamená to, že na první segmentové číslici svítí číslo 5 i s tečkou, na druhé segmentové
  číslici svítí nerozpoznaný znak.
* `segment_state` - obsahuje pro každou segmentovou číslici řetězec vždy o přesně osmi znacích, přičemž každý znak je ze zásady pouze 0 nebo 1 a tento řetězec
  reprezentuje stavy jednotlivých osmi segmentů (segmenty jsou řazeny nejprve odshora dolu, potom zleva doprava, tečka je poslední). Kdyby hodnota
  `state` byla `["5.", "1"]`, bude `segment_state` obsahovat `["11010111", "00100100"]`.

Přitom obě hodnoty `state` a `segment_state` spolu souvisejí a jsou jenom jiným pohledem na totéž. Obě hodnoty se průběžně mohou měnit.

### integrace s javascriptem

Předpokládá se, že do stránky main.html.twig bude vložen javascript, který zajistí živou změnu stavu komponent. Tj. komponenty nemění stavy pouze při znovunačtení
stránky, ale mohou měnit stav průběžně. Stejně tak požadavky na změnu stavu komponent se posílají ze zásady skrze JavaScriptové příkazy.

K tomu je dobré připomenout, že do sekce `<head>` stránky je potřeba vložit příkaz `{% include "header.html.twig" %}`, což zajistí vložení dvou klíčových
knihoven: standardní knihovny jQuery a knihovny pro práci s metrixem (metrix je backend celé aplikace). Aby bylo možné obě knihovny používat, je nutné
jakékoliv javascripty vkládat **až za** include blok s `header.html.twig`.

Knihovna jQuery je dostupná skrze standardní proměnné `jQuery` a `$`, metrixové rozhraní je dostupné v proměnné `metrix`. Knihovnu jQuery tu nebudeme dále popisovat,
vysvětlíme pouze rozhraní knihovny `metrix`.

### knihovna metrix

Knihovna pro integraci metrixu obsahuje v principu tři podčásti:

1. Rozhraní pro změnu stavu komponent
2. Rozhraní pro inicializaci komponent
3. Rozhraní pro realtimovou změnu stavu komponent

#### rozhraní pro změnu stavu komponent

Chceme-li změnit stav komponenty, potřebujeme získat objekt reprezentující danou komponentu. Ten můžeme získat pomocí volání:

```js
const component = metrix.component(id)
```

kde `id` je jednoznačný identifikátor komponenty. Každá komponenta má jiné rozhraní podle jejího typu.

Typ `switch` má rozhraní:

```js
// zapne spínač/kontrolku
component.set()

// vypne spínač/kontrolku
component.clear()

// přepne spínač/kontrolku do opačného stavu (ze zapnuto na vypnuto, z vypnuto na zapnuto)
component.toggle()

// zapne blikání kontrolky
component.setBlink()

// vypne blikání kontrolky
component.clearBlink()

// přepne blikání kontrolky do opačného stavu
component.toggleBlink()

// zapnutí části přepínače podle názvu části
component.setPart("state")
component.setPart("blink")

// vypnutí části přepínače podle názvu části
component.clearPart("state")
component.clearPart("blink")

// přepnutí části přepínače podle názvu části
component.togglePart("state")
component.togglePart("blink")
```

Typ `segment` má rozhraní:

```js
const digit0 = component.digit(0) // vrátí komponentu pro ovládání první segmentové číslice
const digit1 = component.digit(1) // vrátí komponentu pro ovládání druhé segmentové číslice
```

Samotná segmentová číslice má potom rozhraní:

```js
// zapni první segment segmentové číslice (segmenty jsou číslovány od nuly)
digit0.set(0)

// vypni druhý segment segmentové číslice (segmenty jsou číslovány od nuly)
digit0.clear(1)

// přepni poslední segment segmentové číslice (tj. přepni stav "tečky")
digit0.toggle(7)

// zapiš do segmentové číslice hodnotu odpovídající danému stavu.
// Pokud je zapisovaný řetězec nesmyslný, příkaz se ignoruje.
digit0.write("5.")


// následující dva příkazy mají nepovinný parametr cat, který říká, 
// v jaké kategorii se má znak posunout, pokud není kategorie dána,
// použije se systémem zvolená kategorie (v tuto chvíli kategorie hex)
// Možné kategorie:
//  * digit - číslice
//  * hex - hexadecimální číslice
//  * letter - všechna písmena (velká i malá)
//  * lower - malá písmena
//  * upper - velká písmena
//  * letteropt - všechna písmena, je-li k dispozici velké i malé písmeno, je vybráno to lépe vypadající

// přepni na další číslici/znak v dané kategorii
// pokud segment neukazuje znak dané kategorie,
// bude přepnuto na nějaký znak z požadované kategorie
digit0.next(cat = null)

// přepni na předchozí číslici/znak v dané kategorii
// pokud segment neukazuje znak dané kategorie,
// bude přepnuto na nějaký znak z požadované kategorie
digit0.prev(cat = null)
```

#### rozhraní pro inicializaci komponent

Pro první javascriptovou inicializaci komponenty slouží funkce `metrix.onLoad(category, callback)`, kde `category` je kategorie, která specifikuje,
na jakou komponentu, nebo na jaké komponenty chceme inicializační funkci navázat a `callback` je funkce, která se zavolá jednou při inicializaci.

Kategorie může být přitom dvou tříd:

1. chceme-li inicializaci navázat na všechny komponenty daného typu, je kategorie přímo příslušný typ komponenty. Např `"switch"`.
2. chceme-li inicializaci navázat jenom na jednu jedinou komponentu daného id, obsahuje kategorie na začátku dvoujtečku následovanou příslušným id. Např. `":green"`.

```js
metrix.onLoad("switch", function(mev) {
    // tato funkce se zavolá pro všechny komponenty
    // typu "switch" jednou při jejich inicializaci,
    // proměnná mev (metrix event) přitom obsahuje všechny důležité
    // informace o komponentě (obsah bude vysvětlen dále)
})

metrix.onLoad(":green", function(mev) {
    // tato funkce se zavolá pro komponentu s id "green"
    // jednou při jejich inicializaci,
    // proměnná mev (metrix event) přitom obsahuje všechny důležité
    // informace o komponentě (obsah bude vysvětlen dále)
})
```

#### rozhraní pro realtimovou změnu stavu komponent

Velmi podobně jako funkce `metrix.onLoad(category, callback)` funguje také funkce `metrix.onChange(category, callback)`. Rozdíl v obou funkcích je jenom v tom,
že callback registrovaný pomocí `metrix.onLoad()` se spustí jenom jednou při inicializaci celé aplikace, zatímco callback registrovaný skrze `metrix.onChange()`
se spouští opakovaně při libovolné změně stavu komponenty. Je zajištěno, že nejprve se vždy zavolají callbacky registrované přes `metrix.onLoad()` a až
potom se začnou volat callbacky registrované přes `metrix.onChange()`.

```js
metrix.onChange("segment", function(mev) {
    // tato funkce se zavolá pro všechny komponenty
    // typu "segment", kdykoliv změní svůj stav,
    // proměnná mev (metrix event) přitom obsahuje všechny důležité
    // informace o komponentě (obsah bude vysvětlen dále)
})

metrix.onChange(":red", function(mev) {
    // tato funkce se zavolá pro komponentu s id "red",
    // kdykoliv komponenta "red" změní svůj stav
    // proměnná mev (metrix event) přitom obsahuje všechny důležité
    // informace o komponentě (obsah bude vysvětlen dále)
})
```

#### metrix event (proměnná mev)

Všechny registrované callbacky mají jeden parametr, kterým je proměnná obsahující všechny informace o komponentě. Význam proměnné `mev` je stejný jak u funkce
`metrix.onLoad()`, tak u funkce `metrix.onChange()`. Objekt `mev` přitom obsahuje tyto údaje:

* `mev.metrix` - odkaz na samotný objekt `metrix`
* `mev.element` - obsahuje jQuery element reprezentující element spárovaný s komponentou. Spárování elementu s komponentou lze udělat skrze atribut `data-metrix-id="<id-komponenty>"`.
  Např. element `<div data-metrix-id="blue">...</div>` bude spárován s elementem s id `blue`. Párování elementu s komponentou není povinné, ale velmi to usnadňuje život.
* `mev.id` - id dané komponenty (např. `blue`)
* `mev.type` - typ dané komponenty (`switch` nebo `segment`)
* `mev.state` - celkový stav kompnenty (odpovídá jedna ku jedné objektu komponenty z twigové proměnné `components`). Jenom zde reprezentuje nejnovější stav dané komponenty.
* `mev.component` - objekt reprezentující příslušnou komponentu (odpovídá hodnotě `metrix.component(mev.id)`) - slouží jako přímý ovladač dané komponenty

#### správný postup při změně stavu

Aby komponenta reagovala opravdu realtimově na všechny změny stavů (způsobené třeba i jiným uživatelem, který s komponentou pracuje paralelně), doporučují se tyto dva možné scénáře:

1. Při požadavku na změnu stavu (klik na příslušný element) se odesílá požadavek na změnu stavu přes `metrix.component(id)`, např. `metrix.component("segment").digit(0).toggle(4)`,
   samotný klik ale nezmění stav ovládacího elementu (například nezmění zaškrtnutí zaškrtávacího tlačítka) a tuto změnu ovládacího elementu provede až zavolí příslušného
   změnového callbacku registrovaného skrze `metrix.onChange()`
2. Při požadavku na změnu stavu (klik na příslušný element) se odesílá požadavek na změnu stavu přes `metrix.component(id)`, samotné kliknutí proaktivně změní stav elementu
   (například přepne zaškrtávací tlačítko) ale následně přesto provede korekci, kterou vyvolá zavolání callbacku registrovaného skrze `metrix.onChange()`
   samotný klik ale nezmění stav ovládacího elementu (například nezmění zaškrtnutí zaškrtávacího tlačítka) a tuto změnu ovládacího elementu provede až zavolí příslušného
   změnového callbacku registrovaného skrze `metrix.onChange()`

Oba způsoby lze i kombinovat.

#### příklad

Vytvořme jednoduchý příklad, který zvládne plně pracovat s komponentami typu `switch`:

Twigová šablona (všimněte si zejména spárování elementu `<input>` s příslušnou komponentou pomocí atributu `data-metrix-id`):

```twig
{% for component in controls %}
    {% if component.type == "switch" %}
        <label>
            <input data-metrix-id="{{ component.id }}" type="checkbox" {% if component.state %}checked="checked"{% endif %}>
            {{ component.caption }}
        </label>
    {% endif %}
{% endfor %}
```

Javascriptový kód:

```js
metrix.onLoad("switch", function (mev) {         // inicializační funkce pro všechny switch komponenty
    mev.element.bind("click", function() {       // navěsíme standardní jQuery click event na daný checkbox
        mev.component.toggle()                   // při kliknutí na checkbox požádáme metrix o změnu stavu systému
    })
    mev.element.prop("checked", mev.state.state) // nastavíme aktuální stav checkboxu při první inicializaci
})

metrix.onChange("switch", function (mev) {
    mev.element.prop("checked", mev.state.state) // nastavíme aktuální stav checkboxu při změně
})
```
