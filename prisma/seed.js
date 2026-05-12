import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

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
    where: { slug_locale: { slug: data.slug, locale: "en" } },
    update: data,
    create: { ...data, locale: "en" },
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
    seoTitle: `${name} Categories`,
    seoDesc: description,
  })

  const childRows = await Promise.all(
    children.map((childName, index) =>
      upsertCategory({
        name: childName,
        slug: `${slug}-${slugify(childName)}`,
        description: `${childName} resources and recommendations.`,
        type,
        parentId: parent.id,
        order: index + 1,
        isFeatured: index < 6,
        seoTitle: `${childName} ${name}`,
        seoDesc: `Browse ${childName.toLowerCase()} resources in ${name.toLowerCase()}.`,
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
    where: { slug_locale: { slug: data.slug, locale: "en" } },
    update: data,
    create: { ...data, locale: "en" },
  })
}

async function upsertAuthor(data) {
  return prisma.author.upsert({
    where: { slug_locale: { slug: data.slug, locale: "en" } },
    update: data,
    create: { ...data, locale: "en" },
  })
}

async function upsertPost(data, tagIds) {
  const post = await prisma.post.upsert({
    where: { slug_locale: { slug: data.slug, locale: "en" } },
    update: data,
    create: { ...data, locale: "en" },
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
    where: { slug_locale: { slug: data.slug, locale: "en" } },
    update: data,
    create: { ...data, locale: "en" },
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
      "Online services for teams, operations, infrastructure, analytics, AI, and growth.",
    type: "SAAS",
    order: 1,
    children: [
      "AI",
      "Developer Tools",
      "Hosting",
      "Cloud",
      "VPS",
      "VPN",
      "Domains",
      "DNS",
      "CDN",
      "Website Builders",
      "E-commerce",
      "Analytics",
      "SEO",
      "Marketing",
      "Email",
      "Productivity",
      "Design",
      "Databases",
      "Monitoring",
      "Automation",
      "Security",
      "Payments",
      "CMS",
      "Storage",
    ],
  })

  const articlesTree = await seedCategoryTree({
    name: "Articles",
    slug: "articles",
    description: "Editorial categories for guides, tutorials, reviews, and research.",
    type: "ARTICLE",
    order: 2,
    children: [
      "Guides",
      "Tutorials",
      "Comparisons",
      "Reviews",
      "Infrastructure",
      "AI",
      "Web Development",
      "SEO",
      "Security",
      "Performance",
    ],
  })

  const toolsTree = await seedCategoryTree({
    name: "Tools",
    slug: "tools",
    description: "Utility categories for technical tools and browser-based helpers.",
    type: "TOOL",
    order: 3,
    children: [
      "Generators",
      "Converters",
      "SEO Tools",
      "Developer Utilities",
      "Text Tools",
      "Image Tools",
      "Performance Tools",
      "Security Tools",
      "Network Tools",
      "JSON Tools",
      "CSS Tools",
      "Color Tools",
    ],
  })

  const articleGuides = articlesTree.childrenByName.get("Guides")
  const articleAi = articlesTree.childrenByName.get("AI")
  const toolJson = toolsTree.childrenByName.get("JSON Tools")
  const toolGenerators = toolsTree.childrenByName.get("Generators")
  const toolConverters = toolsTree.childrenByName.get("Converters")

  const [cloudTag, devopsTag, aiTag, serviceTag] = await Promise.all([
    upsertTag({ name: "Cloud", slug: "cloud", description: "Cloud platforms and infrastructure." }),
    upsertTag({ name: "DevOps", slug: "devops", description: "Automation and operations workflows." }),
    upsertTag({ name: "AI Tools", slug: "ai-tools", description: "AI software and productivity tools." }),
    upsertTag({ name: "Services", slug: "services", description: "Online services and software platforms." }),
  ])

  const [alex, maya] = await Promise.all([
    upsertAuthor({
      name: "Alex Carter",
      slug: "alex-carter",
      bio: "Infrastructure writer focused on practical cloud and developer tooling decisions.",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop",
      websiteUrl: "https://tekvora.com",
      twitterUrl: "https://x.com",
      linkedinUrl: "https://linkedin.com",
    }),
    upsertAuthor({
      name: "Maya Chen",
      slug: "maya-chen",
      bio: "Services analyst covering productivity software, AI tools, and modern team workflows.",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop",
      websiteUrl: "https://tekvora.com",
    }),
  ])

  const contentB = `
    <p>Modern developer tools should reduce coordination cost rather than simply add another dashboard. The best tools fit naturally into code review, deployment, monitoring, and documentation workflows.</p>
    <h2>Evaluate the workflow, not just the feature list</h2>
    <p>A product with dozens of features can still fail if it adds friction to everyday development. Start by mapping the workflow your team repeats most often.</p>
    <h3>Integrations</h3>
    <p>Strong integrations with GitHub, Slack, CI systems, and observability platforms often matter more than niche features.</p>
    <pre><code>deployment_checklist = ["tests", "review", "rollback"]</code></pre>
    <h2>Adoption and governance</h2>
    <p>Good tools make it easy to define ownership, permissions, audit trails, and usage conventions. This is especially important as teams grow.</p>
  `

  const contentC = `
    <p>AI services are moving quickly, but buyers still need a grounded evaluation process. The best choice depends on data handling, workflow fit, output quality, and administrative controls.</p>
    <h2>Start with the use case</h2>
    <p>Separate writing assistance, research automation, support workflows, and developer productivity. Each category has different quality and security requirements.</p>
    <h2>Security and data controls</h2>
    <p>Review retention policies, model training settings, team permissions, and export options before rolling out an AI product widely.</p>
    <h3>Measurement</h3>
    <p>Track time saved, error rates, and user satisfaction. Without measurement, AI tools can become expensive experiments.</p>
  `

  await Promise.all([
    upsertPost(
      {
        title: "The Practical Developer Tool Buying Checklist",
        slug: "developer-tool-buying-checklist",
        excerpt: "A structured checklist for evaluating developer tools before they become part of your engineering workflow.",
        content: contentB,
        format: "HTML",
        status: "PUBLISHED",
        type: "ARTICLE",
        categoryId: articleGuides.id,
        authorId: alex.id,
        coverImageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1400&h=800&fit=crop",
        seoTitle: "Developer Tool Buying Checklist",
        seoDesc: "Use this developer tool buying checklist to evaluate workflow fit, integrations, governance, and operational value.",
        publishedAt: daysAgo(5),
      },
      [devopsTag.id, cloudTag.id]
    ),
    upsertPost(
      {
        title: "How to Evaluate AI Services Without the Hype",
        slug: "evaluate-ai-services",
        excerpt: "A calm evaluation process for AI services focused on workflow fit, security, measurement, and quality.",
        content: contentC,
        format: "HTML",
        status: "PUBLISHED",
        type: "ARTICLE",
        categoryId: articleAi.id,
        authorId: maya.id,
        coverImageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1400&h=800&fit=crop",
        seoTitle: "How to Evaluate AI Services",
        seoDesc: "Evaluate AI services based on use case fit, data controls, measurement, and real operational value.",
        publishedAt: daysAgo(9),
      },
      [aiTag.id, serviceTag.id]
    ),
  ])

  await upsertPost(
    {
      title: "Draft Example Hidden From Public Pages",
      slug: "draft-example-hidden-from-public-pages",
      excerpt: "This draft exists to verify that public queries only show published content.",
      content: "<p>This post should not appear publicly.</p><h2>Draft heading</h2><p>Hidden content.</p>",
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
      shortDescription: "Format, validate, and read JSON data in a clean browser-based tool.",
      tagline: "Format, validate, and read JSON data in a clean browser-based tool.",
      description:
        "Paste JSON, choose indentation, and get a readable formatted output instantly.",
      content:
        "<h2>Why use a JSON formatter?</h2><p>Formatted JSON is easier to inspect during debugging, API testing, and configuration review.</p>",
      status: "PUBLISHED",
      categoryId: toolJson.id,
      componentKey: "json-formatter",
      seoTitle: "JSON Formatter",
      seoDesc: "Free online JSON formatter and validator for developers.",
      isFeatured: true,
      order: 1,
      publishedAt: daysAgo(1),
    }),
    upsertTool({
      name: "UUID Generator",
      slug: "uuid-generator",
      shortDescription: "Generate secure UUID v4 values for tests, fixtures, and application data.",
      tagline: "Generate secure UUID v4 values for tests, fixtures, and application data.",
      description:
        "Create one or many browser-generated UUIDs and copy them into your workflow.",
      content:
        "<h2>Common UUID uses</h2><p>UUIDs are useful for database records, idempotency keys, distributed systems, and sample data.</p>",
      status: "PUBLISHED",
      categoryId: toolGenerators.id,
      componentKey: "uuid-generator",
      seoTitle: "UUID Generator",
      seoDesc: "Generate UUID v4 values online for development and testing.",
      isFeatured: true,
      order: 2,
      publishedAt: daysAgo(1),
    }),
    upsertTool({
      name: "Base64 Encoder / Decoder",
      slug: "base64-encoder-decoder",
      shortDescription: "Encode plain text to Base64 or decode Base64 back to readable text.",
      tagline: "Encode plain text to Base64 or decode Base64 back to readable text.",
      description:
        "A simple Base64 utility for text snippets, API payloads, and configuration values.",
      content:
        "<h2>Base64 basics</h2><p>Base64 is an encoding format, not encryption. Avoid using it for secrets unless combined with proper security controls.</p>",
      status: "PUBLISHED",
      categoryId: toolConverters.id,
      componentKey: "base64-encoder",
      seoTitle: "Base64 Encoder and Decoder",
      seoDesc: "Free Base64 encoder and decoder for text snippets and developer workflows.",
      order: 3,
      publishedAt: daysAgo(1),
    }),
    upsertTool({
      name: "Timestamp Converter",
      slug: "timestamp-converter",
      shortDescription: "Convert Unix timestamps to dates and dates back to timestamps.",
      tagline: "Convert Unix timestamps to dates and dates back to timestamps.",
      description:
        "Quickly inspect Unix seconds, milliseconds, ISO strings, and local display times.",
      content:
        "<h2>Seconds vs milliseconds</h2><p>Unix timestamps are often stored as seconds, while JavaScript dates use milliseconds.</p>",
      status: "PUBLISHED",
      categoryId: toolConverters.id,
      componentKey: "timestamp-converter",
      seoTitle: "Timestamp Converter",
      seoDesc: "Convert Unix timestamps, milliseconds, and ISO dates online.",
      order: 4,
      publishedAt: daysAgo(1),
    }),
  ])

  await Promise.all([
    upsertServiceProduct({
      name: "FlowDesk",
      slug: "flowdesk",
      shortDescription:
        "A productivity service for product and engineering teams that need clear planning without heavy process.",
      description:
        "FlowDesk works best for teams that want issue tracking, roadmaps, lightweight docs, and recurring delivery reports in one quiet workspace.",
      logoUrl: "https://placehold.co/160x160/1d4ed8/ffffff?text=F",
      websiteUrl: "https://example.com/flowdesk",
      affiliateUrl: "https://example.com/flowdesk?ref=tekvora",
      category: "Productivity",
      pricingModel: "Per seat with free trial",
      pricingFrom: 8.0,
      currency: "USD",
      rating: 4.6,
      features: ["Roadmaps", "Issue tracking", "Docs", "Delivery reports"],
      pros: ["Fast onboarding", "Clean interface", "Strong reporting"],
      cons: ["Limited enterprise workflow controls", "No native time tracking"],
      bestFor: ["Product teams", "Engineering teams", "Startups"],
      alternatives: ["Linear", "Jira", "Asana"],
      status: "PUBLISHED",
      isFeatured: true,
      order: 1,
      seoTitle: "FlowDesk Review",
      seoDescription: "FlowDesk review covering pricing, features, best-fit teams, pros, cons, and alternatives.",
      ogImageUrl: "https://placehold.co/1200x630/1d4ed8/ffffff?text=FlowDesk",
      publishedAt: daysAgo(1),
    }),
    upsertServiceProduct({
      name: "MetricPilot",
      slug: "metricpilot",
      shortDescription:
        "A lightweight analytics service for dashboards, funnels, retention, and revenue reporting.",
      description:
        "MetricPilot gives operators a focused analytics layer without forcing teams into a heavyweight BI implementation.",
      logoUrl: "https://placehold.co/160x160/047857/ffffff?text=M",
      websiteUrl: "https://example.com/metricpilot",
      affiliateUrl: "https://example.com/metricpilot?ref=tekvora",
      category: "Analytics",
      pricingModel: "Usage-based",
      pricingFrom: 19.0,
      currency: "USD",
      rating: 4.4,
      features: ["Funnels", "Retention cohorts", "Revenue metrics", "CSV export"],
      pros: ["Clear service metrics", "Useful default dashboards", "Simple setup"],
      cons: ["Advanced modeling is limited", "Connector catalog is still growing"],
      bestFor: ["Service operators", "Growth teams", "Founders"],
      alternatives: ["Mixpanel", "Amplitude", "June"],
      status: "PUBLISHED",
      isFeatured: true,
      order: 2,
      seoTitle: "MetricPilot Review",
      seoDescription: "MetricPilot analytics review with pricing, features, alternatives, pros, cons, and ideal users.",
      publishedAt: daysAgo(2),
    }),
    upsertServiceProduct({
      name: "SupportForge",
      slug: "supportforge",
      shortDescription:
        "An email and support service that combines shared inbox, help center, automations, and AI drafting.",
      description:
        "SupportForge is a practical option for growing support teams that need structured inbox workflows and a solid knowledge base.",
      logoUrl: "https://placehold.co/160x160/be123c/ffffff?text=S",
      websiteUrl: "https://example.com/supportforge",
      affiliateUrl: "https://example.com/supportforge?ref=tekvora",
      category: "Email",
      pricingModel: "Per agent",
      pricingFrom: 15.0,
      currency: "USD",
      rating: 4.2,
      features: ["Shared inbox", "Help center", "Automation rules", "AI drafts"],
      pros: ["Good agent workflow", "Strong help center tools", "Flexible automations"],
      cons: ["Reporting takes setup", "AI features cost extra"],
      bestFor: ["Support teams", "B2B services", "Customer success"],
      alternatives: ["Zendesk", "Intercom", "Help Scout"],
      status: "PUBLISHED",
      isFeatured: false,
      order: 3,
      seoTitle: "SupportForge Review",
      seoDescription: "SupportForge review covering support workflows, AI features, pricing, pros, cons, and alternatives.",
      publishedAt: daysAgo(3),
    }),
  ])

  await Promise.all([
    upsertComparison({
      title: "FlowDesk vs MetricPilot",
      slug: "flowdesk-vs-metricpilot",
      excerpt: "A practical comparison between productivity and analytics service workflows.",
      itemAName: "FlowDesk",
      itemBName: "MetricPilot",
      itemALogoUrl: "https://placehold.co/160x160/1d4ed8/ffffff?text=F",
      itemBLogoUrl: "https://placehold.co/160x160/047857/ffffff?text=M",
      itemAUrl: "https://example.com/flowdesk",
      itemBUrl: "https://example.com/metricpilot",
      itemAAffiliateUrl: "https://example.com/flowdesk?ref=tekvora",
      itemBAffiliateUrl: "https://example.com/metricpilot?ref=tekvora",
      summary: "FlowDesk is better for delivery planning, while MetricPilot is better for service metrics and revenue analysis.",
      verdict: "Choose FlowDesk if your main problem is execution clarity. Choose MetricPilot if your main problem is product and revenue visibility.",
      winner: "Tie",
      comparisonTable: [
        { feature: "Primary use", itemA: "Project management", itemB: "Analytics", winner: "Tie" },
        { feature: "Starting price", itemA: "$8/month", itemB: "$19/month", winner: "A" },
        { feature: "Best for", itemA: "Product teams", itemB: "Growth teams", winner: "Tie" },
      ],
      prosA: ["Clean planning workflow", "Strong delivery reports", "Fast onboarding"],
      consA: ["No native analytics suite", "Limited advanced governance"],
      prosB: ["Useful service dashboards", "Good funnel visibility", "Simple setup"],
      consB: ["Not a task tracker", "Connector catalog is smaller than BI tools"],
      bestForA: ["Roadmaps", "Issue tracking", "Engineering delivery"],
      bestForB: ["Funnels", "Retention", "Revenue dashboards"],
      content: "<h2>Bottom line</h2><p>These products solve different operational problems, so the right choice depends on whether planning or measurement is the current bottleneck.</p>",
      status: "PUBLISHED",
      isFeatured: true,
      order: 1,
      seoTitle: "FlowDesk vs MetricPilot",
      seoDescription: "Compare FlowDesk and MetricPilot by pricing, features, best use cases, pros, cons, and winner.",
      ogImageUrl: "https://placehold.co/1200x630/111827/ffffff?text=FlowDesk+vs+MetricPilot",
      publishedAt: daysAgo(1),
    }),
  ])

  console.log(`Seeded admin user: ${email}`)
  console.log("Seeded sample public articles, tools, services, comparisons, categories, tags, and authors.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
