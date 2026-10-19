import { Link } from 'react-router-dom';
import { Logo } from '../components/ui';
import { PHOTOS, VIDEOS } from '../lib/media';

const OPERATOR = '윤영상';
const CONTACT = 'ysangyn@gmail.com';
const SINCE = '2026년 10월 16일';

function Privacy() {
  return (
    <>
      <h1>개인정보 처리방침</h1>
      <p>보라핀(이하 '서비스')은 초대받은 사람만 쓰는 여행 기록 서비스입니다. 서비스를 쓰는 데 꼭 필요한 정보만 받고, 광고나 다른 목적으로 쓰지 않습니다.</p>

      <h2>1. 받는 정보</h2>
      <ul>
        <li><b>로그인 정보</b>: 메일 주소, 구글로 로그인하면 구글 계정 이름. 이메일 로그인의 비밀번호는 Google Firebase가 암호화해 보관하며 운영자도 볼 수 없습니다.</li>
        <li><b>직접 남긴 기록</b>: 여행 장소·날짜, 메모와 글, 함께 간 사람 이름, 우리 장소와 한 줄 평, 가고 싶은 곳</li>
        <li><b>올린 사진</b>: 줄인 사진 파일과 사진에 담긴 촬영 일시, 카메라 기종, 촬영 위치(약 100m 단위)</li>
        <li><b>오류 기록</b>: 앱에서 문제가 났을 때의 오류 내용, 화면 주소, 브라우저 종류</li>
      </ul>

      <h2>2. 쓰는 곳</h2>
      <p>기록을 보관하고 지도·추억·찾아보기로 보여 주는 데, 그리고 오류를 고치는 데만 씁니다.</p>

      <h2>3. 보관 기간과 파기</h2>
      <p>계정이 함께 쓰는 사람 목록에서 빠지거나 삭제를 요청하면 지체 없이 지웁니다. 앱 안에서 지운 기록과 사진은 바로 지워집니다. 오류 기록은 해결한 뒤 지웁니다.</p>

      <h2>4. 다른 곳에 주는 정보</h2>
      <p>다른 사람이나 회사에 주지 않습니다. 다만 여행에서 <b>링크 공개</b>를 켜면, 링크를 아는 사람은 로그인 없이 그 여행의 제목, 날짜, 장소, 사진(최대 60장, 촬영 일시와 사진 설명 포함), 들른 곳 이름을 볼 수 있습니다. 메모, 글, 함께 간 사람 이름은 공개되지 않으며, 공개를 끄면 바로 볼 수 없게 됩니다.</p>

      <h2>5. 맡기는 곳 (처리 위탁·국외 이전)</h2>
      <p>서비스는 Google LLC의 Firebase(로그인, 데이터베이스, 웹 호스팅)를 씁니다. 기록과 사진은 서울 지역 데이터베이스에 저장되고, 로그인과 웹 호스팅은 Google의 국외 서버에서 처리될 수 있습니다. 이 정보는 서비스를 쓰는 동안 Google 서버에 보관됩니다.</p>

      <h2>6. 이용자의 권리</h2>
      <p>내 정보를 보거나 고치거나 지우거나 처리를 멈춰 달라고 언제든 요구할 수 있습니다. 대부분은 앱 안에서 직접 할 수 있고, 우리 공간 › 백업에서 모든 기록을 내려받을 수 있습니다. 그 밖의 요청은 아래 연락처로 보내 주세요.</p>

      <h2>7. 기기에 저장하는 정보</h2>
      <p>로그인을 유지하고 오프라인에서도 기록을 보여 주려고 브라우저 저장소에 기록과 사진을 임시로 둡니다. 광고나 방문 분석을 위한 추적은 하지 않습니다.</p>

      <h2>8. 개인정보 보호책임자</h2>
      <p>{OPERATOR} · <a href={`mailto:${CONTACT}`}>{CONTACT}</a></p>

      <p className="muted small">시행일 {SINCE}. 방침이 바뀌면 앱에서 먼저 알립니다.</p>
    </>
  );
}

function Terms() {
  return (
    <>
      <h1>이용약관</h1>
      <p>보라핀은 {OPERATOR}이 운영하는 여행 기록 서비스입니다. 서비스를 쓰면 아래 내용에 동의한 것으로 봅니다.</p>

      <h2>1. 서비스</h2>
      <p>여행을 기록하고 지도에 핀을 꽂고, 사진과 추억을 함께 보는 서비스입니다. 지금은 무료이며, 관리자가 초대한 메일 주소로만 들어올 수 있습니다(구글 로그인 또는 이메일 로그인).</p>

      <h2>2. 기록의 권리</h2>
      <p>직접 남긴 기록과 사진의 권리는 남긴 사람에게 있습니다. 서비스는 그 기록을 보관하고 보여 주는 데만 씁니다.</p>

      <h2>3. 지켜 주세요</h2>
      <ul>
        <li>다른 사람의 사진이나 글을 허락 없이 올리지 않습니다.</li>
        <li>공개 링크는 보여 주고 싶은 사람에게만 보냅니다.</li>
        <li>서비스를 망가뜨리거나 다른 사람의 계정으로 들어가려 하지 않습니다.</li>
      </ul>

      <h2>4. 서비스 바뀜과 멈춤</h2>
      <p>서비스는 더 나아지도록 바뀔 수 있습니다. 서비스를 멈추게 되면 적어도 30일 전에 알리고, 그동안 모든 기록을 내려받을 수 있게 합니다. 무료 사용량을 다 쓰면 그날 일부 기능이 잠시 멈출 수 있습니다.</p>

      <h2>5. 백업</h2>
      <p>기록은 안전하게 보관하려고 노력하지만, 소중한 사진의 원본은 휴대폰이나 다른 곳에도 함께 보관해 주세요. 보라핀에는 줄인 사진이 저장됩니다.</p>

      <h2>6. 문의</h2>
      <p><a href={`mailto:${CONTACT}`}>{CONTACT}</a></p>

      <p className="muted small">시행일 {SINCE}</p>
    </>
  );
}

function Credits() {
  const items = [...PHOTOS.map((p) => ({ what: p.name, c: p.credit })), ...VIDEOS.map((v) => ({ what: `${v.name} (영상)`, c: v.credit }))];
  return (
    <>
      <h1>사진·영상 출처</h1>
      <p>앱을 꾸미는 여행지 사진과 영상은 위키미디어 공용(Wikimedia Commons)에서 자유 이용이 허락된 자료를 줄여서 썼습니다. 각 자료의 이용 허락 조건을 따릅니다(CC BY-SA 자료를 줄인 것은 같은 조건으로 나눕니다).</p>
      <ul className="credits">
        {items.map(({ what, c }) => (
          <li key={c.page}>
            <b>{what}</b> · <a href={c.page} target="_blank" rel="noreferrer">{c.title}</a> · {c.artist} · {c.license}
          </li>
        ))}
        {items.length === 0 && <li>아직 실린 자료가 없어요.</li>}
      </ul>
      <h2>지도 경계</h2>
      <ul>
        <li>통계청 SGIS 행정구역 경계 (공공누리 1유형)</li>
        <li>vuski/admdongkor (CC BY 4.0)</li>
        <li>Natural Earth (퍼블릭 도메인)</li>
      </ul>
      <h2>기후 자료</h2>
      <p>NASA POWER 월별 기후값 (NASA Langley Research Center)</p>
      <p>지역 축제 정보: 한국관광공사 TourAPI (공공누리 제1유형). 이름과 기간만 매주 받아 씁니다.</p>
      <p>여행경보·입국허가요건: 외교부 해외안전여행(공공데이터포털). 매일 받아 씁니다. 떠나기 전 0404.go.kr에서 확인하세요.</p>
      <p>환율: 한국수출입은행 현재환율(매매기준율). 매일 받아 씁니다.</p>
      <p>장소 자리 찾기: OpenStreetMap Nominatim (© OpenStreetMap 기여자).</p>
    </>
  );
}

/** 약관·개인정보 처리방침·사진 출처 (로그인 없이 볼 수 있음) */
export default function Legal({ kind }: { kind: 'privacy' | 'terms' | 'credits' }) {
  return (
    <div className="page legal" style={{ paddingTop: 20, paddingBottom: 40 }}>
      <Link to="/" className="brand" style={{ color: 'inherit' }}><Logo />보라핀</Link>
      <article>{kind === 'privacy' ? <Privacy /> : kind === 'terms' ? <Terms /> : <Credits />}</article>
      <div className="small" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <Link to="/privacy">개인정보 처리방침</Link>
        <Link to="/terms">이용약관</Link>
        <Link to="/credits">사진·영상 출처</Link>
      </div>
    </div>
  );
}
