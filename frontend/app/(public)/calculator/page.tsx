import type { Metadata } from "next";
import SolarCalculatorClient from "./SolarCalculatorClient";

export const metadata: Metadata = {
  title: "AI Solar Calculator | Al Rehman Solar",
  description:
    "Get an instant estimate of your solar system size, panels, inverter, battery, savings and approximate investment. Free AI solar calculator for Lahore, Karachi, Islamabad and all of Pakistan.",
  keywords: [
    "solar calculator Pakistan",
    "solar system calculator Lahore",
    "solar panel calculator",
    "solar savings calculator Pakistan",
    "how many solar panels do I need Pakistan",
    "solar system cost Pakistan",
    "solar estimate Lahore",
  ],
  openGraph: {
    title: "AI Solar Calculator | Al Rehman Solar",
    description:
      "Get an instant estimate of your solar system size, panels, inverter, battery, savings and approximate investment.",
    type: "website",
  },
};

export default function SolarCalculatorPage() {
  return <SolarCalculatorClient />;
}
