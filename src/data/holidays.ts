export const PRICE_CHECKED_ON = "10 October 2026";

export type TripStyle =
  | "winter-sun"
  | "city"
  | "beach"
  | "ski"
  | "family"
  | "food";

export type FamilyFit = "great" | "fine" | "poor";

export type Departure = {
  year: number;
  month: number;
  price: number;
  label: string;
  /** The listing did not print a year. 2026 is the only reading that fits a check on 10 October 2026. */
  yearInferred?: boolean;
};

export type Holiday = {
  id: string;
  destination: string;
  country: string;
  placeKey: string;
  title: string;
  styles: TripStyle[];
  familyFit: FamilyFit;
  /** Months the trip still makes sense, even when this exact fare is for another date. */
  seasonMonths: number[];
  nights: number;
  /** Published for this many adults. Omit when the fare is a normal 2-sharing rate. */
  occupancy?: number;
  departures: Departure[];
  /** Used when the listing has a price but no travel date. */
  undatedPrice?: number;
  priceBasis: string;
  departFrom: string;
  board: string;
  lines: { label: string; detail: string }[];
  includes: string[];
  excludes: string[];
  why: string;
  suits: string;
  days: { title: string; detail: string }[];
  sourceName: string;
  sourceUrl: string;
  caveat?: string;
};

export const STYLE_OPTIONS: { id: TripStyle; label: string; hint: string }[] = [
  {
    id: "winter-sun",
    label: "Winter sun",
    hint: "Warmth while London is grey",
  },
  {
    id: "city",
    label: "City break",
    hint: "Streets, a museum, a proper hotel",
  },
  {
    id: "beach",
    label: "Beach",
    hint: "Sand, a pool, and not much else",
  },
  {
    id: "ski",
    label: "Ski",
    hint: "Snow and a week in the Alps",
  },
  {
    id: "family",
    label: "Family",
    hint: "Somewhere that works with children",
  },
  {
    id: "food",
    label: "Food and culture",
    hint: "Markets, a riad, a long lunch",
  },
];

export const holidays: Holiday[] = [
  {
    id: "les-deux-alpes-serre-palas",
    destination: "Les 2 Alpes",
    country: "France",
    placeKey: "les-2-alpes",
    title: "A bed-and-breakfast week under the glacier",
    styles: ["ski"],
    familyFit: "fine",
    seasonMonths: [12, 1, 2, 3, 4],
    nights: 7,
    departures: [
      {
        year: 2027,
        month: 1,
        price: 556,
        label: "7 nights from London Gatwick on 2 January 2027",
      },
    ],
    priceBasis: "£556 a person, 2 adults, bed and breakfast",
    departFrom: "London Gatwick",
    board: "Bed and breakfast",
    lines: [
      {
        label: "Package",
        detail:
          "£556 a person for 7 nights, 2 adults, bed and breakfast, from London Gatwick on 2 January 2027. Inghams shows it as a £400-a-person saving. Flights, transfers and Hotel Serre Palas are in the figure, and Inghams says the price includes local tax payable at the hotel.",
      },
      {
        label: "Lift pass, not in the package",
        detail:
          "On the same Inghams page, a 6-day Les 2 Alpes adult pass is £278 in high season and £250 in low season. A child aged 5–12 is £222 in high season.",
      },
      {
        label: "Package plus an adult pass",
        detail:
          "£834 a person if you add the £278 high-season adult pass to the £556 package. That sum is mine, from those two figures on the Inghams page. It is not a price Inghams sells as one bundle.",
      },
    ],
    includes: [
      "Return flights from London Gatwick",
      "Transfers",
      "7 nights at Hotel Serre Palas",
      "Breakfast",
      "Local tax, which Inghams says is payable at the hotel",
    ],
    excludes: [
      "Lift pass",
      "Skis, boots and helmet",
      "Lunch and dinner",
      "Tuition",
    ],
    why: "This is the cheapest full ski week I could pin to a London departure, a hotel and a date. Serre Palas is a small family-run hotel in the village, with the glacier above you if the valley snow is poor. You eat breakfast in the hotel and buy the rest of the week in town, which is why the fare sits so far under the half-board weeks.",
    suits: "Two adults who will ski and are happy to find their own lunch and dinner. It is a village hotel, not a kids-club chalet.",
    days: [
      {
        title: "Saturday",
        detail:
          "Fly Gatwick to Geneva or Chambéry. Inghams puts the coach at about 3 hours 15 minutes from Geneva, or 2 hours 30 minutes from Chambéry.",
      },
      {
        title: "On the hill",
        detail:
          "Beginners have free lifts on the lower slopes. Once you want the glacier, the Jandri Express is the way up, and the Inghams pass also covers two days in Alpe d'Huez and one in Serre Chevalier, with transport extra.",
      },
      {
        title: "If you take a day off",
        detail:
          "The ice rink in the centre is free with a six-day pass. Skate hire is extra. The ice caves sit under the Roche Mantel glacier.",
      },
    ],
    sourceName: "Inghams",
    sourceUrl: "https://www.inghams.co.uk/ski-holidays/ski-resorts/france/les-2-alpes",
    caveat:
      "The £556 fare is for 2 January 2027 and two adults. Other dates on the same page are a different price.",
  },
  {
    id: "les-deux-alpes-brunerie",
    destination: "Les 2 Alpes",
    country: "France",
    placeKey: "les-2-alpes",
    title: "Half board, five minutes from the Jandri lift",
    styles: ["ski"],
    familyFit: "fine",
    seasonMonths: [12, 1, 2, 3, 4],
    nights: 7,
    departures: [
      {
        year: 2027,
        month: 1,
        price: 799,
        label: "2–9 January 2027 from London Gatwick",
      },
      {
        year: 2027,
        month: 2,
        price: 799,
        label: "27 February–6 March 2027 from London Gatwick",
      },
      {
        year: 2027,
        month: 3,
        price: 799,
        label: "13–20 March 2027 from London Gatwick",
      },
      {
        year: 2027,
        month: 4,
        price: 999,
        label: "3–10 April 2027 from London Gatwick",
      },
    ],
    priceBasis: "£799 a person on the January, February and March weeks",
    departFrom: "London Gatwick",
    board: "Half board",
    lines: [
      {
        label: "Dated weeks",
        detail:
          "SkiBound lists Hotel La Brunerie at £799 a person for 2–9 January, 27 February–6 March and 13–20 March 2027, from Gatwick, Manchester or, on the January week, Scotland. 3–10 April 2027 is £999 a person from Gatwick or Manchester.",
      },
      {
        label: "Page title",
        detail:
          "The heading says from £999 a person. That matches the April week. The January, February and March weeks in the date list are £799.",
      },
      {
        label: "Lift pass",
        detail:
          "Not included, and SkiBound does not price it on this page. Inghams publishes a Les 2 Alpes adult 6-day high-season pass at £278. That is a different operator, for the same resort.",
      },
    ],
    includes: [
      "7 nights at Hotel La Brunerie",
      "Half board",
      "Return flights",
      "Overseas transfers",
    ],
    excludes: [
      "Lift pass",
      "Equipment hire",
      "Tuition",
      "Lunches",
    ],
    why: "Take this when you want dinner sorted and the lift a short walk away. La Brunerie is a 3-star in the middle of Les 2 Alpes, five minutes from the Jandri Express, with its own bar and ski storage. You pay about £240 a person more than the Serre Palas bed-and-breakfast week for those meals and that location.",
    suits: "Couples or friends who would rather not hunt for a table after skiing. Families can stay here, but the page does not sell a kids’ club.",
    days: [
      {
        title: "The walk to the lift",
        detail:
          "SkiBound puts the hotel five minutes from the Jandri Express, which is the gondola that reaches the glacier.",
      },
      {
        title: "Evenings",
        detail:
          "Half board means dinner in the hotel. The village around it has bars, a bowling alley and shops if you want out afterwards.",
      },
      {
        title: "Late season",
        detail:
          "The April week jumps to £999. The glacier is the reason people stay late: Les 2 Alpes skis up to 3,568 metres.",
      },
    ],
    sourceName: "SkiBound",
    sourceUrl:
      "https://www.skiboundholidays.co.uk/les-deux-alpes-ski-deal-hotel-la-brunerie/",
    caveat:
      "Manchester and Newcastle are also listed, depending on the week. The prices above are the Gatwick ones.",
  },
  {
    id: "les-deux-alpes-cretes",
    destination: "Les 2 Alpes",
    country: "France",
    placeKey: "les-2-alpes",
    title: "All inclusive, with a kids’ club, for four adults",
    styles: ["ski", "family"],
    familyFit: "great",
    seasonMonths: [12, 1, 2, 3, 4],
    nights: 7,
    occupancy: 4,
    departures: [
      {
        year: 2026,
        month: 12,
        price: 964,
        label:
          "7 nights, 4 adults, all inclusive, from London Gatwick on 12 December 2026",
      },
    ],
    priceBasis: "£964 a person for 4 adults",
    departFrom: "London Gatwick",
    board: "All inclusive",
    lines: [
      {
        label: "Package",
        detail:
          "£964 a person at Hotel Les Cretes. Inghams bases it on 7 nights, 4 adults, all inclusive, from London Gatwick on 12 December 2026, including local tax payable at the hotel.",
      },
      {
        label: "Who it is priced for",
        detail:
          "The fare is for four adults. I have not guessed what a couple, or a child, would pay in the same hotel.",
      },
      {
        label: "Lift pass",
        detail:
          "Still extra. Inghams’ 6-day adult high-season pass for Les 2 Alpes is £278, and a child aged 5–12 is £222 in high season.",
      },
    ],
    includes: [
      "Return flights from London Gatwick",
      "Transfers",
      "7 nights at Hotel Les Cretes",
      "All-inclusive meals and drinks",
    ],
    excludes: ["Lift pass", "Equipment", "Tuition"],
    why: "This is the family ski week on the desk. Inghams describes Les Cretes as ski-in, ski-out, with all-inclusive meals and drinks and free all-ages kids’ clubs. The catch is the basis: the £964 is published for four adults on 12 December 2026, not for a couple and not for half term.",
    suits: "Four adults, or a family only if you ask Inghams to reprice children. I would not treat £964 as a child’s fare.",
    days: [
      {
        title: "12 December 2026",
        detail:
          "Out from Gatwick. French school holidays, on Inghams’ note, run 18 December 2026 to 3 January 2027, so this Saturday sits just before that rush.",
      },
      {
        title: "With children",
        detail:
          "Les Cretes runs free all-ages kids’ clubs. Piou Piou, the 3-to-5 club, is a separate tuition product at £215 for six mornings, not part of the hotel price.",
      },
      {
        title: "Bad-weather day",
        detail:
          "Palais des Sports in the resort has badminton, a climbing wall and skating nearby. Most of those are payable locally.",
      },
    ],
    sourceName: "Inghams",
    sourceUrl: "https://www.inghams.co.uk/ski-holidays/ski-resorts/france/les-2-alpes",
  },
  {
    id: "gran-canaria-koala",
    destination: "Gran Canaria",
    country: "Spain",
    placeKey: "gran-canaria",
    title: "A self-catering week over Christmas, from Gatwick",
    styles: ["winter-sun", "beach"],
    familyFit: "fine",
    seasonMonths: [11, 12, 1, 2, 3, 4],
    nights: 7,
    departures: [
      {
        year: 2027,
        month: 12,
        price: 584,
        label: "London Gatwick, 26 December 2027, 7 nights",
      },
    ],
    priceBasis: "£584 a person, self catering",
    departFrom: "London Gatwick",
    board: "Self catering",
    lines: [
      {
        label: "Package",
        detail:
          "£584 a person for 7 nights at the 4* Apartments LIVVO Koala Garden, self catering, from London Gatwick on 26 December 2027.",
      },
      {
        label: "What easyJet holidays says is included on beach packages",
        detail:
          "Return flights, 23kg luggage and transfers, plus the accommodation. This figure is from the operator’s winter 2027 launch list, reported by Global Agents, not from a live search I could re-run.",
      },
    ],
    includes: [
      "Return flights from London Gatwick",
      "23kg luggage",
      "Transfers",
      "7 nights self catering",
    ],
    excludes: [
      "Meals and drinks",
      "A hire car",
      "Travel insurance",
    ],
    why: "If you want winter sun from a London airport and you are happy to cook, this is the Canaries fare I can actually cite. Boxing Day 2027, a 4-star apartment, luggage and the transfer already in the £584. It is a launch price, so it will move, and it is one week rather than a whole winter of availability.",
    suits: "Couples or families who want a kitchen and do not need an all-inclusive bracelet. Christmas week will feel busy even at this price.",
    days: [
      {
        title: "26 December 2027",
        detail:
          "Fly Gatwick and take the included transfer to the apartment. Meals are on you from the first night.",
      },
      {
        title: "The week",
        detail:
          "Seven nights, so you get a full stretch on the island rather than a weekend. The listing does not name a resort town beyond the hotel, LIVVO Koala Garden.",
      },
      {
        title: "Home",
        detail:
          "Return a week later with the 23kg bag the beach package includes. City-break packages in the same launch list do not automatically include that bag.",
      },
    ],
    sourceName: "Global Agents, reporting easyJet holidays",
    sourceUrl:
      "https://globalagents.uk/news/easyjet-holidays-launches-winter-2027-package-holidays-beach-holidays-city-breaks",
    caveat:
      "This is a published launch example, not a basket I held. Check easyJet holidays before you rely on £584.",
  },
  {
    id: "lanzarote-hyde",
    destination: "Lanzarote",
    country: "Spain",
    placeKey: "lanzarote",
    title: "Self catering in Lanzarote, flying from Luton",
    styles: ["winter-sun", "beach"],
    familyFit: "fine",
    seasonMonths: [11, 12, 1, 2, 3, 4],
    nights: 7,
    departures: [
      {
        year: 2027,
        month: 12,
        price: 711,
        label: "London Luton, 26 December 2027, 7 nights",
      },
    ],
    priceBasis: "£711 a person, self catering",
    departFrom: "London Luton",
    board: "Self catering",
    lines: [
      {
        label: "Package",
        detail:
          "£711 a person for 7 nights at the 3* Hyde Park Lane, self catering, from London Luton on 26 December 2027. Return flights, 23kg luggage and transfers are included.",
      },
      {
        label: "Why it costs more than Gran Canaria",
        detail:
          "The same easyJet holidays launch list puts Gran Canaria from Gatwick at £584 for the same dates and the same self-catering shape. Lanzarote is the dearer of the two London departures.",
      },
    ],
    includes: [
      "Return flights from London Luton",
      "23kg luggage",
      "Transfers",
      "7 nights self catering at Hyde Park Lane",
    ],
    excludes: ["Meals and drinks", "Car hire", "Insurance"],
    why: "Choose Lanzarote over the cheaper Gran Canaria week if Luton is the airport you actually want, or if you would rather be on this island. The hotel is 3-star and self catering, so the money is going on the flight and the week, not on a meal plan. Same caveat as the other launch fare: it is an example price from the winter 2027 on-sale, dated 26 December 2027.",
    suits: "Anyone who wants a volcanic island and a kitchen, and can leave from Luton. Not the trip if you need Gatwick or all-inclusive.",
    days: [
      {
        title: "Out",
        detail:
          "26 December 2027 from London Luton. The transfer to Hyde Park Lane is in the package.",
      },
      {
        title: "On the island",
        detail:
          "The listing does not include a hire car. Timanfaya and the north-coast pools are the reasons to rent one, and that money is on top.",
      },
      {
        title: "Evenings",
        detail:
          "Self catering means the supermarket, or eating out and watching the £711 stop being the whole cost of the holiday.",
      },
    ],
    sourceName: "Global Agents, reporting easyJet holidays",
    sourceUrl:
      "https://globalagents.uk/news/easyjet-holidays-launches-winter-2027-package-holidays-beach-holidays-city-breaks",
    caveat:
      "Launch example from London Luton, not Gatwick. Confirm the live easyJet holidays price.",
  },
  {
    id: "majorca-sol-house",
    destination: "Magalluf, Majorca",
    country: "Spain",
    placeKey: "majorca",
    title: "A beach hotel with DJs, fifty metres from the sand",
    styles: ["beach"],
    familyFit: "poor",
    seasonMonths: [5, 6, 7, 8, 9],
    nights: 7,
    departures: [
      {
        year: 2027,
        month: 5,
        price: 534,
        label: "4–11 May 2027 from London Stansted",
      },
    ],
    priceBasis: "£534 a person, 2 adults sharing, bed and breakfast",
    departFrom: "London Stansted",
    board: "Bed and breakfast",
    lines: [
      {
        label: "Package",
        detail:
          "Spear Travels lists a Jet2holidays VIBE package from £534 a person. 7 nights, bed and breakfast, 2 sharing a standard room at 4* Sol House Mallorca. Outbound Stansted to Palma on 4 May 2027, back on 11 May.",
      },
      {
        label: "Local tax",
        detail:
          "The same page describes £534 as £516 plus £18 local tax, and also says that £18 is payable locally. I am showing £534 because that is the package figure they print. Ask them whether the £18 is already in what you pay now.",
      },
    ],
    includes: [
      "Direct return flights, London Stansted to Palma",
      "22kg hold luggage and 10kg hand luggage",
      "Return resort transfers",
      "7 nights bed and breakfast",
      "ATOL protection through Jet2holidays",
    ],
    excludes: [
      "Lunch and dinner",
      "Drinks beyond breakfast",
      "Travel insurance, which the agent prices from £40 a person",
    ],
    why: "This is the summer beach week with a real London date on it. Sol House is 50 metres from Magalluf beach, with pool DJs and a young crowd. At £534 for flights, a 22kg bag, transfers and breakfast, it is the one I would book for two friends in early May. I would not book it for children.",
    suits: "Couples and friends who want music with the beach. A poor fit for a family pool holiday.",
    days: [
      {
        title: "4 May 2027",
        detail:
          "Direct Jet2 flight from Stansted to Palma, then the included transfer to Magalluf.",
      },
      {
        title: "The days",
        detail:
          "Breakfast in the hotel, then the beach or the pool. The agent page sells DJ sets and Bali beds, not kids’ clubs or a quiet cove.",
      },
      {
        title: "If you want out of Magalluf",
        detail:
          "Palma and the west-coast villages are a bus or a hire car away. Neither is in the £534.",
      },
    ],
    sourceName: "Spear Travels, quoting Jet2holidays VIBE",
    sourceUrl:
      "https://speartravels.net/majorca-vibe-escape-at-sol-house-mallorca-from-london-4may27/",
    caveat:
      "An agent listing for a Jet2holidays package, checked 10 October 2026. The £60 deposit they mention is not the holiday price.",
  },
  {
    id: "disneyland-hotel",
    destination: "Disneyland Paris",
    country: "France",
    placeKey: "disneyland-paris",
    title: "Two nights in the Disneyland Hotel, by train",
    styles: ["family"],
    familyFit: "great",
    seasonMonths: [1, 2],
    nights: 2,
    departures: [
      {
        year: 2027,
        month: 1,
        price: 815,
        label: "28–30 January 2027, or the dates COGO lists as 28–31 January",
      },
      {
        year: 2027,
        month: 2,
        price: 815,
        label: "4–6 February 2027",
      },
    ],
    priceBasis:
      "Adult rates depend on how many people share. £815 is the 2-person share. Children aged 3–11 are £400.",
    departFrom: "London St Pancras",
    board: "Room only",
    lines: [
      {
        label: "Adult rate by room share",
        detail:
          "Four people sharing £650 a person. Three sharing £695. Two sharing £815. A single room is £1,350. COGO prints these as the prices, not as a from-price.",
      },
      {
        label: "Children",
        detail:
          "Aged 3–11, £400 a person. Aged 0–2, free. The totals on this card price every child at the 3–11 fare, because the brief does not ask for ages.",
      },
      {
        label: "Meals",
        detail:
          "Not included. COGO sells meal plans as an extra. The hotel has several restaurants, including La Forêt Secrète, and you pay for them.",
      },
    ],
    includes: [
      "Return Eurostar from London St Pancras",
      "Coach between Paris and the hotel",
      "2 nights at the 5-star Disneyland Hotel",
      "2-day park passes for Disneyland Park and Disney Adventure World",
      "Extra Magic Time before the park opens to the public",
    ],
    excludes: [
      "Meals and snacks",
      "Travel insurance",
      "Anything inside the park that is not on the ticket",
    ],
    why: "This is the family trip I would actually send someone on. You are in the Disneyland Hotel, which has its own gate into the park, on the train rather than a flight, with two-day tickets and Extra Magic Time already paid. A family of four sharing pays £650 an adult and £400 a child, so £2,100 before food. Two adults on their own pay £815 each, which is a dear way to do two nights unless the hotel is the point.",
    suits: "Families with children old enough for the parks. Less sense for a couple who only want Paris.",
    days: [
      {
        title: "Day 1",
        detail:
          "COGO’s plan is an 11:00 Eurostar from St Pancras, then a coach to the hotel. They ask you to allow 90 minutes to check in at the station.",
      },
      {
        title: "Day 2",
        detail:
          "Extra Magic Time, then a full day. World of Frozen is the new land they tell you to aim at.",
      },
      {
        title: "Day 3",
        detail:
          "A second park day. If the rides are enough, the evening spectacular is Disney Tales of Magic, then the coach back for the train.",
      },
    ],
    sourceName: "COGO Travel",
    sourceUrl:
      "https://www.cogotravel.co.uk/trips-for-groups/disneyland-paris/disneyland-hotel-eurostar-package/",
    caveat:
      "The page lists 28–31 January 2027 and 4–6 February 2027. A party larger than four is beyond the four-person share they publish.",
  },
  {
    id: "vienna-budapest",
    destination: "Vienna and Budapest",
    country: "Austria and Hungary",
    placeKey: "vienna-budapest",
    title: "Four nights of Christmas markets, two cities",
    styles: ["city", "food"],
    familyFit: "fine",
    seasonMonths: [11, 12],
    nights: 4,
    departures: [
      {
        year: 2026,
        month: 11,
        price: 449,
        label: "November 2026, from £449 a person",
      },
      {
        year: 2026,
        month: 12,
        price: 449,
        label: "December 2026, from £449 a person",
      },
    ],
    priceBasis: "From £449 a person, two sharing, 4 nights",
    departFrom: "London",
    board: "Room only",
    lines: [
      {
        label: "Lead-in fare",
        detail:
          "£449 a person for November 2026 and the same for December 2026. Love Luxury bases it on two people sharing. It covers 4 nights and return flights from London. They confirm the exact figure for your dates before you pay.",
      },
      {
        label: "Hotels",
        detail:
          "Austria Trend Hotel Rathauspark and Mercure Budapest City Centre, or similar, both 4-star. Where they say “or similar”, they confirm the property in writing before you pay.",
      },
      {
        label: "Not in the £449",
        detail:
          "Airport transfers, hold luggage, seat selection, meals, market spending, and local city tax at the hotel. Cabin baggage is included. The connection between the cities is included.",
      },
    ],
    includes: [
      "Return flights from London",
      "4 nights, split across the two hotels",
      "Cabin baggage",
      "The connection between Vienna and Budapest",
      "ATOL 10713",
    ],
    excludes: [
      "Hold luggage",
      "Airport transfers",
      "Meals",
      "Local tourist taxes",
      "Market food and drink",
    ],
    why: "This is the Christmas-market trip, and it is a from-price rather than a single flight I can name. Four nights is the right length: two evenings at Vienna’s Rathausplatz, then Budapest’s squares and a thermal bath. At £449 with flights it is the one I would pick for a cold-weather city break, as long as you budget extra for a checked bag and for punsch, because the room is room only.",
    suits: "Couples, and families who do not mind cold evenings and crowded weekend markets. Love Luxury says midweek, and earlier in the season, is cheaper and quieter.",
    days: [
      {
        title: "Vienna",
        detail:
          "In on the London flight and walk to the Rathausplatz market. The hotel they name, Austria Trend Rathauspark, is the one by the city hall, or a similar 4-star if that one is gone.",
      },
      {
        title: "The connection",
        detail:
          "A short hop to Budapest is included. The day you travel is a half day in each city, not two full days.",
      },
      {
        title: "Budapest",
        detail:
          "Vörösmarty Square, the basilica light show, and a bath if you want one. The forint is a second currency: Hungary is not on the euro. Market stalls often want cash.",
      },
    ],
    sourceName: "Love Luxury Holidays",
    sourceUrl: "https://loveluxuryholidays.co.uk/deals/vienna-budapest-christmas-twin/",
    caveat:
      "A lead-in fare. December weekends closer to Christmas will not be £449. Regional airports are a supplement they price on request.",
  },
  {
    id: "marrakech-nye",
    destination: "Marrakech",
    country: "Morocco",
    placeKey: "marrakech",
    title: "New Year in a riad, with a sunrise balloon",
    styles: ["food", "city"],
    familyFit: "fine",
    seasonMonths: [12, 1],
    nights: 4,
    departures: [
      {
        year: 2026,
        month: 12,
        price: 955,
        label: "Flights from London Gatwick on 31 December 2026, 4 nights",
      },
    ],
    priceBasis: "£955 a person, 2 adults sharing",
    departFrom: "London Gatwick",
    board: "Bed and breakfast",
    lines: [
      {
        label: "Package",
        detail:
          "£955 a person, 4 nights, 2 adults sharing. Travel Counsellors dates the flights from London Gatwick on 31 December 2026. Quote CITYBREMOR if you call them.",
      },
      {
        label: "In the price",
        detail:
          "Riad Al Rimal, a double superior queen room on bed and breakfast, a sunrise hot-air-balloon ride with breakfast, flights and transfers. They say no local charges are payable.",
      },
    ],
    includes: [
      "Flights from London Gatwick on 31 December 2026",
      "Transfers",
      "4 nights at Riad Al Rimal, bed and breakfast",
      "Sunrise balloon flight with breakfast on New Year’s Day",
      "ATOL protection under Travel Counsellors ATOL 6751, where they are the organiser",
    ],
    excludes: [
      "Lunches and dinners, apart from the balloon breakfast",
      "Travel insurance",
      "Tips and shopping in the souks",
    ],
    why: "I would send you here if the point of the trip is New Year, not a cheap week in the sun. You land on 31 December, sleep in a riad in the medina, and start 2027 in a balloon over the Atlas. At £955 for four nights it is a treat, not a bargain. The evenings are the reason to be in Marrakech: Jemaa el-Fnaa, the grills, the square.",
    suits: "Two adults. Fine with older children who can handle the medina. A poor New Year’s plan for toddlers, and the balloon is an early start.",
    days: [
      {
        title: "31 December 2026",
        detail:
          "Fly Gatwick, transfer to Riad Al Rimal, and take the square in the evening. Dinner is not in the package.",
      },
      {
        title: "New Year’s Day",
        detail:
          "Sunrise balloon, then breakfast. The rest of the day is for sleeping it off or the souks.",
      },
      {
        title: "A quieter hour",
        detail:
          "Jardin Majorelle, for the blue villa and the cactus garden, when the medina has been enough.",
      },
    ],
    sourceName: "Travel Counsellors",
    sourceUrl:
      "https://www.travelcounsellors.co.uk/offers/welcome-the-new-year-in-marrakech/",
    caveat:
      "Subject to availability. Travel Counsellors says the price was correct at the time of posting and can change.",
  },
  {
    id: "marrakech-agadir",
    destination: "Marrakech and Agadir",
    country: "Morocco",
    placeKey: "marrakech-agadir",
    title: "Three nights in a riad, then four on the beach",
    styles: ["food", "beach", "winter-sun"],
    familyFit: "fine",
    seasonMonths: [1, 2, 3, 4, 5, 6, 7, 10, 11, 12],
    nights: 7,
    departures: [
      {
        year: 2026,
        month: 10,
        price: 679,
        label: "October 2026, from £679 a person",
      },
      {
        year: 2026,
        month: 11,
        price: 529,
        label: "November 2026, from £529 a person",
      },
      {
        year: 2026,
        month: 12,
        price: 499,
        label: "1–15 December 2026, from £499 a person",
      },
      {
        year: 2027,
        month: 1,
        price: 519,
        label: "January 2027, from £519 a person",
      },
      {
        year: 2027,
        month: 2,
        price: 559,
        label: "February 2027, from £559 a person",
      },
      {
        year: 2027,
        month: 3,
        price: 549,
        label: "March 2027, from £549 a person",
      },
      {
        year: 2027,
        month: 4,
        price: 639,
        label: "April 2027, from £639 a person",
      },
      {
        year: 2027,
        month: 5,
        price: 599,
        label: "May 2027, from £599 a person",
      },
      {
        year: 2027,
        month: 6,
        price: 599,
        label: "June 2027, from £599 a person",
      },
      {
        year: 2027,
        month: 7,
        price: 699,
        label: "July 2027, from £699 a person",
      },
    ],
    priceBasis: "From-prices a person, two sharing, flights from London",
    departFrom: "London",
    board: "Breakfast in Marrakech, all inclusive in Agadir",
    lines: [
      {
        label: "The shape of the week",
        detail:
          "7 nights: 3 in a 4-star riad in Marrakech with breakfast, then 4 all inclusive at a 4-star beach resort in Agadir. You fly into Marrakech and home from Agadir. A private taxi between them is included and takes about three hours.",
      },
      {
        label: "Monthly from-prices",
        detail:
          "October 2026 £679, November £529, 1–15 December £499, January 2027 £519, February £559, March £549, April £639, May £599, June £599, July £699. Later December dates, and August and September, are not on the list.",
      },
      {
        label: "Hotels named as examples",
        detail:
          "A riad such as Riad Infinity Sea & Spa, or similar, then a resort such as Amadil Ocean Club, or similar. Love Luxury confirms the actual properties before you pay.",
      },
    ],
    includes: [
      "Return flights from London, open-jaw via Marrakech and Agadir",
      "3 nights bed and breakfast in a 4-star riad",
      "4 nights all inclusive at a 4-star Agadir resort",
      "Private taxi from Marrakech to Agadir",
      "One small hand bag each",
      "ATOL 10713",
    ],
    excludes: [
      "Checked luggage",
      "Transfers from Marrakech airport to the riad, and from the resort to Agadir airport",
      "Dinners in Marrakech",
      "Atlas Mountains excursions",
      "Travel insurance",
    ],
    why: "This is the trip I would book if you want both the medina and a proper rest, and you do not want to build it yourself. Three nights is enough for the souks, Bahia Palace and a morning at Majorelle, and then the meals are paid for on the beach. December’s £499 is the cheapest month they publish, and it is hand luggage only, so a suitcase is a real extra. July is £699 and Marrakech’s average high that month is 37.7°C, which is why the beach nights are the point of a summer booking.",
    suits: "Couples and friends who can travel with a small cabin bag. Possible with children if the medina will not be too much. It is a bad match if you need every meal included for all seven nights, because Marrakech is breakfast only.",
    days: [
      {
        title: "Marrakech",
        detail:
          "Two full days. One for the souks and Bahia Palace, one for Majorelle Garden. Eat on Jemaa el-Fnaa in the evening. Those dinners are not in the fare.",
      },
      {
        title: "The taxi south",
        detail:
          "Day four is the included private taxi to Agadir, about three hours. You do not fly back to Marrakech at the end.",
      },
      {
        title: "Agadir",
        detail:
          "Four all-inclusive nights at a beachfront resort. The beach, the promenade and the marina are there. The pool is there when you do not want the beach.",
      },
    ],
    sourceName: "Love Luxury Holidays",
    sourceUrl: "https://loveluxuryholidays.co.uk/marrakech-holidays-guide/",
    caveat:
      "Lead-in fares, updated on their page in September 2026. The riad and resort are “or similar” until they confirm them in writing.",
  },
  {
    id: "lisbon-ibis",
    destination: "Lisbon",
    country: "Portugal",
    placeKey: "lisbon",
    title: "A two-night weekend at the Ibis, with the flight",
    styles: ["city", "food"],
    familyFit: "fine",
    seasonMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    nights: 2,
    departures: [
      {
        year: 2026,
        month: 12,
        price: 98,
        label: "Stansted, 10–12 December, 2 nights",
        yearInferred: true,
      },
    ],
    priceBasis: "£98 a person, two adults, £196 for the room and flights",
    departFrom: "London Stansted",
    board: "Room only",
    lines: [
      {
        label: "Package",
        detail:
          "Plofair lists Stansted to Lisbon at £98 a person for 2 nights, £196 for two adults. Ryanair, Hotel Ibis Lisboa Jose Malhoa, which they score 8.1. Dates on the page: 10–12 December.",
      },
      {
        label: "The year",
        detail:
          "The page does not print a year. Checked on 10 October 2026, the next 10–12 December is 2026. I am treating it as December 2026 and saying so, rather than pretending the listing typed the year.",
      },
    ],
    includes: [
      "Ryanair return from London Stansted",
      "2 nights at Ibis Lisboa Jose Malhoa",
    ],
    excludes: [
      "Breakfast, unless the rate you land on includes it",
      "Hold luggage, which Ryanair usually sells separately",
      "Transfers across Lisbon",
    ],
    why: "This is the cheap city weekend, and it is honestly cheap because the hotel is an Ibis in Jose Malhoa, not a tiled guest house in Alfama. At £98 including the flight it is the one I would use for a December hit of pastel de nata and a walk, then get a tram or a metro to the centre. I would not use it as a base for a slow week.",
    suits: "Two adults who want Lisbon for a weekend and will travel in with a cabin bag. Fine with one older child if the room can take them. Plofair’s price is built for two adults.",
    days: [
      {
        title: "Out",
        detail:
          "Ryanair from Stansted. The Ibis is not in the old town, so the first job is the metro or a taxi, which is not in the £98.",
      },
      {
        title: "One full day",
        detail:
          "Alfama, a miradouro, and Time Out Market or a smaller dining room in Mouraria. Two nights gives you one full day and two evenings.",
      },
      {
        title: "Home",
        detail:
          "12 December on the listing. Check the Ryanair bag rules before you pack, because this page does not include a 20kg suitcase.",
      },
    ],
    sourceName: "Plofair",
    sourceUrl: "https://plofair.com/",
    caveat:
      "Weekend packages on this page move. The £98 was the Lisbon price when I read it on 10 October 2026.",
  },
  {
    id: "amsterdam-westcord",
    destination: "Amsterdam",
    country: "Netherlands",
    placeKey: "amsterdam",
    title: "Two nights at the WestCord, room only, from Gatwick",
    styles: ["city"],
    familyFit: "fine",
    seasonMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    nights: 2,
    departures: [
      {
        year: 2027,
        month: 12,
        price: 239,
        label: "London Gatwick, 10 December 2027, 2 nights",
      },
    ],
    priceBasis: "£239 a person, room only",
    departFrom: "London Gatwick",
    board: "Room only",
    lines: [
      {
        label: "Package",
        detail:
          "£239 a person. 4* WestCord Fashion Hotel Amsterdam, room only, London Gatwick, 10 December 2027. easyJet holidays’ launch list says this includes return flights and two nights. The 23kg bag and transfers are described for beach holidays, not for this city break.",
      },
    ],
    includes: [
      "Return flights from London Gatwick",
      "2 nights at the 4* WestCord Fashion Hotel, room only",
    ],
    excludes: [
      "Breakfast and other meals",
      "23kg luggage, unless you add it",
      "Transfers from Schiphol",
    ],
    why: "A short December city break with the date and the hotel named. £239 is more than the Lisbon weekend because the hotel is 4-star and the trip is a year further out, on a published launch fare. Room only means the famous breakfasts are your bill. I would book it for galleries and a walk, not for a canal-house fantasy.",
    suits: "Adults on a short break from Gatwick. Usable with children, though nothing in the listing is built around them.",
    days: [
      {
        title: "10 December 2027",
        detail:
          "Fly Gatwick to Amsterdam. The hotel is the WestCord Fashion Hotel. Getting there from the airport is not described as included.",
      },
      {
        title: "The full day",
        detail:
          "One full day and two evenings. The Rijksmuseum or the Van Gogh, then somewhere for dinner, which is outside the £239.",
      },
      {
        title: "Home",
        detail:
          "Two nights, so you are back on 12 December 2027 if the package runs as advertised.",
      },
    ],
    sourceName: "Global Agents, reporting easyJet holidays",
    sourceUrl:
      "https://globalagents.uk/news/easyjet-holidays-launches-winter-2027-package-holidays-beach-holidays-city-breaks",
    caveat:
      "A launch example for 10 December 2027. Confirm it on easyJet holidays. The fare is room only.",
  },
  {
    id: "rome-palazzo",
    destination: "Rome",
    country: "Italy",
    placeKey: "rome",
    title: "Two nights near the centre, flight included",
    styles: ["city", "food"],
    familyFit: "fine",
    seasonMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    nights: 2,
    departures: [],
    undatedPrice: 120,
    priceBasis: "£120 a person, £241 for two adults",
    departFrom: "London Stansted",
    board: "Room only",
    lines: [
      {
        label: "Package",
        detail:
          "Plofair lists Rome at £120 a person for 2 nights, £241 for two adults. Ryanair, Palazzo Sant’antonio Roma, which they score 8.1.",
      },
      {
        label: "No date on the page",
        detail:
          "Unlike their Lisbon, Madrid and Alicante rows, the Rome block I read did not print departure dates. This is the price on the page on 10 October 2026, not a fare I can attach to the month you pick.",
      },
    ],
    includes: [
      "Ryanair return from London Stansted",
      "2 nights at Palazzo Sant’antonio Roma",
    ],
    excludes: [
      "Breakfast",
      "Hold luggage",
      "Any ticketed museum",
    ],
    why: "Rome for a weekend, with the flight and a central-enough hotel already added together, is worth showing because people underprice the room. £120 a person is the listing. I am not going to pretend I saw a travel date. If the month matters, open the Plofair page and see what it says now, or look at the Lisbon and Amsterdam cards, which do have dates.",
    suits: "Two adults who want a short hit of Rome and can be flexible on the weekend. The price is quoted for two.",
    days: [
      {
        title: "Arrival",
        detail:
          "Ryanair into Rome from Stansted. The hotel is Palazzo Sant’antonio. Check the pin on a map before you assume you can walk to the Pantheon.",
      },
      {
        title: "One full day",
        detail:
          "Two nights gives you one proper day. Pick a neighbourhood and eat there. Museum tickets are not in the £120.",
      },
      {
        title: "The gap",
        detail:
          "I cannot tell you which weekend this fare is for. That is the weakness of this card, and it is on purpose.",
      },
    ],
    sourceName: "Plofair",
    sourceUrl: "https://plofair.com/",
    caveat:
      "No travel date was printed on the Rome package when I checked it. The price may already have moved.",
  },
  {
    id: "alicante-travelodge",
    destination: "Alicante",
    country: "Spain",
    placeKey: "alicante",
    title: "The cheapest winter weekend on the desk",
    styles: ["beach", "winter-sun"],
    familyFit: "fine",
    seasonMonths: [11, 12, 1, 2, 3],
    nights: 2,
    departures: [
      {
        year: 2026,
        month: 12,
        price: 81,
        label: "Stansted, 10–12 December, 2 nights",
        yearInferred: true,
      },
    ],
    priceBasis: "£81 a person, two adults, £163 altogether",
    departFrom: "London Stansted",
    board: "Room only",
    lines: [
      {
        label: "Package",
        detail:
          "Plofair lists Stansted to Alicante at £81 a person, £163 for two adults, 2 nights. Ryanair and Hotel Travelodge Alicante Puerto, scored 8.2. Dates printed: 10–12 December.",
      },
      {
        label: "The year",
        detail:
          "No year on the page. From a check on 10 October 2026 I am reading it as December 2026.",
      },
    ],
    includes: [
      "Ryanair return from London Stansted",
      "2 nights at Travelodge Alicante Puerto",
    ],
    excludes: [
      "Meals",
      "Hold luggage",
      "A hire car if you want the beaches north or south of the city",
    ],
    why: "I am including this because it is a real total, not because it is a great holiday. £81 gets you a Travelodge by the port and a Ryanair seat. In mid-December Alicante is mild, not summer. Take it for a walk on the promenade and a long lunch. Do not take it if you wanted a resort week.",
    suits: "Two adults on a tight budget who know they are booking a weekend, not a holiday in the longer sense.",
    days: [
      {
        title: "10 December",
        detail:
          "Stansted to Alicante. The Travelodge is at the port, so the old town and the seafront are the walk.",
      },
      {
        title: "The full day",
        detail:
          "Santa Bárbara if you want the view, then lunch. Two nights does not give you the Costa Blanca properly.",
      },
      {
        title: "Home",
        detail:
          "Back on the 12th. Budget for a cabin-bag-only pack unless you pay Ryanair for more.",
      },
    ],
    sourceName: "Plofair",
    sourceUrl: "https://plofair.com/",
    caveat:
      "A weekend deal, not a seven-night holiday. The year was not printed on the listing.",
  },
];
