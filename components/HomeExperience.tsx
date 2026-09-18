'use client';
import Link from 'next/link';import {useState} from 'react';import AtmosphereCanvas from './AtmosphereCanvas';import LiveStat from './LiveStat';import {services} from '../lib/services';import {LIFETIME_BIN_CLEANS} from '../lib/stats';
export default function HomeExperience(){const [active,setActive]=useState(0);const s=services[active];return <main className={'site tone-'+s.tone}>
 <section className="heroScene">
  <video className="heroVideo" autoPlay muted loop playsInline poster="/media/IMG_3027.jpg"><source src="/media/pressure-hero.mp4" type="video/mp4"/></video>
  <div className="heroWash"/><div className="ambientOrb"/><AtmosphereCanvas/>
  <header className="nav"><Link href="/" className="brand"><span>CAIRNS</span><small>BIN CLEANING</small></Link><nav><Link href="#services">Services</Link><Link href="/prices">Prices</Link><Link href="/commercial-cleaning">Commercial</Link><a href="tel:+61434052755">0434 052 755</a><Link href="/instant-quote" className="nav-book-btn">Instant quote</Link></nav></header>
  <div className="heroCopy"><p className="eyebrow">CAIRNS · HOMES · BUSINESSES · STRATA</p><h1>What needs<br/>cleaning?</h1><p className="lead">Driveway gone black? Roof getting green? Bins starting to smell? Measure it yourself on the satellite map and the price appears — no waiting on a call-back.</p><div className="heroActions"><Link href="/instant-quote" className="primary">Get my price now</Link><a href="tel:+61434052755" className="ghost">Call 0434 052 755</a><a href="#services" className="ghost">Choose the job</a></div></div>
  <div className="weatherNote"><span className="pulse"/> BUILT FOR CAIRNS CONDITIONS</div><div className="scrollCue">SCROLL <i/></div>
 </section>
 <section id="services" className="serviceStage">
  <div className="stageIntro"><p className="eyebrow dark">START WITH THE PROBLEM</p><h2>Simple on purpose.</h2><p>No giant form. No hunting through menus. Choose what you need and we’ll take it from there.</p></div>
  <div className="serviceExplorer">
   <div className="serviceList">{services.map((item,i)=><Link key={item.slug} href={'/'+item.slug} onMouseEnter={()=>setActive(i)} onFocus={()=>setActive(i)} className={i===active?'active':''}><span>{String(i+1).padStart(2,'0')}</span>{item.name}<b>↗</b></Link>)}</div>
   <Link href={'/'+s.slug} className="servicePreview"><img src={s.media} alt={s.name+' — '+s.short}/><div className="previewShade"/><div className="previewCopy"><small>{s.cue}</small><h3>{s.name}</h3><p>{s.short}</p><strong>{s.price}</strong><em>See service →</em></div></Link>
  </div>
 </section>
 <section className="proofScene"><div><p className="eyebrow dark">REAL CAIRNS WORK</p><h2>Not stock photos.<br/>Not made-up jobs.</h2><p>The website is being built around the work we actually do — homes, commercial sites, bins, concrete and tropical exterior maintenance.</p>{LIFETIME_BIN_CLEANS!=null&&<LiveStat count={LIFETIME_BIN_CLEANS}/>}</div><div className="proofGrid"><img src="/media/IMG_3031.jpg" alt="Cleaned concrete in Cairns"/><img src="/media/IMG_2935.jpg" alt="Clean commercial walkway"/><img src="/media/IMG_2902.jpg" alt="Real Cairns job site"/></div></section>
 <section className="quoteScene"><p className="eyebrow">NO MYSTERY QUOTE</p><h2>Draw it. Price it.<br/>Book it.</h2><p>Type your address, tap the corners of your driveway, roof, patio or car park on the satellite photo, and the price works itself out as you go. Accept it and the job is booked.</p>
  <ol className="quoteSteps"><li><b>1</b><span>Find your place</span><small>Type the address, the map lands on your roof</small></li><li><b>2</b><span>Tap the corners</span><small>Square metres and price appear as you draw</small></li><li><b>3</b><span>Accept the price</span><small>We text you to lock in the day</small></li></ol>
  <div className="quoteActions"><Link href="/instant-quote" className="primary light">Measure it now →</Link><Link href="/prices" className="quoteAlt">Or just show me the price list</Link></div>
  <p className="quoteFine">Prices include GST. Big or unusual jobs come back as a site visit instead of a number — we&rsquo;d rather look first than guess.</p></section>
 <footer><span>CAIRNS BIN CLEANING</span><a href="tel:+61434052755">0434 052 755</a><nav><Link href="/service-areas">Areas</Link><Link href="/faq">FAQ</Link><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></nav><small>For a greener, cleaner FNQ.</small><small className="madeBy">Created by Siezar DeWaal</small></footer>
 </main>}
