import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
  console.log('Seeding database...')

  await prisma.playlistItem.deleteMany()
  await prisma.playlist.deleteMany()
  await prisma.videoDislike.deleteMany()
  await prisma.videoLike.deleteMany()
  await prisma.videoTag.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.video.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Amateur', slug: 'amateur' } }),
    prisma.category.create({ data: { name: 'POV', slug: 'pov' } }),
    prisma.category.create({ data: { name: 'MILF', slug: 'milf' } }),
    prisma.category.create({ data: { name: 'Couples', slug: 'couples' } }),
    prisma.category.create({ data: { name: 'BDSM', slug: 'bdsm' } }),
    prisma.category.create({ data: { name: 'Lesbian', slug: 'lesbian' } }),
    prisma.category.create({ data: { name: 'Latina', slug: 'latina' } }),
    prisma.category.create({ data: { name: 'Roleplay', slug: 'roleplay' } }),
  ])
  console.log(`Created ${categories.length} categories`)

  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]))

  const usersData = [
    {
      email: 'velvetvixen@example.com',
      name: 'Velvet Vixen',
      handle: 'velvetvixen',
      avatar: 'https://picsum.photos/seed/velvetvixen/200/200',
      banner: 'https://picsum.photos/seed/velvetvixen-banner/1200/300',
      bio: 'Studio performer. Weekly HD POV and roleplay scenes for late-night viewers.',
      subscribers: 245000,
    },
    {
      email: 'midnightmia@example.com',
      name: 'Midnight Mia',
      handle: 'midnightmia',
      avatar: 'https://picsum.photos/seed/midnightmia/200/200',
      banner: 'https://picsum.photos/seed/midnightmia-banner/1200/300',
      bio: 'MILF creator focused on story-driven scenes and premium cinematography.',
      subscribers: 182000,
    },
    {
      email: 'couplesnest@example.com',
      name: 'Couples Nest',
      handle: 'couplesnest',
      avatar: 'https://picsum.photos/seed/couplesnest/200/200',
      banner: 'https://picsum.photos/seed/couplesnest-banner/1200/300',
      bio: 'Verified couple sharing authentic chemistry and candid behind-the-scenes moments.',
      subscribers: 321000,
    },
    {
      email: 'domdahlia@example.com',
      name: 'Dom Dahlia',
      handle: 'domdahlia',
      avatar: 'https://picsum.photos/seed/domdahlia/200/200',
      banner: 'https://picsum.photos/seed/domdahlia-banner/1200/300',
      bio: 'BDSM performer with consent-first themed sets and high production quality.',
      subscribers: 156000,
    },
    {
      email: 'scarletlatina@example.com',
      name: 'Scarlet Latina',
      handle: 'scarletlatina',
      avatar: 'https://picsum.photos/seed/scarletlatina/200/200',
      banner: 'https://picsum.photos/seed/scarletlatina-banner/1200/300',
      bio: 'Latina creator known for high-energy scenes, cosplay, and fan-request content.',
      subscribers: 412000,
    },
    {
      email: 'cityamateurs@example.com',
      name: 'City Amateurs',
      handle: 'cityamateurs',
      avatar: 'https://picsum.photos/seed/cityamateurs/200/200',
      banner: 'https://picsum.photos/seed/cityamateurs-banner/1200/300',
      bio: 'Real amateur uploads with verified ages, clear consent, and minimal editing.',
      subscribers: 534000,
    },
    {
      email: 'roleplayrayne@example.com',
      name: 'Roleplay Rayne',
      handle: 'roleplayrayne',
      avatar: 'https://picsum.photos/seed/roleplayrayne/200/200',
      banner: 'https://picsum.photos/seed/roleplayrayne-banner/1200/300',
      bio: 'Character and roleplay specialist with immersive scenarios and episodic drops.',
      subscribers: 89000,
    },
    {
      email: 'sapphicsunset@example.com',
      name: 'Sapphic Sunset',
      handle: 'sapphicsunset',
      avatar: 'https://picsum.photos/seed/sapphicsunset/200/200',
      banner: 'https://picsum.photos/seed/sapphicsunset-banner/1200/300',
      bio: 'Lesbian duo channel focused on romantic scenes and natural chemistry.',
      subscribers: 203000,
    },
  ]

  const users = await Promise.all(usersData.map((u) => prisma.user.create({ data: u })))
  console.log(`Created ${users.length} users`)

  const creatorScenes = [
    {
      uploaderIndex: 0,
      category: 'pov',
      scenes: [
        {
          title: 'Late Night Tease - Bedroom POV',
          description: 'An intimate bedroom POV set with soft lighting, teasing pace, and full-length cuts.',
          tags: ['pov', 'bedroom', 'tease', 'hd', 'solo'],
        },
        {
          title: 'VIP Fan Request - Mirror Angle Session',
          description: 'Custom fan-request scene featuring mirror shots, direct eye contact, and playful pacing.',
          tags: ['pov', 'mirror', 'fan-request', 'premium', 'tease'],
        },
        {
          title: 'After Hours Stream Recap',
          description: 'Edited highlights from the late stream with extended exclusive moments.',
          tags: ['pov', 'exclusive', 'stream', 'night', 'uncut'],
        },
      ],
    },
    {
      uploaderIndex: 1,
      category: 'milf',
      scenes: [
        {
          title: 'Midnight Hotel Roleplay',
          description: 'A polished roleplay fantasy set in a luxury hotel suite with cinematic lighting.',
          tags: ['milf', 'roleplay', 'hotel', 'story', '4k'],
        },
        {
          title: 'Silk Robe Morning Scene',
          description: 'Slow-burn morning set with close framing and sensual atmosphere.',
          tags: ['milf', 'morning', 'solo', 'sensual', 'soft'],
        },
        {
          title: 'Private Suite Confession',
          description: 'Confessional style performance with narrative build-up and premium production.',
          tags: ['milf', 'confession', 'storyline', 'premium', 'exclusive'],
        },
      ],
    },
    {
      uploaderIndex: 2,
      category: 'couples',
      scenes: [
        {
          title: 'Couples Afterparty POV',
          description: 'Real-couple chemistry and party-night energy captured in first-person style.',
          tags: ['couples', 'pov', 'party', 'amateur', 'chemistry'],
        },
        {
          title: 'Weekend Cabin Session',
          description: 'Natural setting, playful dynamic, and candid moments from a cabin getaway.',
          tags: ['couples', 'cabin', 'romantic', 'weekend', 'real'],
        },
        {
          title: 'Date Night Extended Cut',
          description: 'Extended edit from date night with behind-the-scenes opening and full scene.',
          tags: ['couples', 'date-night', 'extended', 'romance', 'uncut'],
        },
      ],
    },
    {
      uploaderIndex: 3,
      category: 'bdsm',
      scenes: [
        {
          title: 'Consent First - Red Room Intro',
          description: 'BDSM theme with clear boundaries, negotiated roles, and stylized visuals.',
          tags: ['bdsm', 'consent', 'roleplay', 'red-room', 'kink'],
        },
        {
          title: 'Leather and Lace Session',
          description: 'High-contrast set with leather wardrobe, close framing, and dominant energy.',
          tags: ['bdsm', 'leather', 'dominant', 'studio', 'hd'],
        },
        {
          title: 'Latex Nights Feature',
          description: 'Feature-length kink scene with slow pacing and controlled atmosphere.',
          tags: ['bdsm', 'latex', 'feature', 'kink', 'premium'],
        },
      ],
    },
    {
      uploaderIndex: 4,
      category: 'latina',
      scenes: [
        {
          title: 'Scarlet Heat - Balcony Scene',
          description: 'High-energy balcony shoot with city lights, bold wardrobe, and confident presence.',
          tags: ['latina', 'balcony', 'night', 'solo', 'tease'],
        },
        {
          title: 'Cosplay Fan Night',
          description: 'Costume-driven fan special with roleplay dialogue and extended ending.',
          tags: ['latina', 'cosplay', 'fan-night', 'roleplay', 'exclusive'],
        },
        {
          title: 'Tropical Suite Fantasy',
          description: 'Tropical set with warm tones, playful mood, and premium editing.',
          tags: ['latina', 'tropical', 'fantasy', 'suite', '4k'],
        },
      ],
    },
    {
      uploaderIndex: 5,
      category: 'amateur',
      scenes: [
        {
          title: 'City Loft Amateur Night',
          description: 'Verified amateur pair in a loft setup with handheld realism and natural pacing.',
          tags: ['amateur', 'loft', 'real', 'verified', 'homemade'],
        },
        {
          title: 'No Script Weekend Upload',
          description: 'Unscripted, one-camera set focused on authenticity and chemistry.',
          tags: ['amateur', 'unscripted', 'weekend', 'real-couple', 'raw'],
        },
        {
          title: 'First Time Collab',
          description: 'Debut collaboration between verified creators with candid behind-the-scenes moments.',
          tags: ['amateur', 'collab', 'first-time', 'verified', 'exclusive'],
        },
      ],
    },
    {
      uploaderIndex: 6,
      category: 'roleplay',
      scenes: [
        {
          title: 'Boss and Assistant Fantasy',
          description: 'Office roleplay with scripted banter, costume styling, and cinematic pacing.',
          tags: ['roleplay', 'office', 'fantasy', 'storyline', 'hd'],
        },
        {
          title: 'Neighbor After Midnight',
          description: 'Late-night roleplay scenario with suspenseful intro and intimate payoff.',
          tags: ['roleplay', 'neighbor', 'midnight', 'story', 'exclusive'],
        },
        {
          title: 'The Interview Tape',
          description: 'Character-driven scene presented as an audition interview gone wild.',
          tags: ['roleplay', 'interview', 'character', 'narrative', 'premium'],
        },
      ],
    },
    {
      uploaderIndex: 7,
      category: 'lesbian',
      scenes: [
        {
          title: 'Sunset Lovers Session',
          description: 'Romantic lesbian scene with soft tones, patient pacing, and affectionate chemistry.',
          tags: ['lesbian', 'romantic', 'sunset', 'duo', 'soft'],
        },
        {
          title: 'Shower Room Secrets',
          description: 'Steamy shower-room setup with polished audio and close camera work.',
          tags: ['lesbian', 'shower', 'duo', 'steamy', 'hd'],
        },
        {
          title: 'Slow Burn Bedroom Set',
          description: 'Long-form scene focused on intimacy, eye contact, and emotional connection.',
          tags: ['lesbian', 'bedroom', 'slow-burn', 'intimate', 'premium'],
        },
      ],
    },
  ]

  const videos: Array<{ id: string }> = []
  for (const creator of creatorScenes) {
    for (const scene of creator.scenes) {
      const video = await prisma.video.create({
        data: {
          title: scene.title,
          description: scene.description,
          thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(scene.title)}/640/360`,
          videoUrl: `https://example.com/videos/${encodeURIComponent(scene.title)}.mp4`,
          duration: rand(360, 1800),
          views: rand(20000, 550000),
          likes: rand(1500, 50000),
          dislikes: rand(25, 900),
          isPublished: true,
          privacy: 'public',
          isShort: false,
          uploaderId: users[creator.uploaderIndex].id,
          categoryId: categoryMap.get(creator.category)!,
          tags: {
            create: scene.tags.map((name) => ({ name })),
          },
        },
      })
      videos.push(video)
    }
  }
  console.log(`Created ${videos.length} videos`)

  const topLevelCommentsData = [
    { content: 'The lighting and camera angles were excellent. Super polished upload.', userId: users[1].id, videoId: videos[0].id },
    { content: 'Loved the chemistry in this one. Please do a follow-up part.', userId: users[2].id, videoId: videos[2].id },
    { content: 'One of the best roleplay scenes on the platform right now.', userId: users[0].id, videoId: videos[3].id },
    { content: 'The pacing was perfect and the quality is top tier.', userId: users[4].id, videoId: videos[6].id },
    { content: 'This couple always delivers. Great upload again.', userId: users[6].id, videoId: videos[7].id },
    { content: 'The consent check-in at the beginning is appreciated.', userId: users[5].id, videoId: videos[9].id },
    { content: 'Wardrobe and set design were both on point.', userId: users[7].id, videoId: videos[12].id },
    { content: 'Real and authentic vibe, exactly what I look for here.', userId: users[3].id, videoId: videos[15].id },
    { content: 'The story setup actually made this feel immersive.', userId: users[2].id, videoId: videos[18].id },
    { content: 'Soft and intimate from start to finish. Beautiful scene.', userId: users[0].id, videoId: videos[21].id },
  ]

  const topComments = await Promise.all(
    topLevelCommentsData.map((c) =>
      prisma.comment.create({
        data: {
          content: c.content,
          userId: c.userId,
          videoId: c.videoId,
        },
      })
    )
  )

  const replyCommentsData = [
    { content: 'Thank you. I spent extra time on post-production for this drop.', userId: users[0].id, videoId: videos[0].id, parentId: topComments[0].id },
    { content: 'Part 2 is already in edit and dropping this week.', userId: users[2].id, videoId: videos[2].id, parentId: topComments[1].id },
    { content: 'More character scenes coming soon.', userId: users[1].id, videoId: videos[3].id, parentId: topComments[2].id },
    { content: 'Appreciate that. We are filming another cabin set next.', userId: users[2].id, videoId: videos[7].id, parentId: topComments[4].id },
    { content: 'Consent and communication are always part of our process.', userId: users[3].id, videoId: videos[9].id, parentId: topComments[5].id },
    { content: 'Glad you noticed the set styling. Thank you.', userId: users[4].id, videoId: videos[12].id, parentId: topComments[6].id },
    { content: 'We love keeping the scenes natural and unfiltered.', userId: users[5].id, videoId: videos[15].id, parentId: topComments[7].id },
    { content: 'That means a lot. We aimed for a slow burn here.', userId: users[7].id, videoId: videos[21].id, parentId: topComments[9].id },
  ]

  const replies = await Promise.all(
    replyCommentsData.map((c) =>
      prisma.comment.create({
        data: {
          content: c.content,
          userId: c.userId,
          videoId: c.videoId,
          parentId: c.parentId,
        },
      })
    )
  )

  console.log(`Created ${topComments.length + replies.length} comments`)

  await prisma.playlist.create({
    data: {
      title: 'POV Essentials',
      description: 'Top-performing POV scenes from the channel.',
      isPublic: true,
      userId: users[0].id,
      items: {
        create: [
          { position: 1, videoId: videos[0].id },
          { position: 2, videoId: videos[1].id },
          { position: 3, videoId: videos[2].id },
        ],
      },
    },
  })

  await prisma.playlist.create({
    data: {
      title: 'Premium Roleplay',
      description: 'Story-driven scenes with cinematic edits.',
      isPublic: true,
      userId: users[0].id,
      items: {
        create: [
          { position: 1, videoId: videos[3].id },
          { position: 2, videoId: videos[18].id },
        ],
      },
    },
  })

  await prisma.playlist.create({
    data: {
      title: 'Private Favorites',
      description: 'Internal shortlist before public release.',
      isPublic: false,
      userId: users[0].id,
      items: {
        create: [
          { position: 1, videoId: videos[21].id },
          { position: 2, videoId: videos[23].id },
        ],
      },
    },
  })

  console.log('Seed completed successfully')
  console.log(`- ${users.length} users`)
  console.log(`- ${categories.length} categories`)
  console.log(`- ${videos.length} videos`)
  console.log(`- ${topComments.length + replies.length} comments`)
  console.log('- 3 playlists')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
