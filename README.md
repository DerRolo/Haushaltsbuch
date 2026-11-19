# Haushaltsbuch – Android-App

Diese Dateien bauen die App. Du brauchst dafür nur einen Browser und ein kostenloses GitHub-Konto (github.com).
Am PC geht es am einfachsten. Plane etwa 20 Minuten ein, das ist einmalig.

## Teil 1: Zwei Repositories anlegen

**Repository für deine Daten (privat)**
1. Auf github.com oben rechts auf **+ → New repository**.
2. Name: `haushaltsbuch-daten`, Sichtbarkeit: **Private**, dann **Create repository**.
3. Auf der Seite **uploading an existing file** wählen.
4. Aus dem Paket `Haushaltsbuch-Daten.zip` den Ordner **`data`** in das Browserfenster ziehen (nicht die Zip-Datei selbst, erst entpacken).
5. Unten **Commit changes**.

**Repository für die App (öffentlich, enthält keine Daten)**
1. **+ → New repository**, Name: `haushaltsbuch`, Sichtbarkeit: **Public**, **Create repository**.
2. **uploading an existing file**, dann alles aus dem entpackten Paket `Haushaltsbuch-App.zip` hineinziehen (Ordner `www`, `resources`, `.github` und die Dateien).
3. **Commit changes**.
4. Prüfe, dass im Repository der Ordner `.github/workflows` mit `apk.yml` und `web.yml` zu sehen ist. Fehlt er (manche Browser überspringen Ordner mit Punkt), dann **Add file → Create new file**, als Name `.github/workflows/apk.yml` eintippen, den Inhalt aus `workflows-kopie/apk.yml` einfügen und speichern. Dasselbe mit `web.yml`.

## Teil 2: Die App bauen lassen

1. Im Repository `haushaltsbuch`: **Settings → Actions → General → Workflow permissions** auf **Read and write permissions** stellen, **Save**.
2. Tab **Actions**. Falls schon ein Lauf „Android-App bauen“ läuft, warte. Sonst links **Android-App bauen → Run workflow**.
3. Nach 5 bis 10 Minuten steht ein grüner Haken da. Falls rot: den Lauf öffnen und mir den Text der roten Stelle schicken.
4. Auf der Startseite des Repositories rechts unter **Releases** die neueste Version öffnen und **Haushaltsbuch.apk** laden.

## Teil 3: Installieren

1. Die Release-Seite am Handy öffnen, **Haushaltsbuch.apk** laden und öffnen.
2. Android fragt, ob dieser Quelle die Installation erlaubt sein soll. Zulassen, installieren.
3. Die App heißt **Haushaltsbuch** und hat ein grünes Buch-Symbol.

## Teil 4: Zugangs-Token erzeugen

1. github.com → Profilbild → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Name: `Haushaltsbuch`. Ablauf: **1 Jahr**.
3. **Repository access → Only select repositories** → `haushaltsbuch-daten`.
4. **Permissions → Repository permissions → Contents → Read and write**.
5. **Generate token** und den Token (`github_pat_…`) sofort kopieren, er wird nur einmal gezeigt.

## Teil 5: App verbinden

1. App öffnen. Auf dem Startbildschirm: GitHub-Benutzername, Repository `haushaltsbuch-daten`, Token einfügen, **Verbinden**.
2. Die App holt deine Daten und zeigt sie an. Ab jetzt wird jede Änderung automatisch hochgeladen. Es geht auch offline, hochgeladen wird später.
3. **Zweites Gerät:** In der ersten App unter **Einstellungen → Kopplungscode für ein anderes Gerät** kopieren, dir selbst schicken, auf dem anderen Gerät beim Start einfügen.

## Teil 6: Am PC nutzen (optional)

1. Im Repository `haushaltsbuch`: **Settings → Pages → Source: GitHub Actions**.
2. **Actions → Web-Version für den PC → Run workflow**.
3. Danach läuft die App unter `https://DEIN-NAME.github.io/haushaltsbuch/`. In Chrome oder Edge in der Adressleiste auf das Installieren-Symbol klicken, dann ist sie ein eigenes Programm.
4. Dort wie auf dem Handy mit Kopplungscode verbinden.

## Wissenswertes

- **Der Token ist das Passwort für deine Daten.** Teile ihn nicht. Das Daten-Repository muss privat bleiben, die App prüft das beim Verbinden.
- **Läuft der Token ab** (nach einem Jahr), erzeuge einen neuen und verbinde die App neu (Einstellungen → Trennen). Deine Daten bleiben im Repository erhalten.
- **Synchronisation** passiert beim Öffnen, nach jeder Änderung und etwa jede Minute. Ändern zwei Geräte genau dieselbe Buchung gleichzeitig, gewinnt die zuletzt gespeicherte. Neue Buchungen von zwei Geräten gehen nicht verloren. In seltenen Konfliktfällen kann eine gelöschte Buchung wieder auftauchen.
- **PDF und CSV:** Am Handy öffnet sich das Teilen-Menü, dort kannst du speichern, in einer PDF-App öffnen und drucken. Am PC wird die Datei heruntergeladen.
- **Updates:** Wenn ich die App ändere, lädst du die geänderten Dateien ins Repository `haushaltsbuch` hoch. GitHub baut automatisch eine neue APK, die du einfach über die alte installierst. Deine Daten bleiben erhalten.
- **Signatur:** Die APK ist mit einem Test-Schlüssel signiert, der im Repository liegt. Das reicht für den Eigengebrauch und erlaubt Updates über die alte Version. Für den Play Store wäre ein eigener Schlüssel nötig.
