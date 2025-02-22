---
title: Jak Používat
description: Důležité dokumenty po ruce!
layout: doc
---

# LEA Bot | JAK POUŽÍVAT
- Vytvořil **[@PetyXbron aka b1ngo](https://github.com/PetyXbron/)**
- Zdrojový kód je častěčně veřejný na platformě GitHub.
- LEA Bot primárně slouží pouze pro smyšlené policejní sbory **Los Santos Police Department** a **Los Santos Sheriff Department** FiveM serveru **[FreshRP](https://servers.fivem.net/servers/detail/994ldb)**. Jeho jiné používání není doporučeno a je nutné se řídit podmínkami.
- Používáním dodržujete **[licenci](./license.md)**

[![Creative Commons License](https://i.creativecommons.org/l/by-nc-nd/4.0/88x31.png)](http://creativecommons.org/licenses/by-nc-nd/4.0/)

> Tenhle návod je neaktualizovaný, nemusí fungovat, ale určitě pomůže.

## OBSAH:
1. [Spuštění procesu](#1-spuštění-procesu)
2. [Přidání bota na server](#2-přidání-bota-na-server)


### 1. Spuštění procesu
Před spuštěním nezapomeň použít `npm install` pro instalaci balíčků.
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
- 👮✅ **`/blacklist`** - Správa blacklistu
- 👮✅ **`/db`** - Správa databáze zaměstnanců
- 🫡✅ **`/duty`** - Zápis služby
- 🫡✅ **`/event`** - Zápis faktury v rámci eventu
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

Zároveň nově hostuje stránky s **LSPD, LSSD, SAHP tabulkami a blacklistem** na bázi Express.js, Vue.js a API.
Ty se aktualizují **přímo z databáze a Discord serverů** po každém načtení stránky.