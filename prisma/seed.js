import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

function daysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

async function upsertCategory(data) {
  return prisma.category.upsert({
    where: { slug_locale: { slug: data.slug, locale: "en" } },
    update: data,
    create: { ...data, locale: "en" },
  })
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

async function upsertHostingProvider(data) {
  return prisma.hostingProvider.upsert({
    where: { slug: data.slug },
    update: data,
    create: data,
  })
}

async function upsertSaaSProduct(data) {
  return prisma.saaSProduct.upsert({
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

  const [hosting, tools, saas] = await Promise.all([
    upsertCategory({
      name: "Hosting",
      slug: "hosting",
      description: "Infrastructure, VPS, cloud hosting, and deployment guidance.",
      order: 1,
      isFeatured: true,
      seoTitle: "Hosting Guides",
      seoDesc: "Independent hosting and VPS guides for technical teams.",
    }),
    upsertCategory({
      name: "Developer Tools",
      slug: "developer-tools",
      description: "Software tools for development, operations, and productivity.",
      order: 2,
      isFeatured: true,
      seoTitle: "Developer Tools",
      seoDesc: "Practical reviews and buying guides for developer tools.",
    }),
    upsertCategory({
      name: "SaaS",
      slug: "saas",
      description: "SaaS products for teams, operations, analytics, and growth.",
      order: 3,
      isFeatured: false,
      seoTitle: "SaaS Guides",
      seoDesc: "SaaS comparisons and practical selection guides.",
    }),
  ])

  const vps = await upsertCategory({
    name: "VPS",
    slug: "vps",
    description: "Virtual private server reviews and comparisons.",
    parentId: hosting.id,
    order: 1,
    isFeatured: true,
  })

  const [cloudTag, vpsTag, devopsTag, aiTag, saasTag] = await Promise.all([
    upsertTag({ name: "Cloud", slug: "cloud", description: "Cloud platforms and infrastructure." }),
    upsertTag({ name: "VPS", slug: "vps", description: "Virtual private servers." }),
    upsertTag({ name: "DevOps", slug: "devops", description: "Automation and operations workflows." }),
    upsertTag({ name: "AI Tools", slug: "ai-tools", description: "AI software and productivity tools." }),
    upsertTag({ name: "SaaS", slug: "saas", description: "Software as a service." }),
  ])

  const [alex, maya] = await Promise.all([
    upsertAuthor({
      name: "Alex Carter",
      slug: "alex-carter",
      bio: "Infrastructure writer focused on practical cloud, VPS, and developer tooling decisions.",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop",
      websiteUrl: "https://tekvora.com",
      twitterUrl: "https://x.com",
      linkedinUrl: "https://linkedin.com",
    }),
    upsertAuthor({
      name: "Maya Chen",
      slug: "maya-chen",
      bio: "SaaS analyst covering productivity software, AI tools, and modern team workflows.",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop",
      websiteUrl: "https://tekvora.com",
    }),
  ])

  const contentA = `
    <p>Choosing a VPS provider is no longer only about the lowest monthly price. Teams now need predictable CPU performance, reliable networking, clear backup options, and support that can resolve infrastructure incidents quickly.</p>
    <h2>What matters most when comparing VPS providers</h2>
    <p>The most important factors are compute consistency, storage performance, bandwidth policy, data center footprint, and the quality of the control panel. A cheap VPS that throttles during peak hours can cost more in engineering time than a slightly more expensive plan.</p>
    <h3>Performance and isolation</h3>
    <p>Look for transparent CPU allocation, modern NVMe storage, and clear fair-use policies. Providers that publish benchmark methodology and real network limits are easier to trust.</p>
    <blockquote>For production workloads, predictable performance is usually more valuable than headline discounts.</blockquote>
    <h2>Operational features</h2>
    <p>Snapshots, firewall rules, private networking, monitoring, and automated rebuilds can dramatically reduce recovery time. These features matter even for small teams.</p>
    <ul><li>Automated backups</li><li>Simple firewall management</li><li>Regional availability</li><li>Transparent pricing</li></ul>
    <h2>Final recommendation</h2>
    <p>Shortlist providers based on operational needs first, then compare prices. The best VPS choice is the one your team can run confidently during normal weeks and incidents.</p>
  `

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
    <p>AI SaaS tools are moving quickly, but buyers still need a grounded evaluation process. The best choice depends on data handling, workflow fit, output quality, and administrative controls.</p>
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
        title: "How to Choose a VPS Provider in 2026",
        slug: "how-to-choose-a-vps-provider",
        excerpt: "A practical framework for comparing VPS providers by performance, reliability, operations, and long-term cost.",
        content: contentA,
        format: "HTML",
        status: "PUBLISHED",
        type: "ARTICLE",
        categoryId: vps.id,
        authorId: alex.id,
        coverImageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1400&h=800&fit=crop",
        seoTitle: "How to Choose a VPS Provider in 2026",
        seoDesc: "Compare VPS providers using performance, reliability, operations, and pricing criteria that matter for real teams.",
        ogImageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1400&h=800&fit=crop",
        publishedAt: daysAgo(2),
      },
      [cloudTag.id, vpsTag.id, devopsTag.id]
    ),
    upsertPost(
      {
        title: "The Practical Developer Tool Buying Checklist",
        slug: "developer-tool-buying-checklist",
        excerpt: "A structured checklist for evaluating developer tools before they become part of your engineering workflow.",
        content: contentB,
        format: "HTML",
        status: "PUBLISHED",
        type: "ARTICLE",
        categoryId: tools.id,
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
        title: "How to Evaluate AI SaaS Tools Without the Hype",
        slug: "evaluate-ai-saas-tools",
        excerpt: "A calm evaluation process for AI SaaS tools focused on workflow fit, security, measurement, and quality.",
        content: contentC,
        format: "HTML",
        status: "PUBLISHED",
        type: "ARTICLE",
        categoryId: saas.id,
        authorId: maya.id,
        coverImageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1400&h=800&fit=crop",
        seoTitle: "How to Evaluate AI SaaS Tools",
        seoDesc: "Evaluate AI SaaS tools based on use case fit, data controls, measurement, and real operational value.",
        publishedAt: daysAgo(9),
      },
      [aiTag.id, saasTag.id]
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
      categoryId: tools.id,
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
      categoryId: tools.id,
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
      categoryId: tools.id,
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
      categoryId: tools.id,
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
      categoryId: tools.id,
      componentKey: "timestamp-converter",
      seoTitle: "Timestamp Converter",
      seoDesc: "Convert Unix timestamps, milliseconds, and ISO dates online.",
      order: 4,
      publishedAt: daysAgo(1),
    }),
  ])

  await Promise.all([
    upsertHostingProvider({
      name: "NorthStack VPS",
      slug: "northstack-vps",
      shortDescription:
        "A developer-friendly VPS provider with predictable NVMe performance and simple operations.",
      description:
        "NorthStack VPS is a strong fit for small engineering teams that want reliable virtual servers, clean networking, backups, and a practical control panel without enterprise complexity.",
      logoUrl: "https://placehold.co/160x160/111827/ffffff?text=N",
      websiteUrl: "https://example.com/northstack",
      affiliateUrl: "https://example.com/northstack?ref=tekvora",
      pricingFrom: 6.0,
      currency: "USD",
      rating: 4.6,
      pros: ["Consistent CPU performance", "Simple backup workflow", "Good developer UX"],
      cons: ["Fewer edge locations than hyperscale clouds", "Limited managed database options"],
      features: ["NVMe storage", "Snapshots", "Private networking", "Firewall rules"],
      bestFor: ["Developers", "Small SaaS teams", "Staging environments"],
      performanceNotes:
        "Benchmark consistency is the main strength. CPU and disk results remain stable across normal daily usage.",
      supportNotes:
        "Support is practical and technical, with faster responses for infrastructure incidents than general account questions.",
      dataCenterLocations: ["New York", "Frankfurt", "Singapore"],
      status: "PUBLISHED",
      isFeatured: true,
      order: 1,
      seoTitle: "NorthStack VPS Review",
      seoDescription: "NorthStack VPS review covering pricing, performance, support, pros, cons, and best-fit use cases.",
      ogImageUrl: "https://placehold.co/1200x630/111827/ffffff?text=NorthStack+VPS",
      publishedAt: daysAgo(1),
    }),
    upsertHostingProvider({
      name: "CloudHarbor",
      slug: "cloudharbor",
      shortDescription:
        "A balanced cloud hosting platform for production websites, APIs, and managed VPS workloads.",
      description:
        "CloudHarbor focuses on straightforward production hosting with good regional coverage, clear billing, and enough managed services for growing teams.",
      logoUrl: "https://placehold.co/160x160/0f766e/ffffff?text=C",
      websiteUrl: "https://example.com/cloudharbor",
      affiliateUrl: "https://example.com/cloudharbor?ref=tekvora",
      pricingFrom: 9.5,
      currency: "USD",
      rating: 4.4,
      pros: ["Clear pricing", "Good regional footprint", "Useful managed services"],
      cons: ["Control panel can feel dense", "Backups cost extra on small plans"],
      features: ["Managed VPS", "Load balancers", "Object storage", "Team permissions"],
      bestFor: ["Production websites", "APIs", "Growing startups"],
      performanceNotes:
        "Network performance is solid across major regions, with strongest results in North America and Europe.",
      supportNotes:
        "Documentation is strong, while ticket support is best for well-scoped infrastructure questions.",
      dataCenterLocations: ["Virginia", "London", "Amsterdam", "Tokyo"],
      status: "PUBLISHED",
      isFeatured: true,
      order: 2,
      seoTitle: "CloudHarbor Review",
      seoDescription: "CloudHarbor hosting review with pricing, features, performance notes, and ideal use cases.",
      publishedAt: daysAgo(2),
    }),
    upsertHostingProvider({
      name: "BareNode",
      slug: "barenode",
      shortDescription:
        "A lower-cost VPS host for simple Linux servers, test environments, and personal projects.",
      description:
        "BareNode is best viewed as a budget VPS provider for workloads that need root access and low monthly pricing more than managed services.",
      logoUrl: "https://placehold.co/160x160/7c2d12/ffffff?text=B",
      websiteUrl: "https://example.com/barenode",
      affiliateUrl: "https://example.com/barenode?ref=tekvora",
      pricingFrom: 4.0,
      currency: "USD",
      rating: 4.1,
      pros: ["Low entry pricing", "Fast server provisioning", "Simple Linux images"],
      cons: ["Support is basic", "Limited advanced networking"],
      features: ["Root access", "IPv6", "Linux images", "Manual snapshots"],
      bestFor: ["Personal projects", "Test servers", "Budget VPS"],
      performanceNotes:
        "Performance is good for the price, but production teams should benchmark noisy-neighbor behavior before committing.",
      supportNotes:
        "Support handles provisioning and account issues, but teams should expect to manage server operations themselves.",
      dataCenterLocations: ["Dallas", "Warsaw"],
      status: "PUBLISHED",
      isFeatured: false,
      order: 3,
      seoTitle: "BareNode VPS Review",
      seoDescription: "BareNode review for budget VPS users comparing pricing, performance, support, and limitations.",
      publishedAt: daysAgo(3),
    }),
  ])

  await Promise.all([
    upsertSaaSProduct({
      name: "FlowDesk",
      slug: "flowdesk",
      shortDescription:
        "A project management SaaS for product and engineering teams that need clear planning without heavy process.",
      description:
        "FlowDesk works best for teams that want issue tracking, roadmaps, lightweight docs, and recurring delivery reports in one quiet workspace.",
      logoUrl: "https://placehold.co/160x160/1d4ed8/ffffff?text=F",
      websiteUrl: "https://example.com/flowdesk",
      affiliateUrl: "https://example.com/flowdesk?ref=tekvora",
      category: "Project Management",
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
    upsertSaaSProduct({
      name: "MetricPilot",
      slug: "metricpilot",
      shortDescription:
        "A lightweight analytics SaaS for SaaS dashboards, funnels, retention, and revenue reporting.",
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
      pros: ["Clear SaaS metrics", "Useful default dashboards", "Simple setup"],
      cons: ["Advanced modeling is limited", "Connector catalog is still growing"],
      bestFor: ["SaaS operators", "Growth teams", "Founders"],
      alternatives: ["Mixpanel", "Amplitude", "June"],
      status: "PUBLISHED",
      isFeatured: true,
      order: 2,
      seoTitle: "MetricPilot Review",
      seoDescription: "MetricPilot analytics review with pricing, features, alternatives, pros, cons, and ideal users.",
      publishedAt: daysAgo(2),
    }),
    upsertSaaSProduct({
      name: "SupportForge",
      slug: "supportforge",
      shortDescription:
        "A customer support SaaS that combines shared inbox, help center, automations, and AI drafting.",
      description:
        "SupportForge is a practical option for growing SaaS support teams that need structured inbox workflows and a solid knowledge base.",
      logoUrl: "https://placehold.co/160x160/be123c/ffffff?text=S",
      websiteUrl: "https://example.com/supportforge",
      affiliateUrl: "https://example.com/supportforge?ref=tekvora",
      category: "Customer Support",
      pricingModel: "Per agent",
      pricingFrom: 15.0,
      currency: "USD",
      rating: 4.2,
      features: ["Shared inbox", "Help center", "Automation rules", "AI drafts"],
      pros: ["Good agent workflow", "Strong help center tools", "Flexible automations"],
      cons: ["Reporting takes setup", "AI features cost extra"],
      bestFor: ["Support teams", "B2B SaaS", "Customer success"],
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
      excerpt: "A practical comparison between project management and SaaS analytics workflows.",
      itemAName: "FlowDesk",
      itemBName: "MetricPilot",
      itemALogoUrl: "https://placehold.co/160x160/1d4ed8/ffffff?text=F",
      itemBLogoUrl: "https://placehold.co/160x160/047857/ffffff?text=M",
      itemAUrl: "https://example.com/flowdesk",
      itemBUrl: "https://example.com/metricpilot",
      itemAAffiliateUrl: "https://example.com/flowdesk?ref=tekvora",
      itemBAffiliateUrl: "https://example.com/metricpilot?ref=tekvora",
      summary: "FlowDesk is better for delivery planning, while MetricPilot is better for SaaS metrics and revenue analysis.",
      verdict: "Choose FlowDesk if your main problem is execution clarity. Choose MetricPilot if your main problem is product and revenue visibility.",
      winner: "Tie",
      comparisonTable: [
        { feature: "Primary use", itemA: "Project management", itemB: "Analytics", winner: "Tie" },
        { feature: "Starting price", itemA: "$8/month", itemB: "$19/month", winner: "A" },
        { feature: "Best for", itemA: "Product teams", itemB: "Growth teams", winner: "Tie" },
      ],
      prosA: ["Clean planning workflow", "Strong delivery reports", "Fast onboarding"],
      consA: ["No native analytics suite", "Limited advanced governance"],
      prosB: ["Useful SaaS dashboards", "Good funnel visibility", "Simple setup"],
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
    upsertComparison({
      title: "NorthStack VPS vs CloudHarbor",
      slug: "northstack-vps-vs-cloudharbor",
      excerpt: "Compare two infrastructure providers by pricing, performance, operations, and best-fit teams.",
      itemAName: "NorthStack VPS",
      itemBName: "CloudHarbor",
      itemALogoUrl: "https://placehold.co/160x160/111827/ffffff?text=N",
      itemBLogoUrl: "https://placehold.co/160x160/0f766e/ffffff?text=C",
      itemAUrl: "https://example.com/northstack",
      itemBUrl: "https://example.com/cloudharbor",
      itemAAffiliateUrl: "https://example.com/northstack?ref=tekvora",
      itemBAffiliateUrl: "https://example.com/cloudharbor?ref=tekvora",
      summary: "NorthStack VPS is stronger for simple VPS operations, while CloudHarbor is better for teams that need a broader cloud platform.",
      verdict: "NorthStack wins for lean VPS deployments. CloudHarbor wins for production platforms needing managed services.",
      winner: "Depends",
      comparisonTable: [
        { feature: "Starting price", itemA: "$6/month", itemB: "$9.50/month", winner: "A" },
        { feature: "Managed services", itemA: "Limited", itemB: "Broader", winner: "B" },
        { feature: "Developer UX", itemA: "Simple", itemB: "Feature-rich", winner: "Tie" },
      ],
      prosA: ["Predictable VPS performance", "Simple backups", "Clean control panel"],
      consA: ["Fewer platform services", "Smaller region list"],
      prosB: ["Broader cloud features", "Good regional coverage", "Team permissions"],
      consB: ["Higher starting price", "Denser control panel"],
      bestForA: ["Small SaaS teams", "Staging servers", "Simple VPS"],
      bestForB: ["Production websites", "APIs", "Growing infrastructure teams"],
      content: "<h2>Recommendation</h2><p>Start with the operational model your team needs. Simple VPS workloads favor NorthStack, while multi-service deployments favor CloudHarbor.</p>",
      status: "PUBLISHED",
      isFeatured: true,
      order: 2,
      seoTitle: "NorthStack VPS vs CloudHarbor",
      seoDescription: "Compare NorthStack VPS and CloudHarbor by price, performance, managed services, support, and best use cases.",
      publishedAt: daysAgo(2),
    }),
  ])

  console.log(`Seeded admin user: ${email}`)
  console.log("Seeded sample public articles, tools, hosting reviews, SaaS products, comparisons, categories, tags, and authors.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
