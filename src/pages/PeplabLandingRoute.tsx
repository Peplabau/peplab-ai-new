/**
 * Marketing landing at /landing — Research Gateway with the new product hero.
 */
import '@/landing/index.css';
import '@/landing/research-atelier.css';
import BrandSplash from '@/landing/components/BrandSplash';
import ResearchGateway from '@/landing/pages/ResearchGateway';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';

export default function PeplabLandingRoute() {
  return (
    <>
      <BrandSplash />
      <Navigation />
      <CartDrawer />
      <ResearchGateway />
    </>
  );
}
