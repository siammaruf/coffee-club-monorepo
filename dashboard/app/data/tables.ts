import type { RestaurantTable } from "~/types/table";

export const dummyTables: RestaurantTable[] = [
  {
    id: "1",
    number: "T1",
    seat: 4,
    description: "Corner table with window view",
    location: "Main Floor",
    status: "available"
  },
  {
    id: "2",
    number: "T2",
    seat: 2,
    description: "Small table near bar",
    location: "Main Floor",
    status: "occupied"
  },
  {
    id: "3",
    number: "T3",
    seat: 6,
    description: "Large family table",
    location: "Main Floor",
    status: "reserved",
    reservation_time: "2025-06-24T19:00:00",
    reservation_name: "Johnson Family"
  },
  {
    id: "4",
    number: "T4",
    seat: 4,
    description: "Booth seating",
    location: "Main Floor",
    status: "available"
  },
  {
    id: "5",
    number: "B1",
    seat: 4,
    description: "Outdoor balcony table",
    location: "Balcony",
    status: "available"
  },
  {
    id: "6",
    number: "B2",
    seat: 2,
    description: "Outdoor balcony table for two",
    location: "Balcony",
    status: "maintenance"
  },
  {
    id: "7",
    number: "P1",
    seat: 8,
    description: "Private room large table",
    location: "Private Room",
    status: "reserved",
    reservation_time: "2025-06-24T20:30:00",
    reservation_name: "Corporate Event"
  },
  {
    id: "8",
    number: "P2",
    seat: 6,
    description: "Private room medium table",
    location: "Private Room",
    status: "available"
  }
];