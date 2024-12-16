---
title: Blacklist
description: K čemu slouží blacklist a jak ho ovládat
---
<script setup>
  const gAds = import.meta.env.VITE_GADS;
</script>

# Blacklist

Blacklist je systém, ve kterém se evidují osoby, které byly z různých důvodů vyloučeny nebo sankcionovány v rámci sboru. 

![Příklad použití příkazu /blacklist](/media/assets/bot/blacklist.png)

## **Co obsahuje blacklist?**
V blacklistu se zobrazují následující údaje:
- **ID blacklistu** (jedinečné číslo záznamu)
- **IC jméno** (herní jméno osoby)
- **OOC nick** (mimosvětové uživatelské jméno)
- **Reason** (důvod zařazení na blacklist)
- **Datum** (datum, kdy byl blacklist udělen)
- **IC a OOC jméno** (jméno a přezdívka člena leadershipu, který blacklist udělil)
- **Volací znak** (volací znak člena leadershipu)
- **Odznak** (odznak nebo identifikace sboru)

## **Jak přidat osobu na blacklist?**
Pro přidání osoby na blacklist použijte příkaz `/blacklist` a postupujte podle instrukcí, které se zobrazí na obrazovce. Viz ukázka:

![Formulář pro zápis omluvenky](/media/assets/bot/blacklist2.png)


## **Jak odebrat osobu z blacklistu?**
Pro odebrání osoby z blacklistu použijte příkaz `/blacklistremove` a zadejte potřebné údaje dle zobrazených pokynů.

![Formulář pro zápis omluvenky](/media/assets/bot/blacklist3.png)


## **Pravidla používání blacklistu**
Blacklist může přidávat nebo odebírat pouze **leadership** daného sboru. Jakékoliv zneužití tohoto systému je přísně zakázáno a může vést k disciplinárním opatřením.

## **Výhody propojeného systému**
- **Přehlednost**: Všechny záznamy o blacklistech jsou na jednom místě.
- **Propojenost**: Leadership má přístup k datům napříč sbory, což usnadňuje koordinaci.
- **Okamžitá aktualizace**: Jakékoliv nové záznamy se ihned projeví v tabulkách.

Pokud narazíte na problém, využijte kanál `📨│ticket` nebo kontaktujte administrátory.