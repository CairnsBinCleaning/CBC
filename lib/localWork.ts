/* /local-work: real local jobs, shown by type and suburb.

   A client's name, link and logo appear ONLY when `permission` is true, which
   means the client has said yes in writing. Until then the job is described
   without naming them, and the name is not stored here at all (the repo is
   public). Add `client` and set permission only after that yes (20 Sept 2026).
   Photos are our own, from the job described. */

export type LocalJob = {
  id: string;
  title: string; // shown while unnamed
  suburb: string;
  when: string;
  work: string[];
  note?: string;
  photos: { src: string; alt: string; width: number; height: number }[];
  client?: { name: string; url?: string; logo?: string }; // only shown with permission
  permission: boolean;
};

export const localJobs: LocalJob[] = [
  {
    id: "school-brinsmead",
    title: "A school campus in Brinsmead",
    suburb: "Brinsmead",
    when: "May, June and August 2026",
    work: [
      "Roof soft washing across several school buildings",
      "Paved walkways and outdoor areas",
      "Work planned around the school: signed in on the school's contractor system, insurance and WorkCover on file",
    ],
    photos: [
      { src: "/media/IMG_3156.jpg", alt: "School roof in Brinsmead after a roof soft wash, ranges behind", width: 2400, height: 1800 },
    ],
    permission: false,
  },
  {
    id: "collins-ave-edge-hill",
    title: "An apartment complex and ground-floor businesses on Collins Avenue, Edge Hill",
    suburb: "Edge Hill",
    when: "August 2026",
    work: [
      "Basement car park ramp",
      "Walkways, stairs and entry paths",
      "Pool surrounds",
      "Street frontage used by the ground-floor businesses",
    ],
    note: "Booked through the complex's body corporate manager.",
    photos: [
      { src: "/media/IMG_2902.jpg", alt: "Rotary surface cleaner on the basement car park ramp at an Edge Hill apartment complex", width: 1500, height: 2000 },
      { src: "/media/IMG_2920.jpg", alt: "Cleaned courtyard pavers at an Edge Hill apartment complex", width: 2000, height: 1500 },
      { src: "/media/IMG_2935.jpg", alt: "Cleaned walkway beside the building at an Edge Hill apartment complex", width: 1500, height: 2000 },
    ],
    permission: false,
  },
  {
    id: "refuse-rooms-cairns-city",
    title: "Commercial refuse rooms in the Cairns CBD",
    suburb: "Cairns City",
    when: "2026",
    work: ["Bulk bins washed in place", "Refuse room floors washed down"],
    photos: [
      { src: "/media/strata-refuse-room-cairns-city.jpg", alt: "Refuse room in the Cairns CBD with bulk bins cleaned in place", width: 1296, height: 972 },
    ],
    permission: false,
  },
  {
    id: "bin-enclosure-mooroobool",
    title: "A bulk bin enclosure in Mooroobool",
    suburb: "Mooroobool",
    when: "September 2026",
    work: ["Bulk bins and the enclosure floor cleaned"],
    photos: [
      { src: "/media/IMG_3227.jpg", alt: "Bulk bin enclosure in Mooroobool during a clean", width: 2000, height: 1500 },
    ],
    permission: false,
  },
];
