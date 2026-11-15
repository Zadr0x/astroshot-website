import HilmProduct from "@/components/hilm/HilmProduct";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dream",
  description: "Write a dream and turn it into a cinematic dream video.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DreamPage() {
  return <HilmProduct />;
}
