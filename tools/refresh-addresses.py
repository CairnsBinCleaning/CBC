"""Refresh data/cairns-addresses.txt from the national address file (G-NAF).

Run every few months so new houses show up in the instant quote search:
    python tools/refresh-addresses.py
Then commit data/cairns-addresses.txt and push.

Source: Digital Atlas of Australia "National Address Points" (G-NAF,
© Geoscape Australia, Open G-NAF licence / CC BY 4.0). Postcodes cover
Gordonvale to Palm Cove; add one to POSTCODES to widen the area.
"""
import json, re, time, urllib.parse, urllib.request
from pathlib import Path

POSTCODES = ["4865", "4868", "4869", "4870", "4878", "4879"]
URL = "https://services-ap1.arcgis.com/ypkPEy1AmwPKGNNv/arcgis/rest/services/national_address_points/FeatureServer/0/query"
FIELDS = ("FLAT_TYPE,FLAT_NUMBER_PREFIX,FLAT_NUMBER,FLAT_NUMBER_SUFFIX,NUMBER_FIRST_PREFIX,NUMBER_FIRST,"
          "NUMBER_FIRST_SUFFIX,NUMBER_LAST,NUMBER_LAST_SUFFIX,STREET_NAME,STREET_TYPE,STREET_SUFFIX,"
          "LOCALITY_NAME,POSTCODE,LATITUDE,LONGITUDE,ALIAS_PRINCIPAL")
FLAT_WORDS = {"SHOP": "Shop", "SHED": "Shed", "OFFC": "Office", "VLLA": "Villa", "DUPL": "Duplex",
              "SE": "Suite", "APT": "Apartment", "TNHS": "Townhouse", "FLAT": "Flat"}


def fetch(pc, offset):
    q = urllib.parse.urlencode({
        "where": f"STATE='QLD' AND POSTCODE='{pc}' AND DATE_RETIRED IS NULL",
        "outFields": FIELDS, "returnGeometry": "false", "resultOffset": offset,
        "resultRecordCount": 2000, "orderByFields": "OBJECTID", "f": "json"})
    for attempt in range(5):
        try:
            return json.load(urllib.request.urlopen(URL + "?" + q, timeout=60))
        except Exception:
            time.sleep(3 * (attempt + 1))
    raise SystemExit(f"Gave up on postcode {pc} at offset {offset}")


def title(s):
    s = s.title()
    s = re.sub(r"\bMc([a-z])", lambda m: "Mc" + m.group(1).upper(), s)
    return re.sub(r"\bO'([a-z])", lambda m: "O'" + m.group(1).upper(), s)


rows, seen = [], set()
for pc in POSTCODES:
    offset = 0
    while True:
        data = fetch(pc, offset)
        feats = [f["attributes"] for f in data.get("features", [])]
        offset += len(feats)
        for x in feats:
            if x["ALIAS_PRINCIPAL"] != "PRINCIPAL" or x["NUMBER_FIRST"] is None:
                continue
            num = f"{x['NUMBER_FIRST_PREFIX'] or ''}{x['NUMBER_FIRST']}{x['NUMBER_FIRST_SUFFIX'] or ''}"
            if x["NUMBER_LAST"]:
                num += f"-{x['NUMBER_LAST']}{x['NUMBER_LAST_SUFFIX'] or ''}"
            flat = ""
            if x["FLAT_NUMBER"] is not None:
                flat = f"{x['FLAT_NUMBER_PREFIX'] or ''}{x['FLAT_NUMBER']}{x['FLAT_NUMBER_SUFFIX'] or ''}"
            street = title(" ".join(p for p in [x["STREET_NAME"], x["STREET_TYPE"], x["STREET_SUFFIX"]] if p))
            place = f"{title(x['LOCALITY_NAME'])} {x['POSTCODE']}"
            if flat and x["FLAT_TYPE"] in FLAT_WORDS:
                label = f"{FLAT_WORDS[x['FLAT_TYPE']]} {flat}, {num} {street}, {place}"
            else:
                label = f"{flat + '/' if flat else ''}{num} {street}, {place}"
            if label not in seen:
                seen.add(label)
                rows.append(f"{label}|{round(x['LATITUDE'], 6)}|{round(x['LONGITUDE'], 6)}")
        if not data.get("exceededTransferLimit") and len(feats) < 2000:
            break
    print(pc, offset, "addresses")

rows.sort()
out = Path(__file__).resolve().parent.parent / "data" / "cairns-addresses.txt"
out.write_text("\n".join(rows), encoding="utf-8")
print(f"Wrote {len(rows)} addresses to {out}")
