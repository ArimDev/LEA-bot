# LEA Bot | JAK POUŽÍVAT
- Vytvořil **[@PetyXbron aka b1ngo](https://github.com/PetyXbron/)**
- Veřejně dostupné na platformě GitHub.
- LEA Bot primárně slouží pouze pro smyšlené policejní sbory **Los Santos Police Department** a **Los Santos Sheriff Department** na FiveM serveru **NoLimit | RefreshRP**. Jeho jiné používání není doporučeno a je nutné se řídit podmínkami.
- Zkontroluj **[licenci](/LICENSE.md)** před používáním

[![Creative Commons License](https://i.creativecommons.org/l/by-nc-nd/4.0/88x31.png)](http://creativecommons.org/licenses/by-nc-nd/4.0/)

## OBSAH:
1. [Spuštění procesu](#1-spuštění-procesu)
2. [Přidání bota na server](#2-přidání-bota-na-server)
3. [Používání funkcí](#3-používání-funkcí)
    1. [Zápis duty](#1-zapsání-duty)
    2. [Zápis omluvenky](#2-zapsání-omluvenky)


### 1. Spuštění procesu
Před spuštěním nezapomeň použít `npm install` pro instalaci balíčků (`discord.js`, `dotenv`, `express`, `node-fetch`).
- `npm start` pro zapnutí na dobu neurčitou
- `npm test` pro kontrolu bezproblémového zapnutí

### 2. Přidání bota na server
Použitím pozvánky https://discord.com/oauth2/authorize?client_id=ID-APLIKACE&permissions=309640612928&scope=bot%20applications.commands s oprávněními:
- [x] Upravovat role *(přiřazování role hodnosti)*
- [x] Upravovat přezdívky *(přiřazování volačky do přezdívky)*
- [x] Číst zprávy a zobrazovat kanály *(odesílání a úprava zpráv)*
- [x] Odesílání zpráv *(odesílání a úprava zpráv)*
- [x] Vytvářet veřejná vlákna *(vytváření diskuzí)*
- [x] Odesílání zpráv ve vláknech *(odesílání a úprava zpráv)*
- [x] Vkládat odkazy *(embeds)*
- [x] Přikládat soubory *(nahrávání příliš velkého obsahu)*
- [x] Používání externích emoji *(pro zpestření zpráv)*
- [x] Přidávat reakce *(označení složky za správnou nebo chybnou)*

### 3. Používání funkcí
Bot se hlavně zatím používá pomocí jednoduchých příkazů:
- 👮✅ **`/db`** - Správa databáze zaměstnanců
- 🫡✅ **`/duty`** - Zápis služby
- 👮✅ **`/leader`** - Obecná admin správa
- 🫡✅ **`/menu`** - Základní přehled / pomocné menu bota
- 🫡✅ **`/omluvenka`** - Zápis omluvenky
- 🫡✅ **`/online`** - Členi serveru, kteří aktuálně hrají na RefreshRP
- 🫡✅ **`/profil`** - Vyhledat zaměstnance na základě různých parametrů
- 🫡❌ **`/rep`** - Hodnocení, přidání reputace kolegům
####
- 🫡 značí příkaz pro **všechny / zaměstnance**
- 👮 značí příkaz pro **adminy**
- ✅ značí příkaz, který je v téhle verzi **funkční**
- ❌ značí příkaz, který je v téhle verzi **nefunkční / nedokončený**

Zároveň nově hostuje stránky s **LSPD, LSSD tabulkami, jejich divizemi a blacklistem** na bázi Express.js, HTML+CSS+JS.
Ty se aktualizují **přímo z databáze a Discord serverů** po každém načtení stránky.

#### 1. Zapsání duty
1. Použij příkaz **`/duty`**.

![Duty pop-up ukázka](/assets/duty-modal.png)

2. **Vyplň údaje** v tzv. pop-upu.
3. **Potvrď odeslání** a zkontroluj výsledek.

![Duty embed ukázka](/assets/duty-embed.png)

#### 2. Zapsání omluvenky
1. Použij příkaz **`/omluvenka`**.

![Omluvenka pop-up ukázka](/assets/apology-modal.png)

2. **Vyplň údaje** v tzv. pop-upu.
3. **Potvrď odeslání** a zkontroluj výsledek.

![Omluvenka embed ukázka](/assets/apology-embed.png)

Použivání každé funkce je omezené a tím pádem je nepochopení, či špatné použití skoro nemožné.