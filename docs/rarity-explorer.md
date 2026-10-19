# Offline rarity explorer: approved data and rules

## Authority and provenance

The owner approved local implementation after the audit, confirmed publication
rights for all 128 trait images, and selected **B**, the striped `T-Sailor.png`,
for the `CLOTHES: Sailor Tee` mapping. This corrects the generator/catalog art
conflict without changing metadata, scores or ranks. Rights are owner-confirmed,
not independently licensed. Stop at local acceptance; no publication or delivery
change was authorized in the initial implementation step. After local acceptance,
the owner separately approved the bounded delivery-selection adjustment below,
without authorizing publication or deployment at that step. The owner subsequently
accepted preparing a commit and PR; merge and deployment remain separate gates.

Canonical source: legacy `src/components/rarity.json`, SHA-256
`879353c792d3bc9634ffaffa51c0b780422428b3c5ca8b9ee37167a42e47ef1d`.
It matches `gen/rarity.json` byte-for-byte. The 5,555 raw records in
`gen/metadata/all-objects.json` match its token IDs and attribute identities.
Do not use `rarity_old.json` (all token trait identities differ), or the unrelated
10,000-record output in the analyzer directory. The analyzer's computation source
was read as a rule reference, never executed in the archive.

`rarity-source-manifest.json` records source hashes, exact image filename case,
the approved layer mapping and derivative hashes. Originals remain untouched.
The public dataset omits remote image URIs, prose, ownership and marketplace
fields. Public layer names are fixed local IDs, not caller-selected paths.

## Rules established before implementation

- Token IDs are integers **1–5,555**; legacy internal IDs are **0–5,554**.
  Lookup must use one token consistently. Do not reproduce the old UI's next-token
  rank lookup, artificial 464 maximum or permissive `parseInt` input handling.
- Legacy component score is exactly
  `Math.round((1 / (count / total)) * 1e4) / 1e4`, with total 5,555.
- Each token's stored score is the JavaScript sum of its rounded attribute
  components, plus rounded missing-category components, plus its rounded
  trait-count component. Missing-category scoring uses the number of tokens
  lacking that category; trait-count scoring uses tokens with the same attribute
  count. Do not introduce a final rounding step or omit either component group.
- Ranks sort raw stored scores descending, stably retaining source/internal-ID
  order for exact ties. Ranks remain distinct sequential integers, not shared
  competition ranks. There are 167 exact-score tie groups involving 338 records.
- Independently rebuilding scores from raw metadata using JavaScript reproduced
  all 5,555 stored scores and ranks exactly. The UI displays these stored fields,
  not a new calculation, and uses the legacy `Number(score).toFixed(1)` format.
- Composition, back to front: **BACKGROUND → ACCESSORIES → BODY → NECK → CLASS
  → CLOTHES → HEAD**. Omitted attributes have no image layer. All 128 used values
  have source images. Six legacy filename-case differences are normalized through
  explicit manifest mappings, not string guessing. Only Sailor Tee uses the
  owner-selected catalog artwork instead of the generator's orange shirt.

| Token | Stored rank | Display score | Reference                                        |
| ----: | ----------: | ------------: | ------------------------------------------------ |
|     1 |        3056 |         110.0 | PURPLE, Silver, L1L G, Midas Vest, G.I.          |
|     2 |        2495 |         120.9 | BLUE, Silver, DR1P VA, Tartan SPJ                |
|    54 |        2207 |         127.0 | BLUE, Silver, C1V1L S, striped Sailor Tee, Alien |
|  2940 |           1 |        3019.8 | PURPLE, Silver, Duo, C1V1L G, Camo SPJ, Kartier  |
|  5555 |        2988 |         111.4 | BLACK, Petrol, DR1P TM, 90s Tee, Mocha           |

## Data preparation and behavior

The committed derivatives are 1000×1000 transparent PNGs, resized from 2000px
sources with high-quality filtering. The raw 248 MB layer set becomes about
73 MB; selected-token layers load on demand. The compact dataset is about
390 KB. No runtime image/metadata request leaves the site's origin.

Regeneration is owner-controlled, not a build prerequisite. With the untouched
archive available, use standard-library Python 3 and Windows System.Drawing:

```powershell
python scripts/prepare-rarity-data.py --legacy-root 'C:/Work/Drip'
./scripts/prepare-rarity-images.ps1 -LegacyRoot 'C:/Work/Drip'
npx --no-install prettier docs/rarity-source-manifest.json --write
```

The scripts validate the source snapshot, metadata relationships, trait mapping
and source-image hashes; they never execute the legacy generator, query a remote
service or change original files. The compact generated JSON is explicitly
excluded from formatting; handwritten code is not excluded from any check.

The section activates near the viewport, with a keyboard-accessible manual entry
fallback. Data errors, invalid IDs and image failures have separate recoverable
states. Loading/retrying metadata is abortable on unmount; artwork updates are
keyed by token so stale layer events cannot complete another token's image.

## Separately approved delivery selection

The total build remains below the existing 200 MB raw-file transport cap. The
former 1 MB inline selection threshold made many small layer images exceed the
combined 4 MB JSON limit. After local acceptance, the owner approved lowering
the inline threshold to 64,000 bytes; larger files use the existing binary upload
API. The JSON, individual-file and total-bundle guards, captured-byte integrity,
no-retry behavior and production approval are unchanged. Mock-controller tests
cover the actual 128-layer batch on both targets and the exact threshold boundary.
This is local verification only: no publication, provider mutation or deployment
is authorized by the adjustment. Hosted batch verification remains outstanding.
