export const STATIONS = [
  {
    id: 1,
    name: "JKUAT Main Station",
    location: "Jomo Kenyatta University, Juja",
    coordinates: "-1.0917, 37.0169",
    elevation: "1,550m",
    status: "Active",
    lastUpdated: "2026-07-10 14:30:00 UTC",
    current: {
      temperature: 22.4,
      humidity: 64.8,
      pressure: 1012.3,
      windSpeed: 5.8,
      windDirection: "NE",
      rainfall: 1.4,
      heatIndex: 21.2,
      wetBulb: 16.8,
      wbgt: 20.1,
    },
  },
  // {
  //   id: 2,
  //   name: "Nairobi Station",
  //   location: "Nairobi CBD",
  //   coordinates: "-1.2921, 36.8219",
  //   elevation: "1,795m",
  //   status: "Active",
  //   lastUpdated: "2026-07-10 14:25:00 UTC",
  //   current: {
  //     temperature: 23.1,
  //     humidity: 58.2,
  //     pressure: 1015.6,
  //     windSpeed: 4.2,
  //     windDirection: "SE",
  //     rainfall: 0.0,
  //     heatIndex: 22.8,
  //     wetBulb: 17.2,
  //     wbgt: 20.8,
  //   },
  // },
  // {
  //   id: 3,
  //   name: "Mola Ridge Station",
  //   location: "Mola Ridge Farm, Kiambu",
  //   coordinates: "-0.9852, 36.9123",
  //   elevation: "1,820m",
  //   status: "Active",
  //   lastUpdated: "2026-07-10 14:20:00 UTC",
  //   current: {
  //     temperature: 19.8,
  //     humidity: 72.1,
  //     pressure: 1010.8,
  //     windSpeed: 3.1,
  //     windDirection: "SW",
  //     rainfall: 3.2,
  //     heatIndex: 19.2,
  //     wetBulb: 16.1,
  //     wbgt: 18.5,
  //   },
  // },
  // {
  //   id: 4,
  //   name: "Machakos Station",
  //   location: "Machakos County",
  //   coordinates: "-1.5176, 37.2634",
  //   elevation: "1,615m",
  //   status: "Active",
  //   lastUpdated: "2026-07-10 14:15:00 UTC",
  //   current: {
  //     temperature: 21.7,
  //     humidity: 62.3,
  //     pressure: 1014.2,
  //     windSpeed: 6.1,
  //     windDirection: "E",
  //     rainfall: 0.0,
  //     heatIndex: 21.3,
  //     wetBulb: 16.9,
  //     wbgt: 19.8,
  //   },
  // },
  // {
  //   id: 5,
  //   name: "Thika Station",
  //   location: "Thika Town",
  //   coordinates: "-1.0386, 37.0833",
  //   elevation: "1,495m",
  //   status: "Maintenance",
  //   lastUpdated: "2026-07-09 08:00:00 UTC",
  //   current: {
  //     temperature: 20.5,
  //     humidity: 68.4,
  //     pressure: 1013.1,
  //     windSpeed: 2.5,
  //     windDirection: "N",
  //     rainfall: 0.8,
  //     heatIndex: 20.1,
  //     wetBulb: 16.5,
  //     wbgt: 19.2,
  //   },
  // },
];

export const DOWNLOAD_HISTORY = [
  {
    id: 1,
    name: "JKUAT_Weather_2026-01_to_2026-06",
    station: "JKUAT Main Station",
    dateRange: "Jan 2026 — Jun 2026",
    format: "CSV",
    generated: "2026-07-01 08:30",
  },
  {
    id: 2,
    name: "Nairobi_Temperature_2026-06",
    station: "Nairobi Station",
    dateRange: "Jun 2026",
    format: "JSON",
    generated: "2026-07-02 14:15",
  },
];

export const generatePreviewData = () => {
  const data = [];
  for (let i = 0; i < 10; i++) {
    data.push({
      timestamp: `2026-07-10 ${String(14 - i).padStart(2, "0")}:00:00 UTC`,
      temperature: (20 + Math.random() * 5).toFixed(1),
      humidity: (55 + Math.random() * 20).toFixed(1),
      pressure: (1010 + Math.random() * 8).toFixed(1),
      windSpeed: (2 + Math.random() * 6).toFixed(1),
      windDirection: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
        Math.floor(Math.random() * 8)
      ],
      rainfall: (Math.random() * 5).toFixed(1),
      heatIndex: (19 + Math.random() * 5).toFixed(1),
      wbgt: (17 + Math.random() * 5).toFixed(1),
    });
  }
  return data;
};
