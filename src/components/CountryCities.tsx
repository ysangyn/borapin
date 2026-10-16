import { useState } from 'react';
import { josa } from 'es-hangul';
import { useNavigate } from 'react-router-dom';
import { CityRow } from './WorldPicker';
import { CityFacts } from './CityInfo';
import { useToast } from './ui';
import { useAuth } from '../lib/auth';
import { quickWish } from '../lib/wishActions';
import { cityPlace, useWorld, type WorldCity } from '../lib/world';
import type { Place, Wish } from '../lib/types';

/** 지도에서 나라를 눌렀을 때: 그 나라에서 골라 둔 도시들 (누르면 기본 정보, 담기) */
export default function CountryCities({ place, wishes }: { place: Place; wishes: Wish[] }) {
  const world = useWorld();
  const auth = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [open, setOpen] = useState<string | null>(null);
  if (place.t !== 'country' || !world) return null;
  const list = world.cities.filter((w) => w.c === place.id);
  if (!list.length) return null;
  const month = new Date().getMonth() + 1;
  const add = async (w: WorldCity) => {
    if (auth.status !== 'ready') return;
    try {
      const { id, already } = await quickWish(cityPlace(w), auth.user, wishes);
      toast(already ? '이미 담겨 있어요' : `${josa(w.city, '을/를')} 가고 싶은 곳에 담았어요`, { label: '메모 쓰기', onClick: () => nav(`/wishes/${id}`) });
    } catch { toast('담지 못했어요. 다시 해 주세요'); }
  };
  return (
    <div className="country-cities" data-testid="country-cities">
      <div className="tiny" style={{ fontWeight: 800, color: 'var(--ink3)', marginBottom: 4 }}>가 볼 만한 도시 {list.length}</div>
      <div className="list">
        {list.map((w) => (
          <div key={w.city}>
            <CityRow w={w} month={month} onAdd={() => add(w)} />
            <button type="button" className="link-btn" onClick={() => setOpen(open === w.city ? null : w.city)}>{open === w.city ? '접기' : '기본 정보 보기'}</button>
            {open === w.city && <CityFacts w={w} compact updated={world.updated} />}
          </div>
        ))}
      </div>
    </div>
  );
}
