"""Select public OSM charging-location fields from a local extract, not via Overpass.

Requires osmium==4.3.2. Run --help. Large PBF and intermediate JSON stay outside git;
the TypeScript importer validates and publishes only the small station snapshot.
"""
import argparse
import hashlib
import json
from pathlib import Path

SOCKETS = {"type2", "type2_cable", "type1", "schuko", "nema_5_15", "brazilian", "ccs2",
           "type2_combo", "chademo", "tesla_supercharger", "tesla_ccs", "gb_t"}
FIELDS = {"amenity", "name", "brand", "operator", "network", "access", "motorcar", "capacity", "addr:country", "addr:city",
          "addr:town", "addr:state", "addr:street", "addr:housenumber", "disused", "abandoned",
          "construction", "proposed"} | {f"socket:{key}{suffix}" for key in SOCKETS for suffix in ("", ":output")}
SOURCE_URL = "https://download.geofabrik.de/south-america/brazil-261108.osm.pbf"
SOURCE_MD5 = "e0076a91afd957aa8f18318be6185356"


def copy_fields(obj, kind):
    record = {"type": kind, "id": obj.id,
              "tags": {tag.k: tag.v for tag in obj.tags if tag.k in FIELDS}}
    if obj.timestamp.year > 1970:
        record["timestamp"] = obj.timestamp.isoformat().replace("+00:00", "Z")
    return record


def extract_chargers(path, data_until=None):
    import osmium
    processor = osmium.FileProcessor(str(path)).with_filter(osmium.filter.TagFilter(("amenity", "charging_station")))
    header_time = processor.header.get("osmosis_replication_timestamp")
    timestamp = header_time or data_until
    if not timestamp:
        raise ValueError("An extract data timestamp is required; retrieval time is not source time.")
    if header_time and data_until and header_time != data_until:
        raise ValueError("Extract header timestamp does not match the declared timestamp.")
    elements, ways, needed = [], [], set()
    matched = missing_geometry = 0
    for obj in processor:
        matched += 1
        if obj.is_node() and obj.location.valid():
            record = copy_fields(obj, "node")
            record.update(lat=obj.location.lat, lon=obj.location.lon)
            elements.append(record)
        elif obj.is_way():
            refs = [node.ref for node in obj.nodes]
            ways.append((copy_fields(obj, "way"), refs))
            needed.update(refs)
        else:
            missing_geometry += 1
    print(f"OSM tag pass: {matched} charging elements; {len(needed)} way node references", flush=True)
    coordinates = {}
    if needed:
        nodes = osmium.FileProcessor(str(path)).with_filter(osmium.filter.EntityFilter(osmium.osm.NODE))
        nodes = nodes.with_filter(osmium.filter.IdFilter(needed))
        for node in nodes:
            if node.location.valid():
                coordinates[node.id] = (node.location.lat, node.location.lon)
    for record, refs in ways:
        if not refs or any(ref not in coordinates for ref in refs):
            missing_geometry += 1
            continue
        latitudes = [coordinates[ref][0] for ref in refs]
        longitudes = [coordinates[ref][1] for ref in refs]
        record["center"] = {"lat": (min(latitudes) + max(latitudes)) / 2,
                            "lon": (min(longitudes) + max(longitudes)) / 2}
        record["positionMethod"] = "area-center"
        elements.append(record)
    if not elements:
        raise ValueError("Refusing an empty extract result.")
    return {"osm3s": {"timestamp_osm_base": timestamp}, "elements": elements,
            "statistics": {"matchedInput": matched, "withoutCompleteGeometry": missing_geometry}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--data-until", help="Optional expected ISO timestamp; checked against the PBF header.")
    args = parser.parse_args()
    if args.output.resolve().is_relative_to(Path.cwd().resolve()):
        raise ValueError("Write intermediate data outside the public repository.")
    checksum = hashlib.md5()
    with args.input.open("rb") as stream:
        for chunk in iter(lambda: stream.read(8 * 1024 * 1024), b""):
            checksum.update(chunk)
    if checksum.hexdigest() != SOURCE_MD5:
        raise ValueError("Source checksum differs from the pinned Geofabrik extract.")
    print("Pinned Geofabrik checksum verified", flush=True)
    data = extract_chargers(args.input, args.data_until)
    data["source"] = {"url": SOURCE_URL, "md5": SOURCE_MD5}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    temporary = args.output.with_suffix(".tmp")
    temporary.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    temporary.replace(args.output)
    print(json.dumps({"dataUntil": data["osm3s"]["timestamp_osm_base"], **data["statistics"]}))


if __name__ == "__main__":
    main()
