import {
  PrismaClient,
  UserRole,
  MembershipTier,
  StoryClassification,
  StoryStatus,
  ContentRating,
  PromotionStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding FicForge PostgreSQL database...");

  // 1. Seed Users
  const valerius = await prisma.user.upsert({
    where: { email: "valerius@ficforge.org" },
    update: {},
    create: {
      email: "valerius@ficforge.org",
      username: "valerius_f",
      role: UserRole.CREATOR,
      isVerified: true,
      profile: {
        create: {
          displayName: "Valerius Frost",
          bio: "Author of high fantasy & speculative serialized epics.",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        },
      },
      wallet: {
        create: {
          purchasedSparks: 400,
          bonusSparks: 50,
          earnedSparks: 0,
        },
      },
      vault: {
        create: {
          clearedBalanceUsd: 4.50,
          pendingHoldingUsd: 0.00,
          paypalEmail: "valerius.payouts@gmail.com",
          isEligibleForPayout: false,
        },
      },
      membership: {
        create: {
          tier: MembershipTier.FORGE_PLUS,
          promoCreditsBalance: 2,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  const kincaid = await prisma.user.upsert({
    where: { email: "kincaid@ficforge.org" },
    update: {},
    create: {
      email: "kincaid@ficforge.org",
      username: "mkincaid",
      role: UserRole.CREATOR,
      isVerified: true,
      profile: {
        create: {
          displayName: "M. Kincaid",
          bio: "Passionate sci-fi & space opera fanfiction writer.",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        },
      },
      wallet: {
        create: {
          purchasedSparks: 100,
          bonusSparks: 20,
          earnedSparks: 0,
        },
      },
    },
  });

  const jax = await prisma.user.upsert({
    where: { email: "jax@ficforge.org" },
    update: {},
    create: {
      email: "jax@ficforge.org",
      username: "jaxmercer",
      role: UserRole.CREATOR,
      isVerified: true,
      profile: {
        create: {
          displayName: "Jax Mercer",
          bio: "Cyberpunk & noir serialized fiction author.",
          avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        },
      },
      wallet: {
        create: {
          purchasedSparks: 500,
          bonusSparks: 100,
          earnedSparks: 0,
        },
      },
    },
  });

  console.log("Users seeded successfully.");

  // 2. Seed Stories
  const emberStory = await prisma.story.upsert({
    where: { slug: "the-ember-archive" },
    update: {},
    create: {
      authorId: valerius.id,
      title: "The Ember Archive",
      slug: "the-ember-archive",
      synopsis: "In a world where memories are currency and history can be burned for fuel, an archivist uncovers a forgotten lineage of flame-weavers that could reignite civilization or ash it forever.",
      classification: StoryClassification.ORIGINAL,
      status: StoryStatus.ONGOING,
      rating: ContentRating.MATURE,
      coverImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
      viewCount: 48920,
      likeCount: 5820,
      bookmarkCount: 2310,
      chapters: {
        create: [
          {
            chapterNumber: 1,
            orderIndex: 1,
            title: "Ashes of the Spire",
            slug: "chapter-1",
            content: "The smoke had settled over the Upper Archives like a shroud of black velvet. Valerius brushed ash from the leather-bound ledger, his fingers trembling not from fear, but from the cold that seeped through the shattered stained-glass windows.",
            wordCount: 1420,
            isPublished: true,
            publishedAt: new Date(),
          },
          {
            chapterNumber: 2,
            orderIndex: 2,
            title: "The Flame-Weaver's Oath",
            slug: "chapter-2",
            content: "The underground forge hummed with heat so intense it distorted the silhouettes of the elders standing around the stone crucible. To weave flame was not merely an art; it was a pact signed in blood and breath.",
            wordCount: 1850,
            isPublished: true,
            publishedAt: new Date(),
          },
          {
            chapterNumber: 3,
            orderIndex: 3,
            title: "The Salt Flats at Midnight",
            slug: "chapter-3",
            content: "Across the shimmering crystalline plains of the Great Desolation, silence was absolute. Only the crunch of salt beneath heavy boots betrayed the caravan's desperate march toward the Spire.",
            wordCount: 2100,
            isPublished: true,
            publishedAt: new Date(),
          },
        ],
      },
    },
  });

  const starWarsStory = await prisma.story.upsert({
    where: { slug: "star-wars-the-obsidian-blade" },
    update: {},
    create: {
      authorId: kincaid.id,
      title: "Star Wars: The Obsidian Blade",
      slug: "star-wars-the-obsidian-blade",
      synopsis: "Centuries before the Skywalker Saga, an ancient dark-side artifact awakens on a forgotten Outer Rim world. A lone Jedi Knight and an exiled scavenger must prevent its obsidian core from fracturing reality.",
      classification: StoryClassification.FANFICTION,
      status: StoryStatus.ONGOING,
      rating: ContentRating.TEEN,
      coverImageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
      viewCount: 31200,
      likeCount: 4210,
      bookmarkCount: 1840,
      chapters: {
        create: [
          {
            chapterNumber: 1,
            orderIndex: 1,
            title: "Echoes in the Vapor",
            slug: "chapter-1",
            content: "The twin suns of the frontier system hung low over the rusted junk canyons of Kintan-4. Mara watched the dust devils twist through the canyon floor through the cracked scope of her macrobinoculars.",
            wordCount: 1650,
            isPublished: true,
            publishedAt: new Date(),
          },
          {
            chapterNumber: 2,
            orderIndex: 2,
            title: "The Obsidian Chamber",
            slug: "chapter-2",
            content: "The door groaned on ancient hinges. Inside, the obsidian monolith pulsed with a rhythmic indigo heartbeat that resonated directly through Mara's teeth.",
            wordCount: 1980,
            isPublished: true,
            publishedAt: new Date(),
          },
        ],
      },
    },
  });

  const neonStory = await prisma.story.upsert({
    where: { slug: "neon-syndicate-blood-chrome" },
    update: {},
    create: {
      authorId: jax.id,
      title: "Neon Syndicate: Blood & Chrome",
      slug: "neon-syndicate-blood-chrome",
      synopsis: "In Neo-Shinjuku's underbelly, an aug-runner takes a high-stakes contract to extract a prototype neural cortex from Megacorp headquarters, only to discover the AI inside already knows his true identity.",
      classification: StoryClassification.ORIGINAL,
      status: StoryStatus.ONGOING,
      rating: ContentRating.EXPLICIT,
      isExplicit18Plus: true,
      isMonetizationBlocked: true,
      coverImageUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
      viewCount: 18450,
      likeCount: 2980,
      bookmarkCount: 1120,
      chapters: {
        create: [
          {
            chapterNumber: 1,
            orderIndex: 1,
            title: "Sub-Level Zero",
            slug: "chapter-1",
            content: "Rain hissed against the reinforced acrylic visor of Jax's combat helmet. Forty floors below, the neon lights of District 9 bled into the smog like open wounds.",
            wordCount: 2200,
            isPublished: true,
            publishedAt: new Date(),
          },
        ],
      },
    },
  });

  console.log("Stories seeded successfully.");

  // 3. Seed Active Spotlight Promotions
  const now = new Date();
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.spotlightPromotion.deleteMany(); // Reset promotions table

  await prisma.spotlightPromotion.create({
    data: {
      storyId: emberStory.id,
      userId: valerius.id,
      creditsSpent: 1,
      status: PromotionStatus.ACTIVE,
      startDate: now,
      endDate: nextWeek,
      impressions: 48920,
      clicks: 6410,
    },
  });

  await prisma.spotlightPromotion.create({
    data: {
      storyId: starWarsStory.id,
      userId: kincaid.id,
      creditsSpent: 1,
      status: PromotionStatus.ACTIVE,
      startDate: now,
      endDate: nextWeek,
      impressions: 31200,
      clicks: 4180,
    },
  });

  await prisma.spotlightPromotion.create({
    data: {
      storyId: neonStory.id,
      userId: jax.id,
      creditsSpent: 1,
      status: PromotionStatus.ACTIVE,
      startDate: now,
      endDate: nextWeek,
      impressions: 18450,
      clicks: 2890,
    },
  });

  console.log("All 3 Spotlight Promotions seeded into PostgreSQL!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
