"""One function per data source. Each returns a plain dict and raises on failure.
The orchestrator decides what to do with a failure — a source that isn't set up
yet must never take the whole report down."""

import requests
from auth import google_service_account_token, google_oauth_token

GA4_SCOPE = ["https://www.googleapis.com/auth/analytics.readonly"]
GSC_SCOPE = ["https://www.googleapis.com/auth/webmasters.readonly"]
TIMEOUT = 60


# ---------------------------------------------------------------- GA4

def _ga4_report(token, prop, body):
    r = requests.post(
        f"https://analyticsdata.googleapis.com/v1beta/properties/{prop}:runReport",
        headers={"Authorization": f"Bearer {token}"},
        json=body,
        timeout=TIMEOUT,
    )
    if r.status_code >= 400:
        raise RuntimeError(f"GA4 {r.status_code}: {r.text[:400]}")
    return r.json()


def _rows(resp):
    out = []
    for row in resp.get("rows", []):
        out.append(
            {
                "dims": [d.get("value", "") for d in row.get("dimensionValues", [])],
                "mets": [m.get("value", "0") for m in row.get("metricValues", [])],
            }
        )
    return out


def fetch_ga4(cfg, win):
    """Website traffic. Pulls the report day, the day before, and a 7-day trail
    in one set of calls so the dashboard can show real movement, not a bare number."""
    sa = cfg["google_service_account"]
    prop = str(cfg["ga4_property_id"])
    token = google_service_account_token(sa, GA4_SCOPE)

    metrics = [
        "sessions",
        "totalUsers",
        "newUsers",
        "screenPageViews",
        "averageSessionDuration",
        "bounceRate",
        "keyEvents",
    ]
    m = [{"name": x} for x in metrics]

    # Headline totals for day / prior day / 7-day trail
    totals = _ga4_report(
        token,
        prop,
        {
            "dateRanges": [
                {"startDate": win["day"], "endDate": win["day"], "name": "day"},
                {"startDate": win["prev"], "endDate": win["prev"], "name": "prev"},
                {"startDate": win["trail_start"], "endDate": win["trail_end"], "name": "trail7"},
            ],
            "metrics": m,
        },
    )

    def pick(name):
        for row in totals.get("rows", []):
            dv = [d.get("value") for d in row.get("dimensionValues", [])]
            if name in dv:
                return {
                    k: float(v.get("value", 0))
                    for k, v in zip(metrics, row.get("metricValues", []))
                }
        return {k: 0.0 for k in metrics}

    day, prev, trail = pick("day"), pick("prev"), pick("trail7")
    trail_avg = {k: v / 7.0 for k, v in trail.items()}

    dr = [{"startDate": win["day"], "endDate": win["day"]}]

    channels = _rows(
        _ga4_report(
            token,
            prop,
            {
                "dateRanges": dr,
                "dimensions": [{"name": "sessionDefaultChannelGroup"}],
                "metrics": [{"name": "sessions"}, {"name": "keyEvents"}],
                "orderBys": [{"metric": {"metricName": "sessions"}, "desc": True}],
                "limit": 12,
            },
        )
    )

    pages = _rows(
        _ga4_report(
            token,
            prop,
            {
                "dateRanges": dr,
                "dimensions": [{"name": "pagePath"}],
                "metrics": [
                    {"name": "screenPageViews"},
                    {"name": "sessions"},
                    {"name": "averageSessionDuration"},
                ],
                "orderBys": [{"metric": {"metricName": "screenPageViews"}, "desc": True}],
                "limit": 15,
            },
        )
    )

    cities = _rows(
        _ga4_report(
            token,
            prop,
            {
                "dateRanges": dr,
                "dimensions": [{"name": "city"}],
                "metrics": [{"name": "sessions"}],
                "orderBys": [{"metric": {"metricName": "sessions"}, "desc": True}],
                "limit": 12,
            },
        )
    )

    devices = _rows(
        _ga4_report(
            token,
            prop,
            {
                "dateRanges": dr,
                "dimensions": [{"name": "deviceCategory"}],
                "metrics": [{"name": "sessions"}],
            },
        )
    )

    # 14 days of sessions for the trend line
    trend = _rows(
        _ga4_report(
            token,
            prop,
            {
                "dateRanges": [{"startDate": win["trend_start"], "endDate": win["day"]}],
                "dimensions": [{"name": "date"}],
                "metrics": [{"name": "sessions"}, {"name": "keyEvents"}],
                "orderBys": [{"dimension": {"dimensionName": "date"}}],
                "limit": 40,
            },
        )
    )

    return {
        "totals": day,
        "prev": prev,
        "trail_avg": trail_avg,
        "channels": [
            {"name": r["dims"][0], "sessions": int(float(r["mets"][0])), "key_events": int(float(r["mets"][1]))}
            for r in channels
        ],
        "pages": [
            {
                "path": r["dims"][0],
                "views": int(float(r["mets"][0])),
                "sessions": int(float(r["mets"][1])),
                "avg_seconds": float(r["mets"][2]),
            }
            for r in pages
        ],
        "cities": [{"name": r["dims"][0], "sessions": int(float(r["mets"][0]))} for r in cities],
        "devices": [{"name": r["dims"][0], "sessions": int(float(r["mets"][0]))} for r in devices],
        "trend": [
            {"date": r["dims"][0], "sessions": int(float(r["mets"][0])), "key_events": int(float(r["mets"][1]))}
            for r in trend
        ],
    }


# ---------------------------------------------- Google Search Console

def fetch_gsc(cfg, win):
    """What people typed into Google to land on the site. GSC lags ~2 days,
    so this reports the freshest complete day it actually has."""
    sa = cfg["google_service_account"]
    site = cfg["search_console_site"]
    token = google_service_account_token(sa, GSC_SCOPE)
    url = (
        "https://www.googleapis.com/webmasters/v3/sites/"
        f"{requests.utils.quote(site, safe='')}/searchAnalytics/query"
    )

    def q(body):
        r = requests.post(url, headers={"Authorization": f"Bearer {token}"}, json=body, timeout=TIMEOUT)
        if r.status_code >= 400:
            raise RuntimeError(f"Search Console {r.status_code}: {r.text[:400]}")
        return r.json().get("rows", [])

    base = {"startDate": win["gsc_start"], "endDate": win["gsc_end"], "dataState": "all"}

    by_day = q({**base, "dimensions": ["date"], "rowLimit": 30})
    queries = q({**base, "dimensions": ["query"], "rowLimit": 25})
    pages = q({**base, "dimensions": ["page"], "rowLimit": 15})

    def norm(rows, key):
        return [
            {
                key: r["keys"][0],
                "clicks": int(r.get("clicks", 0)),
                "impressions": int(r.get("impressions", 0)),
                "ctr": round(r.get("ctr", 0) * 100, 2),
                "position": round(r.get("position", 0), 1),
            }
            for r in rows
        ]

    days = norm(by_day, "date")
    latest = days[-1] if days else None
    prior = days[-2] if len(days) > 1 else None

    return {
        "window": {"start": win["gsc_start"], "end": win["gsc_end"]},
        "latest_day": latest,
        "prior_day": prior,
        "by_day": days,
        "queries": norm(queries, "query"),
        "pages": norm(pages, "page"),
        "totals": {
            "clicks": sum(d["clicks"] for d in days),
            "impressions": sum(d["impressions"] for d in days),
        },
    }


# ----------------------------------------------------------- Google Ads

GAQL_CAMPAIGNS = """
SELECT campaign.name, campaign.status, campaign.advertising_channel_type,
       metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.ctr,
       metrics.average_cpc, metrics.conversions, metrics.cost_per_conversion,
       metrics.search_impression_share
FROM campaign
WHERE segments.date BETWEEN '{start}' AND '{end}'
  AND metrics.impressions > 0
ORDER BY metrics.cost_micros DESC
"""

GAQL_TERMS = """
SELECT search_term_view.search_term, campaign.name,
       metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.conversions
FROM search_term_view
WHERE segments.date BETWEEN '{start}' AND '{end}'
ORDER BY metrics.cost_micros DESC
LIMIT 30
"""

GAQL_DAILY = """
SELECT segments.date, metrics.cost_micros, metrics.clicks, metrics.conversions
FROM customer
WHERE segments.date BETWEEN '{start}' AND '{end}'
ORDER BY segments.date
"""


def _ads_query(cfg, token, query):
    cid = str(cfg["google_ads_customer_id"]).replace("-", "")
    login_cid = str(cfg.get("google_ads_login_customer_id", "")).replace("-", "")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    # Developer tokens were sunset 9 Sep 2026 and access now attaches to the
    # Cloud project. The header is still accepted, so send it when one exists.
    if cfg.get("google_ads_developer_token"):
        headers["developer-token"] = cfg["google_ads_developer_token"]
    if login_cid:
        headers["login-customer-id"] = login_cid
    r = requests.post(
        f"https://googleads.googleapis.com/v25/customers/{cid}/googleAds:searchStream",
        headers=headers,
        json={"query": query},
        timeout=TIMEOUT,
    )
    if r.status_code >= 400:
        raise RuntimeError(f"Google Ads {r.status_code}: {r.text[:400]}")
    out = []
    for chunk in r.json():
        out.extend(chunk.get("results", []))
    return out


def _g(d, *path, default=0):
    for p in path:
        if not isinstance(d, dict) or p not in d:
            return default
        d = d[p]
    return d


def fetch_google_ads(cfg, win):
    token = google_oauth_token(
        cfg["google_ads_client_id"],
        cfg["google_ads_client_secret"],
        cfg["google_ads_refresh_token"],
    )
    day = {"start": win["day"], "end": win["day"]}

    campaigns = _ads_query(cfg, token, GAQL_CAMPAIGNS.format(**day))
    terms = _ads_query(cfg, token, GAQL_TERMS.format(**day))
    daily = _ads_query(
        cfg, token, GAQL_DAILY.format(start=win["trend_start"], end=win["day"])
    )

    def camp(r):
        m = r.get("metrics", {})
        return {
            "name": _g(r, "campaign", "name", default=""),
            "status": _g(r, "campaign", "status", default=""),
            "channel": _g(r, "campaign", "advertisingChannelType", default=""),
            "spend": float(m.get("costMicros", 0)) / 1e6,
            "impressions": int(m.get("impressions", 0)),
            "clicks": int(m.get("clicks", 0)),
            "ctr": round(float(m.get("ctr", 0)) * 100, 2),
            "cpc": float(m.get("averageCpc", 0)) / 1e6,
            "conversions": float(m.get("conversions", 0)),
            "cost_per_conversion": float(m.get("costPerConversion", 0)) / 1e6,
            "impression_share": round(float(m.get("searchImpressionShare", 0)) * 100, 1),
        }

    camps = [camp(r) for r in campaigns]

    return {
        "campaigns": camps,
        "totals": {
            "spend": sum(c["spend"] for c in camps),
            "clicks": sum(c["clicks"] for c in camps),
            "impressions": sum(c["impressions"] for c in camps),
            "conversions": sum(c["conversions"] for c in camps),
        },
        "search_terms": [
            {
                "term": _g(r, "searchTermView", "searchTerm", default=""),
                "campaign": _g(r, "campaign", "name", default=""),
                "spend": float(_g(r, "metrics", "costMicros")) / 1e6,
                "clicks": int(_g(r, "metrics", "clicks")),
                "impressions": int(_g(r, "metrics", "impressions")),
                "conversions": float(_g(r, "metrics", "conversions")),
            }
            for r in terms
        ],
        "daily": [
            {
                "date": _g(r, "segments", "date", default=""),
                "spend": float(_g(r, "metrics", "costMicros")) / 1e6,
                "clicks": int(_g(r, "metrics", "clicks")),
                "conversions": float(_g(r, "metrics", "conversions")),
            }
            for r in daily
        ],
    }


# ------------------------------------------------------------- Meta Ads

META_VERSION = "v21.0"


def _meta_get(path, token, params):
    r = requests.get(
        f"https://graph.facebook.com/{META_VERSION}/{path}",
        params={**params, "access_token": token},
        timeout=TIMEOUT,
    )
    if r.status_code >= 400:
        raise RuntimeError(f"Meta {r.status_code}: {r.text[:400]}")
    return r.json()


def _meta_actions(row):
    """Meta buries leads inside an 'actions' array. Pull out the ones that
    actually mean a customer contacted the business."""
    lead_types = {
        "lead",
        "onsite_conversion.lead_grouped",
        "offsite_conversion.fb_pixel_lead",
        "onsite_conversion.messaging_conversation_started_7d",
        "onsite_conversion.total_messaging_connection",
        "click_to_call_call_confirm",
    }
    leads, breakdown = 0.0, {}
    for a in row.get("actions", []) or []:
        t, v = a.get("action_type", ""), float(a.get("value", 0))
        breakdown[t] = v
        if t in lead_types:
            leads += v
    return leads, breakdown


def fetch_meta_ads(cfg, win):
    token = cfg["meta_access_token"]
    acct = str(cfg["meta_ad_account_id"])
    if not acct.startswith("act_"):
        acct = "act_" + acct

    fields = (
        "campaign_name,spend,impressions,reach,frequency,clicks,ctr,cpc,cpm,"
        "actions,action_values,inline_link_clicks"
    )
    day = {"since": win["day"], "until": win["day"]}

    camp_rows = _meta_get(
        f"{acct}/insights",
        token,
        {"fields": fields, "level": "campaign", "time_range": str(day).replace("'", '"')},
    ).get("data", [])

    ad_rows = _meta_get(
        f"{acct}/insights",
        token,
        {
            "fields": "ad_name,campaign_name,spend,impressions,clicks,ctr,cpc,actions",
            "level": "ad",
            "limit": 25,
            "time_range": str(day).replace("'", '"'),
        },
    ).get("data", [])

    daily_rows = _meta_get(
        f"{acct}/insights",
        token,
        {
            "fields": "spend,clicks,impressions,actions",
            "level": "account",
            "time_increment": 1,
            "time_range": str({"since": win["trend_start"], "until": win["day"]}).replace("'", '"'),
        },
    ).get("data", [])

    def norm(r, name_key):
        leads, breakdown = _meta_actions(r)
        return {
            "name": r.get(name_key, ""),
            "campaign": r.get("campaign_name", ""),
            "spend": float(r.get("spend", 0)),
            "impressions": int(r.get("impressions", 0)),
            "reach": int(r.get("reach", 0)),
            "clicks": int(r.get("clicks", 0)),
            "link_clicks": int(r.get("inline_link_clicks", 0) or 0),
            "ctr": round(float(r.get("ctr", 0)), 2),
            "cpc": float(r.get("cpc", 0) or 0),
            "cpm": float(r.get("cpm", 0) or 0),
            "leads": leads,
            "cost_per_lead": (float(r.get("spend", 0)) / leads) if leads else None,
            "actions": breakdown,
        }

    camps = [norm(r, "campaign_name") for r in camp_rows]
    ads = [norm(r, "ad_name") for r in ad_rows]
    ads.sort(key=lambda a: a["spend"], reverse=True)

    return {
        "campaigns": camps,
        "ads": ads,
        "totals": {
            "spend": sum(c["spend"] for c in camps),
            "impressions": sum(c["impressions"] for c in camps),
            "reach": sum(c["reach"] for c in camps),
            "clicks": sum(c["clicks"] for c in camps),
            "leads": sum(c["leads"] for c in camps),
        },
        "daily": [
            {
                "date": r.get("date_start", ""),
                "spend": float(r.get("spend", 0)),
                "clicks": int(r.get("clicks", 0)),
                "leads": _meta_actions(r)[0],
            }
            for r in daily_rows
        ],
    }


# --------------------------------------------------------------- Jobber

JOBBER_QUERY = """
query DailyPulse($after: ISO8601DateTime!) {
  requests(filter: {createdAt: {after: $after}}, first: 50) {
    totalCount
    nodes { id title createdAt source client { name } }
  }
  quotes(filter: {createdAt: {after: $after}}, first: 50) {
    totalCount
    nodes { id quoteNumber amounts { total } quoteStatus createdAt client { name } }
  }
  jobs(filter: {createdAt: {after: $after}}, first: 50) {
    totalCount
    nodes { id jobNumber total createdAt client { name } }
  }
}
"""


def fetch_jobber(cfg, win):
    """Bookings and quotes — the only numbers on this page that are actually money."""
    token = cfg["jobber_access_token"]
    r = requests.post(
        "https://api.getjobber.com/api/graphql",
        headers={
            "Authorization": f"Bearer {token}",
            "X-JOBBER-GRAPHQL-VERSION": cfg.get("jobber_api_version", "2025-01-20"),
            "Content-Type": "application/json",
        },
        json={"query": JOBBER_QUERY, "variables": {"after": win["day_start_iso"]}},
        timeout=TIMEOUT,
    )
    if r.status_code >= 400:
        raise RuntimeError(f"Jobber {r.status_code}: {r.text[:400]}")
    body = r.json()
    if body.get("errors"):
        raise RuntimeError(f"Jobber: {str(body['errors'])[:400]}")
    d = body["data"]

    quotes = d["quotes"]["nodes"]
    return {
        "requests": {
            "count": d["requests"]["totalCount"],
            "items": [
                {
                    "title": n.get("title"),
                    "client": (n.get("client") or {}).get("name"),
                    "source": n.get("source"),
                    "at": n.get("createdAt"),
                }
                for n in d["requests"]["nodes"]
            ],
        },
        "quotes": {
            "count": d["quotes"]["totalCount"],
            "value": sum(float((q.get("amounts") or {}).get("total", 0) or 0) for q in quotes),
            "items": [
                {
                    "number": q.get("quoteNumber"),
                    "client": (q.get("client") or {}).get("name"),
                    "total": float((q.get("amounts") or {}).get("total", 0) or 0),
                    "status": q.get("quoteStatus"),
                }
                for q in quotes
            ],
        },
        "jobs": {
            "count": d["jobs"]["totalCount"],
            "value": sum(float(j.get("total", 0) or 0) for j in d["jobs"]["nodes"]),
            "items": [
                {
                    "number": j.get("jobNumber"),
                    "client": (j.get("client") or {}).get("name"),
                    "total": float(j.get("total", 0) or 0),
                }
                for j in d["jobs"]["nodes"]
            ],
        },
    }



# ------------------------------------------- Google Business Profile

GBP_SCOPE = ["https://www.googleapis.com/auth/business.manage"]

# The metrics worth a tradie's attention. Impressions are split four ways by
# Google; we roll them up but keep search-vs-maps, because "found us on Maps"
# and "searched our name" are different customers.
GBP_METRICS = [
    "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
    "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
    "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
    "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
    "CALL_CLICKS",
    "WEBSITE_CLICKS",
    "BUSINESS_DIRECTION_REQUESTS",
    "BUSINESS_CONVERSATIONS",
]


def _gbp_token(cfg):
    """GBP is a user-owned surface — Google does not support service accounts
    here, so this uses its own OAuth refresh token."""
    return google_oauth_token(
        cfg["gbp_client_id"], cfg["gbp_client_secret"], cfg["gbp_refresh_token"]
    )


def _d(datestr):
    y, m, d = datestr.split("-")
    return {"year": int(y), "month": int(m), "day": int(d)}


def fetch_gbp(cfg, win):
    """Google Business Profile — for a local trade this usually out-pulls the
    website. Calls, direction requests and website taps straight off the listing."""
    token = _gbp_token(cfg)
    loc = str(cfg["gbp_location_id"])
    if not loc.startswith("locations/"):
        loc = "locations/" + loc

    start, end = _d(win["trend_start"]), _d(win["day"])
    params = [("dailyMetrics", m) for m in GBP_METRICS]
    for k, v in start.items():
        params.append((f"dailyRange.start_date.{k}", v))
    for k, v in end.items():
        params.append((f"dailyRange.end_date.{k}", v))

    r = requests.get(
        f"https://businessprofileperformance.googleapis.com/v1/{loc}:fetchMultiDailyMetricsTimeSeries",
        headers={"Authorization": f"Bearer {token}"},
        params=params,
        timeout=TIMEOUT,
    )
    if r.status_code >= 400:
        raise RuntimeError(f"Business Profile {r.status_code}: {r.text[:400]}")

    series = {}
    for block in r.json().get("multiDailyMetricTimeSeries", []):
        for ts in block.get("dailyMetricTimeSeries", []):
            name = ts.get("dailyMetric")
            points = {}
            for p in (ts.get("timeSeries") or {}).get("datedValues", []):
                dd = p.get("date", {})
                key = f"{dd.get('year'):04d}-{dd.get('month'):02d}-{dd.get('day'):02d}"
                points[key] = int(p.get("value", 0) or 0)
            series[name] = points

    def on(day, *names):
        return sum(series.get(n, {}).get(day, 0) for n in names)

    def snapshot(day):
        search = on(day, "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH", "BUSINESS_IMPRESSIONS_MOBILE_SEARCH")
        maps = on(day, "BUSINESS_IMPRESSIONS_DESKTOP_MAPS", "BUSINESS_IMPRESSIONS_MOBILE_MAPS")
        calls = on(day, "CALL_CLICKS")
        clicks = on(day, "WEBSITE_CLICKS")
        directions = on(day, "BUSINESS_DIRECTION_REQUESTS")
        messages = on(day, "BUSINESS_CONVERSATIONS")
        seen = search + maps
        return {
            "search_views": search,
            "maps_views": maps,
            "views": seen,
            "calls": calls,
            "website_clicks": clicks,
            "directions": directions,
            "messages": messages,
            "actions": calls + clicks + directions + messages,
            "action_rate": round((calls + clicks + directions + messages) / seen * 100, 2) if seen else 0.0,
        }

    days = sorted({d for pts in series.values() for d in pts})
    trail = [snapshot(d) for d in days[-8:-1]]
    n = len(trail) or 1

    return {
        "totals": snapshot(win["day"]),
        "prev": snapshot(win["prev"]),
        "trail_avg": {
            k: round(sum(t[k] for t in trail) / n, 1)
            for k in ("views", "calls", "website_clicks", "directions", "actions")
        },
        "trend": [{"date": d.replace("-", ""), **snapshot(d)} for d in days],
    }


def fetch_reviews(cfg, win):
    """New Google reviews. Local ranking runs on these, and an unanswered
    one-star costs more than a bad ad day."""
    token = _gbp_token(cfg)
    account = str(cfg["gbp_account_id"])
    if not account.startswith("accounts/"):
        account = "accounts/" + account
    loc = str(cfg["gbp_location_id"])
    if loc.startswith("locations/"):
        loc = loc.split("/", 1)[1]

    r = requests.get(
        f"https://mybusiness.googleapis.com/v4/{account}/locations/{loc}/reviews",
        headers={"Authorization": f"Bearer {token}"},
        params={"pageSize": 50, "orderBy": "updateTime desc"},
        timeout=TIMEOUT,
    )
    if r.status_code >= 400:
        raise RuntimeError(f"Reviews {r.status_code}: {r.text[:400]}")
    body = r.json()

    stars = {"ONE": 1, "TWO": 2, "THREE": 3, "FOUR": 4, "FIVE": 5}
    items, new_today, unanswered = [], [], []
    for rv in body.get("reviews", []):
        created = (rv.get("createTime") or "")[:10]
        item = {
            "author": (rv.get("reviewer") or {}).get("displayName", "Someone"),
            "stars": stars.get(rv.get("starRating", ""), 0),
            "comment": (rv.get("comment") or "").strip()[:400],
            "created": created,
            "replied": bool(rv.get("reviewReply")),
        }
        items.append(item)
        if created == win["day"]:
            new_today.append(item)
        if not item["replied"]:
            unanswered.append(item)

    return {
        "average": round(float(body.get("averageRating", 0) or 0), 2),
        "total": int(body.get("totalReviewCount", 0) or 0),
        "new_today": new_today,
        "unanswered": unanswered[:10],
        "unanswered_count": len(unanswered),
        "recent": items[:10],
    }


# ----------------------------------------------------------------- Xero

def fetch_xero(cfg, win):
    """What was actually invoiced. Ad spend against real revenue beats ad spend
    against platform-claimed conversions every time."""
    r = requests.post(
        "https://identity.xero.com/connect/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": cfg["xero_refresh_token"],
            "client_id": cfg["xero_client_id"],
            "client_secret": cfg["xero_client_secret"],
        },
        timeout=TIMEOUT,
    )
    if r.status_code >= 400:
        raise RuntimeError(f"Xero auth {r.status_code}: {r.text[:300]}")
    access = r.json()["access_token"]

    headers = {
        "Authorization": f"Bearer {access}",
        "Xero-tenant-id": cfg["xero_tenant_id"],
        "Accept": "application/json",
    }
    # Pull the whole trend window in one call, then split by day locally.
    where = f'Type=="ACCREC" AND Date>=DateTime({win["trend_start"].replace("-", ",")})'
    inv = requests.get(
        "https://api.xero.com/api.xro/2.0/Invoices",
        headers=headers,
        params={"where": where, "order": "Date DESC", "page": 1},
        timeout=TIMEOUT,
    )
    if inv.status_code >= 400:
        raise RuntimeError(f"Xero {inv.status_code}: {inv.text[:300]}")

    rows = inv.json().get("Invoices", [])
    by_day = {}
    day_items = []
    for i in rows:
        d = (i.get("DateString") or i.get("Date") or "")[:10]
        total = float(i.get("Total", 0) or 0)
        by_day[d] = by_day.get(d, 0.0) + total
        if d == win["day"]:
            day_items.append(
                {
                    "number": i.get("InvoiceNumber"),
                    "contact": (i.get("Contact") or {}).get("Name"),
                    "total": total,
                    "status": i.get("Status"),
                }
            )

    trail_days = sorted(by_day)[-8:-1]
    return {
        "invoiced_today": round(by_day.get(win["day"], 0.0), 2),
        "invoiced_prev": round(by_day.get(win["prev"], 0.0), 2),
        "trail_avg": round(sum(by_day.get(d, 0) for d in trail_days) / (len(trail_days) or 1), 2),
        "count_today": len(day_items),
        "items": day_items,
        "trend": [{"date": d.replace("-", ""), "invoiced": round(v, 2)} for d, v in sorted(by_day.items())],
    }


# --------------------------------------------------------------- Weather

CAIRNS = {"latitude": -16.9203, "longitude": 145.7710}


def fetch_weather(cfg, win):
    """Rain beside the lead count. In FNQ a quiet week in the wet is weather,
    not a broken campaign — and turning ads off for weather is an expensive
    mistake. Free, no key, no account."""
    r = requests.get(
        "https://api.open-meteo.com/v1/forecast",
        params={
            **CAIRNS,
            "daily": "precipitation_sum,temperature_2m_max,weather_code",
            "timezone": "Australia/Brisbane",
            "past_days": 14,
            "forecast_days": 4,
        },
        timeout=TIMEOUT,
    )
    if r.status_code >= 400:
        raise RuntimeError(f"Weather {r.status_code}: {r.text[:300]}")
    d = r.json().get("daily", {})
    dates = d.get("time", [])
    rain = d.get("precipitation_sum", [])
    tmax = d.get("temperature_2m_max", [])
    codes = d.get("weather_code", [])

    rows = [
        {
            "date": dt.replace("-", ""),
            "iso": dt,
            "rain_mm": round(float(rain[i] or 0), 1),
            "max_c": round(float(tmax[i] or 0), 1),
            "code": int(codes[i] or 0),
        }
        for i, dt in enumerate(dates)
    ]
    today_row = next((r_ for r_ in rows if r_["iso"] == win["day"]), None)
    ahead = [r_ for r_ in rows if r_["iso"] > win["day"]][:4]
    past14 = [r_ for r_ in rows if r_["iso"] <= win["day"]]

    return {
        "day": today_row,
        "forecast": ahead,
        "trend": rows,
        "wet_days_14": sum(1 for r_ in past14 if r_["rain_mm"] >= 5),
        "rain_14_mm": round(sum(r_["rain_mm"] for r_ in past14), 1),
        "rain_ahead_mm": round(sum(r_["rain_mm"] for r_ in ahead), 1),
    }


# ----------------------------------------------------------- Site health

def fetch_site_health(cfg, win):
    """If the site is slow or down at 7am, the day's leads are gone and no
    other number on this page will tell you why."""
    import time as _t

    url = cfg["site_url"]
    out = {"url": url}
    try:
        t0 = _t.perf_counter()
        r = requests.get(url, timeout=30, headers={"User-Agent": "CBC-MorningWashUp/1.0"})
        out["status"] = r.status_code
        out["seconds"] = round(_t.perf_counter() - t0, 2)
        out["bytes"] = len(r.content)
        out["ok"] = r.status_code < 400
    except Exception as e:  # noqa: BLE001
        out.update({"status": None, "seconds": None, "bytes": None, "ok": False, "error": str(e)[:200]})
    return out


REGISTRY = {
    "ga4": (fetch_ga4, ["google_service_account", "ga4_property_id"], "Website traffic (GA4)"),
    "gsc": (fetch_gsc, ["google_service_account", "search_console_site"], "Google search visibility"),
    "google_ads": (
        fetch_google_ads,
        [
            "google_ads_client_id",
            "google_ads_client_secret",
            "google_ads_refresh_token",
            "google_ads_customer_id",
        ],
        "Google Ads",
    ),
    "meta_ads": (fetch_meta_ads, ["meta_access_token", "meta_ad_account_id"], "Meta Ads"),
    "jobber": (fetch_jobber, ["jobber_access_token"], "Jobber bookings"),
    "gbp": (
        fetch_gbp,
        ["gbp_client_id", "gbp_client_secret", "gbp_refresh_token", "gbp_location_id"],
        "Google Business Profile",
    ),
    "reviews": (
        fetch_reviews,
        ["gbp_client_id", "gbp_client_secret", "gbp_refresh_token", "gbp_location_id", "gbp_account_id"],
        "Google reviews",
    ),
    "xero": (
        fetch_xero,
        ["xero_client_id", "xero_client_secret", "xero_refresh_token", "xero_tenant_id"],
        "Xero invoiced revenue",
    ),
    "weather": (fetch_weather, [], "Cairns weather"),
    "site_health": (fetch_site_health, ["site_url"], "Website uptime & speed"),
}
