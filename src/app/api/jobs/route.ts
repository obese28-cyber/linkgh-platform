import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: 1,
      title: "Senior Accountant",
      company: "Deloitte Ghana",
      location: "Accra",
      category: "Accounting",
      type: "Full-time",
      verified: true,
    },
    {
      id: 2,
      title: "Finance Analyst",
      company: "Ecobank Ghana",
      location: "Accra",
      category: "Finance",
      type: "Full-time",
      verified: true,
    },
  ]);
}