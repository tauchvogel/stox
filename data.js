'use strict';
// Inhalte der App (alles offline). Quellen-Kürzel:
// BBK = Bundesamt für Bevölkerungsschutz (DE) · AT = oesterreich.gv.at · CH = BABS (Schweiz)
// US = Red Cross / Ready.gov · Allg. = allgemein übliche Empfehlung
window.NV_DATA = {

  // ---------- Vergleich der Behörden ----------
  compare: [
    { who: 'Deutschland (BBK)', text: 'Vorrat für 10 Tage, 2 l Flüssigkeit pro Person/Tag (davon ca. 0,5 l zum Kochen), ca. 2.200 kcal/Tag. Auch 3 Tage Vorrat sind besser als keiner.' },
    { who: 'Österreich', text: 'Für ca. 2 Wochen planen („Campingurlaub zu Hause“), Vorrat 10–14 Tage, ca. 2,5 l Wasser/Tag (ca. 35 l pro Person), Bargeld bis 100 € pro Person in kleinen Scheinen.' },
    { who: 'Schweiz (BABS)', text: 'Lebensmittel für ca. 1 Woche, 9 l Wasser pro Person für 3–4 Tage, Notgepäck in ca. 30 Minuten gepackt.' },
    { who: 'USA (Red Cross / Ready.gov)', text: '3 Tage Notgepäck für Evakuierung, 2 Wochen Vorrat zu Hause. Wasser 1 Gallone (ca. 3,8 l) pro Person/Tag inkl. Hygiene, Medikamente für 7 Tage.' },
    { who: 'Für dich (4 Personen, 14 Tage)', text: 'BBK-Mindestwert: 112 l Wasser. Mit Reserve für Hygiene/Kochen empfehlenswert: 140–170 l (2,5–3 l pro Person/Tag).' }
  ],

  // ---------- Checkliste ----------
  checklist: [
    { id: 'wasser', icon: '💧', title: 'Wasser', items: [
      { id: 'w1', src: 'BBK AT CH US', text: 'Trinkwasser-Vorrat: mind. 2 l pro Person und Tag (4 Pers. × 14 Tage = 112 l, besser 140 l+)' },
      { id: 'w2', src: 'BBK', text: 'Zusätzliches Brauchwasser für Toilette, Reinigung, Löschen (Kanister, Eimer, Wannen)' },
      { id: 'w3', src: 'Allg.', text: 'Wasser-Entkeimung als Reserve (Tabletten oder Outdoor-Filter)' },
      { id: 'w4', src: 'Allg.', text: 'Wasser kühl, dunkel und gut verschlossen lagern; Haltbarkeit prüfen' },
      { id: 'w5', src: 'BBK', text: 'Wasser für Haustiere einplanen' }
    ]},
    { id: 'essen', icon: '🥫', title: 'Lebensmittel', items: [
      { id: 'e1', src: 'BBK AT', text: 'Vorrat für mind. 10–14 Tage, ca. 2.200 kcal pro Person und Tag (siehe Bedarf-Tab)' },
      { id: 'e2', src: 'BBK CH', text: 'Ohne Kühlung haltbar, fertig essbar oder kurze Kochzeit' },
      { id: 'e3', src: 'BBK', text: 'Allergien, Diäten, Kinder und Vorlieben berücksichtigen. „Keine Experimente“: nur Essen, das ihr sonst auch esst' },
      { id: 'e4', src: 'AT', text: 'Kühl, trocken, schädlingssicher lagern; Vorrat einmal pro Jahr prüfen oder laufend rotieren' },
      { id: 'e5', src: 'AT', text: 'Nicht auf die Tiefkühltruhe verlassen: Bei Stromausfall taut sie nach einigen Stunden auf' },
      { id: 'e6', src: 'BBK US', text: 'Manueller Dosenöffner, Geschirr, Besteck (ggf. Einweg), Topf mit Deckel' },
      { id: 'e7', src: 'BBK', text: 'Salz, Zucker, Brühe, Gewürze, Kaffee/Tee nicht vergessen (Geschmack und Moral)' }
    ]},
    { id: 'kochen', icon: '🔥', title: 'Kochen, Heizen, Brandschutz', items: [
      { id: 'k1', src: 'BBK AT CH', text: 'Notkocher (Camping-/Gaskocher, Spiritus oder Brennpaste) plus Brennstoff-Vorrat; Hinweis des Herstellers beachten, ob für Innenräume zugelassen' },
      { id: 'k2', src: 'BBK', text: 'Streichhölzer oder Feuerzeuge' },
      { id: 'k3', src: 'BBK AT', text: 'CO-Melder (Kohlenmonoxid ist unsichtbar, geruchlos, lebensgefährlich), wenn Gas, Ofen oder Kamin genutzt werden' },
      { id: 'k4', src: 'BBK AT', text: 'Stromlose Heizmöglichkeit nur mit zugelassenen Geräten; sonst warme Kleidung, Decken, Schlafsäcke' },
      { id: 'k5', src: 'BBK US', text: 'Rauchmelder in allen Räumen außer Bad und Küche; Batterien testen' },
      { id: 'k6', src: 'BBK US', text: 'Feuerlöscher oder Löschspray (Fettbrand, Brandklasse F) griffbereit; Umgang vorher üben' }
    ]},
    { id: 'licht', icon: '🔦', title: 'Licht, Information, Strom', items: [
      { id: 'l1', src: 'BBK AT CH US', text: 'Batterie-, Solar- oder Kurbelradio (UKW) mit Ersatzbatterien' },
      { id: 'l2', src: 'BBK AT US', text: 'Taschenlampen oder Stirnlampen plus Ersatzbatterien (sicherer als offene Flamme)' },
      { id: 'l3', src: 'BBK US', text: 'Geladene Powerbank(s), ggf. Solarlader; Ladekabel' },
      { id: 'l4', src: 'CH', text: 'Kerzen mit sicherem Halter nur mit Vorsicht, nie unbeaufsichtigt' },
      { id: 'l5', src: 'BBK', text: 'Warn-App (NINA, in AT/CH: Alertswiss o. Ä.) installiert und Push erlaubt' },
      { id: 'l6', src: 'BBK', text: 'Offline-Karten der Umgebung auf dem Handy; Papierkarte' },
      { id: 'l7', src: 'US', text: 'Trillerpfeife zum Signalisieren (pro Person)' }
    ]},
    { id: 'medizin', icon: '🩹', title: 'Erste Hilfe & Medikamente', items: [
      { id: 'm1', src: 'BBK CH US', text: 'Verbandskasten nach DIN 13157 (Verfallsdaten prüfen)' },
      { id: 'm2', src: 'BBK', text: 'Persönliche Medikamente für mind. 10 Tage (empfohlen: 14); in den USA 7 Tage' },
      { id: 'm3', src: 'BBK', text: 'Schmerz- und Fiebermittel, Fieberthermometer, Mittel gegen Durchfall, Erbrechen, Erkältung, Elektrolyte' },
      { id: 'm4', src: 'BBK', text: 'Wund-/Hautdesinfektion, Pflaster, Verbandmaterial, Verbandtuch für Brandwunden, Kühlkompresse' },
      { id: 'm5', src: 'BBK', text: 'Pinzette, Schere, Einmalhandschuhe, Mittel gegen Insektenstiche und Sonnenbrand' },
      { id: 'm6', src: 'BBK US', text: 'Ersatz für Hilfsmittel: Brille, Kontaktlinsen/Lösung, Hörgerät mit Batterien' },
      { id: 'm7', src: 'US', text: 'Medikamentenliste und medizinische Infos (Allergien, Vorerkrankungen) schriftlich' },
      { id: 'm8', src: 'BBK', text: 'Erste-Hilfe-Wissen auffrischen (Druckverband, Herzdruckmassage)' }
    ]},
    { id: 'hygiene', icon: '🧼', title: 'Hygiene & Müll', items: [
      { id: 'h1', src: 'BBK', text: 'Zahnpasta, Zahnbürste, Seife, Toilettenpapier, Feuchttücher, Haushaltspapier' },
      { id: 'h2', src: 'BBK', text: 'Monatshygiene, Windeln, Waschmittel, Desinfektionsmittel, Haushaltshandschuhe' },
      { id: 'h3', src: 'BBK', text: 'Müllbeutel, auch große und stabile zum Einhängen in die Toilette; Notfall-WC oder Campingtoilette' },
      { id: 'h4', src: 'AT', text: 'Sparsam mit Verbrauchsgütern umgehen: Die Müllabfuhr kann kurzzeitig ausfallen' }
    ]},
    { id: 'dokumente', icon: '📄', title: 'Dokumente & Geld', items: [
      { id: 'd1', src: 'BBK US', text: 'Feuerfeste oder wasserdichte Dokumentenmappe: Ausweise, Geburts-/Heiratsurkunde, Versicherungen, Impfpass, Verträge, Testament' },
      { id: 'd2', src: 'BBK', text: 'Digitale Kopien auf USB-Stick oder externer Festplatte (verschlüsselt), nicht nur in der Cloud' },
      { id: 'd3', src: 'AT BBK', text: 'Bargeld in kleinen Scheinen zu Hause (AT: bis 100 € pro Person), sicher aufbewahren' },
      { id: 'd4', src: 'CH US', text: 'Wichtige Telefonnummern und Kontakte auf Papier (nicht nur im Handy)' }
    ]},
    { id: 'notgepaeck', icon: '🎒', title: 'Notgepäck (in ca. 30 Min. packbar)', items: [
      { id: 'n1', src: 'BBK CH', text: 'Warme Kleidung, Regenschutz, feste Schuhe, Wechselkleidung' },
      { id: 'n2', src: 'BBK US', text: 'Dokumente, Bargeld, Schlüssel, Handy mit Powerbank' },
      { id: 'n3', src: 'BBK CH', text: 'Radio, Taschenlampe, Erste-Hilfe-Set, persönliche Medikamente' },
      { id: 'n4', src: 'BBK', text: 'Trinkflasche, haltbare Lebensmittel, Essgeschirr, Taschenmesser, Dosenöffner' },
      { id: 'n5', src: 'BBK US', text: 'Schlafsack oder Decke, Feuerzeug, Hygieneartikel' },
      { id: 'n6', src: 'BBK', text: 'Arbeitshandschuhe, Atemschutzmaske, Notizblock und Stift, Kopfbedeckung, Sonnencreme' }
    ]},
    { id: 'haus', icon: '🏠', title: 'Haus & Wohnung', items: [
      { id: 'x1', src: 'US', text: 'Absperrhähne für Wasser, Gas und Strom kennen; Zange oder Schraubenschlüssel dafür' },
      { id: 'x2', src: 'BBK', text: 'Fluchtwege zu Hause, am Arbeitsplatz und in fremden Gebäuden kennen' },
      { id: 'x3', src: 'BBK', text: 'Schutzhelm gegen herumfliegende Trümmer (optional)' },
      { id: 'x4', src: 'US', text: 'Folie, Klebeband, Schere zum Abdichten (Fenster/Türen)' },
      { id: 'x5', src: 'BBK', text: 'Keller bei Hochwasser: niemals betreten. Wertsachen nach oben' }
    ]},
    { id: 'plan', icon: '👪', title: 'Familienplan & Nachbarschaft', items: [
      { id: 'p1', src: 'AT CH', text: 'Treffpunkte vereinbaren für den Fall, dass Telefone ausfallen; wer holt wen ab' },
      { id: 'p2', src: 'AT CH', text: 'Nachbarn und Freunde einbinden; wer braucht Hilfe (Ältere, Kranke)?' },
      { id: 'p3', src: 'AT', text: 'Bei der Gemeinde klären: Anlaufstellen (Feuerwehrhaus, Gemeindeamt), Wasser-/Busversorgung' },
      { id: 'p4', src: 'BBK', text: 'Kindern altersgerecht, offen und ehrlich erklären; Gefühle benennen' },
      { id: 'p5', src: 'Allg.', text: 'Plan einmal gemeinsam durchspielen (Stromausfall-Abend ohne Strom üben)' }
    ]},
    { id: 'sonder', icon: '🍼', title: 'Sonderbedarf (Baby, Tiere, Ältere)', items: [
      { id: 's1', src: 'US', text: 'Baby: Milchnahrung, Fläschchen, Brei, Windeln, Feuchttücher, Wundschutz' },
      { id: 's2', src: 'BBK AT US', text: 'Haustiere: Futter, Wasser, Leine, Transportbox, Impfpass, Medikamente' },
      { id: 's3', src: 'BBK AT', text: 'Ältere/Pflegebedürftige: Medikamente, Hilfsmittel, Pflegebedarf, Ersatzbatterien' },
      { id: 's4', src: 'BBK', text: 'Spezielle Ernährung (Allergien, Diabetes, glutenfrei) im Vorrat abgedeckt' },
      { id: 's5', src: 'US', text: 'Spiele, Bücher, Beschäftigung für Kinder' }
    ]},
    { id: 'auto', icon: '🚗', title: 'Auto & Mobilität', items: [
      { id: 'a1', src: 'AT', text: 'Tank nie fast leer lassen (Tankstellen können ausfallen)' },
      { id: 'a2', src: 'US', text: 'Notfallset im Auto: Decke, Wasser, Warnweste, Verbandkasten, Taschenlampe' }
    ]},
    { id: 'pflege', icon: '🔁', title: 'Pflege des Vorrats', items: [
      { id: 'r1', src: 'AT US', text: 'Einmal pro Jahr: MHD prüfen, Abgelaufenes ersetzen, Batterien testen, Plan überarbeiten' },
      { id: 'r2', src: 'Allg.', text: 'Ältere Ware zuerst verbrauchen und neu nachkaufen (rotieren)' },
      { id: 'r3', src: 'Allg.', text: 'App-Sicherung (JSON) regelmäßig speichern und Liste ausdrucken' }
    ]}
  ],

  // ---------- Verhaltensregeln ----------
  behavior: [
    { id: 'notruf', icon: '☎️', title: 'Notruf & wichtige Nummern', src: 'BBK AT CH', blocks: [
      { h: 'Deutschland', pts: [
        { tel: '112', text: 'Feuerwehr & Rettungsdienst' },
        { tel: '110', text: 'Polizei' },
        { tel: '116117', text: 'Ärztlicher Bereitschaftsdienst (nicht lebensbedrohlich)' },
        { tel: '115', text: 'Behördenruf' },
        { text: 'Weitere vorher auf Papier notieren: Giftnotruf deiner Region, Stadtwerke, Hausarzt, Apotheke.' }
      ]},
      { h: 'Österreich / Schweiz', pts: [
        { tel: '112', text: 'Europäischer Notruf (überall)' },
        { text: 'AT: 144 Rettung · 122 Feuerwehr · 133 Polizei' },
        { text: 'CH: 117 Polizei · 118 Feuerwehr · 144 Sanität · 145 Tox Info Suisse' }
      ]},
      { h: 'So meldest du einen Notfall (5 W)', pts: [
        { text: 'Wo ist es passiert? · Was ist passiert? · Wie viele Verletzte? · Welche Verletzungen/Gefahren? · Warten auf Rückfragen.' }
      ]},
      { h: 'Wenn Netze ausfallen', pts: [
        { text: 'Notruf kann bei Stromausfall gestört sein. Dann zu Fuß zu Feuerwehrhaus, Polizei oder den Anlaufstellen deiner Gemeinde (vorher erkundigen). In AT bleiben Polizeiinspektionen besetzt.' },
        { text: 'Notruf-App „nora“ (DE) ermöglicht Notruf ohne Sprechen. Vorher einrichten.' }
      ]}
    ]},
    { id: 'warnung', icon: '📻', title: 'Warnungen & Informationen', src: 'BBK CH', blocks: [
      { h: 'Tun', pts: [
        { text: 'Warn-App (NINA) und Radio nutzen; Handy auch nachts empfangsbereit lassen.' },
        { text: 'Sirene „Warnung“: 1 Minute auf- und abschwellender Heulton → Radio/Warn-App einschalten, Hinweise beachten.' },
        { text: 'Sirene „Entwarnung“: 1 Minute Dauerton → Gefahr vorbei.' },
        { text: 'Bei Strom-/Mobilfunkausfall fallen viele Kanäle aus: Radio (Batterie/Kurbel) funktioniert weiter. CH: Alertswiss/UKW-Radio, AT: ORF-Notfallradio.' },
        { text: 'Amtliche Warnungen an Nachbarn weitergeben.' }
      ]},
      { h: 'Nicht tun', bad: true, pts: [
        { text: 'Gerüchte und ungeprüfte Nachrichten weiterleiten. Quelle prüfen: seriös? Impressum? Mit anderen Quellen verglichen? Im Zweifel nicht teilen.' }
      ]}
    ]},
    { id: 'strom', icon: '⚡', title: 'Stromausfall / Blackout', src: 'BBK AT CH', blocks: [
      { h: 'Sofort', pts: [
        { text: 'Prüfen: Nur im Haus (Sicherungen) oder auch bei Nachbarn/Straße? Radio einschalten und Informationen abwarten.' },
        { text: 'Taschenlampe statt Kerzen. Kerzen nur mit sicherem Halter und nie unbeaufsichtigt.' },
        { text: 'Empfindliche Elektrogeräte vom Netz nehmen (Überspannung bei Rückkehr). Eine Lampe als Signal angeschaltet lassen.' },
        { text: 'Handy sparsam nutzen (Energiesparmodus), Netze überlasten schnell: kurze Anrufe, SMS statt Telefonat, Notruf freihalten.' }
      ]},
      { h: 'Lebensmittel & Kochen', pts: [
        { text: 'Kühl-/Gefrierschrank geschlossen halten; zuerst Verderbliches verbrauchen (CH).' },
        { text: 'Kochen im Freien mit Camping-Kocher/Grill. Innen nur Stövchen/Fondue mit kleinen Mengen oder ausdrücklich für Innenräume zugelassene Geräte. Ein Gasherd lässt sich oft weiter nutzen.' },
        { text: 'Wasser: Leitungsdruck kann ausfallen. Vorrat nutzen, WC mit Eimer/Brauchwasser spülen oder Notfall-WC verwenden.' }
      ]},
      { h: 'Wärme', pts: [
        { text: 'Einen Raum auswählen, Schichten, Decken, Schlafsäcke. Kurz stoßlüften (Fenster ganz öffnen, wenige Minuten).' }
      ]},
      { h: 'Nicht tun', bad: true, pts: [
        { text: 'Grill, Holzkohle, Gaskocher (nicht zugelassen) oder Stromaggregat in Innenräumen: Kohlenmonoxid-Vergiftung, Lebensgefahr.' },
        { text: 'Notstromaggregat ohne fachgerechte Einspeisung anschließen.' },
        { text: 'Aufzug benutzen (Steckenbleiben).' },
        { text: 'Autos in der Garage laufen lassen.' },
        { text: 'Sich auf elektrische Tore, Rollläden oder Türöffner verlassen: vorher lernen, wie man sie manuell entriegelt.' }
      ]},
      { h: 'Danach', pts: [
        { text: 'Geräte einzeln wieder einschalten, Lebensmittel aus Kühlschrank/Truhe prüfen. Im Zweifel wegwerfen.' }
      ]}
    ]},
    { id: 'hochwasser', icon: '🌊', title: 'Hochwasser & Starkregen', src: 'BBK', blocks: [
      { h: 'Vorher', pts: [
        { text: 'Warnungen beobachten (NINA, Radio). Wertsachen, Dokumente, Medikamente in obere Stockwerke bringen.' },
        { text: 'Wenn gefahrlos möglich: Strom und Gas im gefährdeten Bereich abstellen. Fahrzeuge in höhere Lagen.' }
      ]},
      { h: 'Währenddessen', pts: [
        { text: 'Höher gelegene Bereiche oder Stockwerke bieten den besten Schutz.' },
        { text: 'Notgepäck bereithalten, Anweisungen der Einsatzkräfte befolgen. Bei Räumungsaufruf sofort gehen.' }
      ]},
      { h: 'Nicht tun', bad: true, pts: [
        { text: 'Keller niemals betreten: Die Tür lässt sich bei Flutung nicht mehr von innen öffnen, dazu Stromschlaggefahr.' },
        { text: 'Tiefgaragen, U-Bahn-Stationen, Unterführungen meiden.' },
        { text: 'Durch überflutete Straßen oder Bäche fahren oder waten (Strömung, Löcher, Strom).' }
      ]},
      { h: 'Danach', pts: [
        { text: 'Elektrik erst von Fachleuten prüfen lassen. Lebensmittel und Trinkwasser mit Kontakt zu Flutwasser nicht verwenden.' }
      ]}
    ]},
    { id: 'sturm', icon: '🌪️', title: 'Sturm & Unwetter', src: 'Allg.', blocks: [
      { h: 'Tun', pts: [
        { text: 'Vorher: Balkon-/Gartenmöbel und lose Gegenstände sichern, Fenster/Türen/Rollläden schließen.' },
        { text: 'Im Gebäude bleiben, Abstand zu Fenstern. Gewitter: im Gebäude oder Auto Schutz suchen.' }
      ]},
      { h: 'Nicht tun', bad: true, pts: [
        { text: 'Wälder, Bäume, Gerüste, Baustellen aufsuchen; unter Bäumen parken.' },
        { text: 'Heruntergefallene Leitungen berühren: Lebensgefahr, Abstand halten und 112 rufen.' },
        { text: 'Im Freien auf offenem Gelände, am Wasser oder unter einzelnen Bäumen bei Gewitter aufhalten.' }
      ]}
    ]},
    { id: 'brand', icon: '🧯', title: 'Brand', src: 'BBK', blocks: [
      { h: 'Tun', pts: [
        { text: 'Nur löschen, wenn es ohne Gefahr geht. Sonst Raum verlassen, Fenster und Tür schließen (weniger Sauerstoff, weniger Rauch).' },
        { text: 'Alle im Haushalt warnen und unterstützen, Nachbarn warnen, Notruf 112.' },
        { text: 'Gebäude verlassen. Bei verrauchtem Fluchtweg am Fenster laut auf sich aufmerksam machen.' }
      ]},
      { h: 'Nicht tun', bad: true, pts: [
        { text: 'Fett, Öl, Wachs oder Benzin NIE mit Wasser löschen (Fettexplosion). Nur Löschspray/Löscher der Brandklasse F oder Decke.' },
        { text: 'Durch verrauchte Räume laufen. Aufzug benutzen.' }
      ]}
    ]},
    { id: 'gefahrstoff', icon: '☣️', title: 'Gefahrstoffe, Explosion & Schutzraum', src: 'BBK', blocks: [
      { h: 'Gase oder Chemikalien', pts: [
        { text: 'Im Freien: in ein Gebäude gehen, Fenster und Türen schließen, Lüftung/Klimaanlage aus, möglichst in obere Stockwerke (die meisten Gase sind schwerer als Luft).' },
        { text: 'Gefahrstoffe im Gebäude: Gebäude verlassen. Kein Gebäude in der Nähe: im Auto Schutz suchen, Belüftung aus.' }
      ]},
      { h: 'Radioaktive Stoffe, Explosion', pts: [
        { text: 'So tief wie möglich, weg von Fenstern: Keller, Tiefgaragen, U-Bahn.' },
        { text: 'Explosionen: Druckwellen, Trümmer, Glassplitter. Geeignet sind fensterlose Kellerräume oder innenliegende Räume (Treppenhaus, Bad, Flur); Dachgeschoss meiden.' },
        { text: 'Regel der 2 Wände: zwischen dir und draußen sollten zwei Wände liegen. Abstand zu Fenstern, Türen, Eingängen. Keine Aufzüge.' }
      ]},
      { h: 'Dann', pts: [
        { text: 'Radio und Warn-App beobachten; auf Entwarnung warten.' }
      ]}
    ]},
    { id: 'evakuierung', icon: '🚪', title: 'Evakuierung', src: 'BBK CH', blocks: [
      { h: 'Vor dem Verlassen (ca. 30 Min.)', pts: [
        { text: 'Notgepäck mit Dokumenten, Medikamenten, Radio, Kleidung mitnehmen.' },
        { text: 'Türen und Fenster schließen, Elektrogeräte ausschalten, Gas/Wasser absperren, offenes Feuer löschen.' },
        { text: 'Haustiere mit Futter und Wasser mitnehmen. Nachbarn und Hilfsbedürftige einbeziehen.' },
        { text: 'Zettel mit Ziel und Uhrzeit an die Tür oder Familie informieren.' }
      ]},
      { h: 'Unterwegs', pts: [
        { text: 'Hauptverkehrsachsen meiden (CH), Anweisungen der Einsatzkräfte befolgen, Anlaufstellen/Notfalltreffpunkte ansteuern.' },
        { text: 'Treffpunkt der Familie nutzen, wenn Telefone ausfallen.' }
      ]},
      { h: 'Nicht tun', bad: true, pts: [
        { text: 'Aufzüge benutzen.' },
        { text: 'Zurückgehen, bevor Behörden Entwarnung geben.' }
      ]}
    ]},
    { id: 'wasser', icon: '🚰', title: 'Trinkwasser-Notfall', src: 'Allg.', blocks: [
      { h: 'Tun', pts: [
        { text: 'Erst den Vorrat nutzen. Leitungswasser nur trinken, wenn die Behörde es freigibt; bei „Abkochgebot“ sprudelnd kochen (Dauer nach Angabe der Behörde; sonst mind. 3 Minuten) und abkühlen lassen.' },
        { text: 'Trübes Wasser durch Tuch oder Kaffeefilter vorfiltern, dann abkochen oder Entkeimungsmittel nach Packungsangabe nutzen.' },
        { text: 'Trinkwasser sparen: Brauchwasser (Badewanne, Regen) nur für WC und Reinigung.' },
        { text: 'Hände regelmäßig waschen/desinfizieren.' }
      ]},
      { h: 'Nicht tun', bad: true, pts: [
        { text: 'Unaufbereitetes Wasser aus Teichen, Bächen oder Flutwasser trinken.' }
      ]}
    ]},
    { id: 'klima', icon: '🌡️', title: 'Kälte (Heizungsausfall) & Hitze', src: 'Allg.', blocks: [
      { h: 'Kälte', pts: [
        { text: 'Auf einen kleinen Raum konzentrieren, Schichten tragen, Decken/Schlafsäcke, warme Getränke, bewegen.' },
        { text: 'Fenster abdichten, Vorhänge schließen. Warnzeichen: starkes Zittern, Verwirrung, Müdigkeit → Wärme, 112.' }
      ]},
      { h: 'Hitze', pts: [
        { text: 'Räume abdunkeln, nachts lüften, ausreichend trinken, Ältere, Kinder und Tiere beobachten. Tiere nie im Auto lassen.' }
      ]},
      { h: 'Nicht tun', bad: true, pts: [
        { text: 'Herd, Grill oder nicht zugelassene Heizgeräte als Heizung in Innenräumen: Brand- und CO-Gefahr.' }
      ]}
    ]},
    { id: 'erstehilfe', icon: '❤️‍🩹', title: 'Erste Hilfe (Kurzfassung)', src: 'BBK', blocks: [
      { h: 'Wiederbelebung', pts: [
        { text: 'Bewusstlos und keine normale Atmung: 112 rufen (Lautsprecher), in die Mitte des Brustkorbs fest und schnell drücken (ca. 100–120 pro Minute, 5–6 cm tief). Nicht aufhören bis Hilfe da ist. Jeder kann das; Kurs lohnt sich (wiederbelebung.de).' }
      ]},
      { h: 'Druckverband bei starker Blutung', pts: [
        { text: '1) Wunde desinfizieren, Kompresse auflegen. 2) Kompresse mit Mullbinde 2–3× umwickeln. 3) Druckpolster auf die Wunde legen. 4) Mehrfach mit Binde umwickeln und mit Klebestreifen fixieren. Dazu 112.' }
      ]},
      { h: 'Hinweis', pts: [
        { text: 'Diese Kurzfassung ersetzt keinen Erste-Hilfe-Kurs.' }
      ]}
    ]},
    { id: 'psyche', icon: '🧠', title: 'Ruhe bewahren, Kinder & Nachbarn', src: 'BBK', blocks: [
      { h: 'Tun', pts: [
        { text: 'Kinder: Fragen offen, ehrlich, sachlich beantworten; Gefühle benennen, positive Botschaften geben; Malen/Spiel hilft.' },
        { text: 'Tagesstruktur halten, regelmäßig essen und trinken, ausreichend schlafen.' },
        { text: 'Nachbarn fragen, ob sie Hilfe brauchen, besonders Ältere und Kranke.' },
        { text: 'Bei Überforderung: Telefonseelsorge 0800 111 0 111 / 0800 111 0 222 / 116 123 (bei Netz), Kinder: nummergegenkummer.de.' }
      ]}
    ]}
  ],

  // ---------- Startliste Einkauf: 4 Personen / 14 Tage ----------
  // want = Stückzahl zum Kaufen, size/unit = Inhalt pro Stück. Zielmengen = BBK × 5,6.
  starter: [
    // Getränke (Soll 112 l)
    { name: 'Mineralwasser still (1,5-l-Flasche)', cat: 'getraenke', want: 70, size: 1.5, unit: 'l', note: 'Zusätzlich 2 Kanister (10 l) für Brauchwasser' },
    { name: 'Apfelsaft/Fruchtsaft haltbar (1 l)', cat: 'getraenke', want: 8, size: 1, unit: 'l' },
    // Getreide (Soll 19,6 kg)
    { name: 'Reis (1 kg)', cat: 'getreide', want: 5, size: 1, unit: 'kg' },
    { name: 'Nudeln (500 g)', cat: 'getreide', want: 12, size: 500, unit: 'g' },
    { name: 'Haferflocken (500 g)', cat: 'getreide', want: 4, size: 500, unit: 'g' },
    { name: 'Knäckebrot/Vollkornbrot haltbar (500 g)', cat: 'getreide', want: 6, size: 500, unit: 'g' },
    { name: 'Kartoffelpüree-Pulver (500 g)', cat: 'getreide', want: 3, size: 500, unit: 'g' },
    { name: 'Couscous oder Bulgur (500 g)', cat: 'getreide', want: 4, size: 500, unit: 'g' },
    { name: 'Zwieback (250 g)', cat: 'getreide', want: 2, size: 250, unit: 'g' },
    // Gemüse & Hülsenfrüchte (Soll 22,4 kg)
    { name: 'Dosentomaten (400 g)', cat: 'gemuese', want: 8, size: 400, unit: 'g' },
    { name: 'Kidneybohnen Dose (400 g)', cat: 'gemuese', want: 8, size: 400, unit: 'g' },
    { name: 'Kichererbsen Dose (400 g)', cat: 'gemuese', want: 8, size: 400, unit: 'g' },
    { name: 'Linsen getrocknet (500 g)', cat: 'gemuese', want: 4, size: 500, unit: 'g', note: 'Mehr Wasser und Kochzeit nötig' },
    { name: 'Gemüsemais Dose (400 g)', cat: 'gemuese', want: 8, size: 400, unit: 'g' },
    { name: 'Erbsen-Möhren Dose/Glas (400 g)', cat: 'gemuese', want: 8, size: 400, unit: 'g' },
    { name: 'Rotkohl/Sauerkraut Glas (700 g)', cat: 'gemuese', want: 7, size: 700, unit: 'g' },
    // Obst & Nüsse (Soll 14 kg)
    { name: 'Obstkonserve Pfirsich/Ananas (400 g)', cat: 'obst', want: 12, size: 400, unit: 'g' },
    { name: 'Apfelmus Glas (700 g)', cat: 'obst', want: 8, size: 700, unit: 'g' },
    { name: 'Trockenobst (500 g)', cat: 'obst', want: 5, size: 500, unit: 'g' },
    { name: 'Nussmischung (250 g)', cat: 'obst', want: 6, size: 250, unit: 'g' },
    // Milch & Milchprodukte (Soll 14,6 kg)
    { name: 'H-Milch (1 l)', cat: 'milch', want: 10, size: 1, unit: 'l' },
    { name: 'Milchpulver (500 g)', cat: 'milch', want: 4, size: 500, unit: 'g' },
    { name: 'Hartkäse vakuumverpackt (250 g)', cat: 'milch', want: 6, size: 250, unit: 'g' },
    { name: 'Schmelzkäse Dose/Glas (200 g)', cat: 'milch', want: 6, size: 200, unit: 'g' },
    // Fisch, Fleisch, Eier (Soll 8,4 kg)
    { name: 'Thunfisch Dose (150 g)', cat: 'fisch', want: 10, size: 150, unit: 'g' },
    { name: 'Sardinen/Makrele Dose (120 g)', cat: 'fisch', want: 10, size: 120, unit: 'g' },
    { name: 'Gulasch/Rindfleisch Dose (400 g)', cat: 'fisch', want: 10, size: 400, unit: 'g' },
    { name: 'Wurstkonserve/Leberwurst (200 g)', cat: 'fisch', want: 8, size: 200, unit: 'g' },
    { name: 'Vollei-Pulver (250 g)', cat: 'fisch', want: 2, size: 250, unit: 'g' },
    // Fette & Öle (Soll 2,0 kg)
    { name: 'Speiseöl (1 l)', cat: 'fett', want: 2, size: 1, unit: 'l' },
    { name: 'Butterschmalz/Kokosfett (250 g)', cat: 'fett', want: 2, size: 250, unit: 'g' },
    // Sonstiges
    { name: 'Salz (1 kg)', cat: 'sonstiges', want: 1, unit: 'Stk' },
    { name: 'Zucker (1 kg)', cat: 'sonstiges', want: 2, unit: 'Stk' },
    { name: 'Mehl (1 kg)', cat: 'sonstiges', want: 1, unit: 'Stk' },
    { name: 'Honig (500 g)', cat: 'sonstiges', want: 2, unit: 'Stk' },
    { name: 'Marmelade (450 g)', cat: 'sonstiges', want: 4, unit: 'Stk' },
    { name: 'Instant-Gemüsebrühe (Glas)', cat: 'sonstiges', want: 2, unit: 'Stk' },
    { name: 'Kaffee (500 g) oder Instant', cat: 'sonstiges', want: 3, unit: 'Stk' },
    { name: 'Tee (Packung, ungesüßt)', cat: 'sonstiges', want: 6, unit: 'Stk' },
    { name: 'Kakaopulver (250 g)', cat: 'sonstiges', want: 2, unit: 'Stk' },
    { name: 'Hartkekse/Salzstangen (Packung)', cat: 'sonstiges', want: 8, unit: 'Stk' },
    { name: 'Eintopf/Fertiggericht Dose (800 g)', cat: 'sonstiges', want: 12, unit: 'Stk' },
    { name: 'Schokolade/Müsliriegel (Packung)', cat: 'sonstiges', want: 20, unit: 'Stk' },
    { name: 'Gewürze-Set (Pfeffer, Paprika, Kräuter)', cat: 'sonstiges', want: 1, unit: 'Stk' },
    // Kochen, Licht, Energie
    { name: 'Campingkocher (Gas)', cat: 'technik', want: 1, unit: 'Stk', note: 'Im Freien nutzen, außer für Innenräume zugelassen' },
    { name: 'Gaskartuschen für Kocher', cat: 'technik', want: 6, unit: 'Stk' },
    { name: 'Streichhölzer/Feuerzeug', cat: 'technik', want: 4, unit: 'Stk' },
    { name: 'Teelichter (100er-Pack) + Stövchen', cat: 'technik', want: 1, unit: 'Stk' },
    { name: 'Stumpenkerzen mit Halter', cat: 'technik', want: 8, unit: 'Stk' },
    { name: 'Kurbel-/Solar-/Batterieradio (UKW)', cat: 'technik', want: 1, unit: 'Stk' },
    { name: 'Taschenlampe/Stirnlampe LED', cat: 'technik', want: 4, unit: 'Stk' },
    { name: 'Batterien AA (Stück)', cat: 'technik', want: 24, unit: 'Stk' },
    { name: 'Batterien AAA (Stück)', cat: 'technik', want: 12, unit: 'Stk' },
    { name: 'Powerbank (min. 10.000 mAh)', cat: 'technik', want: 2, unit: 'Stk' },
    { name: 'Wasserkanister (10 l)', cat: 'technik', want: 2, unit: 'Stk' },
    { name: 'Wasser-Entkeimungstabletten', cat: 'technik', want: 1, unit: 'Stk' },
    { name: 'Dosenöffner (manuell)', cat: 'technik', want: 2, unit: 'Stk' },
    { name: 'Geschirr/Besteck-Set (Camping/Einweg)', cat: 'technik', want: 1, unit: 'Stk' },
    // Medizin
    { name: 'Verbandskasten DIN 13157', cat: 'technik', want: 1, unit: 'Stk' },
    { name: 'Schmerz-/Fiebermittel', cat: 'technik', want: 2, unit: 'Stk' },
    { name: 'Fieberthermometer', cat: 'technik', want: 1, unit: 'Stk' },
    { name: 'Elektrolytpulver / Mittel gegen Durchfall', cat: 'technik', want: 2, unit: 'Stk' },
    { name: 'Wund- und Händedesinfektion', cat: 'technik', want: 3, unit: 'Stk' },
    { name: 'Brandwunden-Verbandtuch', cat: 'technik', want: 1, unit: 'Stk' },
    { name: 'Einmalhandschuhe (100er)', cat: 'technik', want: 1, unit: 'Stk' },
    { name: 'FFP2-Masken', cat: 'technik', want: 10, unit: 'Stk' },
    // Hygiene
    { name: 'Toilettenpapier (12 Rollen)', cat: 'technik', want: 3, unit: 'Stk' },
    { name: 'Seife', cat: 'technik', want: 6, unit: 'Stk' },
    { name: 'Zahnpasta', cat: 'technik', want: 4, unit: 'Stk' },
    { name: 'Zahnbürsten', cat: 'technik', want: 4, unit: 'Stk' },
    { name: 'Feuchttücher', cat: 'technik', want: 4, unit: 'Stk' },
    { name: 'Müllbeutel stark (60–120 l, Rolle)', cat: 'technik', want: 2, unit: 'Stk' },
    { name: 'Haushaltspapier (Rolle)', cat: 'technik', want: 4, unit: 'Stk' },
    { name: 'Waschmittel/Reinigungsmittel', cat: 'technik', want: 1, unit: 'Stk' },
    { name: 'Notfall-WC oder Campingtoilette + Beutel', cat: 'technik', want: 1, unit: 'Stk' },
    // Haus & Schutz
    { name: 'CO-Melder', cat: 'technik', want: 1, unit: 'Stk', note: 'Wichtig, wenn Gas, Ofen oder Kamin genutzt wird' },
    { name: 'Rauchmelder-Ersatzbatterien (9 V)', cat: 'technik', want: 4, unit: 'Stk' },
    { name: 'Feuerlöscher/Löschspray (Brandklasse F)', cat: 'technik', want: 1, unit: 'Stk' },
    { name: 'Decken/Schlafsäcke', cat: 'technik', want: 4, unit: 'Stk' },
    { name: 'Dokumentenmappe feuer-/wasserfest', cat: 'technik', want: 1, unit: 'Stk' },
    { name: 'Trillerpfeife', cat: 'technik', want: 4, unit: 'Stk' },
    { name: 'Arbeitshandschuhe', cat: 'technik', want: 4, unit: 'Stk' }
  ]
};

// ---------- Angaben zum Anbieter (vor einem Verkauf ausfüllen!) ----------
// Impressumspflicht (§ 5 DDG): Name, ladungsfähige Anschrift, E-Mail; ggf. Telefon, USt-IdNr.
window.NV_DATA.legal = {
  version: '2.2',
  contentDate: 'November 2026',
  provider: { name: '', address: '', email: '', phone: '', vatId: '' },
  hoster: 'dem jeweiligen Hosting-Anbieter (z. B. Netlify, Cloudflare oder GitHub)'
};
