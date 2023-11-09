# SAHP-bot | JAK POUŽÍVAT
- Vytvořil **[@PetyXbron](https://github.com/PetyXbron/)**
- Veřejně dostupné na platformě GitHub.
- SAHP-bot primárně slouží pouze **San Andreas Highway Patrol** na FiveM serveru **RefreshRP**. Jeho jiné používání není doporučeno a je nutné se řídit podmínkami.
- Zkontroluj **[licenci](/LICENSE.md)** před používáním

[![Creative Commons License](https://i.creativecommons.org/l/by-nc-nd/4.0/88x31.png)](http://creativecommons.org/licenses/by-nc-nd/4.0/)

## OBSAH:
1. [Spuštění procesu](#1-spuštění-procesu)
2. [Přidání bota na server](#2-přidání-bota-na-server)
3. [Používání funkcí](#3-používání-funkcí)
    1. [Zápis duty](#i-zapsání-duty)
    2. [Zápis omluvenky](#i-zapsání-omluvenky)
    3. [Zápis CPZ](#i-zapsání-cpz)


### 1. Spuštění procesu
Před spuštěním nezapomeň použít `npm install` pro instalaci balíčků (`discord.js`, `dotenv`, `fs`).
- `npm start` pro zapnutí na dobu neurčitou
- `npm test` pro kontrolu bezproblémového zapnutí

### 2. Přidání bota na server
Použitím pozvánky https://discord.com/oauth2/authorize?client_id=ID-APLIKACE&permissions=274877990912&scope=bot%20applications.commands s oprávněními:
- [x] Odesílání zpráv *(úprava zpráv)*
- [x] Odesílání zpráv ve vláknech *(úprava zpráv)*
- [x] Vkládat odkazy *(embeds)*
- [x] Číst historii zpráv *(úprava zpráv)*

### 3. Používání funkcí
Bot se hlavně zatím používá pomocí jednoduchých příkazů:
- 🫡✅ **`/cpz`** - Zápis CPZ
- 👮✅ **`/db`** - Správa databáze zaměstnanců
- 🫡✅ **`/duty`** - Zápis služby
- 🫡❌ **`/hledat`** - Vyhledat zaměstnance podle údaje mimo těch z Discordu
- 🫡✅ **`/kolega`** - Vyhledat zaměstnance podle Discord člena
- 🫡✅ **`/menu`** - Základní přehled / pomocné menu bota
- 🫡✅ **`/omluvenka`** - Zápis omluvenky
- 👮❌ **`/warn`** - Varování zaměstnance

🫡 značí příkaz pro **všechny / zaměstnance**
👮 značí příkaz pro **adminy**
✅ značí příkaz, který je v téhle verzi **funkční**
❌ značí příkaz, který je v téhle verzi **nefunkční / nedokončený**

#### i. Zapsání duty
1. Použij příkaz **`/duty`**.

![Duty pop-up ukázka](/assets/duty-modal.png)
2. **Vyplň údaje** v tzv. pop-upu.
3. **Potvrď odeslání** a zkontroluj výsledek.

![Duty embed ukázka](/assets/duty-embed.png)

#### i. Zapsání omluvenky
1. Použij příkaz **`/omluvenka`**.

![Omluvenka pop-up ukázka](/assets/apology-modal.png)
2. **Vyplň údaje** v tzv. pop-upu.
3. **Potvrď odeslání** a zkontroluj výsledek.

![Omluvenka embed ukázka](/assets/apology-embed.png)

#### i. Zapsání CPZ
1. Použij příkaz **`/cpz`**.

![CPZ pop-up ukázka](/assets/cpz-modal.png)
2. **Vyplň údaje** v tzv. pop-upu.
3. **Potvrď odeslání** a zkontroluj výsledek.

![CPZ embed ukázka](/assets/cpz-embed.png)