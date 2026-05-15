import bcrypt from "bcryptjs"
import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

function daysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function upsertCategory(data) {
  return prisma.category.upsert({
    where: { slug_locale: { slug: data.slug, locale: "de-DE" } },
    update: data,
    create: { ...data, locale: "de-DE" },
  })
}

async function seedCategoryTree({
  name,
  slug,
  description,
  type,
  children,
  order,
}) {
  const parent = await upsertCategory({
    name,
    slug,
    description,
    type,
    parentId: null,
    order,
    isFeatured: true,
    seoTitle: `${name} Kategorien`,
    seoDesc: description,
  })

  const childRows = await Promise.all(
    children.map((childName, index) =>
      upsertCategory({
        name: childName,
        slug: `${slug}-${slugify(childName)}`,
        description: `Ressourcen und Empfehlungen zu ${childName}.`,
        type,
        parentId: parent.id,
        order: index + 1,
        isFeatured: index < 6,
        seoTitle: `${childName} ${name}`,
        seoDesc: `Durchsuchen Sie Ressourcen zu ${childName} im Bereich ${name}.`,
      })
    )
  )

  return {
    parent,
    childrenByName: new Map(childRows.map((category) => [category.name, category])),
  }
}

async function upsertTag(data) {
  return prisma.tag.upsert({
    where: { slug_locale: { slug: data.slug, locale: "de-DE" } },
    update: data,
    create: { ...data, locale: "de-DE" },
  })
}

async function upsertAuthor(data) {
  return prisma.author.upsert({
    where: { slug_locale: { slug: data.slug, locale: "de-DE" } },
    update: data,
    create: { ...data, locale: "de-DE" },
  })
}

async function upsertPost(data, tagIds) {
  const post = await prisma.post.upsert({
    where: { slug_locale: { slug: data.slug, locale: "de-DE" } },
    update: data,
    create: { ...data, locale: "de-DE" },
  })

  await prisma.postTag.deleteMany({ where: { postId: post.id } })
  await prisma.postTag.createMany({
    data: tagIds.map((tagId) => ({ postId: post.id, tagId })),
    skipDuplicates: true,
  })

  return post
}

async function upsertTool(data) {
  return prisma.tool.upsert({
    where: { slug_locale: { slug: data.slug, locale: "de-DE" } },
    update: data,
    create: { ...data, locale: "de-DE" },
  })
}

async function upsertServiceProduct(data) {
  return prisma.serviceProduct.upsert({
    where: { slug: data.slug },
    update: data,
    create: data,
  })
}

async function upsertComparison(data) {
  return prisma.comparison.upsert({
    where: { slug: data.slug },
    update: data,
    create: data,
  })
}

async function main() {
  const email = "admin@example.com"
  const passwordHash = await bcrypt.hash("Admin123@", 12)

  await prisma.user.upsert({
    where: { email },
    update: {
      name: "Tekvora Admin",
      passwordHash,
      role: "ADMIN",
    },
    create: {
      email,
      name: "Tekvora Admin",
      passwordHash,
      role: "ADMIN",
    },
  })

  await seedCategoryTree({
    name: "Services",
    slug: "services",
    description:
      "Online-Services für Teams, Betrieb, Infrastruktur, Analytics, KI und Wachstum.",
    type: "SAAS",
    order: 1,
    children: [
      "KI",
      "Entwickler-Tools",
      "Hosting",
      "Cloud",
      "VPS",
      "VPN",
      "Domains",
      "DNS",
      "CDN",
      "Website-Baukästen",
      "E-Commerce",
      "Analytics",
      "SEO",
      "Marketing",
      "Email",
      "Produktivität",
      "Design",
      "Datenbanken",
      "Monitoring",
      "Automatisierung",
      "Sicherheit",
      "Zahlungen",
      "CMS",
      "Speicher",
    ],
  })

  const articlesTree = await seedCategoryTree({
    name: "Artikel",
    slug: "articles",
    description: "Redaktionelle Kategorien für Ratgeber, Tutorials, Tests und Recherche.",
    type: "ARTICLE",
    order: 2,
    children: [
      "Ratgeber",
      "Tutorials",
      "Vergleiche",
      "Tests",
      "Infrastructure",
      "KI",
      "Webentwicklung",
      "SEO",
      "Sicherheit",
      "Performance",
    ],
  })

  const toolsTree = await seedCategoryTree({
    name: "Tools",
    slug: "tools",
    description: "Kategorien für technische Tools und browserbasierte Helfer.",
    type: "TOOL",
    order: 3,
    children: [
      "Generatoren",
      "Konverter",
      "SEO-Tools",
      "Entwickler-Helfer",
      "Text-Tools",
      "Bild-Tools",
      "Performance-Tools",
      "Security-Tools",
      "Netzwerk-Tools",
      "JSON-Tools",
      "CSS-Tools",
      "Farb-Tools",
    ],
  })

  const articleGuides = articlesTree.childrenByName.get("Ratgeber")
  const articleAi = articlesTree.childrenByName.get("KI")
  const toolJson = toolsTree.childrenByName.get("JSON-Tools")
  const toolGenerators = toolsTree.childrenByName.get("Generatoren")
  const toolConverters = toolsTree.childrenByName.get("Konverter")

  const [cloudTag, devopsTag, aiTag, serviceTag] = await Promise.all([
    upsertTag({ name: "Cloud", slug: "cloud", description: "Cloud-Plattformen und Infrastruktur." }),
    upsertTag({ name: "DevOps", slug: "devops", description: "Automatisierung und Betriebsabläufe." }),
    upsertTag({ name: "KI-Tools", slug: "ki-tools", description: "KI-Software und Produktivitätstools." }),
    upsertTag({ name: "Services", slug: "services", description: "Online-Services und Softwareplattformen." }),
  ])

  const [alex, maya] = await Promise.all([
    upsertAuthor({
      name: "Alex Carter",
      slug: "alex-carter",
      bio: "Infrastruktur-Autor mit Schwerpunkt auf praxistauglichen Cloud- und Entwickler-Tool-Entscheidungen.",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop",
      websiteUrl: "https://tekvora.de",
      twitterUrl: "https://x.com",
      linkedinUrl: "https://linkedin.com",
    }),
    upsertAuthor({
      name: "Maya Chen",
      slug: "maya-chen",
      bio: "Service-Analystin für Produktivitätssoftware, KI-Tools und moderne Team-Workflows.",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop",
      websiteUrl: "https://tekvora.de",
    }),
  ])

  const contentB = `
    <p>Moderne Entwickler-Tools sollten Abstimmungsaufwand reduzieren, statt nur ein weiteres Dashboard einzuführen. Gute Werkzeuge passen natürlich in Code-Review, Deployment, Monitoring und Dokumentation.</p>
    <h2>Bewerten Sie den Workflow, nicht nur die Funktionsliste</h2>
    <p>Ein Produkt mit vielen Funktionen kann trotzdem scheitern, wenn es den Entwicklungsalltag erschwert. Beginnen Sie mit dem Workflow, den Ihr Team am häufigsten wiederholt.</p>
    <h3>Integrationen</h3>
    <p>Starke Integrationen mit GitHub, Slack, CI-Systemen und Observability-Plattformen sind oft wichtiger als Nischenfunktionen.</p>
    <pre><code>deployment_checklist = ["tests", "review", "rollback"]</code></pre>
    <h2>Einführung und Governance</h2>
    <p>Gute Tools erleichtern es, Verantwortlichkeiten, Berechtigungen, Audit-Trails und Nutzungsregeln festzulegen. Das wird besonders wichtig, wenn Teams wachsen.</p>
  `

  const contentC = `
    <p>KI-Services entwickeln sich schnell, doch Käufer brauchen weiterhin einen nüchternen Bewertungsprozess. Die beste Wahl hängt von Datenverarbeitung, Workflow-Passung, Ausgabequalität und administrativen Kontrollen ab.</p>
    <h2>Beginnen Sie mit dem Einsatzfall</h2>
    <p>Trennen Sie Schreibhilfe, Rechercheautomatisierung, Support-Workflows und Entwicklerproduktivität. Jede Kategorie hat andere Qualitäts- und Sicherheitsanforderungen.</p>
    <h2>Sicherheit und Datenkontrolle</h2>
    <p>Prüfen Sie Aufbewahrungsregeln, Modelltraining-Einstellungen, Teamrechte und Exportoptionen, bevor ein KI-Produkt breit ausgerollt wird.</p>
    <h3>Messung</h3>
    <p>Messen Sie eingesparte Zeit, Fehlerraten und Nutzerzufriedenheit. Ohne Messung können KI-Tools schnell zu teuren Experimenten werden.</p>
  `

  await Promise.all([
    upsertPost(
      {
        title: "Die praktische Checkliste für den Kauf von Entwickler-Tools",
        slug: "developer-tool-buying-checklist",
        excerpt: "Eine strukturierte Checkliste, um Entwickler-Tools zu bewerten, bevor sie Teil des Engineering-Workflows werden.",
        content: contentB,
        format: "HTML",
        status: "PUBLISHED",
        type: "ARTICLE",
        categoryId: articleGuides.id,
        authorId: alex.id,
        coverImageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1400&h=800&fit=crop",
        seoTitle: "Checkliste für den Kauf von Entwickler-Tools",
        seoDesc: "Bewerten Sie Workflow-Passung, Integrationen, Governance und operativen Nutzen von Entwickler-Tools.",
        publishedAt: daysAgo(5),
      },
      [devopsTag.id, cloudTag.id]
    ),
    upsertPost(
      {
        title: "KI-Services ohne Hype bewerten",
        slug: "evaluate-ai-services",
        excerpt: "Ein nüchterner Bewertungsprozess für KI-Services mit Fokus auf Workflow-Passung, Sicherheit, Messbarkeit und Qualität.",
        content: contentC,
        format: "HTML",
        status: "PUBLISHED",
        type: "ARTICLE",
        categoryId: articleAi.id,
        authorId: maya.id,
        coverImageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1400&h=800&fit=crop",
        seoTitle: "KI-Services bewerten",
        seoDesc: "Bewerten Sie KI-Services nach Einsatzfall, Datenkontrolle, Messbarkeit und realem operativem Nutzen.",
        publishedAt: daysAgo(9),
      },
      [aiTag.id, serviceTag.id]
    ),
  ])

  await upsertPost(
    {
      title: "Entwurf, der öffentlich verborgen bleibt",
      slug: "draft-example-hidden-from-public-pages",
      excerpt: "Dieser Entwurf prüft, dass öffentliche Abfragen nur veröffentlichte Inhalte anzeigen.",
      content: "<p>Dieser Beitrag sollte öffentlich nicht erscheinen.</p><h2>Entwurfsüberschrift</h2><p>Verborgener Inhalt.</p>",
      format: "HTML",
      status: "DRAFT",
      type: "ARTICLE",
      categoryId: articleGuides.id,
      authorId: maya.id,
      publishedAt: null,
    },
    [devopsTag.id]
  )

  await Promise.all([
    upsertTool({
      name: "JSON Formatter",
      slug: "json-formatter",
      shortDescription: "JSON-Daten in einem übersichtlichen Browser-Tool formatieren, validieren und lesen.",
      tagline: "JSON-Daten in einem übersichtlichen Browser-Tool formatieren, validieren und lesen.",
      description:
        "JSON einfügen, Einrückung wählen und sofort eine lesbare formatierte Ausgabe erhalten.",
      content:
        "<h2>Warum einen JSON Formatter nutzen?</h2><p>Formatiertes JSON lässt sich beim Debugging, API-Testen und Prüfen von Konfigurationen deutlich leichter lesen.</p>",
      status: "PUBLISHED",
      categoryId: toolJson.id,
      componentKey: "json-formatter",
      seoTitle: "JSON Formatter",
      seoDesc: "Kostenloser Online-JSON-Formatter und Validator für Entwickler.",
      isFeatured: true,
      order: 1,
      publishedAt: daysAgo(1),
    }),
    upsertTool({
      name: "UUID Generator",
      slug: "uuid-generator",
      shortDescription: "Sichere UUID-v4-Werte für Tests, Fixtures und Anwendungsdaten erzeugen.",
      tagline: "Sichere UUID-v4-Werte für Tests, Fixtures und Anwendungsdaten erzeugen.",
      description:
        "Eine oder mehrere im Browser erzeugte UUIDs erstellen und direkt in den Workflow kopieren.",
      content:
        "<h2>Typische Einsatzfälle für UUIDs</h2><p>UUIDs eignen sich für Datenbankeinträge, Idempotency Keys, verteilte Systeme und Beispieldaten.</p>",
      status: "PUBLISHED",
      categoryId: toolGenerators.id,
      componentKey: "uuid-generator",
      seoTitle: "UUID Generator",
      seoDesc: "UUID-v4-Werte online für Entwicklung und Tests erzeugen.",
      isFeatured: true,
      order: 2,
      publishedAt: daysAgo(1),
    }),
    upsertTool({
      name: "Base64 Encoder / Decoder",
      slug: "base64-encoder-decoder",
      shortDescription: "Klartext in Base64 kodieren oder Base64 wieder in lesbaren Text dekodieren.",
      tagline: "Klartext in Base64 kodieren oder Base64 wieder in lesbaren Text dekodieren.",
      description:
        "Ein einfaches Base64-Tool für Textausschnitte, API-Payloads und Konfigurationswerte.",
      content:
        "<h2>Base64-Grundlagen</h2><p>Base64 ist ein Kodierungsformat, keine Verschlüsselung. Nutzen Sie es für Secrets nur in Kombination mit geeigneten Sicherheitsmaßnahmen.</p>",
      status: "PUBLISHED",
      categoryId: toolConverters.id,
      componentKey: "base64-encoder",
      seoTitle: "Base64 Encoder und Decoder",
      seoDesc: "Kostenloser Base64 Encoder und Decoder für Textausschnitte und Entwickler-Workflows.",
      order: 3,
      publishedAt: daysAgo(1),
    }),
    upsertTool({
      name: "Zeitstempel-Konverter",
      slug: "timestamp-converter",
      shortDescription: "Unix-Zeitstempel in Datumswerte umwandeln und Datumswerte zurück in Zeitstempel konvertieren.",
      tagline: "Unix-Zeitstempel in Datumswerte umwandeln und Datumswerte zurück in Zeitstempel konvertieren.",
      description:
        "Unix-Sekunden, Millisekunden, ISO-Zeichenfolgen und lokale Anzeigezeiten schnell prüfen.",
      content:
        "<h2>Sekunden vs. Millisekunden</h2><p>Unix-Zeitstempel werden häufig in Sekunden gespeichert, während JavaScript-Datumswerte Millisekunden verwenden.</p>",
      status: "PUBLISHED",
      categoryId: toolConverters.id,
      componentKey: "timestamp-converter",
      seoTitle: "Zeitstempel-Konverter",
      seoDesc: "Unix-Zeitstempel, Millisekunden und ISO-Datumswerte online umwandeln.",
      order: 4,
      publishedAt: daysAgo(1),
    }),
  ])

  await Promise.all([
    upsertServiceProduct({
      name: "FlowDesk",
      slug: "flowdesk",
      shortDescription:
        "Ein Produktivitätsservice für Produkt- und Engineering-Teams, die klare Planung ohne schweren Prozess benötigen.",
      description:
        "FlowDesk eignet sich besonders für Teams, die Issue Tracking, Roadmaps, schlanke Dokumentation und wiederkehrende Delivery-Reports in einem ruhigen Arbeitsbereich bündeln möchten.",
      logoUrl: "https://placehold.co/160x160/1d4ed8/ffffff?text=F",
      websiteUrl: "https://example.com/flowdesk",
      affiliateUrl: "https://example.com/flowdesk?ref=tekvora",
      category: "Produktivität",
      pricingModel: "Pro Nutzer mit kostenloser Testphase",
      pricingFrom: 8.0,
      currency: "USD",
      rating: 4.6,
      features: ["Roadmaps", "Issue Tracking", "Dokumente", "Delivery-Reports"],
      pros: ["Schnelles Onboarding", "Aufgeräumte Oberfläche", "Starkes Reporting"],
      cons: ["Begrenzte Enterprise-Workflow-Kontrollen", "Keine native Zeiterfassung"],
      bestFor: ["Produktteams", "Engineering-Teams", "Startups"],
      alternatives: ["Linear", "Jira", "Asana"],
      status: "PUBLISHED",
      isFeatured: true,
      order: 1,
      seoTitle: "FlowDesk Test",
      seoDescription: "FlowDesk Test mit Preisen, Funktionen, passenden Teams, Vorteilen, Nachteilen und Alternativen.",
      ogImageUrl: "https://placehold.co/1200x630/1d4ed8/ffffff?text=FlowDesk",
      publishedAt: daysAgo(1),
    }),
    upsertServiceProduct({
      name: "MetricPilot",
      slug: "metricpilot",
      shortDescription:
        "Ein schlanker Analytics-Service für Dashboards, Funnels, Retention und Umsatz-Reporting.",
      description:
        "MetricPilot bietet Betreibern eine fokussierte Analytics-Schicht, ohne Teams in eine schwergewichtige BI-Einführung zu zwingen.",
      logoUrl: "https://placehold.co/160x160/047857/ffffff?text=M",
      websiteUrl: "https://example.com/metricpilot",
      affiliateUrl: "https://example.com/metricpilot?ref=tekvora",
      category: "Analytics",
      pricingModel: "Nutzungsbasiert",
      pricingFrom: 19.0,
      currency: "USD",
      rating: 4.4,
      features: ["Funnels", "Retention-Kohorten", "Umsatzmetriken", "CSV-Export"],
      pros: ["Klare Service-Metriken", "Nützliche Standard-Dashboards", "Einfache Einrichtung"],
      cons: ["Fortgeschrittene Modellierung ist begrenzt", "Connector-Katalog wächst noch"],
      bestFor: ["Service-Betreiber", "Growth-Teams", "Gründer"],
      alternatives: ["Mixpanel", "Amplitude", "June"],
      status: "PUBLISHED",
      isFeatured: true,
      order: 2,
      seoTitle: "MetricPilot Test",
      seoDescription: "MetricPilot Analytics-Test mit Preisen, Funktionen, Alternativen, Vorteilen, Nachteilen und idealen Nutzern.",
      publishedAt: daysAgo(2),
    }),
    upsertServiceProduct({
      name: "SupportForge",
      slug: "supportforge",
      shortDescription:
        "Ein E-Mail- und Support-Service, der Shared Inbox, Help Center, Automatisierungen und KI-Entwürfe kombiniert.",
      description:
        "SupportForge ist eine praktische Option für wachsende Support-Teams, die strukturierte Inbox-Workflows und eine solide Wissensdatenbank benötigen.",
      logoUrl: "https://placehold.co/160x160/be123c/ffffff?text=S",
      websiteUrl: "https://example.com/supportforge",
      affiliateUrl: "https://example.com/supportforge?ref=tekvora",
      category: "Email",
      pricingModel: "Pro Agent",
      pricingFrom: 15.0,
      currency: "USD",
      rating: 4.2,
      features: ["Shared Inbox", "Help Center", "Automatisierungsregeln", "KI-Entwürfe"],
      pros: ["Guter Agent-Workflow", "Starke Help-Center-Tools", "Flexible Automatisierungen"],
      cons: ["Reporting braucht Einrichtung", "KI-Funktionen kosten extra"],
      bestFor: ["Support-Teams", "B2B-Services", "Customer Success"],
      alternatives: ["Zendesk", "Intercom", "Help Scout"],
      status: "PUBLISHED",
      isFeatured: false,
      order: 3,
      seoTitle: "SupportForge Test",
      seoDescription: "SupportForge Test zu Support-Workflows, KI-Funktionen, Preisen, Vorteilen, Nachteilen und Alternativen.",
      publishedAt: daysAgo(3),
    }),
  ])

  await Promise.all([
    upsertComparison({
      title: "FlowDesk vs MetricPilot",
      slug: "flowdesk-vs-metricpilot",
      excerpt: "Ein praxisnaher Vergleich zwischen Produktivitäts- und Analytics-Workflows.",
      itemAName: "FlowDesk",
      itemBName: "MetricPilot",
      itemALogoUrl: "https://placehold.co/160x160/1d4ed8/ffffff?text=F",
      itemBLogoUrl: "https://placehold.co/160x160/047857/ffffff?text=M",
      itemAUrl: "https://example.com/flowdesk",
      itemBUrl: "https://example.com/metricpilot",
      itemAAffiliateUrl: "https://example.com/flowdesk?ref=tekvora",
      itemBAffiliateUrl: "https://example.com/metricpilot?ref=tekvora",
      summary: "FlowDesk ist stärker bei Delivery-Planung, während MetricPilot bei Service-Metriken und Umsatzanalyse überzeugt.",
      verdict: "Wählen Sie FlowDesk, wenn vor allem Ausführungsklarheit fehlt. Wählen Sie MetricPilot, wenn Produkt- und Umsatzsichtbarkeit das größere Problem ist.",
      winner: "Unentschieden",
      comparisonTable: [
        { feature: "Haupteinsatz", itemA: "Projektmanagement", itemB: "Analytics", winner: "Unentschieden" },
        { feature: "Einstiegspreis", itemA: "$8/Monat", itemB: "$19/Monat", winner: "A" },
        { feature: "Am besten für", itemA: "Produktteams", itemB: "Growth-Teams", winner: "Unentschieden" },
      ],
      prosA: ["Klarer Planungsworkflow", "Starke Delivery-Reports", "Schnelles Onboarding"],
      consA: ["Keine native Analytics-Suite", "Begrenzte erweiterte Governance"],
      prosB: ["Nützliche Service-Dashboards", "Gute Funnel-Sichtbarkeit", "Einfache Einrichtung"],
      consB: ["Kein Task Tracker", "Connector-Katalog kleiner als bei BI-Tools"],
      bestForA: ["Roadmaps", "Issue Tracking", "Engineering Delivery"],
      bestForB: ["Funnels", "Retention", "Umsatz-Dashboards"],
      content: "<h2>Fazit</h2><p>Diese Produkte lösen unterschiedliche operative Probleme. Die richtige Wahl hängt davon ab, ob Planung oder Messbarkeit aktuell der Engpass ist.</p>",
      status: "PUBLISHED",
      isFeatured: true,
      order: 1,
      seoTitle: "FlowDesk vs MetricPilot",
      seoDescription: "Vergleichen Sie FlowDesk und MetricPilot nach Preis, Funktionen, Einsatzfällen, Vorteilen, Nachteilen und Gewinner.",
      ogImageUrl: "https://placehold.co/1200x630/111827/ffffff?text=FlowDesk+vs+MetricPilot",
      publishedAt: daysAgo(1),
    }),
  ])

  console.log(`Seeded admin user: ${email}`)
  console.log("Seeded German sample public articles, tools, services, comparisons, categories, tags, and authors.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
