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
  console.log("Seeding FicForge PostgreSQL database with unified Creator entity & sample stories...");

  // Clear existing records to ensure clean relational integrity
  await prisma.spotlightPromotion.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.story.deleteMany();
  await prisma.creatorVault.deleteMany();
  await prisma.sparksWallet.deleteMany();
  await prisma.platformMembership.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create the unified real creator user (Valerius Frost)
  const valerius = await prisma.user.create({
    data: {
      id: "user-creator-demo",
      email: "creator@ficforge.org",
      username: "valerius_f",
      role: UserRole.CREATOR,
      isVerified: true,
      profile: {
        create: {
          displayName: "Valerius Frost",
          bio: "Author of high fantasy, space opera & serialized epics. Writing across multiple worlds.",
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
          paypalEmail: "creator.payouts@ficforge.org",
          isEligibleForPayout: false,
        },
      },
      membership: {
        create: {
          tier: MembershipTier.FORGE_PLUS,
          promoCreditsBalance: 3,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  console.log(`Created primary Creator User: ${valerius.username} (${valerius.id})`);

  // 2. Assign ALL sample stories to this exact user
  const emberStory = await prisma.story.create({
    data: {
      id: "story-ember-archive",
      authorId: valerius.id,
      title: "The Ember Archive",
      slug: "the-ember-archive",
      synopsis: "In a world where memories burn to ash, a lonely cartographer discovers the Ember Spire — a forgotten sanctuary housing the echoes of fallen kingdoms. As the northern frost creeps southward to extinguish the last living fires, she must forge an alliance with an exiled flame-weaver to unlock the ancient script before history itself dissolves into silence.",
      classification: StoryClassification.ORIGINAL,
      status: StoryStatus.ONGOING,
      rating: ContentRating.TEEN,
      coverImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
      viewCount: 96240,
      likeCount: 14850,
      bookmarkCount: 8420,
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

  const starWarsStory = await prisma.story.create({
    data: {
      id: "story-obsidian-blade",
      authorId: valerius.id,
      title: "Star Wars: The Obsidian Blade",
      slug: "star-wars-the-obsidian-blade",
      synopsis: "Centuries before the Skywalker Saga, an ancient dark-side artifact awakens on a forgotten Outer Rim world. A lone Jedi Knight and an exiled scavenger must prevent its obsidian core from fracturing reality.",
      classification: StoryClassification.FANFICTION,
      status: StoryStatus.ONGOING,
      rating: ContentRating.GENERAL,
      coverImageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
      viewCount: 38900,
      likeCount: 5820,
      bookmarkCount: 2940,
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

  const neonStory = await prisma.story.create({
    data: {
      id: "story-neon-syndicate",
      authorId: valerius.id,
      title: "Neon Syndicate: Blood & Chrome",
      slug: "neon-syndicate-blood-chrome",
      synopsis: "In Neo-Shinjuku's underbelly, an aug-runner takes a high-stakes contract to extract a prototype neural cortex from Megacorp headquarters, only to discover the AI inside already knows his true identity.",
      classification: StoryClassification.ORIGINAL,
      status: StoryStatus.ONGOING,
      rating: ContentRating.EXPLICIT,
      isExplicit18Plus: true,
      isMonetizationBlocked: true,
      coverImageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
      viewCount: 41200,
      likeCount: 6200,
      bookmarkCount: 3100,
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

  console.log("All 3 stories created and linked to Valerius Frost in PostgreSQL!");

  // 3. Seed Spotlight Promotions:
  // - The Ember Archive: Currently ACTIVE (showing on homepage showcase)
  // - Star Wars: The Obsidian Blade: EXPIRED (past history, cooldown completed -> ready to test activating!)
  // - Neon Syndicate: Blood & Chrome: Unpromoted (ready to test activating!)
  const now = new Date();
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const fourDaysFromNow = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const twentyThreeDaysAgo = new Date(Date.now() - 23 * 24 * 60 * 60 * 1000);

  await prisma.spotlightPromotion.create({
    data: {
      id: "spotlight-ember-archive",
      storyId: emberStory.id,
      userId: valerius.id,
      creditsSpent: 1,
      status: PromotionStatus.ACTIVE,
      startDate: threeDaysAgo,
      endDate: fourDaysFromNow,
      impressions: 48920,
      clicks: 6410,
    },
  });

  await prisma.spotlightPromotion.create({
    data: {
      id: "spotlight-obsidian-blade",
      storyId: starWarsStory.id,
      userId: valerius.id,
      creditsSpent: 1,
      status: PromotionStatus.EXPIRED,
      startDate: thirtyDaysAgo,
      endDate: twentyThreeDaysAgo,
      impressions: 31200,
      clicks: 4180,
    },
  });

  console.log("Spotlight seeded: 1 active showcase story + 1 historical completed promotion, leaving other titles ready for test activation!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
