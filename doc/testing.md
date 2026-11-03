# Testování a provoz aplikace

## spuštění aplikace a konfigurace

Při prvním spuštění pomocí

```bash
bin/docker start
```

se vás aplikace zeptá na dvě otázky:

1. Na jakém portu chcete, aby vám aplikace běžela. Pokud si nevíte rady, zkuste ponechat port 80. Můžete ale nastavit jiný port (např. 8080) a aplikace pak bude dostupná
   přes url `http://localhost:8080`
2. Uveďte název zařízení, se kterým má aplikace komunikovat. Aplikace předpokládá jako zařízení RS485 rozhraní, které se hlásí jako sériové zařízení. Pokud aplikaci
   provozujete přes WSL (Windows subsystem for Linux), je přístup k RS485 zařízení patrně vcelku komplikovaná záležitost, která nebyla testována. Vždy ale můžete
   zadat hodnotu `none`, která přepne backend aplikace do režimu, ve kterém není komunikace s reálným hardwarem vůbec vyžadována. I v tomto režimu je aplikace
   plně testovatelná.

Pokud chcete zařízení rekonfigurovat, můžete tak učinit pomocí:

```bash
bin/docker configure
bin/docker restart    # restart aplikace - nutné jenom, pokud už aplikace běžela a pokud se skutečně konfigurace změnila
```

## testování výstupu

Pokud není k dispozici reálný hardware, lze si prohlížet výstup aspoň částečně pomocí monitorovacího nástroje. Monitorovací nástroj lze spustit jako:

```bash
bin/monitor
```

Monitorovací nástroj sleduje v reálném čase stavy všech kontrolek a segmentů a zobrazuje je v čitelném tvaru. Někdy je potřeba vyčkat až 10 sekund, než se data zobrazí.

Jedinou nevýhodou tohoto pohledu je, že stav segmentů segmentového displeje se zobrazuje jako řetězec osmi nul a jedniček v kanonickém pořadí a převod do geometrického
tvaru si musí uživatel udělat sám.

Monitor se ukončí stiskem klávesy `q`. Aby mohl monitor běžet, musí být aplikační kontejnery spuštěny (spustí se buď přes `bin/docker start` nebo `bin/docker up`).

Monitor lze použít jak v případě, že je dostupný reálný hardware, tak v případě, že reálný hardware není připojen.

## testování nedostupnosti backendu

Do aplikace je integrován jednoduchý mechanismus, kterým je možné aplikaci "předstírat," že backend serveru je nedostupný. To je věc, kterou bude potřebovat designer
chybové stránky aplikace. Nedostupný backend lze předstírat vytvořením souboru `backend-disabled.txt` v kořenovém adresáři projektu. Na obsahu souboru nezáleží.

Chce-li tedy někdo vyzkoušet zobrazování chybové zprávy o nedostupnosti backendu, stačí vyvrořit soubor `backend-disabled.txt`. Smazáním souboru se stane backend
opět dostupným.
