"""Validate the approved legacy snapshot and prepare offline data/source provenance.

Uses only the Python standard library. Never executes the legacy generator or
fetches remote metadata. Image derivatives are prepared separately on Windows.
"""

import argparse
import ast
import collections
import hashlib
import json
import math
import pathlib

SOURCE_SHA = '879353c792d3bc9634ffaffa51c0b780422428b3c5ca8b9ee37167a42e47ef1d'
ORDER = ['BACKGROUND', 'ACCESSORIES', 'BODY', 'NECK', 'CLASS', 'CLOTHES', 'HEAD']


def digest(path):
    """Return the SHA-256 identity of one explicitly selected source file."""
    return hashlib.sha256(path.read_bytes()).hexdigest()


def score(count, total):
    """Mirror the positive-value legacy four-decimal component rounding for validation only."""
    return math.floor((1 / (count / total)) * 10000 + 0.5) / 10000


def prepare(legacy, project):
    """Validate canonical records and emit compact data plus a bounded layer-source manifest."""
    source = legacy / 'src/components/rarity.json'
    if digest(source) != SOURCE_SHA:
        raise ValueError('Unapproved rarity snapshot; audit changes before regenerating')
    data = json.loads(source.read_text(encoding='utf-8'))
    raw_source = legacy / 'gen/metadata/all-objects.json'
    raw = json.loads(raw_source.read_text(encoding='utf-8'))
    rows = data['rarity']
    total = len(rows)
    assert total == 5555 and len(raw) == total
    counts = collections.Counter((a['trait_type'], a['value']) for r in rows for a in r['attributes'])
    types = collections.Counter(a['trait_type'] for r in rows for a in r['attributes'])
    lengths = collections.Counter(len(r['attributes']) for r in rows)
    for index, row in enumerate(rows):
        assert row['id'] == index and row['tokenId'] == index + 1
        assert raw[index]['tokenId'] == row['tokenId']
        assert raw[index]['attributes'] == [{k: a[k] for k in ('trait_type', 'value')} for a in row['attributes']]
        assert len({a['trait_type'] for a in row['attributes']}) == len(row['attributes'])
        for attr in row['attributes']:
            assert attr['rarity_score'] == score(counts[attr['trait_type'], attr['value']], total)
        missing = set(types) - {a['trait_type'] for a in row['attributes']}
        assert missing == {m['trait_type'] for m in row['missing_traits']}
        for item in row['missing_traits']:
            assert item['rarity_score'] == score(total - types[item['trait_type']], total)
        assert row['trait_count']['rarity_score'] == score(lengths[len(row['attributes'])], total)
    ranked = sorted(rows, key=lambda row: -row['rarity_score'])
    assert [str(row['id']) for row in ranked] == data['ranked']
    assert all(row['rank'] == i + 1 for i, row in enumerate(ranked))

    generator = legacy / 'gen/index.py'
    tree = ast.parse(generator.read_text(encoding='utf-8'))
    call = next(node.value for node in tree.body if isinstance(node, ast.Expr)
                and isinstance(node.value, ast.Call) and isinstance(node.value.func, ast.Name)
                and node.value.func.id == 'generate_unique_images')
    config = ast.literal_eval(call.args[1])
    assert [layer['name'] for layer in config['layers']] == ORDER
    traits = []
    assets = []
    registry = {}
    for layer in config['layers']:
        for value, filename in zip(layer['values'], layer['filename']):
            key = (layer['name'], value)
            if key not in counts:
                continue
            directory = legacy / 'gen' / layer['trait_path']
            matches = [p for p in directory.iterdir() if p.name.casefold() == (filename + '.png').casefold()]
            assert len(matches) == 1, key
            image = matches[0]
            if key == ('CLOTHES', 'Sailor Tee'):
                image = legacy / 'src/trait-layers/CLOTHES/T-Sailor.png'
            item = data['traits'][key[0]][key[1]]
            assert item['count'] == counts[key]
            assert item['rarity_score'] == score(counts[key], total)
            index = len(traits)
            asset = f'layers/t{index:03d}.png'
            registry[key] = index
            traits.append({'type': key[0], 'value': value, 'count': item['count'], 'score': item['rarity_score'], 'asset': asset})
            assets.append({'id': index, 'type': key[0], 'value': value, 'source': image.relative_to(legacy).as_posix(),
                           'sourceSha256': digest(image), 'output': asset})
    assert len(traits) == len(counts) == 128
    tokens = [{'id': row['tokenId'], 'rank': row['rank'], 'score': row['rarity_score'],
               'traits': [registry[a['trait_type'], a['value']] for a in row['attributes']]} for row in rows]
    result = {'schema': 1, 'total': total, 'traits': traits, 'tokens': tokens}
    encoded = (json.dumps(result, separators=(',', ':'), ensure_ascii=True) + '\n').encode()
    manifest = {'schema': 1, 'sourceRaritySha256': SOURCE_SHA, 'sourceMetadataSha256': digest(raw_source),
                'sourceGeneratorSha256': digest(generator), 'collectionSha256': hashlib.sha256(encoded).hexdigest(),
                'layerOrder': ORDER, 'sailorTeeDecision': 'Owner-approved B: striped catalog artwork, no metadata/rank change',
                'assets': assets}
    output = project / 'public/rarity'
    output.mkdir(parents=True, exist_ok=True)
    (output / 'collection.json').write_bytes(encoded)
    (project / 'rarity-source-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    print(f'Validated {total} tokens and {len(traits)} traits; compact collection: {len(encoded)} bytes')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--legacy-root', required=True, type=pathlib.Path)
    parser.add_argument('--project-root', type=pathlib.Path, default=pathlib.Path(__file__).resolve().parent.parent)
    args = parser.parse_args()
    prepare(args.legacy_root.resolve(), args.project_root.resolve())
