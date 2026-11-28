# AI_RULES.md – Verbindliche Arbeitsregeln für Haushaltsbuch und Krypto-Buch

Diese Datei ist bei jeder KI-gestützten Arbeit an diesen Apps zu lesen und als verbindliche Leitlinie zu behandeln. Sie soll verhindern, dass Anforderungen wiederholt erklärt werden müssen, Änderungen nur lokal umgesetzt werden oder sich die Apps uneinheitlich entwickeln.

Das Projekt besteht aus zwei Apps, die sich wie **eine** App anfühlen sollen:

- **Haushaltsbuch** (`index.html`): Buchungen, Konten, Auswertung, Regelmäßiges, Steuer, Auto.
- **Krypto-Buch** (`krypto.html`): Wallets und Börsen, Buchungen, Verlauf, Steuer, Synchronisieren.

Beide laufen als Android-App (Capacitor-APK) und als Web-App (GitHub Pages, auch auf dem iPhone und am PC). Beide synchronisieren über private GitHub-Repositories (`gh.js`, `ghk.js`).

## 1. Grundprinzip: Einheitlichkeit ist der Standard

- **Eine Änderung gilt grundsätzlich app-weit für alle vergleichbaren Stellen, und das schließt beide Apps ein.**
- Beschreibt der Nutzer ein Verhalten, ein Symbol, ein Layout oder eine Regel an einer Stelle, prüfe alle anderen Ansichten und Komponenten mit demselben Element oder derselben Funktion, in beiden Apps.
- Setze eine Änderung nicht nur an der genannten Stelle um, wenn sie sinnvollerweise eine gemeinsame Regel betrifft.
- Einheitlichkeit bedeutet: gleiche Funktion, gleiche Bedeutung, gleiche Bedienlogik, möglichst gleiche Darstellung. Unterschiede nur, wenn sie fachlich sinnvoll oder technisch nötig sind.
- Soll eine Änderung bewusst nur für eine Ansicht oder eine App gelten, muss der Nutzer das sagen oder es muss eindeutig aus dem Kontext hervorgehen.

### Beispiel
Sagt der Nutzer, in der Wallet-Liste solle die Checkbox „Abfragen erlauben" direkt in der Zeile stehen, prüfe, wo sonst Schalter für „erlauben/ausschalten" vorkommen (zum Beispiel im Wallet-Editor, in Einstellungen, im Haushaltsbuch), und halte Aussehen und Verhalten gleich.

## 2. Funktionsgleichheit und gemeinsame Muster

Gleiche Objekte und gleiche Aufgaben bekommen in beiden Apps gleiche Bedienung.

- **Eintragen und Bearbeiten:** Formular, Feldreihenfolge, Validierung, Meldungen und „Rückgängig" sollen sich in beiden Apps gleich anfühlen.
- **Listen:** Zeilenaufbau, Aufklappen, Stift zum Bearbeiten, Farben (Rot für Löschen und Verlust, Grün für Zugang und Gewinn) sind einheitlich.
- **Kopfbereich:** Oben rechts stehen in beiden Apps „Wechsel zur anderen App", „Einstellungen" und der Synchronisationsstatus. Einstellungen sind in beiden Apps über denselben Knopf erreichbar.
- **Hilfe:** Ein „i" öffnet eine kurze, verständliche Erklärung zum jeweiligen Tab.
- **Auswahl in zwei Schritten, wenn viele Optionen da sind:** zuerst die Art wählen (zum Beispiel Ausgabe, Einnahme, Intern), dann nur die passenden Einträge zeigen. Gilt als Muster für andere lange Auswahlen.
- **Ausklappbereiche für Seltenes:** Optionale Felder liegen in einem Ausklappbereich, der sich seinen letzten Zustand merkt.
- **Menüs und Dialoge:** Bottom-Sheets, Toasts und Bestätigungsdialoge haben immer dasselbe Aussehen und Verhalten. Es gibt einen Toast mit „Rückgängig", wenn eine Aktion Daten ändert.
- **Fehlende Aktionen** nicht stillschweigend akzeptieren: Erst prüfen, ob es einen echten Grund gibt. Bei Zweifeln nachfragen.
- **Kontextgerechte Konsistenz statt blindes Kopieren:** Nicht jede Funktion passt überall. Steuerrechnung für Krypto gehört nicht ins Haushaltsbuch, ein Tankbuch nicht ins Krypto-Buch. Wenn unklar ist, ob etwas übernommen werden soll, **gezielt nachfragen**.

## 3. Vor Umsetzung den Umfang bestimmen

Bei jeder Anforderung zuerst klären, ob sie betrifft:

1. Nur ein einzelnes Element.
2. Eine einzelne Ansicht.
3. Alle Ansichten mit diesem Element.
4. Beide Apps.
5. Globale Regeln: Daten, Synchronisation, Steuerberechnung, Navigation, Einstellungen.

**Nicht automatisch den kleinstmöglichen Umfang wählen.**

## 4. Rückfragen bei Mehrdeutigkeit

- Gibt es mehrere plausible Umsetzungen, die Bedienung, Daten, Steuerlogik oder Funktionsumfang wesentlich verändern, **vorher eine konkrete Rückfrage** stellen.
- Rückfragen gezielt halten und nur die tatsächlich offene Entscheidung betreffen.
- Für offensichtliche Folgeänderungen nicht nachfragen.
- Berührt eine Änderung eine frühere Nutzerentscheidung (siehe Abschnitt 13), diese berücksichtigen und bei echtem Konflikt nachfragen.
- Unvollständige oder widersprüchliche Wünsche (zum Beispiel eine abgebrochene Nachricht) nicht raten, sondern die offene Stelle benennen.

## 5. Einheitliches UI und Design

- Bestehende Muster sind Standards: Chips, Segment-Schalter, Karten, Bottom-Sheets, Toasts, Info-Dialoge.
- **Handy zuerst, Desktop gleichwertig.** Jede UI-Änderung auf schmalem Handy (ab 360 px), breitem PC-Fenster und beim Drehen prüfen. Nichts darf abgeschnitten werden oder horizontal scrollen, außer breite Tabellen mit sichtbarer Scrollleiste.
- Mit Touch gut zu treffen: Schaltflächen und Checkboxen mindestens so groß, dass sie mit dem Daumen sicher sitzen.
- Keine Funktion darf nur per Hover, Rechtsklick oder Tastatur erreichbar sein.
- Texte: deutsch, Du-Form, kurz und verständlich. Fachbegriffe nur, wenn nötig, und dann erklärt.
- Zahlen und Währung: deutsches Format (1.234,56 €), das Eurozeichen wird überall gleich gesetzt.
- Gemeinsame Komponenten bevorzugen. Keine Duplikate mit leichten Abweichungen.
- Bei neuen Elementen die Dichte nicht unnötig erhöhen: lieber ausklappbar als eine lange Seite.

## 6. Navigation und Kontext

- Zurück-Taste und Browser-Zurück führen immer dorthin, wo der Nutzer herkam (Liste, Editor, Unterseite), nicht pauschal zur Startseite oder in die andere App.
- Neue Unterseiten und Editoren legen einen Verlaufseintrag an und stellen den vorherigen Zustand wieder her (Filter, Aufklappzustand, Scrollposition, soweit machbar).
- Navigation nicht nur für den gemeldeten Weg korrigieren: verwandte Wege mitprüfen.
- Keine neue Navigationsstruktur erfinden, wenn die Zielstruktur unklar ist. Dann nachfragen.

## 7. Daten, Speicherung und Synchronisation (besonders vorsichtig)

- **Keine Daten unbeabsichtigt verlieren, überschreiben oder zurücksetzen.** Neue Felder müssen mit alten Datenständen funktionieren (Standardwerte, Umwandlung beim Lesen), ohne die Datei umzubauen.
- Nutzerdaten, Einstellungen und Aufklappzustände müssen dauerhaft gespeichert werden, wo sie einen Neustart überleben sollen.
- **Synchronisation:** Mehrere Geräte schreiben gleichzeitig. Änderungen werden zusammengeführt. Gelöschtes darf nicht wiederauferstehen, Neues nicht doppelt entstehen. Alles, was an `gh.js` oder `ghk.js` geändert wird, braucht einen Test mit simuliertem GitHub (Race-Fälle: Löschen auf Gerät A, Bearbeiten auf Gerät B, doppeltes Pushen).
- Jede Buchung hat eine eindeutige ID. IDs nie ändern.
- **Datensicherung (JSON) muss immer erhalten bleiben und alle Daten enthalten.** Bei neuen Datenfeldern prüfen, dass die Sicherung sie mitnimmt und wieder einliest.
- Automatische Zuordnung, Heilung, Vorschläge und Importe dürfen **nie ohne Bestätigung buchen** (Ausnahme nur, wenn der Nutzer sie ausdrücklich für ein Wallet freigegeben hat und der Fall eindeutig ist).
- Importe müssen idempotent sein: derselbe Import zweimal ergibt keine Doppelbuchungen.
- Löschaktionen immer mit „Rückgängig" oder Bestätigung. Sammellöschungen (zum Beispiel „alle Korrekturen") zeigen vorher die Anzahl.
- Zustand muss in allen Ansichten gleich sein: Wird ein Objekt geändert, ändert sich jede Stelle, die es zeigt.

## 8. Steuer- und Rechenlogik (Krypto-Buch und Haushaltsbuch)

- Rechenregeln (FIFO/LIFO, Haltefrist, Freigrenze, Gebühren, Rewards, Transfers) **nie nebenbei ändern**. Änderungen daran nur auf ausdrücklichen Auftrag, mit Tests und mit Hinweis, was sich für bestehende Daten ändert.
- **Transfers zwischen eigenen Wallets sind keine Veräußerung.** Anschaffungsdatum und Anschaffungskosten gehen mit.
- Zubuchungen ohne bekannte Anschaffungskosten sind steuerlich konservativ und als solche zu kennzeichnen.
- Korrekturbuchungen (Ausgleich, Lücke ergänzt, Zubuchung, Sync) müssen erkennbar markiert sein (Tag) und im Steuerbericht-Anhang auftauchen.
- Die App liefert Hilfen, **keine Steuerberatung**. Texte dürfen das nie anders darstellen. Bei Steuerfragen auf einen Steuerberater verweisen.
- Rundung und Summen immer per Test prüfen (Summe der Teile = Gesamtsumme).

## 9. Netzwerk, Privatsphäre und Sicherheit

- **Nie Seed-Phrase oder Private Key abfragen oder speichern.** Nur öffentliche Adressen.
- Abfragen an fremde Dienste (Blockchain, Kurse) laufen **nur auf Knopfdruck** und nur für Adressen oder Wallets, bei denen der Nutzer es erlaubt hat. Kein Hintergrund-Polling, kein Tracking, keine Analytics.
- Die Oberfläche sagt klar, wann ein fremder Dienst Adresse oder IP sehen kann.
- Zugangsdaten (GitHub-Token, Kopplungscode) bleiben nur auf dem Gerät und gehören nie in Logs, Fehlermeldungen oder Ausgaben.
- Fehler im Netz sind normal: Zeitüberschreitung, Rate-Limit, ausgefallener Dienst. Die App zeigt eine verständliche Meldung und läuft weiter. Ein Fehlschlag darf nie Daten verändern.
- Externe Dienste mit Rückfalloption bauen (mehrere Endpunkte). Fest einkodierte Schlüssel gehören nicht in den Code. Optionale Schlüssel trägt der Nutzer selbst ein.

## 10. Sprache und Übersetzung

- Alle sichtbaren Texte gibt es in Deutsch und Englisch. **Jeder neue oder geänderte deutsche Text braucht den passenden englischen Eintrag im Wörterbuch.** Ändert sich ein deutscher Satz, ändert sich sein Schlüssel im Wörterbuch mit, sonst fehlt die Übersetzung.
- PDF-Berichte dürfen auf Deutsch bleiben, das muss dann in der Doku stehen.

## 11. Änderungen sorgfältig umsetzen

- Zuerst bestehenden Code, Datenfluss und ähnliche Funktionen untersuchen.
- Gemeinsame Logik bevorzugt nutzen. Keine bloßen visuellen Workarounds.
- Änderungen gezielt halten. Keine unnötigen Umbenennungen oder Umbauten nebenher.
- Keine bestehenden Funktionen entfernen, nur weil sie gerade nicht gebraucht werden.
- Sonderzeichen in Namen nicht unterschätzen: Coin-Namen, Kategorien, Kontonamen dürfen `#`, Anführungszeichen, Klammern und Leerzeichen enthalten. Keine Selektoren oder IDs aus Nutzertext ungeprüft bauen.
- Für Dinge, die nur im Echtbetrieb prüfbar sind (Netzwerk, Android), Testdaten oder simulierte Antworten nutzen und die Grenze offen nennen.

## 12. Arbeitsablauf bei jedem Änderungsauftrag

1. **Anforderung verstehen:** Was ist das eigentlich gewünschte Verhalten, nicht nur die wörtlich genannte Stelle?
2. **Kontext prüfen:** Bestehende Implementierung, verwandte Ansichten in beiden Apps, geltende Regeln.
3. **Auswirkungsbereich bestimmen** (Abschnitt 3).
4. **Unklarheiten klären** (Abschnitt 4).
5. **Umsetzen**, konsistent und möglichst über gemeinsame Logik.
6. **Folgestellen prüfen:** vergleichbare Ansichten, beide Apps, Handy und PC, Englisch, Sicherung, Navigation.
7. **Validieren:** vorhandene Tests und eine Sichtprüfung in einem Browser. Fehler nicht als behoben darstellen, wenn sie nicht geprüft wurden.
8. **Version erhöhen und ausliefern** (Abschnitt 14).
9. **Berichten:** kurz sagen, was geändert wurde, was zusätzlich mitgezogen wurde, was geprüft wurde und was offen bleibt.

## 13. Bereits getroffene Nutzerentscheidungen (nicht ohne Rückfrage ändern)

- **Kein stilles Buchen.** Vorschläge der App (Lücken, Synchronisation, Zuordnungen) werden gezeigt und bestätigt. Vorfüllen darf rechnen, aber nicht buchen.
- **Lücken in Wallets** werden standardmäßig durch eine Zubuchung ausgeglichen („Fehlenden Bestand zubuchen"), nicht stillschweigend aus anderen Wallets gezogen. „Aus anderen Wallets holen" ist die ausdrücklich zuschaltbare Alternative.
- **Stichtag und „Auf 0 setzen"** pro Wallet bleiben erhalten: Was davor liegt, gilt als gesetzt.
- **Börse oder Wallet:** Börsen haben keine Adressen und kommen per CSV, Wallets haben Adressen und können abgefragt werden. Alte Wallets ohne Angabe werden aus ihren Daten abgeleitet.
- **Abfragen erlauben** ist eine Checkbox in der Wallet-Liste und im Editor. Beim Ausschalten wird gefragt, ob die Sync-Buchungen bleiben oder entfernt werden.
- **Synchronisieren** sitzt in der Wallet-Ansicht oben rechts neben dem „i" und in jeder Wallet-Zeile. Er ist immer sichtbar, auch wenn noch nichts freigegeben ist, und erklärt dann, was zu tun ist.
- **Auffälligkeiten** (Sync-Ergebnisse, Abweichungen, Lücken, ähnliche Buchungen) gehören in die zentrale Ansicht ⋯ → Auffälligkeiten, nicht in die Wallet-Liste. Dort steht nur eine Kurzinfo mit Link.
- **Nie einen Transfer vorschlagen oder buchen, ohne vorher ähnliche vorhandene Buchungen zu prüfen** (gleicher Coin, ähnliche Menge, Datum ± einige Tage). Der Nutzer entscheidet: verbinden, ersetzen oder neu buchen. Nichts automatisch.
- **Netzwerke:** Neue Netzwerke (zuletzt MultiversX/EGLD) immer mit Adressprüfung, Namens-Erkennung und Bestandsabfrage eintragen.
- **Das „i“ (Erklärung) sitzt überall ganz rechts**: in Karten-Überschriften, in der Zeile mit Liste/Karten (Verlauf), bei Gesamtwert, bei Wallets rechts neben „Synchronisieren“. Keine eigene Zeile „Hilfe zu diesem Tab“ mehr im Krypto-Buch.
- **Kurse:** „⟳ Kurse“ (schnell, aktuelle Kurse) steht bei Gesamtwert, „⟳ Verlauf“ (langsam, Kursverlauf für die Grafik) in der Zeile mit 1W/1M/6M/1J/Max.
- **Betrag und Prozent** werden nur durch ein Leerzeichen getrennt, nie durch einen Punkt „·“ (wirkt wie ein Fehler). Gilt in beiden Apps.
- **Kopfzeile in beiden Apps:** Einstellungen ist überall das **Zahnrad** (ganz rechts). Links davon sitzt der Wechsel-Knopf („‹ Haushalt“ / „Krypto ›“, Aussehen unverändert). Im Krypto-Buch stehen links davon noch ⋯ und die Glocke.
- **Benachrichtigungen (Glocke, Krypto-Buch):** rote Zahl für Ungelesenes, beim Antippen verschwindet die Zahl, die Liste bleibt abrufbar. Einträge springen zur Sache (Auffälligkeiten, Buchung, Übersicht). Anlass: neue Auffälligkeiten nach dem Synchronisieren und Bestände, die steuerfrei werden. Nur sparsam benachrichtigen, nie pro Kleinigkeit (Spam vermeiden). Die Liste liegt pro Gerät.
- **Was die Glocke meldet, muss in der Ansicht auch stehen.** Zähler (Glocke, Menü) und Ansicht Auffälligkeiten nutzen dieselbe Filterung. Vorschläge werden pro Wallet gezeigt, auch wenn das Wallet archiviert ist oder keinen Abfragestand mehr hat.
- **Wallets lassen sich löschen** (Editor, mit Rückfrage, Anzahl der betroffenen Buchungen und Rückgängig). „Zusammenführen“ bleibt die Alternative, die Buchungen erhält.
- **Vergleichen statt Fließtext:** Wo die App etwas zuordnen soll (ähnliche Buchung), zeigt sie beide Seiten als Gegenüberstellung mit Pfeil (Quelle ➜ Menge ➜ Ziel), Datum und Hash. Beim Verbinden werden alle Informationen beider Seiten übernommen (Hash, Gegenadresse, Gebühr).
- **Wallet-Karten in Listen** (Auffälligkeiten) haben eine farbige Kopfzeile mit Initiale, großem Namen und Pfeil. Ein Tipp darauf öffnet das Wallet.
- **Netzwerk-Auswahl** zeigt nur Netzwerke, die zur eingegebenen Adresse passen. BNB Beacon Chain (BEP2, `bnb1…`) ist nur noch ein Hinweis, die Chain wurde eingestellt.
- **Haushalt „Buchen“-Knopf:** grau, solange Pflichtfelder fehlen. Tippen zeigt „Es fehlt noch: …“. Der schwebende Knopf erscheint nur, wenn der feste Buchen-Knopf weiter unten liegt, nie darunter.
- **Version und Updates:** Die Version steht oben rechts (`v4.9` neben dem Sync-Status) und ausführlich unten in den Einstellungen („Version … Details und Updates“). Beide Apps nutzen dieselbe Datei `www/upd.js`. Bei jeder Änderung `APP_VER` in beiden Apps erhöhen und `CACHE` in `sw.js` mitziehen.
- **APK-Updates:** Der Workflow `apk.yml` schreibt `www/app-info.json` (Repository, Build-Code, Build-Name) in die APK und nimmt den Build-Code (Minuten seit 1970) als `versionCode`, damit er nie sinkt. Der Release-Text enthält `Build-Code: …`, daran erkennt die App ein neueres Release. Der Signaturschlüssel (`KEYSTORE_B64`) darf **nie** geändert werden.
- **Verbinden-Ansicht in beiden Apps gleich:** Karte „Mit dem Daten-Repository verbinden“ (Kopplungscode + „Mit Code verbinden“), darunter „Oder von Hand“ (Benutzername, Repository-Name, Token, „Verbinden“), im Krypto-Buch zusätzlich ganz unten „Gleicher Zugang wie das Haushaltsbuch“. Felder sind **leer**, Vorgaben stehen nur als graue Platzhalter (z. B. `haushaltsbuch-daten`, `krypto-daten`) und gelten, wenn das Feld leer bleibt. Beide Apps brauchen **getrennte Repositories**, weil sie dieselben Dokumentnamen (`config/main`) benutzen.
- **Zwei getrennte Repositories, strikt.** Haushaltsbuch (`gh.js`, Schlüssel `hb-gh`) und Krypto-Buch (`ghk.js`, Schlüssel `kb-gh`) benutzen nie dasselbe Repository, denn beide schreiben nach `data/config/main`. Schutz: (1) Beim Verbinden wird der Repository-Name geprüft (`haushalt` bzw. `krypto` im Namen, gleiches Repository wie die andere App), (2) der Inhalt (Krypto: `data/orders/`, `wallets` in `config/main`; Haushalt: `data/monate|steuer|sprit/`, `config/main` ohne `wallets`), (3) vor **jedem** Synchronisieren, bevor etwas geschrieben wird. Bei Treffer: Fehlermeldung, nichts wird gespeichert, weitere Schreibversuche stoppen. Änderungen an `gh.js` und `ghk.js` immer in beiden Dateien gleich halten und `tguard.js` laufen lassen. Ein gemeinsames Repository wäre nur mit getrennten Unterordnern möglich (großer Umbau).
- **Updater (Android):** `apk.yml` baut ein kleines Capacitor-Plugin `UpdaterPlugin` (Java) ein: lädt die APK in den Cache und startet den System-Installer über FileProvider. Schlägt der Build damit fehl, baut der Workflow automatisch ohne Plugin (Schutznetz), die App fällt dann auf den Browser-Download zurück. `upd.js` erkennt das Plugin über `Capacitor.Plugins.Updater`. Der Bestätigungsdialog von Android bleibt immer, das lässt sich nicht umgehen.
- **Spam** muss sich überall markieren und wieder freigeben lassen.
- **NFTs und Sonstiges** zählen nicht in Gesamtwert und Anteile, bleiben aber für die Steuer erhalten.
- **Kategorien** werden in zwei Schritten gewählt: Ausgabe, Einnahme, Intern, dann die passenden Kategorien.
- **Eine Buchung hat immer eine Kategorie.**
- **Einstellungen** sind in beiden Apps über einen Knopf im Kopf erreichbar, nicht versteckt.
- **Regelmäßige Buchungen** im Krypto-Buch stehen unter Buchen (neben Eintragen und Importieren), nicht in den Einstellungen. Importieren ebenso.
- **Export** (PDF, CSV) im Krypto-Buch liegt im Steuer-Tab neben der Berechnung, mit Symbolen zum Antippen. Der Steuerbericht beginnt mit einer großen Übersicht (steuerpflichtig, steuerfrei, Rewards).
- **Datensicherung bleibt** und darf nie entfernt oder verkleinert werden.

## 14. Versionierung und Lieferumfang

- Jede Auslieferung erhöht die **Versionsnummer** sichtbar (unten in den Einstellungen).
- Android-Dateien heißen `Haushaltsbuch_v1.N.apk`, Update-Pakete werden nummeriert (zum Beispiel `Krypto-App-Update_v4.3.zip`). Alte Pakete werden ersetzt, nicht gesammelt.
- Der Service Worker erhält bei jeder Änderung einen neuen Cache-Namen, sonst sieht der Nutzer die alte Version.
- Nur Dateien ausliefern, die sich geändert haben, mit korrekten Projektpfaden und ohne unnötige Dateien. Ein Paket muss auf dem **aktuellen** Stand basieren, keine überholten Patches wiederverwenden.
- Die APK wird immer mit demselben Schlüssel signiert (Secret `KEYSTORE_B64`). Diesen Schlüssel nie ändern, sonst lassen sich Updates nicht installieren.
- Bei größeren Änderungen die betroffenen Bereiche kurz auflisten.

## 15. Checkliste vor Abschluss

- [ ] Ist die eigentliche Anforderung umgesetzt?
- [ ] Wurde sie an allen vergleichbaren Stellen und in beiden Apps umgesetzt?
- [ ] Funktioniert alles auf dem Handy und am PC, ohne abgeschnittene oder verschobene Elemente?
- [ ] Ist die Navigation inklusive Zurück-Weg geprüft?
- [ ] Bleiben bestehende Daten, Sicherung und Synchronisation unversehrt?
- [ ] Bucht nichts ohne Bestätigung, gibt es „Rückgängig" bei Datenänderungen?
- [ ] Sind Rechenregeln unverändert oder die Änderung bewusst, getestet und erklärt?
- [ ] Gibt es englische Texte für alles Neue?
- [ ] Sind Version, Cache-Name und Paketname erhöht?
- [ ] Wurde geprüft, was geprüft werden konnte, und sind nicht getestete Punkte (Netzwerk, Android, echtes Gerät) offen genannt?

## 16. Kommunikation

- Kompakt, sachlich, ehrlich, auf Deutsch in der Du-Form.
- Keine Erfolgsmeldung für Tests, Builds oder Funktionen, die nicht tatsächlich geprüft wurden.
- Klar sagen, wenn etwas nur gegen Testdaten geprüft wurde und im Echtbetrieb noch offen ist.
- Fehler zugeben und beheben, ohne Drama.
- Der Nutzer arbeitet oft spät und müde und hat viele Wünsche in einer Nachricht. Wünsche sauber aufteilen, nichts vergessen, am Ende kurz zusammenfassen, was erledigt ist und was noch aussteht.

## 17. Leitgedanke

**Der Nutzer beschreibt oft eine konkrete Stelle, meint aber eine allgemeine Regel.** Erkenne die Regel, übertrage sie auf beide Apps und halte die Konsistenz aktiv. Ist die Reichweite unklar, lieber eine gezielte Rückfrage als eine unvollständige oder uneinheitliche Lösung.
