import type { Metadata } from 'next';
import HomeExperience from '../components/HomeExperience';
import TrustBar from '../components/TrustBar';
import OwnerNote from '../components/OwnerNote';
import BusinessBand from '../components/BusinessBand';
import SiteFooter from '../components/SiteFooter';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function Page(){return <>
  <HomeExperience
    trust={<div className="home-trust"><TrustBar/></div>}
    owner={<OwnerNote/>}
    business={<BusinessBand/>}
  />
  <SiteFooter/>
</>}
