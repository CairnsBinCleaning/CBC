"""Pull every configured source into one JSON payload.

    python3 collect.py --config creds.json --out data.json
    python3 collect.py --sample --out data.json     # realistic fake data, no creds

A source that isn't set up yet is recorded as 'not_configured' and the rest of
the report still runs. A source that errors records the error verbatim — the
report says so on the page rather than quietly showing a zero.
"""

import argparse
import json
import os
import sys
import traceback
from datetime import datetime, timedelta, timezone

import sources

BRISBANE = timezone(timedelta(hours=10))  # Queensland, no daylight saving


def build_window(ref: datetime = None) -> dict:
    now = ref or datetime.now(BRISBANE)
    day = (now - timedelta(days=1)).date()  # yesterday, the last complete day
    prev = day - timedelta(days=1)
    f = lambda d: d.isoformat()
    return {
        "day": f(day),
        "day_label": day.strftime("%A %-d %B %Y"),
        "prev": f(prev),
        "trail_start": f(day - timedelta(days=7)),
        "trail_end": f(prev),
        "trend_start": f(day - timedelta(days=13)),
        "gsc_start": f(day - timedelta(days=9)),
        "gsc_end": f(day - timedelta(days=2)),
        "day_start_iso": datetime.combine(day, datetime.min.time(), BRISBANE).isoformat(),
        "generated_at": now.isoformat(timespec="seconds"),
    }


def missing_keys(cfg, required):
    out = []
    for k in required:
        v = cfg.get(k)
        if v is None or (isinstance(v, str) and not v.strip()) or (isinstance(v, dict) and not v):
            out.append(k)
    return out


def collect(cfg, win, only=None):
    result = {}
    for key, (fn, required, label) in sources.REGISTRY.items():
        if only and key not in only:
            continue
        miss = missing_keys(cfg, required)
        if miss:
            result[key] = {
                "label": label,
                "status": "not_configured",
                "message": "Waiting on: " + ", ".join(miss),
                "data": None,
            }
            continue
        try:
            result[key] = {"label": label, "status": "ok", "message": None, "data": fn(cfg, win)}
        except Exception as e:  # noqa: BLE001 - one bad source must not kill the report
            result[key] = {
                "label": label,
                "status": "error",
                "message": str(e)[:600],
                "data": None,
                "trace": traceback.format_exc()[-1200:],
            }
    return result


def summarise(src, win, history=None):
    """The handful of numbers that decide what he does today."""
    g = lambda k: (src.get(k) or {}).get("data") or {}
    gads, meta, ga4, job = g("google_ads"), g("meta_ads"), g("ga4"), g("jobber")
    gbp, xero, weather, health = g("gbp"), g("xero"), g("weather"), g("site_health")

    spend = float(gads.get("totals", {}).get("spend", 0)) + float(meta.get("totals", {}).get("spend", 0))
    ad_clicks = int(gads.get("totals", {}).get("clicks", 0)) + int(meta.get("totals", {}).get("clicks", 0))

    # Leads = Jobber requests. The ad platforms over-claim; Jobber knows what
    # actually came in. Phone taps are reported alongside, never added in —
    # a caller who then books would otherwise be counted twice.
    jobber_leads = (job.get("requests", {}) or {}).get("count")
    platform_leads = float(gads.get("totals", {}).get("conversions", 0)) + float(
        meta.get("totals", {}).get("leads", 0)
    )
    leads = jobber_leads if jobber_leads is not None else platform_leads
    leads_source = "Jobber requests" if jobber_leads is not None else "platform-reported conversions"

    gbp_calls = int(gbp.get("totals", {}).get("calls", 0)) if gbp else None
    revenue = xero.get("invoiced_today") if xero else None

    return {
        "spend": round(spend, 2),
        "ad_clicks": ad_clicks,
        "leads": leads,
        "leads_source": leads_source,
        "cost_per_lead": round(spend / leads, 2) if leads else None,
        "sessions": int(ga4.get("totals", {}).get("sessions", 0)),
        "sessions_prev": int(ga4.get("prev", {}).get("sessions", 0)),
        "sessions_trail_avg": round(float(ga4.get("trail_avg", {}).get("sessions", 0)), 1),
        "key_events": int(ga4.get("totals", {}).get("keyEvents", 0)) if ga4 else None,
        "quote_value": (job.get("quotes", {}) or {}).get("value"),
        "quote_count": (job.get("quotes", {}) or {}).get("count"),
        "job_value": (job.get("jobs", {}) or {}).get("value"),
        "job_count": (job.get("jobs", {}) or {}).get("count"),
        "gbp_calls": gbp_calls,
        "gbp_views": int(gbp.get("totals", {}).get("views", 0)) if gbp else None,
        "gbp_actions": int(gbp.get("totals", {}).get("actions", 0)) if gbp else None,
        "revenue": revenue,
        "roas": round(revenue / spend, 2) if (revenue and spend) else None,
        "rain_mm": (weather.get("day") or {}).get("rain_mm") if weather else None,
        "rain_ahead_mm": weather.get("rain_ahead_mm") if weather else None,
        "site_ok": health.get("ok") if health else None,
        "site_seconds": health.get("seconds") if health else None,
    }


def build_alerts(src, summary, win, history=None):
    """Threshold breaches worth interrupting someone for. Anything that does
    not clear a bar stays off this list — a daily alert nobody can ignore
    stops being an alert."""
    g = lambda k: (src.get(k) or {}).get("data") or {}
    out = []
    add = lambda sev, title, detail: out.append({"severity": sev, "title": title, "detail": detail})

    health = g("site_health")
    if health and health.get("ok") is False:
        add("critical", "Website is down",
            f"{health.get('url')} returned {health.get('status') or health.get('error')}. "
            "Every ad dollar spent while it's down is wasted.")
    elif health and (health.get("seconds") or 0) > 4:
        add("warning", "Website is slow",
            f"Took {health['seconds']}s to load. Most of your traffic is on a phone on mobile data.")

    hist = history or []
    recent = [h for h in hist if h.get("date") < win["day"]][-3:]

    if summary["spend"] > 0 and not summary["leads"]:
        dry = [h for h in recent if h.get("spend", 0) > 0 and not h.get("leads")]
        if dry:
            add("critical", f"{len(dry) + 1} days of ad spend, no enquiries",
                f"${summary['spend']:.2f} yesterday and nothing came in, and the same the day before. "
                "Something is broken between the click and the booking form — check the site before adding budget.")
        else:
            add("warning", "Spent on ads, no enquiries",
                f"${summary['spend']:.2f} spent, nothing booked. One quiet day is normal; two is a problem.")

    if hist:
        spends = [h.get("spend", 0) for h in hist[-14:] if h.get("spend")]
        if spends:
            avg = sum(spends) / len(spends)
            if summary["spend"] > avg * 1.6 and summary["spend"] - avg > 25:
                add("warning", "Ad spend spiked",
                    f"${summary['spend']:.2f} against a ${avg:.2f} average. "
                    "Check nothing changed a budget or bid strategy overnight.")
        cpls = [h["cost_per_lead"] for h in hist[-14:] if h.get("cost_per_lead")]
        if cpls and summary.get("cost_per_lead"):
            avg_cpl = sum(cpls) / len(cpls)
            if summary["cost_per_lead"] > avg_cpl * 1.4:
                add("warning", "Leads got dearer",
                    f"${summary['cost_per_lead']:.2f} each against a ${avg_cpl:.2f} average.")

    rev = g("reviews")
    if rev:
        for r in rev.get("new_today", []):
            if r["stars"] <= 3:
                add("critical", f"{r['stars']}-star review from {r['author']}",
                    (r["comment"] or "No comment left.")[:200] + " — reply today; it's public and it ranks.")
            else:
                add("good", f"{r['stars']}-star review from {r['author']}", "Reply to it — replies help local ranking.")
        if rev.get("unanswered_count", 0) >= 3:
            add("warning", f"{rev['unanswered_count']} reviews unanswered",
                "Google weights reply rate in local ranking. Ten minutes clears the backlog.")

    job = g("jobber")
    if job:
        waiting = [q for q in job.get("quotes", {}).get("items", []) if "AWAIT" in str(q.get("status", "")).upper()]
        if waiting:
            v = sum(q["total"] for q in waiting)
            who = ", ".join(str(q.get("client") or f"#{q.get('number')}") for q in waiting[:4])
            add("warning", f"${v:,.0f} of quotes unanswered",
                f"{who} haven't come back. Quotes go cold fast — a same-week follow-up is the "
                "cheapest sale available today.")

    w = g("weather")
    if w and (w.get("rain_ahead_mm") or 0) >= 40:
        add("info", f"{w['rain_ahead_mm']:.0f}mm of rain forecast",
            "Exterior work will slide. Expect enquiries to dip — that's the weather, not the ads. "
            "Don't cut budget over it; push bins and indoor-adjacent work instead.")

    rank = {"critical": 0, "warning": 1, "info": 2, "good": 3}
    out.sort(key=lambda a: rank[a["severity"]])
    return out


def append_history(history, summary, win):
    """One row per day, kept forever. This is what makes 'is this normal for
    September' answerable instead of a guess."""
    history = [h for h in (history or []) if h.get("date") != win["day"]]
    history.append(
        {
            "date": win["day"],
            "spend": summary.get("spend"),
            "leads": summary.get("leads"),
            "cost_per_lead": summary.get("cost_per_lead"),
            "sessions": summary.get("sessions"),
            "quote_value": summary.get("quote_value"),
            "job_value": summary.get("job_value"),
            "revenue": summary.get("revenue"),
            "gbp_calls": summary.get("gbp_calls"),
            "gbp_views": summary.get("gbp_views"),
            "rain_mm": summary.get("rain_mm"),
        }
    )
    history.sort(key=lambda h: h["date"])
    return history[-800:]


def history_context(history, win):
    """Same-period comparisons the APIs can't give you."""
    if not history:
        return None
    from datetime import date

    def parse(d):
        y, m, dd = (int(x) for x in d.split("-"))
        return date(y, m, dd)

    today = parse(win["day"])
    rows = [h for h in history if h.get("date") < win["day"]]

    def window(days_back_start, days_back_end):
        lo, hi = today - timedelta(days=days_back_start), today - timedelta(days=days_back_end)
        return [h for h in rows if lo <= parse(h["date"]) <= hi]

    def avg(rs, key):
        vals = [r[key] for r in rs if r.get(key) is not None]
        return round(sum(vals) / len(vals), 2) if vals else None

    last30, prior30 = window(30, 1), window(60, 31)
    same_week_last_year = window(369, 362)

    return {
        "days_recorded": len(history),
        "last30": {k: avg(last30, k) for k in ("spend", "leads", "sessions", "revenue", "gbp_calls")},
        "prior30": {k: avg(prior30, k) for k in ("spend", "leads", "sessions", "revenue", "gbp_calls")},
        "same_week_last_year": {k: avg(same_week_last_year, k) for k in ("leads", "sessions")}
        if same_week_last_year
        else None,
        "series": [
            {"date": h["date"], "leads": h.get("leads"), "spend": h.get("spend"),
             "sessions": h.get("sessions"), "rain_mm": h.get("rain_mm")}
            for h in history[-120:]
        ],
    }


def sample_payload(win):
    import random

    random.seed(7)
    dates = [
        (datetime.fromisoformat(win["day"]) - timedelta(days=13 - i)).date().isoformat()
        for i in range(14)
    ]
    return {
        "ga4": {
            "label": "Website traffic (GA4)",
            "status": "ok",
            "message": None,
            "data": {
                "totals": {
                    "sessions": 138,
                    "totalUsers": 121,
                    "newUsers": 97,
                    "screenPageViews": 311,
                    "averageSessionDuration": 71.4,
                    "bounceRate": 0.48,
                    "keyEvents": 6,
                },
                "prev": {
                    "sessions": 112,
                    "totalUsers": 99,
                    "newUsers": 80,
                    "screenPageViews": 248,
                    "averageSessionDuration": 64.2,
                    "bounceRate": 0.53,
                    "keyEvents": 3,
                },
                "trail_avg": {
                    "sessions": 104.3,
                    "totalUsers": 92.1,
                    "newUsers": 74.0,
                    "screenPageViews": 232.9,
                    "averageSessionDuration": 66.0,
                    "bounceRate": 0.51,
                    "keyEvents": 3.4,
                },
                "channels": [
                    {"name": "Paid Search", "sessions": 54, "key_events": 3},
                    {"name": "Organic Search", "sessions": 41, "key_events": 2},
                    {"name": "Paid Social", "sessions": 26, "key_events": 1},
                    {"name": "Direct", "sessions": 12, "key_events": 0},
                    {"name": "Referral", "sessions": 5, "key_events": 0},
                ],
                "pages": [
                    {"path": "/", "views": 96, "sessions": 88, "avg_seconds": 43.1},
                    {"path": "/pressure-cleaning", "views": 61, "sessions": 52, "avg_seconds": 88.4},
                    {"path": "/prices", "views": 48, "sessions": 44, "avg_seconds": 112.7},
                    {"path": "/bin-cleaning", "views": 37, "sessions": 31, "avg_seconds": 79.2},
                    {"path": "/roof-cleaning", "views": 29, "sessions": 24, "avg_seconds": 95.0},
                    {"path": "/solar-panel-cleaning", "views": 21, "sessions": 18, "avg_seconds": 68.3},
                    {"path": "/commercial", "views": 11, "sessions": 9, "avg_seconds": 121.5},
                    {"path": "/contact", "views": 8, "sessions": 8, "avg_seconds": 34.0},
                ],
                "cities": [
                    {"name": "Cairns", "sessions": 79},
                    {"name": "Smithfield", "sessions": 14},
                    {"name": "Trinity Beach", "sessions": 11},
                    {"name": "Redlynch", "sessions": 9},
                    {"name": "Edmonton", "sessions": 7},
                    {"name": "Brisbane", "sessions": 6},
                    {"name": "(not set)", "sessions": 12},
                ],
                "devices": [
                    {"name": "mobile", "sessions": 101},
                    {"name": "desktop", "sessions": 29},
                    {"name": "tablet", "sessions": 8},
                ],
                "trend": [
                    {
                        "date": d.replace("-", ""),
                        "sessions": s,
                        "key_events": k,
                    }
                    for d, s, k in zip(
                        dates,
                        [88, 94, 101, 97, 86, 110, 118, 99, 104, 96, 112, 121, 112, 138],
                        [2, 3, 4, 2, 1, 3, 5, 3, 4, 2, 4, 5, 3, 6],
                    )
                ],
            },
        },
        "gsc": {
            "label": "Google search visibility",
            "status": "ok",
            "message": None,
            "data": {
                "window": {"start": win["gsc_start"], "end": win["gsc_end"]},
                "latest_day": {"date": win["gsc_end"], "clicks": 23, "impressions": 941, "ctr": 2.44, "position": 11.3},
                "prior_day": {"date": win["gsc_start"], "clicks": 18, "impressions": 874, "ctr": 2.06, "position": 12.1},
                "by_day": [],
                "queries": [
                    {"query": "bin cleaning cairns", "clicks": 31, "impressions": 288, "ctr": 10.76, "position": 2.1},
                    {"query": "pressure cleaning cairns", "clicks": 24, "impressions": 612, "ctr": 3.92, "position": 6.4},
                    {"query": "driveway cleaning cairns", "clicks": 14, "impressions": 331, "ctr": 4.23, "position": 7.8},
                    {"query": "roof cleaning cairns", "clicks": 9, "impressions": 402, "ctr": 2.24, "position": 12.6},
                    {"query": "solar panel cleaning cairns", "clicks": 7, "impressions": 188, "ctr": 3.72, "position": 9.2},
                    {"query": "wheelie bin cleaning near me", "clicks": 6, "impressions": 155, "ctr": 3.87, "position": 8.5},
                    {"query": "strata cleaning cairns", "clicks": 3, "impressions": 97, "ctr": 3.09, "position": 14.2},
                    {"query": "house washing cairns", "clicks": 2, "impressions": 264, "ctr": 0.76, "position": 18.9},
                ],
                "pages": [
                    {"page": "/", "clicks": 44, "impressions": 1102, "ctr": 3.99, "position": 5.6},
                    {"page": "/pressure-cleaning", "clicks": 28, "impressions": 884, "ctr": 3.17, "position": 8.1},
                    {"page": "/prices", "clicks": 12, "impressions": 231, "ctr": 5.19, "position": 6.9},
                ],
                "totals": {"clicks": 118, "impressions": 4271},
            },
        },
        "google_ads": {
            "label": "Google Ads",
            "status": "ok",
            "message": None,
            "data": {
                "campaigns": [
                    {
                        "name": "Search — Pressure Cleaning Cairns",
                        "status": "ENABLED",
                        "channel": "SEARCH",
                        "spend": 41.20,
                        "impressions": 612,
                        "clicks": 29,
                        "ctr": 4.74,
                        "cpc": 1.42,
                        "conversions": 2.0,
                        "cost_per_conversion": 20.60,
                        "impression_share": 61.4,
                    },
                    {
                        "name": "Search — Bin Cleaning",
                        "status": "ENABLED",
                        "channel": "SEARCH",
                        "spend": 18.75,
                        "impressions": 288,
                        "clicks": 17,
                        "ctr": 5.90,
                        "cpc": 1.10,
                        "conversions": 2.0,
                        "cost_per_conversion": 9.38,
                        "impression_share": 74.8,
                    },
                    {
                        "name": "Search — Commercial / Strata",
                        "status": "ENABLED",
                        "channel": "SEARCH",
                        "spend": 27.40,
                        "impressions": 204,
                        "clicks": 8,
                        "ctr": 3.92,
                        "cpc": 3.43,
                        "conversions": 0.0,
                        "cost_per_conversion": 0.0,
                        "impression_share": 38.2,
                    },
                ],
                "totals": {"spend": 87.35, "clicks": 54, "impressions": 1104, "conversions": 4.0},
                "search_terms": [
                    {"term": "pressure cleaning cairns", "campaign": "Search — Pressure Cleaning Cairns", "spend": 14.80, "clicks": 9, "impressions": 122, "conversions": 1.0},
                    {"term": "driveway pressure washing cairns", "campaign": "Search — Pressure Cleaning Cairns", "spend": 11.30, "clicks": 7, "impressions": 88, "conversions": 1.0},
                    {"term": "bin cleaning cairns", "campaign": "Search — Bin Cleaning", "spend": 9.90, "clicks": 9, "impressions": 141, "conversions": 2.0},
                    {"term": "commercial cleaning companies cairns", "campaign": "Search — Commercial / Strata", "spend": 8.60, "clicks": 2, "impressions": 41, "conversions": 0.0},
                    {"term": "office cleaning jobs cairns", "campaign": "Search — Commercial / Strata", "spend": 7.15, "clicks": 2, "impressions": 33, "conversions": 0.0},
                    {"term": "car wash cairns", "campaign": "Search — Pressure Cleaning Cairns", "spend": 5.40, "clicks": 3, "impressions": 62, "conversions": 0.0},
                    {"term": "how to clean a wheelie bin yourself", "campaign": "Search — Bin Cleaning", "spend": 4.20, "clicks": 4, "impressions": 79, "conversions": 0.0},
                ],
                "daily": [
                    {"date": d, "spend": s, "clicks": c, "conversions": v}
                    for d, s, c, v in zip(
                        dates,
                        [72.1, 80.4, 85.0, 78.2, 66.9, 91.3, 94.8, 82.0, 88.1, 79.6, 90.2, 96.4, 84.7, 87.35],
                        [40, 46, 49, 44, 38, 52, 55, 47, 50, 45, 51, 56, 48, 54],
                        [2, 3, 4, 2, 1, 3, 4, 3, 3, 2, 4, 4, 3, 4],
                    )
                ],
            },
        },
        "meta_ads": {
            "label": "Meta Ads",
            "status": "ok",
            "message": None,
            "data": {
                "campaigns": [
                    {
                        "name": "Bin Cleaning $35.95 — Cairns 25km",
                        "campaign": "",
                        "spend": 24.00,
                        "impressions": 4120,
                        "reach": 3180,
                        "clicks": 71,
                        "link_clicks": 44,
                        "ctr": 1.72,
                        "cpc": 0.34,
                        "cpm": 5.83,
                        "leads": 3.0,
                        "cost_per_lead": 8.00,
                        "actions": {},
                    },
                    {
                        "name": "Driveway Before/After — Retargeting",
                        "campaign": "",
                        "spend": 12.50,
                        "impressions": 1880,
                        "reach": 1104,
                        "clicks": 33,
                        "link_clicks": 21,
                        "ctr": 1.76,
                        "cpc": 0.38,
                        "cpm": 6.65,
                        "leads": 1.0,
                        "cost_per_lead": 12.50,
                        "actions": {},
                    },
                ],
                "ads": [
                    {"name": "Bin price — carousel", "campaign": "Bin Cleaning $35.95 — Cairns 25km", "spend": 15.20, "impressions": 2610, "clicks": 48, "ctr": 1.84, "cpc": 0.32, "leads": 2.0, "cost_per_lead": 7.60, "reach": 0, "link_clicks": 0, "cpm": 0, "actions": {}},
                    {"name": "Bin price — single image", "campaign": "Bin Cleaning $35.95 — Cairns 25km", "spend": 8.80, "impressions": 1510, "clicks": 23, "ctr": 1.52, "cpc": 0.38, "leads": 1.0, "cost_per_lead": 8.80, "reach": 0, "link_clicks": 0, "cpm": 0, "actions": {}},
                    {"name": "Driveway reel 15s", "campaign": "Driveway Before/After — Retargeting", "spend": 12.50, "impressions": 1880, "clicks": 33, "ctr": 1.76, "cpc": 0.38, "leads": 1.0, "cost_per_lead": 12.50, "reach": 0, "link_clicks": 0, "cpm": 0, "actions": {}},
                ],
                "totals": {"spend": 36.50, "impressions": 6000, "reach": 4284, "clicks": 104, "leads": 4.0},
                "daily": [
                    {"date": d, "spend": s, "clicks": c, "leads": l}
                    for d, s, c, l in zip(
                        dates,
                        [30.0, 33.5, 35.0, 31.2, 28.0, 38.4, 40.1, 34.0, 36.6, 32.1, 37.8, 39.2, 35.4, 36.5],
                        [82, 90, 96, 88, 74, 102, 110, 94, 99, 86, 104, 108, 97, 104],
                        [2, 3, 3, 2, 1, 4, 4, 3, 3, 2, 4, 5, 3, 4],
                    )
                ],
            },
        },
        "jobber": {
            "label": "Jobber bookings",
            "status": "ok",
            "message": None,
            "data": {
                "requests": {
                    "count": 6,
                    "items": [
                        {"title": "Driveway + path pressure clean", "client": "M. Doolan", "source": "Website", "at": ""},
                        {"title": "Fortnightly bins x2", "client": "T. Nguyen", "source": "Website", "at": ""},
                        {"title": "Roof wash quote", "client": "Palm Cove BC", "source": "Phone", "at": ""},
                        {"title": "Solar panel clean (18 panels)", "client": "R. Whitby", "source": "Website", "at": ""},
                        {"title": "Bin clean one-off", "client": "K. Farrar", "source": "Facebook", "at": ""},
                        {"title": "Refuse room revamp", "client": "Harbour Lights", "source": "Website", "at": ""},
                    ],
                },
                "quotes": {
                    "count": 3,
                    "value": 1142.50,
                    "items": [
                        {"number": 1184, "client": "Palm Cove BC", "total": 690.00, "status": "AWAITING_RESPONSE"},
                        {"number": 1185, "client": "R. Whitby", "total": 261.00, "status": "AWAITING_RESPONSE"},
                        {"number": 1186, "client": "M. Doolan", "total": 191.50, "status": "APPROVED"},
                    ],
                },
                "jobs": {
                    "count": 2,
                    "value": 266.45,
                    "items": [
                        {"number": 2211, "client": "M. Doolan", "total": 191.50},
                        {"number": 2212, "client": "T. Nguyen", "total": 74.95},
                    ],
                },
            },
        },
        "gbp": {
            "label": "Google Business Profile",
            "status": "ok",
            "message": None,
            "data": {
                "totals": {"search_views": 412, "maps_views": 289, "views": 701, "calls": 9,
                           "website_clicks": 38, "directions": 6, "messages": 2,
                           "actions": 55, "action_rate": 7.85},
                "prev": {"search_views": 388, "maps_views": 254, "views": 642, "calls": 6,
                         "website_clicks": 31, "directions": 4, "messages": 1,
                         "actions": 42, "action_rate": 6.54},
                "trail_avg": {"views": 618.4, "calls": 6.7, "website_clicks": 29.9,
                              "directions": 4.6, "actions": 41.3},
                "trend": [
                    {"date": d.replace("-", ""), "views": v, "calls": c, "website_clicks": w,
                     "directions": 5, "messages": 1, "actions": c + w + 6,
                     "search_views": 0, "maps_views": 0, "action_rate": 0}
                    for d, v, c, w in zip(
                        dates,
                        [560, 588, 604, 571, 522, 649, 671, 601, 627, 583, 655, 688, 642, 701],
                        [5, 7, 6, 5, 4, 8, 9, 6, 7, 5, 8, 9, 6, 9],
                        [24, 27, 29, 26, 22, 33, 35, 28, 31, 26, 34, 36, 31, 38],
                    )
                ],
            },
        },
        "reviews": {
            "label": "Google reviews",
            "status": "ok",
            "message": None,
            "data": {
                "average": 4.8,
                "total": 63,
                "new_today": [
                    {"author": "Dale P.", "stars": 5, "created": win["day"], "replied": False,
                     "comment": "Driveway looks brand new. Turned up when they said they would."}
                ],
                "unanswered": [
                    {"author": "Dale P.", "stars": 5, "created": win["day"], "replied": False, "comment": ""},
                    {"author": "Jen R.", "stars": 5, "created": win["prev"], "replied": False, "comment": ""},
                    {"author": "Mark T.", "stars": 4, "created": win["prev"], "replied": False, "comment": ""},
                ],
                "unanswered_count": 3,
                "recent": [],
            },
        },
        "xero": {
            "label": "Xero invoiced revenue",
            "status": "ok",
            "message": None,
            "data": {
                "invoiced_today": 486.40,
                "invoiced_prev": 312.00,
                "trail_avg": 398.10,
                "count_today": 4,
                "items": [
                    {"number": "INV-1841", "contact": "M. Doolan", "total": 191.50, "status": "AUTHORISED"},
                    {"number": "INV-1842", "contact": "Harbour Lights", "total": 139.00, "status": "AUTHORISED"},
                    {"number": "INV-1843", "contact": "T. Nguyen", "total": 74.95, "status": "PAID"},
                    {"number": "INV-1844", "contact": "K. Farrar", "total": 80.95, "status": "PAID"},
                ],
                "trend": [
                    {"date": d.replace("-", ""), "invoiced": v}
                    for d, v in zip(
                        dates,
                        [341.0, 402.5, 388.0, 296.4, 180.0, 455.9, 512.0, 366.0, 428.8,
                         301.2, 470.5, 523.4, 312.0, 486.4],
                    )
                ],
            },
        },
        "weather": {
            "label": "Cairns weather",
            "status": "ok",
            "message": None,
            "data": {
                "day": {"date": win["day"].replace("-", ""), "iso": win["day"],
                        "rain_mm": 0.4, "max_c": 29.8, "code": 2},
                "forecast": [
                    {"iso": "", "date": "", "rain_mm": 2.1, "max_c": 30.1, "code": 3},
                    {"iso": "", "date": "", "rain_mm": 18.6, "max_c": 28.4, "code": 61},
                    {"iso": "", "date": "", "rain_mm": 24.0, "max_c": 27.9, "code": 63},
                    {"iso": "", "date": "", "rain_mm": 9.2, "max_c": 28.8, "code": 61},
                ],
                "trend": [
                    {"date": d.replace("-", ""), "iso": d, "rain_mm": r, "max_c": 29.0, "code": 2}
                    for d, r in zip(dates, [0.0, 0.0, 1.2, 6.8, 22.4, 3.1, 0.0, 0.0,
                                            0.4, 0.0, 0.0, 2.6, 0.0, 0.4])
                ],
                "wet_days_14": 2,
                "rain_14_mm": 36.5,
                "rain_ahead_mm": 53.9,
            },
        },
        "site_health": {
            "label": "Website uptime & speed",
            "status": "ok",
            "message": None,
            "data": {
                "url": "https://www.zacsbinandpressurecleaning.com.au",
                "status": 200,
                "seconds": 1.42,
                "bytes": 184320,
                "ok": True,
            },
        },
    }


def sample_history(win):
    """Ninety days of plausible history so the sample page shows what the
    month-on-month and seasonal comparisons will look like once real days
    have accumulated."""
    import random

    random.seed(11)
    day = datetime.fromisoformat(win["day"]).date()
    rows = []
    for i in range(90, 0, -1):
        d = day - timedelta(days=i)
        weekend = d.weekday() >= 5
        base_leads = 2 if weekend else 5
        leads = max(0, base_leads + random.randint(-2, 3))
        spend = 0.0 if weekend and random.random() < 0.2 else round(random.uniform(70, 135), 2)
        rain = round(max(0.0, random.gauss(2.5, 6.0)), 1)
        if rain > 15:
            leads = max(0, leads - 2)
        rows.append(
            {
                "date": d.isoformat(),
                "spend": spend,
                "leads": leads,
                "cost_per_lead": round(spend / leads, 2) if leads else None,
                "sessions": int(90 + leads * 7 + random.randint(-18, 22)),
                "quote_value": round(leads * random.uniform(120, 340), 2),
                "job_value": round(leads * random.uniform(60, 180), 2),
                "revenue": round(random.uniform(180, 560), 2),
                "gbp_calls": max(0, 6 + random.randint(-4, 5)),
                "gbp_views": int(600 + random.randint(-120, 140)),
                "rain_mm": rain,
            }
        )
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", help="path to credentials JSON")
    ap.add_argument("--out", default="data.json")
    ap.add_argument("--sample", action="store_true", help="use realistic fake data")
    ap.add_argument("--only", help="comma-separated source keys")
    ap.add_argument("--date", help="override the report day, YYYY-MM-DD")
    ap.add_argument("--history", help="path to history.json; read and rewritten in place")
    args = ap.parse_args()

    ref = None
    if args.date:
        ref = datetime.fromisoformat(args.date).replace(tzinfo=BRISBANE) + timedelta(days=1)
    win = build_window(ref)

    history = []
    if args.history and os.path.exists(args.history):
        try:
            history = json.load(open(args.history))
            if not isinstance(history, list):
                history = []
        except Exception as e:  # noqa: BLE001 - a corrupt history must not stop the report
            print(f"  history unreadable, starting a fresh one: {e}")
            history = []

    if args.sample:
        src = sample_payload(win)
        if not history:
            history = sample_history(win)
    else:
        if not args.config:
            sys.exit("need --config (or --sample)")
        cfg = json.load(open(args.config))
        only = args.only.split(",") if args.only else None
        src = collect(cfg, win, only)

    summary = summarise(src, win, history)
    alerts = build_alerts(src, summary, win, history)
    history = append_history(history, summary, win)

    payload = {
        "window": win,
        "sources": src,
        "summary": summary,
        "alerts": alerts,
        "history": history_context(history, win),
        "sample": bool(args.sample),
    }
    with open(args.out, "w") as f:
        json.dump(payload, f, indent=2)

    if args.history:
        with open(args.history, "w") as f:
            json.dump(history, f, separators=(",", ":"))

    ready = [k for k, v in src.items() if v["status"] == "ok"]
    waiting = [k for k, v in src.items() if v["status"] == "not_configured"]
    broken = [k for k, v in src.items() if v["status"] == "error"]
    print(f"wrote {args.out}  day={win['day']}  history={len(history)} days")
    print(f"  live: {', '.join(ready) or 'none'}")
    if waiting:
        print(f"  not set up yet: {', '.join(waiting)}")
    for k in broken:
        print(f"  ERROR {k}: {src[k]['message']}")
    for a in alerts:
        print(f"  [{a['severity'].upper()}] {a['title']}")


if __name__ == "__main__":
    main()
