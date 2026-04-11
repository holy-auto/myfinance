import { Hero } from "./_components/hero";
import { Services } from "./_components/services";
import { PricingSimulator } from "./_components/pricing-simulator";
import { Access } from "./_components/access";
import { BookingForm } from "./_components/booking-form";

export default function CarwashHomePage() {
  return (
    <>
      <Hero />
      <Services />
      <PricingSimulator />
      <Access />
      <BookingForm />
    </>
  );
}
