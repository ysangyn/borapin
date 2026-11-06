/**
 * 찾아보기 시험 문제: 실제로 물어볼 질문과 기대하는 답 (질문 틀·장소·답에 들어갈 말).
 * 배포할 때마다 채점하고, 점수가 기준보다 낮으면 배포를 멈춘다. 못 알아들은 질문은 여기에 보탠다.
 */
export interface Case {
  q: string;
  intent: string;
  /** 답이 가리켜야 할 장소 (kr:코드 / country:ID) */
  place?: string;
  /** 답 글에 들어 있어야 할 말 */
  has?: string;
  /** 이어서 묻기: 직전 질문 */
  after?: string;
  /** 행동 단추 중 하나가 가리켜야 할 주소(앞부분). tests/unit/askLinks.test.ts가 본다 */
  link?: string;
}

export const CASES: Case[] = [
  // 11-06 2차: 이어 묻기·우리 기록·교통·거리·사람별
  { q: '거기 야경 좋은 데', intent: 'spots', after: '부산 가서 뭐 먹지', place: 'kr:26', has: '야경' },
  { q: '경주 말고', intent: 'recommend', after: '내년 봄에 벚꽃 보러 어디 갈까' },
  { q: '올해 몇 번 여행했어', intent: 'stats', has: '올해' },
  { q: '통영 KTX 있어?', intent: 'transport', place: 'kr:48220', has: '역' },
  { q: '통영에서 남해까지 얼마나 걸려', intent: 'distance', has: 'km' },
  { q: '일본 유심 어디서 사', intent: 'faq', has: '유심' },
  { q: '교토 가을 단풍 언제', intent: 'season', place: 'country:JPN', has: '단풍' },
  { q: '보라가 가고 싶다고 한 곳', intent: 'wishList', has: '보라' },
  { q: '또 가고 싶다고 한 카페', intent: 'again', has: '테라로사' },
  { q: '집 근처 드라이브', intent: 'recommend' },
  { q: '서울에서 2시간 안에 갈 수 있는 바다', intent: 'recommend', has: '바다' },
  { q: '괜찮은 온천', intent: 'recommend', has: '온천' },
  { q: '눈 보러 갈 만한 곳', intent: 'recommend', has: '눈' },
  { q: '사진 몇 장 있어', intent: 'media', has: '사진' },
  { q: '글 뭐 썼지', intent: 'media', has: '글' },
  // 11-06 테스터 되어 넣어 본 질문들 (틀렸던 것)
  // 앞 질문의 장소가 엉뚱하게 이어지지 않게: 조건·달·테마가 새로 나오면 새 질문
  { q: '아이랑 가기 좋은 곳', intent: 'recommend', after: '서울 근교 당일치기' },
  { q: '단풍 아직 볼 수 있어?', intent: 'recommend', after: '서울 근교 당일치기', has: '단풍' },
  { q: '11월 축제 뭐 있어', intent: 'festival', after: '서울 근교 당일치기', has: '11월 축제' },
  { q: '가고 싶은 곳 목록 보여줘', intent: 'wishList', after: '제주 가고 싶다' },
  { q: '이번 주말에 뭐하지', intent: 'recommend' },
  { q: '비 오는 날 갈 만한 데', intent: 'recommend', has: '실내' },
  // 날씨·옷차림: 예보는 못 보지만 평년 기후로 답한다 (해외는 달별 옷차림, 국내는 좋은 때)
  { q: '교토 11월 춥나', intent: 'weather', place: 'country:JPN', has: '낮' },
  { q: '통영 날씨 어때', intent: 'weather', place: 'kr:48220' },
  { q: '오사카 12월에 뭐 입지', intent: 'weather', place: 'country:JPN', has: '코트' },
  // 우리 기록에서 조건으로 찾기
  { q: '우리가 간 카페 중에 바다 보이는 데', intent: 'find', has: '테라로사' },
  { q: '성수동 카페 어디 갔었지', intent: 'find', has: '어니언' },
  // 못 찾을 때: 무엇을 어디서 찾았는지 (어색한 '카페 바다로는' 대신) · 오션뷰도 바다로
  { q: '우리가 간 카페 중에 산 보이는 데', intent: 'find', has: "다녀온 카페" },
  { q: '오션뷰 카페 어디 갔었지', intent: 'find', has: '테라로사' },
  { q: '제주 가고 싶은 곳에 뭐 적어뒀지', intent: 'wishList', has: '성산일출봉' },
  // 코스·일정을 짜 달라면 계획하기로
  { q: '오사카 3박4일 코스 짜줘', intent: 'plan', place: 'country:JPN', link: '/plan?place=country:JPN' },
  { q: '강릉 1박2일 일정 추천', intent: 'plan', place: 'kr:51150', link: '/plan?place=kr:51150' },
  // 환율
  { q: '엔화 환율', intent: 'money', has: '엔' },
  { q: '일본 돈 얼마야', intent: 'money', place: 'country:JPN', has: '엔' },
  // 자료에 없는 조건은 솔직하게
  { q: '통영에서 케이블카 타려면', intent: 'spots', place: 'kr:48220', has: '케이블카' },
  { q: 'ㅋㅋㅋ', intent: 'hello' },
  // 계획하는 사람이 처음 묻는 말 (써 보기 11-05: '조건에 맞는 곳을 찾지 못했어요'로 막혔던 것)
  { q: '12월에 어디 갈까', intent: 'recommend', has: '가 볼 만한 곳' },
  { q: '1월 여행지 추천', intent: 'recommend', has: '가 볼 만한 곳' },
  { q: '다음 달에 1박 2일로 어디 갈까', intent: 'recommend' },
  { q: '1박 2일 어디 가지', intent: 'recommend' },
  { q: '다음 달 여행지 추천', intent: 'recommend' },
  { q: '이번 주말 당일치기 어디 갈까', intent: 'recommend' },
  { q: '2박 3일로 갈 만한 곳', intent: 'recommend' },
  // 해외 쪽 추천은 세계 도시 자료로 (국내로 엉뚱하게 답하지 않게)
  { q: '북극해 여행지 추천', intent: 'recommend', has: '북극권' },
  { q: '카리브해 여행지 추천', intent: 'recommend', has: '자료가 없어요' },
  { q: '오로라 보러 갈 만한 곳 추천', intent: 'recommend', has: '북극권' },
  { q: '1월에 동남아 어디 갈까', intent: 'recommend', has: '동남아' },
  { q: '부모님 모시고 유럽 추천', intent: 'recommend', has: '유럽' },
  // 볼거리·먹거리·특산물·교통 (지명 + 조사·띄어쓰기·오타·초성)
  { q: '강릉 볼거리', intent: 'spots', place: 'kr:51150', has: '안목 커피거리', link: '/plan?place=kr:51150' },
  { q: '강릉에서 뭐 하지?', intent: 'spots', place: 'kr:51150' },
  { q: '강릉 가볼 만한 곳', intent: 'spots', place: 'kr:51150' },
  { q: '강능 맛집', intent: 'foods', place: 'kr:51150', has: '초당 순두부' },
  { q: '강릉시 먹거리', intent: 'foods', place: 'kr:51150' },
  { q: '강릉 맛집 알려줘', intent: 'foods', place: 'kr:51150', has: '초당할머니순두부' },
  { q: '전주 뭐 먹지', intent: 'foods', place: 'kr:52' },
  { q: '춘천 맛집', intent: 'foods', has: '닭갈비' },
  { q: '제주 기념품', intent: 'goods', place: 'kr:50' },
  { q: '여수 특산물', intent: 'goods' },
  { q: '강릉 어떻게 가?', intent: 'transport', place: 'kr:51150', has: 'KTX' },
  { q: '부산 교통', intent: 'transport', place: 'kr:26' },
  { q: '해운대 맛집', intent: 'foods', place: 'kr:26' },
  { q: '안목 커피거리', intent: 'overview', place: 'kr:51150' },
  { q: '경주 볼거리', intent: 'spots' },
  { q: '서울 구경할 곳', intent: 'spots', place: 'kr:11' },
  { q: '통영', intent: 'overview' },
  { q: '속초', intent: 'overview', has: '우리는' },
  { q: '울릉도 가볼 곳', intent: 'spots', place: 'kr:47940' },
  { q: '독도', intent: 'overview', place: 'kr:47940' },
  // 이어서 묻기
  { q: '거기 맛집은?', intent: 'foods', place: 'kr:51150', after: '강릉 볼거리' },
  { q: '언제 가면 좋아?', intent: 'season', place: 'kr:51150', after: '강릉 볼거리' },
  { q: '교통은?', intent: 'transport', place: 'kr:26', after: '부산 맛집' },
  // 앞 장소와 상관없는 새 추천 질문은 앞 장소를 잇지 않는다
  { q: '11월에 어디 가면 좋아?', intent: 'recommend', has: '11월', after: '강릉 몇 번 갔지?' },
  { q: '안 가본 곳 추천해줘', intent: 'recommend', after: '강릉 볼거리' },
  { q: '그럼 거기 언제 가면 좋아?', intent: 'season', place: 'kr:51150', after: '강릉 맛집' },
  // 가기 좋은 때
  { q: '제주 언제 가면 좋아?', intent: 'season', place: 'kr:50', has: '월' },
  { q: '강릉 몇 월에 가면 좋아', intent: 'season', place: 'kr:51150' },
  { q: '일본 가기 좋은 때', intent: 'season', place: 'country:JPN', has: '도쿄 기준' },
  { q: '다낭 언제 가?', intent: 'season', place: 'country:VNM' },
  { q: '방콕 여행 시기', intent: 'season', place: 'country:THA' },
  // 애매한 지명은 되묻기
  { q: '고성 맛집', intent: 'choose' },
  { q: '광주 볼거리', intent: 'choose' },
  { q: '설악산', intent: 'choose' },
  { q: '중구 맛집', intent: 'choose' },
  // 우리 기록
  { q: '강릉 몇 번 갔지?', intent: 'count', place: 'kr:51150', has: '한 번' },
  { q: '부산 몇번 갔어', intent: 'count', place: 'kr:26' },
  { q: '강원도 몇 번 갔지', intent: 'count', has: '강원' },
  { q: '강릉 언제 갔지?', intent: 'when', place: 'kr:51150', has: '2019' },
  { q: '부산 마지막으로 간 게 언제야', intent: 'when', place: 'kr:26' },
  { q: '작년에 간 곳', intent: 'time', has: '작년' },
  { q: '2019년에 다녀온 곳', intent: 'time', has: '강릉' },
  { q: '작년 가을에 간 곳', intent: 'time', has: '교토' },
  { q: '여름에 간 여행', intent: 'time', has: '속초' },
  { q: '엄마랑 간 곳', intent: 'people', has: '엄마' },
  { q: '엄마하고 갔던 여행', intent: 'people' },
  { q: '친구랑 간 곳', intent: 'people' },
  { q: '우리 몇 곳 갔어?', intent: 'stats', has: '시·군' },
  { q: '몇 퍼센트 칠했어', intent: 'stats' },
  { q: '나라 몇 개 갔지', intent: 'stats', has: '나라' },
  { q: '또 가자고 한 맛집', intent: 'again', has: '초당할머니순두부' },
  { q: '다시 가고 싶은 맛집', intent: 'again' },
  { q: '강릉에서 또 갈래요 한 곳', intent: 'again', has: '초당' },
  // 추천
  { q: '안 가본 곳 추천', intent: 'recommend' },
  { q: '5월에 바다 보러 갈 만한 곳', intent: 'recommend', has: '5월' },
  { q: '이번 달 가기 좋은 곳', intent: 'recommend', has: '가 볼 만한' },
  { q: '가을에 산 보러 갈 만한 곳 추천', intent: 'recommend' },
  { q: '바다 말고 산 추천', intent: 'recommend' },
  { q: '주말에 어디 갈까', intent: 'recommend' },
  { q: '강원도 안 가본 곳 추천', intent: 'recommend', has: '강원' },
  { q: '여행지 추천해줘', intent: 'recommend' },
  // 비교
  { q: '강릉이랑 속초 비교', intent: 'compare', has: '속초' },
  { q: '강릉 vs 속초', intent: 'compare' },
  { q: '부산이랑 여수 중에 어디가 나아', intent: 'compare' },
  // 가고 싶은 곳
  { q: '가고 싶은 곳', intent: 'wishList', has: '제주' },
  { q: '여수 가고 싶어', intent: 'wishAdd', place: 'kr:46130' },
  { q: '통영 담아줘', intent: 'wishAdd' },
  // 해외
  { q: '일본', intent: 'overview', place: 'country:JPN', has: '우리는' },
  { q: '교토 맛집', intent: 'foods', place: 'country:JPN', has: '가이세키' },
  { q: '오사카 볼거리', intent: 'spots', place: 'country:JPN', has: '도톤보리' },
  { q: '방콕 어떻게 가', intent: 'transport', place: 'country:THA', has: '인천에서' },
  { q: '파리 여행', intent: 'overview', place: 'country:FRA', has: '입국' },
  { q: '파리', intent: 'overview', place: 'country:FRA' },
  { q: '괌 언제 가', intent: 'season', place: 'country:GUM' },
  // 지도
  { q: '강릉 지도에서 보여줘', intent: 'map', place: 'kr:51150' },
  { q: '지도', intent: 'map' },
  // 처음 보는 말투 (일반화 점검)
  { q: '속초 갈만한곳', intent: 'overview', place: 'kr:51210' },
  { q: '여수 밤바다', intent: 'overview', place: 'kr:46130' },
  { q: '경포대 근처 맛집', intent: 'foods', place: 'kr:51150' },
  { q: '남이섬 가는 법', intent: 'choose' }, // 가평·춘천 둘 다라 되묻는 게 맞다
  { q: '제주도 맛집', intent: 'foods', place: 'kr:50' },
  { q: '대구 몇 번 갔어', intent: 'count', place: 'kr:27', has: '안 가봤' },
  { q: '올해 몇 번 여행 갔어', intent: 'stats', has: '올해' },
  { q: '부모님이랑 가기 좋은 곳', intent: 'recommend' },
  { q: '광안리 야경', intent: 'overview', place: 'kr:26' },
  { q: '순천 볼만한 곳 알려줘', intent: 'spots' },
  { q: '삿포로 몇 월이 좋아', intent: 'season', place: 'country:JPN' },
  { q: '강릉 커피', intent: 'overview', place: 'kr:51150' },
  { q: '단양 뭐 유명해', intent: 'overview' },
  { q: '태국 vs 베트남', intent: 'compare' },
  // 일상 낱말에 속지 않기 ('가나요' ≠ 가나, '오만 원' ≠ 오만)
  { q: '강릉 언제 가나요', intent: 'season', place: 'kr:51150' },
  { q: '오만 원으로 갈 만한 곳', intent: 'recommend' },
  // 축제 (관광공사 자료)
  { q: '강릉 축제', intent: 'festival', place: 'kr:51150', has: '커피축제' },
  { q: '이번 달 축제 뭐 있어', intent: 'festival', has: '축제' },
  { q: '요즘 축제', intent: 'festival' },
  // 다음 여행·예정
  { q: '다음 여행 언제야', intent: 'next', has: '제주 여행', link: '/trips/' },
  { q: '예정된 여행', intent: 'next', has: '제주' },
  // 준비물
  { q: '제주 준비물', intent: 'packing', place: 'kr:50', has: '선크림', link: '/plan?place=kr:50' },
  { q: '교토 갈 때 뭐 챙겨', intent: 'packing', place: 'country:JPN', has: '여권' },
  // 우리 장소·글 찾기
  { q: '순두부 어디였지', intent: 'find', has: '초당할머니순두부' },
  { q: '커피 마신 날', intent: 'find', has: '바다 보며 커피 마신 날' },
  { q: '또 갈래요 한 곳', intent: 'again', has: '초당할머니순두부' },
  // 인사·도움말
  { q: '안녕', intent: 'hello' },
  { q: '고마워', intent: 'hello' },
  { q: '뭐 물어볼 수 있어?', intent: 'help' },
  { q: '도움말', intent: 'help' },
  // 말투·오타·줄임말 (규칙형이 먼저 받아야 AI 호출이 줄어든다)
  { q: '강릉 먹을거 추천', intent: 'foods', place: 'kr:51150' },
  { q: '강릉 가서 머 먹지', intent: 'foods', place: 'kr:51150' },
  { q: '여수 맛있는 집', intent: 'foods', place: 'kr:46130' },
  { q: '제주 갈만한데', intent: 'spots', place: 'kr:50' },
  { q: '부산 놀거리', intent: 'spots', place: 'kr:26' },
  { q: '전주 한옥마을 어때', intent: 'overview', place: 'kr:52' },
  { q: '경주 언제가 좋아?', intent: 'season', place: 'kr:47130' },
  { q: '제주 몇월에 가야돼', intent: 'season', place: 'kr:50' },
  { q: '단양 몇번 갔었지', intent: 'count' },
  { q: '우리 강릉 간 적 있어?', intent: 'count', place: 'kr:51150', has: '한 번' },
  { q: '속초 가봤나', intent: 'count', place: 'kr:51210', has: '한 번' },
  { q: '엄마랑 어디 갔었지', intent: 'people', has: '강릉' },
  { q: '보라가 가고 싶어하는 곳', intent: 'wishList' },
  { q: '11월에 어디 갈까', intent: 'recommend', has: '11월' },
  { q: '단풍 보러 갈 만한 데', intent: 'recommend' },
  { q: '가까운 데 당일치기', intent: 'recommend', has: '수도권에서 가까운' },
  { q: '둘 다 안 가본 섬', intent: 'recommend' },
  { q: '내년 봄 벚꽃', intent: 'recommend', has: '4월에 벚꽃 보러' },
  { q: '올해 몇 군데 갔어', intent: 'stats' },
  { q: '우리 제일 많이 간 곳', intent: 'stats', has: '강릉' },
  { q: '제주도 담아줘', intent: 'wishAdd', place: 'kr:50' },
  { q: '다음주 축제', intent: 'festival' },
  { q: '강릉 커피축제 언제야', intent: 'festival', place: 'kr:51150', has: '10.23' },
  // 별·은하수: 대도시를 고르면 안 된다 (2026-10-19 실제로 대구·안산이 나옴)
  { q: '은하수 보기 좋은 국내 여행지', intent: 'recommend', has: '밤하늘' },
  { q: '별 보러 가기 좋은 곳', intent: 'recommend', has: '밤하늘' },
  // 이번 주 날씨: 예보를 안 보면서 본 척하지 않는다
  { q: '이번 주 날씨 좋은 여행지', intent: 'recommend', has: '예보' },
  // 여행 상식 (손으로 정리한 답)
  { q: '공항 갈 때 여권 필요해?', intent: 'faq', has: '국내선은 신분증' },
  { q: '여권 만드는데 얼마나 걸려?', intent: 'faq', has: '1~2주' },
  { q: '제주 갈 때 여권 필요해?', intent: 'faq', has: '여권이 없어도' },
  { q: '보조배터리 비행기에 실어도 돼?', intent: 'faq', has: '들고 타야' },
  // 우리 여행 패턴: '부부'가 '부여'로 읽히면 안 된다
  { q: '우리 부부의 여행 패턴이 어때 보여?', intent: 'pattern' },
  // 요즘 자료(관광빅데이터 외지인 흐름)로 고르는 주제: 뜨는 곳·한적한 곳, 무장애 관광지 수로 많이 안 걷는 곳.
  // 채점 자료에는 요즘 자료가 없어서 주제를 알아듣고 '아직 자료가 없어요'로 솔직하게 답하는지 본다 (자료가 있을 때의 고르기는 tests/unit/trendAsk.test.ts)
  { q: '요즘 뜨는 곳', intent: 'recommend', has: '요즘 뜨는 곳' },
  { q: '요즘 핫한 여행지', intent: 'recommend', has: '요즘 뜨는 곳' },
  { q: '핫플 추천', intent: 'recommend', has: '요즘 뜨는 곳' },
  { q: '요즘 인기 많은 곳 어디야', intent: 'recommend', has: '요즘 뜨는 곳' },
  { q: '한적한 곳 추천', intent: 'recommend', has: '한적한 곳' },
  { q: '사람 없는 조용한 곳', intent: 'recommend', has: '한적한 곳' },
  { q: '붐비지 않는 곳', intent: 'recommend', has: '한적한 곳' },
  { q: '한산한 바다', intent: 'recommend', has: '바다 쪽 한적한 곳' }, // '한산'이 지명·'산'이 테마로 읽히면 안 된다
  { q: '휠체어로 다니기 편한 곳', intent: 'recommend', has: '편하게 다닐' },
  { q: '부모님 모시고 가기 좋은 곳', intent: 'recommend', has: '편하게 다닐' },
  { q: '많이 안 걷는 여행지', intent: 'recommend', has: '편하게 다닐' },
  { q: '유모차 끌고 갈 만한 곳', intent: 'recommend', has: '편하게 다닐' },
  { q: '강원도에서 요즘 뜨는 곳', intent: 'recommend', has: '강원에서 요즘 뜨는 곳' },
  // 자료가 없을 때: 지어내지 않고 없다고 한다
  { q: '요즘 뜨는 곳 알려줘', intent: 'recommend', has: '아직 자료가 없어요' },
  // 모르는 질문은 지어내지 않는다
  { q: '오늘 저녁 뭐 해', intent: 'unknown' },
  { q: 'ㅎㅎ', intent: 'unknown' },
];
