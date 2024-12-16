---
title: Povýšení a degradace
description: Návod pro registraci a vyhazov officera
---
<script setup>
  const gAds = import.meta.env.VITE_GADS;
</script>

# Registrace a Vyhazov

## **Jak funguje registrace?**
Pro registraci nového člena použijte příkaz `/db` a postupujte podle instrukcí, které vám bot poskytne. Následně budete vyplňovat tyto informace:

![Formulář pro zápis služby](/media/assets/bot/registr.png)

- **Jméno** nového člena.
- **Volací znak** (Callsign).
- **Číslo odznaku**.
- **Hodnost**.

Tabulku vyplňujete podle tabulek na webu [LEA Bot](https://leabot.petyxbron.cz), kde hledáte **volné políčko** pro volací znak a číslo odznaku daného člena.

Jakmile všechny požadované informace vyplníte, klikněte na **Odeslat** a systém automaticky přidá nového člena do příslušné tabulky. Veškeré informace jsou okamžitě synchronizovány a dostupné pro vedení.

![Formulář pro zápis služby](/media/assets/bot/registr2.png)

## **Jak probíhá vyhazov?**
Pokud potřebujete člena vyřadit z databáze, postupujte následovně:
1. Ujistěte se, že všechny jeho povinnosti jsou splněné (např. odebrání práv na Discordu).
2. Použijte příkaz `/db` a vyplňte ID člena nebo jeho volací znak.
3. Potvrďte vymazání.

![Formulář pro zápis služby](/media/assets/bot/registr3.png)

Po dokončení procesu se člen automaticky odstraní ze všech příslušných tabulek a jeho záznamy budou archivovány pro potřeby vedení.

## **Důležité upozornění**
- **Registrace a vyhazov** mohou provádět pouze členové **leadershipu** nebo osoby s pověřením.
- Každá změna je logována pro kontrolní účely.
- Chyby při vyplňování tabulek mohou způsobit nesrovnalosti, proto postupujte pečlivě.

Pokud narazíte na problém, využijte kanál `📨│ticket` nebo kontaktujte administrátory.
