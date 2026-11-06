"""동네(구·행정동) 경계를 지역 한 장 단위로 잘게 나눈다 → public/data/dong/{지역코드}.json

원자료: 통계청 SGIS 행정동 경계(공공누리 1유형) · 가공 vuski/admdongkor (CC BY 4.0)
  GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 --filter=blob:none --sparse https://github.com/vuski/admdongkor
  git -C admdongkor sparse-checkout set --no-cone /ver20261001/HangJeongDong_ver20261001.geojson
  python3 scripts/dong-build.py admdongkor/ver20261001/HangJeongDong_ver20261001.geojson
파일 모양: {"v": 판, "f": [[구 또는 null, 동, [[x0,y0,dx,dy,...] 고리...]], ...]} (좌표 ×1e4 정수, 첫 점 뒤는 차이)
"""
import json, os, re, sys

SRC = sys.argv[1]
ROOT = os.path.join(os.path.dirname(__file__), '..')
regions = json.load(open(os.path.join(ROOT, 'src/data/regions.json')))
regions = regions[0] if isinstance(regions, list) else regions['regions']
WHOLE = {'11': '11', '26': '26', '27': '27', '28': '28', '30': '30', '31': '31', '50': '50'}  # 광역시·제주: 지역 하나에 구(군)

def region_of(p):
    sido, sggnm = p['sido'], p['sggnm']
    if sido in WHOLE: return WHOLE[sido], sggnm
    if sido == '12' and sggnm.endswith('구'): return '29', sggnm  # 광주광역시 구 (전남광주 통합 뒤)
    if sido == '36': return '36110', None
    for r in regions:
        if r['code'][:2] in WHOLE or r['code'] == '29': continue
        if sggnm.startswith(r['name']) and (r['sido'] == p['sidonm']):
            rest = sggnm[len(r['name']):].strip()
            return r['code'], (rest or None)
    return None, None

def dong_of(nm):
    d = nm.split(' ')[-1]
    d = re.sub(r'[\d·.]+가[\d·]*동$', '동', d)
    d = re.sub(r'제?\d+동$', '동', d)
    return d

def dp(pts, tol):
    if len(pts) < 4: return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        ax, ay = pts[a]; bx, by = pts[b]
        dx, dy = bx - ax, by - ay; L = (dx * dx + dy * dy) or 1e-18
        best, bi = -1, -1
        for i in range(a + 1, b):
            px, py = pts[i]
            t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / L))
            ex, ey = ax + t * dx - px, ay + t * dy - py
            d = ex * ex + ey * ey
            if d > best: best, bi = d, i
        if bi > 0 and best > tol * tol:
            keep[bi] = True; stack += [(a, bi), (bi, b)]
    return [p for p, k in zip(pts, keep) if k]

def enc(ring):
    q = [(round(x * 1e4), round(y * 1e4)) for x, y in dp(ring, 0.00025)]
    out = []
    for i, (x, y) in enumerate(q):
        if i and (x, y) == q[i - 1]: continue
        out += [x, y] if not out else [x - px, y - py]
        px, py = x, y
    return out if len(out) >= 8 else None

g = json.load(open(SRC))
ver = re.search(r'ver(\d+)', SRC).group(1)
by = {}
miss = set()
for f in g['features']:
    p = f['properties']
    code, gu = region_of(p)
    if not code: miss.add(p['sggnm']); continue
    geom = f['geometry']
    polys = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
    rings = [r for poly in polys for r in [enc(poly[0])] if r]  # 바깥 고리만 (구멍은 동네 판정에 거의 영향 없음)
    if rings: by.setdefault(code, []).append([gu, dong_of(p['adm_nm']), rings])
out = os.path.join(ROOT, 'public/data/dong'); os.makedirs(out, exist_ok=True)
tot = 0
for code, fs in by.items():
    s = json.dumps({'v': ver, 'f': fs}, ensure_ascii=False, separators=(',', ':'))
    open(os.path.join(out, f'{code}.json'), 'w').write(s); tot += len(s)
print(len(by), 'regions', tot // 1024, 'KB', 'miss:', sorted(miss))
