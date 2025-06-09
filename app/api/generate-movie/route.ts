import { NextRequest, NextResponse } from 'next/server';

interface MovieInfo {
  title: string;
  year: string;
  country: string;
  director: string;
  description: string;
  watch_info: string;
  poster_url?: string;
  region?: string;
  genre?: string;
  decade?: string;
  budget?: string;
  release_year?: string;
  rating?: string;
  star_rating?: number; // 1-5 stars, aggregated from critic sources
}

const regionCountries: Record<string, string[]> = {
  'North America': ['United States','USA','Canada','Mexico','Greenland','Bermuda','Saint Pierre and Miquelon'],
  'Europe': ['Albania','Andorra','Armenia','Austria','Azerbaijan','Belarus','Belgium','Bosnia and Herzegovina','Bulgaria','Croatia','Cyprus','Czech Republic','Denmark','Estonia','Finland','France','Georgia','Germany','Greece','Hungary','Iceland','Ireland','Italy','Kazakhstan','Kosovo','Latvia','Liechtenstein','Lithuania','Luxembourg','Malta','Moldova','Monaco','Montenegro','Netherlands','North Macedonia','Norway','Poland','Portugal','Romania','Russia','San Marino','Serbia','Slovakia','Slovenia','Spain','Sweden','Switzerland','Turkey','Ukraine','United Kingdom','UK','Vatican City'],
  'Asia': ['Afghanistan','Armenia','Azerbaijan','Bahrain','Bangladesh','Bhutan','Brunei','Cambodia','China','Cyprus','East Timor','Timor-Leste','Georgia','India','Indonesia','Iran','Iraq','Israel','Japan','Jordan','Kazakhstan','Kuwait','Kyrgyzstan','Laos','Lebanon','Malaysia','Maldives','Mongolia','Myanmar','Burma','Nepal','North Korea','Oman','Pakistan','Palestine','Philippines','Qatar','Russia','Saudi Arabia','Singapore','South Korea','Sri Lanka','Syria','Taiwan','Tajikistan','Thailand','Turkey','Turkmenistan','United Arab Emirates','Uzbekistan','Vietnam','Yemen'],
  'Latin America': ['Mexico','Belize','Costa Rica','El Salvador','Guatemala','Honduras','Nicaragua','Panama','Cuba','Dominican Republic','Haiti','Jamaica','Puerto Rico','Argentina','Bolivia','Brazil','Chile','Colombia','Ecuador','Guyana','Paraguay','Peru','Suriname','Uruguay','Venezuela','Trinidad and Tobago','Barbados','Bahamas','Grenada','St. Lucia','Antigua and Barbuda','St. Kitts and Nevis','Dominica','St. Vincent and the Grenadines'],
  'Africa': ['Algeria','Angola','Benin','Botswana','Burkina Faso','Burundi','Cabo Verde','Cameroon','Central African Republic','Chad','Comoros','Democratic Republic of the Congo','Republic of the Congo','Djibouti','Egypt','Equatorial Guinea','Eritrea','Eswatini','Ethiopia','Gabon','Gambia','Ghana','Guinea','Guinea-Bissau','Ivory Coast','Kenya','Lesotho','Liberia','Libya','Madagascar','Malawi','Mali','Mauritania','Mauritius','Morocco','Mozambique','Namibia','Niger','Nigeria','Rwanda','Sao Tome and Principe','Senegal','Seychelles','Sierra Leone','Somalia','South Africa','South Sudan','Sudan','Tanzania','Togo','Tunisia','Uganda','Zambia','Zimbabwe'],
  'Oceania': ['Australia','New Zealand','Fiji','Papua New Guinea','Samoa','Solomon Islands','Tonga','Vanuatu','Micronesia','Palau','Marshall Islands','Kiribati','Nauru','Tuvalu']
};
const budgetRanges = {
  'Micro-budget': '< $100k',
  'Indie': '$100k - $10M',
  'Studio': '$10M - $50M',
  'Blockbuster': '> $50M'
};
const genreList = ['Drama','Comedy','Horror','Action','Sci-Fi','Romance','Thriller','Animation','Documentary'];
const decadeList = ['1950s','1960s','1970s','1980s','1990s','2000s','2010s','2020s'];
const ratingList = ['G', 'PG', 'PG-13', 'R'];

export async function POST(req: NextRequest) {
  const body = await req.json();
  let { region, genre, decade, budget, rating, minStars } = body;

  // Fallback to random if missing
  if (!region) {
    const regions = Object.keys(regionCountries);
    region = regions[Math.floor(Math.random() * regions.length)];
  }
  if (!genre) {
    genre = genreList[Math.floor(Math.random() * genreList.length)];
  }
  if (!decade) {
    decade = decadeList[Math.floor(Math.random() * decadeList.length)];
  }
  if (!budget) {
    const budgets = Object.keys(budgetRanges);
    budget = budgets[Math.floor(Math.random() * budgets.length)] as keyof typeof budgetRanges;
  }

  // Accept rating as string or array
  let allowedRatings: string[] | undefined = undefined;
  if (Array.isArray(rating)) {
    allowedRatings = rating;
    rating = undefined;
  } else if (typeof rating === 'string') {
    allowedRatings = [rating];
  }

  // In prompt, only include rating if allowedRatings is set and not all ratings
  let ratingPrompt = '';
  if (allowedRatings && allowedRatings.length > 0 && allowedRatings.length < ratingList.length) {
    ratingPrompt = `- Rating: ${allowedRatings.join(' or ')}\n`;
  }

  const prompt = `You are a helpful assistant that suggests a MOVIE (not a TV show, not a miniseries, not a documentary series) strictly based on:\n` +
    `- Region: ${region}\n` +
    `- Genre: ${genre}\n` +
    `- Decade: ${decade}\n` +
    `- Budget: ${budgetRanges[budget as keyof typeof budgetRanges]}\n` +
    ratingPrompt +
    `Do NOT suggest TV shows, miniseries, or anything that is not a feature film/movie.\n` +
    `Reply with a JSON object containing:\n{\n  "title": string,\n  "year": string,\n  "country": string,\n  "director": string,\n  "description": string,\n  "watch_info": string,\n  "rating": string\n}\n\nReturn only valid JSON.`;

  try {
    // Dynamically import openai only on the server
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    let movieInfo: MovieInfo;
    while (true) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 350,
        temperature: 0.7
      });
      const content = completion.choices[0]?.message?.content?.trim();
      if (!content) continue;
      try {
        movieInfo = JSON.parse(content) as MovieInfo;
      } catch {
        continue;
      }
      if (regionCountries[region].some((c: string) => movieInfo.country && movieInfo.country.includes(c))) break;
    }
    // Attach metadata
    movieInfo.region = region;
    movieInfo.genre = genre;
    movieInfo.decade = decade;
    movieInfo.budget = budget;
    movieInfo.release_year = movieInfo.year;
    movieInfo.rating = movieInfo.rating || rating;

    // Fetch poster and critic ratings from OMDb API if API key is available
    let starSources: number[] = [];
    if (process.env.OMDB_API_KEY) {
      try {
        const omdbRes = await fetch(
          `http://www.omdbapi.com/?t=${encodeURIComponent(movieInfo.title)}&apikey=${process.env.OMDB_API_KEY}`
        );
        const omdbData = await omdbRes.json();
        if (omdbData.Poster && omdbData.Poster !== 'N/A') {
          movieInfo.poster_url = omdbData.Poster;
        }
        // Try to get rating from OMDb if not present
        if (!movieInfo.rating && omdbData.Rated) {
          movieInfo.rating = omdbData.Rated;
        }
        // Aggregate critic ratings to star system (1-5)
        if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') {
          const imdb = parseFloat(omdbData.imdbRating);
          if (!isNaN(imdb)) starSources.push(Math.round(imdb / 2)); // IMDb is out of 10
        }
        if (omdbData.Metascore && omdbData.Metascore !== 'N/A') {
          const meta = parseInt(omdbData.Metascore);
          if (!isNaN(meta)) starSources.push(Math.round(meta / 20)); // Metascore is out of 100
        }
        if (Array.isArray(omdbData.Ratings)) {
          for (const r of omdbData.Ratings) {
            if (r.Source === 'Rotten Tomatoes' && r.Value.endsWith('%')) {
              const pct = parseInt(r.Value);
              if (!isNaN(pct)) starSources.push(Math.round(pct / 20)); // RT is out of 100
            }
          }
        }
      } catch {}
    }
    // Compute unified star rating (average, rounded, clamp 1-5)
    if (starSources.length > 0) {
      let avg = starSources.reduce((a, b) => a + b, 0) / starSources.length;
      avg = Math.max(1, Math.min(5, Math.round(avg)));
      movieInfo.star_rating = avg;
    }
    movieInfo.poster_url = movieInfo.poster_url || '';
    // Filter by minStars if provided
    if (minStars && movieInfo.star_rating && movieInfo.star_rating < minStars) {
      return NextResponse.json({ error: 'No movie found with sufficient star rating' }, { status: 404 });
    }
    return NextResponse.json(movieInfo);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate movie' }, { status: 500 });
  }
}
