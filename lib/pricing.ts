export const SOLAR_RATE = 14.5;

export const calloutZones = [
  {
    name: "Cairns central",
    suburbs: [
      "Cairns City","Cairns North","Bungalow","Portsmith","Westcourt",
      "Parramatta Park","Earlville","Manoora","Manunda","Aeroglen",
      "Freshwater","Stratford","Edge Hill","Whitfield","Brinsmead"
    ],
    fee: 50 as number | null,
  },
  {
    name: "Northern Beaches",
    suburbs: [
      "Machans Beach","Holloways Beach","Yorkeys Knob","Caravonica",
      "Kamerunga","Smithfield","Trinity Park","Trinity Beach",
      "Kewarra Beach","Clifton Beach","Palm Cove","Ellis Beach"
    ],
    fee: 50 as number | null,
  },
  {
    name: "Southside",
    suburbs: [
      "Bayview Heights","Mooroobool","Kanimbla","Woree","White Rock",
      "Mount Sheridan","Bentley Park","Edmonton","Gordonvale"
    ],
    fee: 50 as number | null,
  },
];

export function findCallout(suburb: string) {
  const clean = suburb.trim().toLowerCase();
  for (const zone of calloutZones) {
    const match = zone.suburbs.find((s) => s.toLowerCase() === clean);
    if (match) return { zone: zone.name, suburb: match, fee: zone.fee };
  }
  return null;
}
