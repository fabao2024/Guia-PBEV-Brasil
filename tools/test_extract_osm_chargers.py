"""Offline extractor tests. Requires osmium 4.3.2; no network or application state."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import sys

sys.dont_write_bytecode = True

SPEC = importlib.util.spec_from_file_location("extract_chargers", Path(__file__).with_name("extract-osm-chargers.py"))
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)

FIXTURE = '''<osm version="0.6" generator="unit-test">
<node id="1" lat="-23.1" lon="-46.1" timestamp="2026-11-08T12:00:00Z" uid="99" user="private-user" changeset="999">
  <tag k="amenity" v="charging_station"/><tag k="name" v="Node station"/>
  <tag k="contact:email" v="private@example.invalid"/><tag k="note" v="private-note"/>
  <tag k="socket:type2" v="2"/><tag k="socket:type2:output" v="22 kW"/>
</node>
<node id="11" lat="-23" lon="-46"/><node id="12" lat="-24" lon="-48"/>
<node id="13" lat="-23" lon="-48"/><node id="999" lat="-10" lon="-30"/>
<way id="2" timestamp="2026-11-07T12:00:00Z"><nd ref="11"/><nd ref="12"/><nd ref="13"/><nd ref="11"/>
  <tag k="amenity" v="charging_station"/><tag k="name" v="Area station"/>
</way>
<way id="3"><nd ref="11"/><nd ref="99999"/><tag k="amenity" v="charging_station"/></way>
<node id="5" lat="-23" lon="-46"><tag k="amenity" v="fuel"/></node>
</osm>'''


class ExtractorTests(unittest.TestCase):
    def test_extracts_only_stations_and_explicitly_approximates_complete_ways(self):
        root = Path(tempfile.gettempdir()) / "opencode"
        root.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=root) as folder:
            path = Path(folder) / "fixture.osm"
            path.write_text(FIXTURE, encoding="utf-8")
            data = MODULE.extract_chargers(path, "2026-11-08T21:21:00Z")
        self.assertEqual(data["statistics"]["matchedInput"], 3)
        self.assertEqual(data["statistics"]["withoutCompleteGeometry"], 1)
        self.assertEqual(len(data["elements"]), 2)
        node, way = data["elements"]
        self.assertEqual(node["lat"], -23.1)
        self.assertEqual(node["timestamp"], "2026-11-08T12:00:00Z")
        self.assertEqual(way["center"], {"lat": -23.5, "lon": -47.0})
        self.assertEqual(way["positionMethod"], "area-center")
        self.assertNotIn("private-user", json.dumps(data))
        self.assertNotIn("private@example", json.dumps(data))
        self.assertNotIn("private-note", json.dumps(data))

    def test_rejects_an_extract_without_a_known_data_timestamp(self):
        root = Path(tempfile.gettempdir()) / "opencode"
        root.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=root) as folder:
            path = Path(folder) / "fixture.osm"
            path.write_text(FIXTURE, encoding="utf-8")
            with self.assertRaises(ValueError):
                MODULE.extract_chargers(path, None)


if __name__ == "__main__":
    unittest.main()
