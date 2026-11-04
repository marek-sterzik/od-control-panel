# Kontrolní panel pro ovládání hardwarových kontrolek

Tato aplikace slouží na ovládání specifického hardwarového kontrolního panelu určeného pro demonstraci na den otevřených dveří SPŠ Ostrov.

Rychlý start aplikace:

* Nainstalujte docker a Ubuntu ([podrobnosti zde](doc/spso-runtime.md))
* Naklonujte tento repozitář
* Spusťte příkaz `bin/docker start` (při prvním spuštění odpovězte na otázky)

Dokumentace:

* [základní dokumentace k používání prostředí spsostrov-php-runtime](doc/spso-runtime.md)
* [průvodce návrhem témat](doc/theme-design.md)
* [testování a provoz aplikace](doc/testing.md)
* [krátký návod, jak přispívat do projektu](doc/contribution.md)

Architektura:

Aplikace se skládá ze dvou hlavních částí:

1. Z PHP aplikace psané ve frameworku Symfony
2. Z backendu řídícího hardware psaného v pythonu ve frameworku Metrix.

PHP aplikace i její javascriptový frontend komunikují s backendem pomocí websocketů.
