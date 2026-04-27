export type Movie = {
  id: string;
  title: string;
  year: number;
  runtime: number;
  rating: string;
  genres: string[];
  director: string;
  synopsis: string;
  youtubeId: string;
  featured?: boolean;
};

export const movies: Movie[] = [
  {
    id: "inception",
    title: "Inception",
    year: 2010,
    runtime: 148,
    rating: "PG-13",
    genres: ["Sci-Fi", "Action", "Thriller"],
    director: "Christopher Nolan",
    synopsis:
      "A skilled thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO. As he assembles a team of specialists, the line between dream and reality begins to dissolve.",
    youtubeId: "YoHD9XEInc0",
    featured: true,
  },
  {
    id: "the-dark-knight",
    title: "The Dark Knight",
    year: 2008,
    runtime: 152,
    rating: "PG-13",
    genres: ["Action", "Crime", "Drama"],
    director: "Christopher Nolan",
    synopsis:
      "When a chaotic mastermind known as the Joker emerges to terrorize Gotham, Batman must confront the limits of justice, sacrifice, and the thin line between hero and outlaw.",
    youtubeId: "EXeTwQWrcwY",
    featured: true,
  },
  {
    id: "interstellar",
    title: "Interstellar",
    year: 2014,
    runtime: 169,
    rating: "PG-13",
    genres: ["Sci-Fi", "Drama", "Adventure"],
    director: "Christopher Nolan",
    synopsis:
      "A team of explorers travels through a wormhole in space in a desperate attempt to ensure humanity's survival, navigating impossible distances, lost time, and the gravitational pull of love.",
    youtubeId: "zSWdZVtXT7E",
    featured: true,
  },
  {
    id: "dune-part-two",
    title: "Dune: Part Two",
    year: 2024,
    runtime: 166,
    rating: "PG-13",
    genres: ["Sci-Fi", "Adventure"],
    director: "Denis Villeneuve",
    synopsis:
      "Paul Atreides unites with the Fremen to wage a war of revenge against the conspirators who destroyed his family, while struggling to choose between the love of his life and the fate of the universe.",
    youtubeId: "Way9Dexny3w",
    featured: true,
  },
  {
    id: "spider-man-into-the-spider-verse",
    title: "Spider-Man: Into the Spider-Verse",
    year: 2018,
    runtime: 117,
    rating: "PG",
    genres: ["Animation", "Action"],
    director: "Bob Persichetti",
    synopsis:
      "Brooklyn teen Miles Morales becomes the Spider-Man of his reality, crossing paths with five counterparts from other dimensions to stop a threat to all realities.",
    youtubeId: "tg52up16eq0",
  },
  {
    id: "parasite",
    title: "Parasite",
    year: 2019,
    runtime: 132,
    rating: "R",
    genres: ["Thriller", "Drama"],
    director: "Bong Joon-ho",
    synopsis:
      "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan, with consequences neither could imagine.",
    youtubeId: "5xH0HfJHsaY",
  },
  {
    id: "joker",
    title: "Joker",
    year: 2019,
    runtime: 122,
    rating: "R",
    genres: ["Drama", "Crime", "Thriller"],
    director: "Todd Phillips",
    synopsis:
      "A mentally troubled stand-up comedian embarks on a downward spiral that leads to the creation of an iconic villain, holding a mirror to a city teetering on the edge.",
    youtubeId: "zAGVQLHvwOY",
  },
  {
    id: "black-panther",
    title: "Black Panther",
    year: 2018,
    runtime: 134,
    rating: "PG-13",
    genres: ["Action", "Adventure"],
    director: "Ryan Coogler",
    synopsis:
      "T'Challa returns home to the technologically advanced African nation of Wakanda to take his place as king, but a powerful enemy threatens to engulf the world in conflict.",
    youtubeId: "xjDjIWPwcPU",
  },
  {
    id: "john-wick-chapter-4",
    title: "John Wick: Chapter 4",
    year: 2023,
    runtime: 169,
    rating: "R",
    genres: ["Action", "Thriller"],
    director: "Chad Stahelski",
    synopsis:
      "John Wick uncovers a path to defeating the High Table, but before he can earn his freedom he must face off against a new enemy with powerful alliances across the globe.",
    youtubeId: "qEVUtrk8_B4",
  },
  {
    id: "top-gun-maverick",
    title: "Top Gun: Maverick",
    year: 2022,
    runtime: 130,
    rating: "PG-13",
    genres: ["Action", "Drama"],
    director: "Joseph Kosinski",
    synopsis:
      "After more than thirty years of service, Pete 'Maverick' Mitchell is pushing the envelope as a top naval aviator and must confront the ghosts of his past while training a new generation of pilots.",
    youtubeId: "giXco2jaZ_4",
    featured: true,
  },
  {
    id: "oppenheimer",
    title: "Oppenheimer",
    year: 2023,
    runtime: 180,
    rating: "R",
    genres: ["Drama", "History"],
    director: "Christopher Nolan",
    synopsis:
      "The story of J. Robert Oppenheimer's role in developing the atomic bomb during World War II, and the moral fallout that defined a generation of physicists.",
    youtubeId: "uYPbbksJxIg",
  },
  {
    id: "barbie",
    title: "Barbie",
    year: 2023,
    runtime: 114,
    rating: "PG-13",
    genres: ["Comedy", "Adventure"],
    director: "Greta Gerwig",
    synopsis:
      "Living in the seemingly perfect Barbie Land, Barbie embarks on a journey of self-discovery in the real world, questioning everything she thought she knew about being a doll.",
    youtubeId: "pBk4NYhWNMM",
  },
  {
    id: "the-batman",
    title: "The Batman",
    year: 2022,
    runtime: 176,
    rating: "PG-13",
    genres: ["Action", "Crime", "Drama"],
    director: "Matt Reeves",
    synopsis:
      "When a sadistic killer leaves behind a trail of cryptic clues, Batman ventures into Gotham City's underworld and uncovers a vast conspiracy that strikes close to home.",
    youtubeId: "mqqft2x_Aa4",
  },
  {
    id: "everything-everywhere-all-at-once",
    title: "Everything Everywhere All at Once",
    year: 2022,
    runtime: 139,
    rating: "R",
    genres: ["Sci-Fi", "Comedy", "Drama"],
    director: "Daniels",
    synopsis:
      "An aging Chinese immigrant is swept up in an insane adventure where she alone can save existence by exploring other universes and connecting with the lives she could have led.",
    youtubeId: "wxN1T1uxQ2g",
  },
  {
    id: "mad-max-fury-road",
    title: "Mad Max: Fury Road",
    year: 2015,
    runtime: 120,
    rating: "R",
    genres: ["Action", "Adventure"],
    director: "George Miller",
    synopsis:
      "In a post-apocalyptic wasteland, a drifter and a rebellious warrior flee from a tyrannical warlord across the desert in a relentless, fire-breathing convoy of madness.",
    youtubeId: "hEJnMQG9ev8",
  },
  {
    id: "la-la-land",
    title: "La La Land",
    year: 2016,
    runtime: 128,
    rating: "PG-13",
    genres: ["Drama", "Romance", "Music"],
    director: "Damien Chazelle",
    synopsis:
      "A jazz pianist and an aspiring actress fall in love while pursuing their dreams in Los Angeles, in a soaring modern musical that asks what it costs to make art.",
    youtubeId: "0pdqf4P9MB8",
  },
  {
    id: "the-grand-budapest-hotel",
    title: "The Grand Budapest Hotel",
    year: 2014,
    runtime: 99,
    rating: "R",
    genres: ["Comedy", "Drama"],
    director: "Wes Anderson",
    synopsis:
      "The adventures of Gustave H, a legendary concierge at a famous European hotel between the wars, and Zero, the lobby boy who becomes his most trusted friend.",
    youtubeId: "1Fg5iWmQjwk",
  },
  {
    id: "get-out",
    title: "Get Out",
    year: 2017,
    runtime: 104,
    rating: "R",
    genres: ["Horror", "Thriller"],
    director: "Jordan Peele",
    synopsis:
      "A young African-American visits his white girlfriend's family estate, only to find that the welcome he receives masks a sinister and disturbing reality.",
    youtubeId: "DzfpyUB60YY",
  },
  {
    id: "whiplash",
    title: "Whiplash",
    year: 2014,
    runtime: 106,
    rating: "R",
    genres: ["Drama", "Music"],
    director: "Damien Chazelle",
    synopsis:
      "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
    youtubeId: "7d_jQycdQGo",
  },
  {
    id: "avatar-the-way-of-water",
    title: "Avatar: The Way of Water",
    year: 2022,
    runtime: 192,
    rating: "PG-13",
    genres: ["Sci-Fi", "Adventure"],
    director: "James Cameron",
    synopsis:
      "Jake Sully and Neytiri have formed a family and must leave their home to explore the regions of Pandora when an ancient threat resurfaces to finish what was started.",
    youtubeId: "d9MyW72ELq0",
  },
];

export const allGenres = Array.from(
  new Set(movies.flatMap((m) => m.genres)),
).sort();

export const genreSlug = (genre: string) =>
  genre.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export const getMovieById = (id: string) => movies.find((m) => m.id === id);

export const getMoviesByGenre = (slug: string) =>
  movies.filter((m) => m.genres.some((g) => genreSlug(g) === slug));

export const getRelated = (movie: Movie, limit = 6) =>
  movies
    .filter(
      (m) =>
        m.id !== movie.id && m.genres.some((g) => movie.genres.includes(g)),
    )
    .slice(0, limit);

export const featuredMovies = movies.filter((m) => m.featured);

export const youtubeThumb = (id: string, quality: "max" | "hq" | "sd" = "hq") => {
  const map = {
    max: "maxresdefault",
    hq: "hqdefault",
    sd: "sddefault",
  } as const;
  return `https://i.ytimg.com/vi/${id}/${map[quality]}.jpg`;
};

export const youtubeBackdrop = (id: string) =>
  `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
