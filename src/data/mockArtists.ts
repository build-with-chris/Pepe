import type { Artist } from '@/types/artist'

export const mockArtists: Artist[] = [
  {
    id: 1,
    name: 'Marco Magician',
    disciplines: ['magic', 'comedy'],
    profile_image_url: '/src/assets/artists/marco-performer.jpg',
    bio: 'Professional magician and entertainer with over 10 years of experience.',
    location: 'Berlin, Germany',
    rating: 4.8,
    gallery_images: [
      '/src/assets/gallery/magic-show-1.jpg',
      '/src/assets/gallery/magic-show-2.jpg'
    ],
    videos: [
      { url: '/src/assets/videos/marco-promo.mp4', title: 'Magic Performance' }
    ],
    availability: [],
    hourly_rate: 150,
    travel_radius: 50,
    languages: ['German', 'English']
  },
  {
    id: 2,
    name: 'Sofia Dancer',
    disciplines: ['dance', 'acrobatics'],
    profile_image_url: '/src/assets/artists/sofia-dancer.jpg',
    bio: 'Contemporary dancer and acrobat specializing in theatrical performances.',
    location: 'Munich, Germany',
    rating: 4.9,
    gallery_images: [
      '/src/assets/gallery/dance-1.jpg',
      '/src/assets/gallery/dance-2.jpg'
    ],
    videos: [
      { url: '/src/assets/videos/sofia-dance.mp4', title: 'Dance Performance' }
    ],
    availability: [],
    hourly_rate: 120,
    travel_radius: 30,
    languages: ['German', 'English', 'Italian']
  },
  {
    id: 3,
    name: 'Tim Comedian',
    disciplines: ['comedy', 'improvisation'],
    profile_image_url: '/src/assets/artists/tim-comedian.jpg',
    bio: 'Stand-up comedian and improvisational actor bringing laughter to every event.',
    location: 'Hamburg, Germany',
    rating: 4.7,
    gallery_images: [
      '/src/assets/gallery/comedy-1.jpg',
      '/src/assets/gallery/comedy-2.jpg'
    ],
    videos: [
      { url: '/src/assets/videos/tim-comedy.mp4', title: 'Comedy Show' }
    ],
    availability: [],
    hourly_rate: 100,
    travel_radius: 40,
    languages: ['German', 'English']
  },
  {
    id: 4,
    name: 'Elena Musician',
    disciplines: ['music', 'singing'],
    profile_image_url: '/src/assets/artists/elena-musician.jpg',
    bio: 'Classical and contemporary musician with a beautiful voice.',
    location: 'Frankfurt, Germany',
    rating: 4.8,
    gallery_images: [
      '/src/assets/gallery/music-1.jpg',
      '/src/assets/gallery/music-2.jpg'
    ],
    videos: [
      { url: '/src/assets/videos/elena-music.mp4', title: 'Musical Performance' }
    ],
    availability: [],
    hourly_rate: 130,
    travel_radius: 35,
    languages: ['German', 'English', 'Spanish']
  }
]