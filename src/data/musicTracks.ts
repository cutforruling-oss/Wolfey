export interface MusicTrack {
  id: string; // YouTube Video ID
  index: number; // 1 to 10
  title: string;
  artist: string;
  youtubeUrl: string;
  coverImage?: string;
}

export const WOLFEY_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'wI0SADdCcHM',
    index: 1,
    title: 'NO WAY BACK',
    artist: 'Fire Voxy',
    youtubeUrl: 'https://youtu.be/wI0SADdCcHM?si=sq2xp-lwz2LlHRXE',
    coverImage: 'https://img.youtube.com/vi/wI0SADdCcHM/mqdefault.jpg',
  },
  {
    id: 'MgY01n03QLU',
    index: 2,
    title: 'Tokyo Drift - Six Days',
    artist: 'Samdroid Remix',
    youtubeUrl: 'https://youtu.be/MgY01n03QLU?si=dFuOUyTnS7nbe-kW',
    coverImage: 'https://img.youtube.com/vi/MgY01n03QLU/mqdefault.jpg',
  },
  {
    id: 'Zi_XLOBDo_Y',
    index: 3,
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    youtubeUrl: 'https://youtu.be/Zi_XLOBDo_Y?si=Y2GkC3Fs6qiyYXCo',
    coverImage: 'https://img.youtube.com/vi/Zi_XLOBDo_Y/mqdefault.jpg',
  },
  {
    id: 'hT_nvWreIhg',
    index: 4,
    title: 'Counting Stars',
    artist: 'OneRepublic',
    youtubeUrl: 'https://youtu.be/hT_nvWreIhg?si=KMJGg-f4fukfscWz',
    coverImage: 'https://img.youtube.com/vi/hT_nvWreIhg/mqdefault.jpg',
  },
  {
    id: 'kpS135yCI2g',
    index: 5,
    title: 'Billie Jean (Lyrics)',
    artist: 'Michael Jackson',
    youtubeUrl: 'https://youtu.be/kpS135yCI2g?si=6JsIVgXzWEUu5w-Q',
    coverImage: 'https://img.youtube.com/vi/kpS135yCI2g/mqdefault.jpg',
  },
  {
    id: '0GVExpdmoDs',
    index: 6,
    title: 'Animals',
    artist: 'Maroon 5',
    youtubeUrl: 'https://youtu.be/0GVExpdmoDs?si=lPJs0uJxt-r8fn1I',
    coverImage: 'https://img.youtube.com/vi/0GVExpdmoDs/mqdefault.jpg',
  },
  {
    id: 'S9bCLPwzSC0',
    index: 7,
    title: 'Mockingbird',
    artist: 'Eminem',
    youtubeUrl: 'https://youtu.be/S9bCLPwzSC0?si=8r-s4vCUhewWf95a',
    coverImage: 'https://img.youtube.com/vi/S9bCLPwzSC0/mqdefault.jpg',
  },
  {
    id: 'ApXoWvfEYVU',
    index: 8,
    title: 'Sunflower',
    artist: 'Post Malone, Swae Lee',
    youtubeUrl: 'https://youtu.be/ApXoWvfEYVU?si=hlO39y6dx674dTkw',
    coverImage: 'https://img.youtube.com/vi/ApXoWvfEYVU/mqdefault.jpg',
  },
  {
    id: '6Nb-prB-4P0',
    index: 9,
    title: 'Dancin (Krono Remix)',
    artist: 'Aaron Smith ft. Luvli',
    youtubeUrl: 'https://youtu.be/6Nb-prB-4P0?si=uR0frv_1ownhLb_l',
    coverImage: 'https://img.youtube.com/vi/6Nb-prB-4P0/mqdefault.jpg',
  },
  {
    id: 'YiFaZGRkQyc',
    index: 10,
    title: '10,000 Foes',
    artist: 'John Michael Howell',
    youtubeUrl: 'https://youtu.be/YiFaZGRkQyc?si=FSTElSG2a_hc4P4A',
    coverImage: 'https://img.youtube.com/vi/YiFaZGRkQyc/mqdefault.jpg',
  },
];
