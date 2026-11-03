# Mini howto pro přispívání do projektu

## úvodní příprava

Všechny tyto kroky stačí provést jednou na počátku práce a není nutné je opakovat.

### konfigurace gitu

```bash
git config --global user.email "<váš e-mail>"
git config --global user.name "<vaše jméno>"
git config --global push.default current
git config --global pull.rebase false
git config --global advice.detachedhead false
```

### vytvoření ssh klíče

```bash
ssh-keygen
```

Klíč je potom uložen ve vaší domovské složce (zpravidla `/home/<uživatelské-jméno>`) v podsložce `.ssh/`. Tam by měly vzniknout dva soubory:

1. `.ssh/id_ed25519` (nebo postaru `.ssh/id_rsa`) - tajná část klíče, kterou nedáváte nikomu z ruky
2. `.ssh/id_ed25519.pub` (nebo postaru `.ssh/id_rsa.pub`) - veřejná část klíče, kterou můžete komukoliv sdělit a tím se autorizovat.

Klíč lze prohlédnout příkazem:

```bash
cat ~/.ssh/id_ed25519.pub   # nebo postaru: cat ~/.ssh/id_rsa.pub
```

Po vypsání lze obsah klíče zkopírovat do schránky a přenést jinam.


### nastavení githubu

* Na githubu je potřeba si zřídit účet.
* Vygenerovaný ssh klíč je potřeba si nastavit takto:
    * kliknutím na ikonku uživatele vpravo nahoře se rozbalí menu
    * v menu je potřeba kliknout na "Settings", objeví se samostatná stránka nastavení uživatele
    * v levém menu je potřeba vybrat "SSH and GPG keys"
    * kliknout na tlačítko "New SSH key"
    * do kolonky "Title" vyplnit název klíče (hodnota pro vás, abyste se vyznali v tom, který ssh klíč je který)
    * v kolonce "Key type" ponechat vyplněno "Authentication Key"
    * do kolonky "Key" zkopírovat obsah souboru s veřejným ssh klíčem (vypsán příkazem `cat ~/.ssh/id_ed25519.pub`)
* Uživatelské jméno je potřeba sdělit uživateli, aby vás přidal jako přispěvatele do projektu.
* Po přidání učitelem do projektu je potřeba přidání potvrdit z vaší strany. (učitel odesílá pozvánku, kterou musíte přijmout)


### instalace git branch

Pro zobrazování aktuální větve (velmi užitečná věc!) je potřeba zavolat příkaz:

```bash
curl -sS https://raw.githubusercontent.com/marek-sterzik/git-branch/refs/heads/master/git-branch-installer.sh | bash
```

Poté je potřeba restartovat ubuntu (vypnout a zapnout terminál na WSL).


### naklonování repozitáře

Naklonujte repozitář pomocí ssh url:

```bash
git clone git@github.com:marek-sterzik/od-control-panel.git
```

## rutina

```bash
# vstoupím do projektového adresáře
cd od-control-panel

# spustím kontejnery
bin/docker start

# kontroluji stav:
git status

# přepnu se na hlavní větev projektu:
git checkout master

# stáhnu nejnovější verzi projektu z githubu:
git pull

# vytvoření nové větve pro úkol, který právě provádím. Větev musí mít vždy tvar:
# <jmeno-uzivatele>/<kratky-popis-provadeneho-ukonu>
git checkout -b frantisek-vomacka/design-tematu

# nyni pracuji na potřebných změnách, měním soubory v adresáři dle libosti
# nikdy ale nic neměním ve složce `.git`!

# kontrola stavu:
#  červená - změněné soubory
#  zelená - změněné soubory, které jsou určeny k commitu
git status

# přidání souboru do vznikajícího commitu (změna stavu z červeného souboru na zelený):
git add <soubor>

# jakmile jsem spokojen s tím, jaké změny jsou provedeny (a připraveny jako zelené):

# ještě jednou zkontroluji stav změn:
git status

# potom nechám vzniknout nový commit
git commit -m "<lidsky-čitelný-popisek-provedené-změny>"

# commitování lze opakovat, má smysl tvořit commity jako funkční celky

# výslednou větev pushnu na github:
git push -u origin frantisek-vomacka/design-tematu
```

Při volání posledního `git push` se ve zprávě o pushnutí objeví URL na github, které umožňuje vytvořit nový "pull request." Tj. žádost o začlenění větve do hlavní větve projektu.
Buď pomocí tohoto URL, nebo přímo ve webovém rozhraní githubu vytvořím pull request na začlenění mé větve do větve `master`.

Poté informuji učitele, že je úkol odevzdán.


