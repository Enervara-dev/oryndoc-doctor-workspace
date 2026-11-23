import type { Product } from "@/lib/types";

export const products: Product[] = [
  {
    id: "reach",
    name: "Reach",
    tagline: "Clinic operations",
    description:
      "Appointments, patient directory and personalized follow-ups — the daily operating system for your clinic.",
    status: "available",
    href: "/reach/overview",
  },
  {
    id: "voice",
    name: "Voice",
    tagline: "Patient calls",
    description:
      "Phone answering and appointment confirmations. In development.",
    status: "coming-soon",
    href: "/voice",
  },
  {
    id: "assist",
    name: "Assist",
    tagline: "Clinical assistance",
    description:
      "Assistance for doctors during and after consultations. In development.",
    status: "coming-soon",
    href: "/assist",
  },
  {
    id: "azure",
    name: "Assure",
    tagline: "Practice assurance",
    description:
      "Quality and compliance tools for your practice. In development.",
    status: "coming-soon",
    href: "/azure",
  },
];
