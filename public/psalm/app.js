{
const PS=[["복 있는 사람은 악인의 꾀를 좇지 아니하며 죄인의 길에 서지 아니하며 오만한 자의 자리에 앉지 아니하고", "오직 여호와의 율법을 즐거워하여 그 율법을 주야로 묵상하는 자로다", "저는 시냇가에 심은 나무가 시절을 좇아 과실을 맺으며 그 잎사귀가 마르지 아니함 같으니 그 행사가 다 형통하리로다", "악인은 그렇지 않음이여 오직 바람에 나는 겨와 같도다", "그러므로 악인이 심판을 견디지 못하며 죄인이 의인의 회중에 들지 못하리로다", "대저 의인의 길은 여호와께서 인정하시나 악인의 길은 망하리로다"], ["어찌하여 열방이 분노하며 민족들이 허사를 경영하는고", "세상의 군왕들이 나서며 관원들이 서로 꾀하여 여호와와 그 기름 받은 자를 대적하며", "우리가 그 맨 것을 끊고 그 결박을 벗어 버리자 하도다", "하늘에 계신 자가 웃으심이여 주께서 저희를 비웃으시리로다", "그 때에 분을 발하며 진노하사 저희를 놀래어 이르시기를", "내가 나의 왕을 내 거룩한 산 시온에 세웠다 하시리로다", "내가 영을 전하노라 여호와께서 내게 이르시되 너는 내 아들이라 오늘날 내가 너를 낳았도다", "내게 구하라 내가 열방을 유업으로 주리니 네 소유가 땅 끝까지 이르리로다", "네가 철장으로 저희를 깨뜨림이여 질그릇 같이 부수리라 하시도다", "그런즉 군왕들아 너희는 지혜를 얻으며 세상의 관원들아 교훈을 받을지어다", "여호와를 경외함으로 섬기고 떨며 즐거워할지어다", "그 아들에게 입맞추라 그렇지 아니하면 진노하심으로 너희가 길에서 망하리니 그 진노가 급하심이라 여호와를 의지하는 자는 다 복이 있도다"], ["여호와여 나의 대적이 어찌 그리 많은지요 일어나 나를 치는 자가 많소이다", "많은 사람이 있어 나를 가리켜 말하기를 저는 하나님께 도움을 얻지 못한다 하나이다(셀라)", "여호와여 주는 나의 방패시요 나의 영광이시요 나의 머리를 드시는 자니이다", "내가 나의 목소리로 여호와께 부르짖으니 그 성산에서 응답하시는도다(셀라)", "내가 누워 자고 깨었으니 여호와께서 나를 붙드심이로다", "천만인이 나를 둘러치려 하여도 나는 두려워 아니하리이다", "여호와여 일어나소서 나의 하나님이여 나를 구원하소서 주께서 나의 모든 원수의 뺨을 치시며 악인의 이를 꺾으셨나이다", "구원은 여호와께 있사오니 주의 복을 주의 백성에게 내리소서(셀라)"], ["내 의의 하나님이여 내가 부를 때에 응답하소서 곤란 중에 나를 너그럽게 하셨사오니 나를 긍휼히 여기사 나의 기도를 들으소서", "인생들아 어느 때까지 나의 영광을 변하여 욕되게 하며 허사를 좋아하고 궤휼을 구하겠는고(셀라)", "여호와께서 자기를 위하여 경건한 자를 택하신줄 너희가 알지어다 내가 부를 때에 여호와께서 들으시리로다", "너희는 떨며 범죄치 말지어다 자리에 누워 심중에 말하고 잠잠할지어다(셀라)", "의의 제사를 드리고 여호와를 의뢰할지어다", "여러 사람의 말이 우리에게 선을 보일 자 누구뇨 하오니 여호와여 주의 얼굴을 들어 우리에게 비취소서", "주께서 내 마음에 두신 기쁨은 저희의 곡식과 새 포도주의 풍성할 때보다 더하니이다", "내가 평안히 눕고 자기도 하리니 나를 안전히 거하게 하시는 이는 오직 여호와시니이다"], ["여호와여 나의 말에 귀를 기울이사 나의 심사를 통촉하소서", "나의 왕, 나의 하나님이여 나의 부르짖는 소리를 들으소서 내가 주께 기도하나이다", "여호와여 아침에 주께서 나의 소리를 들으시리니 아침에 내가 주께 기도하고 바라리이다", "주는 죄악을 기뻐하는 신이 아니시니 악이 주와 함께 유하지 못하며", "오만한 자가 주의 목전에 서지 못하리이다 주는 모든 행악자를 미워하시며", "거짓말하는 자를 멸하시리이다 여호와께서는 피 흘리기를 즐기고 속이는 자를 싫어하시나이다", "오직 나는 주의 풍성한 인자를 힘입어 주의 집에 들어가 주를 경외함으로 성전을 향하여 경배하리이다", "여호와여 나의 원수들을 인하여 주의 의로 나를 인도하시고 주의 길을 내 목전에 곧게 하소서", "저희 입에 신실함이 없고 저희 심중이 심히 악하며 저희 목구멍은 열린 무덤 같고 저희 혀로는 아첨하나이다", "하나님이여 저희를 정죄하사 자기 꾀에 빠지게 하시고 그 많은 허물로 인하여 저희를 쫓아내소서 저희가 주를 배역함이니이다", "오직 주에게 피하는 자는 다 기뻐하며 주의 보호로 인하여 영영히 기뻐 외치며 주의 이름을 사랑하는 자들은 주를 즐거워하리이다", "여호와여 주는 의인에게 복을 주시고 방패로 함 같이 은혜로 저를 호위하시리이다"], ["여호와여 주의 분으로 나를 견책하지 마옵시며 주의 진노로 나를 징계하지 마옵소서", "여호와여 내가 수척하였사오니 긍휼히 여기소서 여호와여 나의 뼈가 떨리오니 나를 고치소서", "나의 영혼도 심히 떨리나이다 여호와여 어느 때까지니이까", "여호와여 돌아와 나의 영혼을 건지시며 주의 인자하심을 인하여 나를 구원하소서", "사망 중에서는 주를 기억함이 없사오니 음부에서 주께 감사할 자 누구리이까", "내가 탄식함으로 곤핍하여 밤마다 눈물로 내 침상을 띄우며 내 요를 적시나이다", "내 눈이 근심을 인하여 쇠하며 내 모든 대적을 인하여 어두웠나이다", "행악하는 너희는 다 나를 떠나라 여호와께서 내 곡성을 들으셨도다", "여호와께서 내 간구를 들으셨음이여 여호와께서 내 기도를 받으시리로다", "내 모든 원수가 부끄러움을 당하고 심히 떪이여 홀연히 부끄러워 물러가리로다"], ["여호와 내 하나님이여 주께 피하오니 나를 쫓는 모든 자에게서 나를 구하여 건지소서", "건져낼 자 없으면 저희가 사자 같이 나를 찢고 뜯을까 하나이다", "여호와 내 하나님이여 내가 이것을 행하였거나 내 손에 죄악이 있거나", "화친한 자를 악으로 갚았거나 내 대적에게 무고히 빼앗았거든", "원수로 나의 영혼을 쫓아 잡아 내 생명을 땅에 짓밟고 내 영광을 진토에 떨어뜨리게 하소서(셀라)", "여호와여 진노로 일어나사 내 대적들의 노를 막으시며 나를 위하여 깨소서 주께서 심판을 명하셨나이다", "민족들의 집회로 주를 두르게 하시고 그 위 높은 자리에 돌아오소서", "여호와께서 만민에게 심판을 행하시오니 여호와여 나의 의와 내게 있는 성실함을 따라 나를 판단하소서", "악인의 악을 끊고 의인을 세우소서 의로우신 하나님이 사람의 심장을 감찰하시나이다", "나의 방패는 마음이 정직한 자를 구원하시는 하나님께 있도다", "하나님은 의로우신 재판장이심이여 매일 분노하시는 하나님이시로다", "사람이 회개치 아니하면 저가 그 칼을 갈으심이여 그 활을 이미 당기어 예비하셨도다", "죽일 기계를 또한 예비하심이여 그 만든 살은 화전이로다", "악인이 죄악을 해산함이여 잔해를 잉태하여 궤휼을 낳았도다", "저가 웅덩이를 파 만듦이여 제가 만든 함정에 빠졌도다", "그 잔해는 자기 머리로 돌아오고 그 포학은 자기 정수리에 내리리로다", "내가 여호와의 의를 따라 감사함이여 지극히 높으신 여호와의 이름을 찬양하리로다"], ["여호와 우리 주여 주의 이름이 온 땅에 어찌 그리 아름다운지요 주의 영광을 하늘 위에 두셨나이다", "주의 대적을 인하여 어린 아이와 젖먹이의 입으로 말미암아 권능을 세우심이여 이는 원수와 보수자로 잠잠케 하려 하심이니이다", "주의 손가락으로 만드신 주의 하늘과 주의 베풀어 두신 달과 별들을 내가 보오니", "사람이 무엇이관대 주께서 저를 생각하시며 인자가 무엇이관대 주께서 저를 권고하시나이까", "저를 천사보다 조금 못하게 하시고 영화와 존귀로 관을 씌우셨나이다", "주의 손으로 만드신 것을 다스리게 하시고 만물을 그 발 아래 두셨으니", "곧 모든 우양과 들짐승이며", "공중의 새와 바다의 어족과 해로에 다니는 것이니이다", "여호와 우리 주여 주의 이름이 온 땅에 어찌 그리 아름다운지요"], ["내가 전심으로 여호와께 감사하오며 주의 모든 기사를 전하리이다", "내가 주를 기뻐하고 즐거워하며 지극히 높으신 주의 이름을 찬송하리니", "내 원수들이 물러갈 때에 주의 앞에서 넘어져 망함이니이다", "주께서 나의 의와 송사를 변호하셨으며 보좌에 앉으사 의롭게 심판하셨나이다", "열방을 책하시고 악인을 멸하시며 저희 이름을 영영히 도말하셨나이다", "원수가 끊어져 영영히 멸망하였사오니 주께서 무너뜨린 성읍들을 기억할 수 없나이다", "여호와께서 영영히 앉으심이여 심판을 위하여 보좌를 예비하셨도다", "공의로 세계를 심판하심이여 정직으로 만민에게 판단을 행하시리로다", "여호와는 또 압제를 당하는 자의 산성이시요 환난 때의 산성이시로다", "여호와여 주의 이름을 아는 자는 주를 의지하오리니 이는 주를 찾는 자들을 버리지 아니하심이니이다", "너희는 시온에 거하신 여호와를 찬송하며 그 행사를 백성 중에 선포할찌어다", "피 흘림을 심문하시는 이가 저희를 기억하심이여 가난한 자의 부르짖음을 잊지 아니하시도다", "여호와여 나를 긍휼히 여기소서 나를 사망의 문에서 일으키시는 주여 미워하는 자에게 받는 나의 곤고를 보소서", "그리하시면 내가 주의 찬송을 다 전할 것이요 딸 같은 시온의 문에서 주의 구원을 기뻐하리이다", "열방은 자기가 판 웅덩이에 빠짐이여 그 숨긴 그물에 자기 발이 걸렸도다", "여호와께서 자기를 알게 하사 심판을 행하셨음이여 악인은 그 손으로 행한 일에 스스로 얽혔도다(힉가욘, 셀라)", "악인이 음부로 돌아감이여 하나님을 잊어버린 모든 열방이 그리 하리로다", "궁핍한 자가 항상 잊어버림을 보지 아니함이여 가난한 자가 영영히 실망치 아니하리로다", "여호와여 일어나사 인생으로 승리를 얻지 못하게 하시며 열방으로 주의 목전에 심판을 받게하소서", "여호와여 저희로 두렵게 하시며 열방으로 자기는 인생 뿐인줄 알게 하소서(셀라)"], ["여호와여 어찌하여 멀리 서시며 어찌하여 환난 때에 숨으시나이까", "악한 자가 교만하여 가련한 자를 심히 군박하오니 저희로 자기의 베푼 꾀에 빠지게 하소서", "악인은 그 마음의 소욕을 자랑하며 탐리하는 자는 여호와를 배반하여 멸시하나이다", "악인은 그 교만한 얼굴로 말하기를 여호와께서 이를 감찰치 아니하신다 하며 그 모든 사상에 하나님이 없다 하나이다", "저의 길은 언제든지 견고하고 주의 심판은 높아서 저의 안력이 미치지 못하오며 저는 그 모든 대적을 멸시하며", "그 마음에 이르기를 나는 요동치 아니하며 대대로 환난을 당치 아니하리라 하나이다", "그 입에는 저주와 궤휼과 포학이 충만하며 혀 밑에는 잔해와 죄악이 있나이다", "저가 향촌 유벽한 곳에 앉으며 그 은밀한 곳에서 무죄한 자를 죽이며 그 눈은 외로운 자를 엿보나이다", "사자가 그 굴혈에 엎드림 같이 저가 은밀한 곳에 엎드려 가련한 자를 잡으려고 기다리며 자기 그물을 끌어 가련한 자를 잡나이다", "저가 구푸려 엎드리니 그 강포로 인하여 외로운 자가 넘어지나이다", "저의 마음에 이르기를 하나님이 잊으셨고 그 얼굴을 가리우셨으니 영원히 보지 아니하시리라 하나이다", "여호와여 일어나옵소서 하나님이여 손을 드옵소서 가난한 자를 잊지 마옵소서", "어찌하여 악인이 하나님을 멸시하여 그 마음에 이르기를 주는 감찰치 아니하리라 하나이까", "주께서는 보셨나이다 잔해와 원한을 감찰하시고 주의 손으로 갚으려 하시오니 외로운 자가 주를 의지하나이다 주는 벌써부터 고아를 도우시는 자니이다", "악인의 팔을 꺾으소서 악한 자의 악을 없기까지 찾으소서", "여호와께서는 영원무궁토록 왕이시니 열방이 주의 땅에서 멸망하였나이다", "여호와여 주는 겸손한 자의 소원을 들으셨으니 저희 마음을 예비하시며 귀를 기울여 들으시고", "고아와 압박 당하는 자를 위하여 심판하사 세상에 속한 자로 다시는 위협지 못하게 하시리이다"]];
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=s=>{s=Math.max(0,Math.floor(s||0));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const toast=m=>{const t=$("toast");t.textContent=m;t.classList.add("show");clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove("show"),2400)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ranges=a=>{a=[...new Set(a)].sort((x,y)=>x-y);const o=[];for(const n of a){const l=o[o.length-1];if(l&&n===l[1]+1)l[1]=n;else o.push([n,n])}return o.map(([x,y])=>x===y?`${x}`:`${x}-${y}`).join(",")};
const parseR=s=>{const o=[];for(const p of String(s).split(/[,·\s]+/)){const m=p.match(/^(\d+)(?:[-~](\d+))?$/);if(m)for(let i=+m[1];i<=+(m[2]||m[1]);i++)o.push(i)}return o};
/* "청년1팀은혜순 김은혜"처럼 붙여 써도 "청년1팀 은혜순 김은혜"로 정리 */
const fixName=s=>String(s||"").replace(/(팀)(?=\S)/,"$1 ").replace(/(순)(?=\S)/,"$1 ").replace(/\s+/g," ").trim();
const PEN=["#ffe45c","#ffc2d4","#b5e3ff","#c9f0a8","#ffd0a1","#dccbff","#a8eedd","#e9d9b4"];

let key="1",cur={t:"",v:[]},idx=0,tab="",fs=store.get("fs",22),me=store.get("me","");
let names=store.get("names",{});
let phase="idle",mr=null,stream=null,chunks=[],marks=[],t0=0,pausedAt=0,pausedTotal=0,tick=null,actx=null,an=null,raf=null,gateTimer=null;
let recs=[],mix=[],playing=null,db=null,qi=-1;

$("pick").innerHTML=PS.map((_,i)=>`<option value="${i+1}">시편 ${i+1}편</option>`).join("")+`<option value="c">직접 붙여넣기…</option>`;
$("meter").innerHTML=Array.from({length:30},()=>"<span></span>").join("");
$("nr").value=String(store.get("nr",1));$("nr").onchange=e=>store.set("nr",+e.target.value);

const nm=()=>names[key]||(names[key]={});
const splitMe=s=>{const m=String(s||"").match(/^(?:(\S+?)팀\s+)?(?:(\S+?)순\s+)?(.*)$/)||[];return[m[1]||"",m[2]||"",m[3]||""]};
const joinMe=(t,u,n)=>{t=t.trim().replace(/팀$/,"");u=u.trim().replace(/순$/,"");n=n.trim();return n?[t&&t+"팀",u&&u+"순",n].filter(Boolean).join(" "):""};
const saveNames=()=>store.set("names",names);
let meP=store.get("meP",null)||splitMe(me);
function fillMe(skip){["T","S","N"].forEach((k,i)=>{for(const pre of["me","ak"]){const el=$(pre+k);if(el!==skip)el.value=meP[i]}})}
for(const pre of["me","ak"])["T","S"].forEach((k,i)=>$(pre+k).addEventListener("change",e=>{meP[i]=e.target.value.trim().replace(i?/순$/:/팀$/,"");store.set("meP",meP);fillMe()}));
function setMe(v){meP=splitMe(v);me=v;store.set("me",me);store.set("meP",meP);fillMe();renderRead()}
for(const pre of["me","ak"])["T","S","N"].forEach((k,i)=>$(pre+k).addEventListener("input",e=>{meP[i]=e.target.value;me=joinMe(...meP);store.set("me",me);store.set("meP",meP);fillMe(e.target);clearTimeout(setMe.h);setMe.h=setTimeout(renderRead,350)}));
const people=()=>[...new Set(cur.v.map((_,i)=>nm()[i]).filter(Boolean))];
const pen=x=>{const i=people().indexOf(x);return i<0?"#cfcfcf":PEN[i%PEN.length]};
const myIdx=()=>cur.v.map((_,i)=>i).filter(i=>me&&nm()[i]===me);

function load(k){key=String(k);
 if(key==="c"){const c=store.get("custom",null);if(!c){openPaste();return}cur=c}else cur={t:`시편 ${key}편`,v:PS[+key-1]};
 $("pick").value=key;store.set("pick",key);idx=0;document.querySelectorAll(".pt").forEach(e=>e.textContent=cur.t);
 mix=[];stopQ();render()}
function render(){renderAssign();renderRead();renderMix()}

/* ── 1 배정 ── */
function stripHTML(get){const out=[];let run=null;cur.v.forEach((_,i)=>{const x=get(i)||"";if(run&&run.x===x)run.n++;else out.push(run={x,n:1})});
 return out.map(r=>`<span class="${r.x?"":"no"}" style="flex-grow:${r.n};--c:${pen(r.x)}" title="${esc(r.x||"미정")}"></span>`).join("")}
function renderAssign(full=true){const n=nm();
 if(full)$("alist").innerHTML=cur.v.map((v,i)=>`<li><b>${i+1}</b><span class="s">${esc(v)}</span><input data-i="${i}" placeholder="○○팀 ○○순 이름" value="${esc(n[i]||"")}" aria-label="${i+1}절 읽는 사람" enterkeyhint="next" autocomplete="off"></li>`).join("");
 $("alist").querySelectorAll("input").forEach(inp=>inp.style.setProperty("--c",n[inp.dataset.i]?pen(n[inp.dataset.i]):"transparent"));
 $("strip").innerHTML=stripHTML(i=>n[i]);
 const p=people(),left=cur.v.filter((_,i)=>!n[i]).length;
 $("legend").innerHTML=p.map(x=>{const a=cur.v.map((_,i)=>i+1).filter(i=>n[i-1]===x);return `<span><em class="tag" style="--c:${pen(x)}">${esc(x)}</em><span class="cnt">${ranges(a)}절</span></span>`}).join("")+(left?`<span class="cnt">${p.length?"· ":""}미정 ${left}절</span>`:"")}
$("alist").addEventListener("input",e=>{const t=e.target,n=nm(),v=fixName(t.value);if(v)n[t.dataset.i]=v;else delete n[t.dataset.i];saveNames();clearTimeout(render.h);render.h=setTimeout(()=>{renderAssign(false);renderRead()},350)});
$("alist").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();const nx=$("alist").querySelector(`input[data-i="${+e.target.dataset.i+1}"]`);nx?nx.focus():e.target.blur()}});
function quick(mode){const L=$("qnames").value.split(/[,，、\n]+/).map(fixName).filter(Boolean);if(!L.length){toast("이름을 먼저 적어 주세요");$("qnames").focus();return}
 const n={},V=cur.v.length;cur.v.forEach((_,i)=>n[i]=mode==="round"?L[i%L.length]:L[Math.min(L.length-1,Math.floor(i*L.length/V))]);
 names[key]=n;saveNames();store.set("qnames",$("qnames").value);render();toast(`${L.length}명에게 ${V}절을 나눴어요. 아래에서 고칠 수 있어요`)}
$("qRound").onclick=()=>quick("round");$("qBlock").onclick=()=>quick("block");$("qnames").value=store.get("qnames","");
function planText(){const n=nm(),rows=[];let run=null;cur.v.forEach((_,i)=>{const x=n[i];if(!x){run=null;return}if(run&&run.x===x)run.b=i+1;else rows.push(run={x,a:i+1,b:i+1})});
 const miss=cur.v.map((_,i)=>i+1).filter(i=>!n[i-1]);
 return `${cur.t} 나눠 읽기\n`+rows.map(r=>`${r.a===r.b?r.a:r.a+"-"+r.b}절 ${r.x}`).join("\n")+(miss.length?`\n(미정: ${ranges(miss)}절)`:"")}
$("copyPlan").onclick=async()=>{const t=planText();try{await navigator.clipboard.writeText(t);toast("배정표를 복사했어요. 단톡방에 붙여 넣으세요")}catch(e){$("pasteBox").open=true;$("planIn").value=t;$("planIn").select();toast("아래 글을 길게 눌러 복사하세요")}};
function confirmBtn(b,label,fn){if(b.dataset.c!=="1"){b.dataset.c="1";b.dataset.l=b.textContent;b.textContent=label;setTimeout(()=>{if(b.isConnected&&b.dataset.c==="1"){b.dataset.c="";b.textContent=b.dataset.l}},3000);return}b.dataset.c="";b.textContent=b.dataset.l;fn()}
$("clearPlan").onclick=e=>confirmBtn(e.currentTarget,"한 번 더 누르면 지워요",()=>{names[key]={};saveNames();render()});
function openPaste(){$("pick").value=key;location.hash="assign";$("pasteBox").open=true;$("pasteSum").textContent="다른 본문 붙여 넣기";$("planIn").dataset.mode="text";$("planIn").value="";$("planIn").placeholder="첫 줄에 제목, 다음 줄부터 한 줄에 한 절씩 붙여 넣으세요.";$("planIn").focus()}
$("applyPlan").onclick=()=>{const raw=$("planIn").value.trim();if(!raw)return;
 if($("planIn").dataset.mode==="text"){const L=raw.split(/\n+/).map(s=>s.trim()).filter(Boolean);const t=L.length>1&&!/^\d/.test(L[0])?L.shift():"붙여 넣은 본문";
  store.set("custom",{t,v:L.map(s=>s.replace(/^\d+[.)\s]*/,""))});names.c={};saveNames();$("planIn").dataset.mode="";$("planIn").value="";$("pasteSum").textContent="받은 배정표 붙여 넣기";$("pasteBox").open=false;load("c");return}
 const m=raw.match(/시편\s*(\d+)\s*편/);if(m&&PS[+m[1]-1]&&m[1]!==key)load(m[1]);
 const n={};let c=0;for(const line of raw.split(/\n/)){const r=line.match(/^\s*([\d,\-~\s]+?)\s*절\s*[:：]?\s*(.+?)\s*$/);if(!r)continue;for(const i of parseR(r[1]))if(i>=1&&i<=cur.v.length){n[i-1]=r[2];c++}}
 if(!c){toast("'3절 이름' 꼴의 줄을 찾지 못했어요");return}
 names[key]=n;saveNames();render();$("planIn").value="";$("pasteBox").open=false;toast(`${c}개 절에 이름을 넣었어요`)};

/* ── 2 낭독 ── */
function renderRead(){const n=nm(),p=people();if(me&&!p.includes(me)&&p.length){}
 $("who").innerHTML=p.some(q=>q!==me)?`<span class="lead" style="margin:0">배정된 이름에서 고르기</span>`+p.map(x=>`<button data-n="${esc(x)}" class="${x===me?"on":""}" style="--c:${pen(x)}" aria-pressed="${x===me}">${esc(x)}</button>`).join("")
  :"";
 $("text").innerHTML=cur.v.map((v,i)=>`<li data-i="${i}" class="${me&&n[i]===me?"mine":""}" style="--c:${pen(n[i])}"><b>${i+1}</b><p><span class="v">${esc(v)}</span>${(o=>o?`<button class="spk" data-s="${i}" style="--c:${pen(o.reader)}" aria-label="${i+1}절 ${esc(o.reader||"")} 녹음 듣기">${SPK}<span>${esc(o.reader||"녹음")}</span></button>`:n[i]?`<em class="tag">${esc(n[i])}</em>`:"")(srcOf(i))}</p></li>`).join("");
 $("text").classList.toggle("only",myIdx().length>0);hl(idx,false)}
function hl(i,scroll=true){if(!cur.v.length)return;idx=Math.max(0,Math.min(cur.v.length-1,i));
 [...$("text").children].forEach((li,j)=>li.classList.toggle("cur",j===idx));
 if(scroll&&tab==="read"){const li=$("text").children[idx],r=li.getBoundingClientRect();if(r.top<150||r.bottom>innerHeight-190)li.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth",block:"center"})}
 if(phase==="rec"&&marks[marks.length-1]?.i!==idx)marks.push({t:elapsed(),i:idx})}
function go(d){const m=myIdx();if(m.length){const nx=d>0?m.find(i=>i>idx):[...m].reverse().find(i=>i<idx);if(nx!=null)return hl(nx);if(d>0&&phase==="rec")toast("맡은 절을 다 읽었어요. ■ 를 눌러 마치세요");return}hl(idx+d)}
$("text").onclick=e=>{const b=e.target.closest(".spk");if(b){playVerse(+b.dataset.s);return}const li=e.target.closest("li");if(li)hl(+li.dataset.i)};
/* 절별 듣기: 녹음하며 절을 넘긴 시각으로 그 절만 재생 */
const SPK='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 010 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
function starts(o){const st={};if(o.marks&&o.marks.length){for(const k of o.marks)if(!(k.i in st))st[k.i]=k.t}else if(o.tm)[...o.vs].sort((a,b)=>a-b).forEach((v,j)=>{if(o.tm[j]!=null&&!isNaN(o.tm[j]))st[v-1]=o.tm[j]/10});return st}
function srcOf(i){for(const o of mix)if(o.vs.includes(i+1))return o;for(const r of recs)if(r.key===key&&r.reader!=="합본"&&r.vs.includes(i+1))return r;return null}
/* 웹오디오로 해당 구간만 정확히 재생(녹음 파일은 탐색이 불안정할 수 있음), 실패하면 일반 재생으로 */
const va=new Audio();let vaI=-1,vaEnd=0,vac=null,vsrc=null;
const spkOff=()=>{vaI=-1;$("text").querySelectorAll(".spk.on").forEach(b=>b.classList.remove("on"))};
const spkOn=i=>{vaI=i;const b=$("text").querySelector(`.spk[data-s="${i}"]`);b&&b.classList.add("on")};
va.ontimeupdate=()=>{if(vaEnd&&va.currentTime>=vaEnd-0.04)va.pause()};
va.onpause=va.onended=spkOff;
const vStop={pause(){if(vsrc){try{vsrc.onended=null;vsrc.stop()}catch(e){}vsrc=null}va.pause();spkOff()}};
async function playVerse(i){if(phase!=="idle")return;const was=vaI;stopAll();if(was===i)return;const o=srcOf(i);if(!o)return;
 const st=starts(o),s=st[i]||0,later=Object.values(st).filter(t=>t>s+0.05),end=later.length?Math.min(...later):0;
 hl(i);playing=vStop;spkOn(i);
 try{if(!vac)vac=new (window.AudioContext||window.webkitAudioContext)();if(vac.state==="suspended")vac.resume();
  if(!o._buf){const ab=await o.blob.arrayBuffer();o._buf=await new Promise((ok,no)=>{const q=vac.decodeAudioData(ab,ok,no);q&&q.then&&q.then(ok,no)})}
  if(vaI!==i)return;const src=vac.createBufferSource();src.buffer=o._buf;src.connect(vac.destination);
  src.onended=()=>{if(vsrc===src){vsrc=null;spkOff()}};vsrc=src;src.start(0,Math.min(s,o._buf.duration),end?Math.max(0.1,end-s):undefined)}
 catch(e){/* 대체 경로 */
  if(vaI!==i)return;vaEnd=end;if(!o._u)o._u=recs.includes(o)?urlOf(o):URL.createObjectURL(o.blob);va.src=o._u;
  va.onloadedmetadata=()=>{try{if(s>0)va.currentTime=s}catch(x){}va.play().then(()=>spkOn(i)).catch(()=>{spkOff();toast("재생할 수 없어요")})};va.load()}}
$("who").onclick=e=>{const b=e.target.closest("button");if(!b)return;setMe(me===b.dataset.n?"":b.dataset.n);const m=myIdx();if(m.length)hl(m[0])};
$("prev").onclick=()=>go(-1);$("next").onclick=()=>go(1);
const applyFs=()=>{document.documentElement.style.setProperty("--fs",fs+"px");store.set("fs",fs)};
$("fsUp").onclick=()=>{fs=Math.min(36,fs+2);applyFs()};$("fsDown").onclick=()=>{fs=Math.max(16,fs-2);applyFs()};
addEventListener("keydown",e=>{if(tab!=="read"||/TEXTAREA|INPUT|SELECT/.test(e.target.tagName))return;if(e.key==="ArrowRight"||e.key==="ArrowDown"){e.preventDefault();go(1)}if(e.key==="ArrowLeft"||e.key==="ArrowUp"){e.preventDefault();go(-1)}});

/* 녹음 */
const elapsed=()=>t0?((pausedAt||performance.now())-t0-pausedTotal)/1000:0;
function meterLoop(){const d=new Uint8Array(an.fftSize);an.getByteTimeDomainData(d);let m=0;for(const x of d)m=Math.max(m,Math.abs(x-128));
 const f=$("meter").firstElementChild;f.style.height=(12+Math.min(1,m/70)*88)+"%";$("meter").appendChild(f);raf=requestAnimationFrame(meterLoop)}
function teardown(){clearInterval(tick);clearInterval(gateTimer);gateTimer=null;cancelAnimationFrame(raf);
 stream&&stream.getTracks().forEach(t=>t.stop());stream=null;try{actx&&actx.close()}catch(e){}actx=null;
 $("meter").classList.remove("live");[...$("meter").children].forEach(s=>s.style.height="16%");
 const b=$("recBtn");b.classList.remove("on");b.innerHTML="<i></i>";b.setAttribute("aria-label","녹음 시작");$("pauseBtn").classList.remove("show");$("pauseBtn").textContent="❚❚";
 $("clock").textContent="0:00";phase="idle";t0=0}
async function start(){
 stopAll();$("last").hidden=true;
 if(!me){$("ask").hidden=false;fillMe();$("akT").focus();$("state").textContent="먼저 이름을 적어 주세요";return}
 $("ask").hidden=true;
 const m=myIdx();if(m.length&&!m.includes(idx))hl(m[0]);
 const nr=+$("nr").value;phase="count";
 try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:nr>0,noiseSuppression:nr>0,autoGainControl:nr>0,channelCount:1}})}
 catch(e){phase="idle";$("warn").hidden=false;$("warn").scrollIntoView({block:"center"});$("state").textContent="마이크를 쓸 수 없어요";redo=null;return}
 /* 잡음 처리: 저역 차단 → 60Hz 험 제거 → 고역 차단 → [강하게] 노이즈 게이트 → 컴프레서 */
 let recStream=stream;
 try{actx=new (window.AudioContext||window.webkitAudioContext)();if(actx.state==="suspended")await actx.resume();
  let node=actx.createMediaStreamSource(stream);
  if(nr>0){const hp=actx.createBiquadFilter();hp.type="highpass";hp.frequency.value=nr>1?110:85;hp.Q.value=.7;
   const hum=actx.createBiquadFilter();hum.type="notch";hum.frequency.value=60;hum.Q.value=8;
   const lp=actx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=nr>1?7000:9000;
   node.connect(hp);hp.connect(hum);hum.connect(lp);node=lp;
   if(nr>1){const side=actx.createAnalyser();side.fftSize=1024;lp.connect(side);const gate=actx.createGain();lp.connect(gate);node=gate;
    const buf=new Float32Array(side.fftSize);let floor=0.01,open=false;const ctx=actx;
    gateTimer=setInterval(()=>{side.getFloatTimeDomainData(buf);let s=0;for(const x of buf)s+=x*x;const rms=Math.sqrt(s/buf.length);
     floor=rms<floor?floor*0.9+rms*0.1:floor*0.998+rms*0.002;
     const want=rms>floor*2.6+0.004;if(want!==open){open=want;gate.gain.setTargetAtTime(open?1:0.12,ctx.currentTime,open?0.01:0.18)}},30)}
   const comp=actx.createDynamicsCompressor();comp.threshold.value=-24;comp.ratio.value=3;comp.attack.value=.005;comp.release.value=.2;
   node.connect(comp);node=comp}
  an=actx.createAnalyser();an.fftSize=512;node.connect(an);
  const dest=actx.createMediaStreamDestination();node.connect(dest);recStream=dest.stream;
  $("meter").classList.add("live");meterLoop()}catch(e){recStream=stream}
 for(let c=3;c>0;c--){$("recBtn").textContent=c;$("state").textContent="준비… 숨을 고르세요";await sleep(700);if(phase!=="count"){teardown();$("state").textContent="취소했어요";redo=null;return}}
 const types=["audio/webm;codecs=opus","audio/mp4","audio/webm","audio/ogg"];
 const type=types.find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t))||"";
 try{mr=new MediaRecorder(recStream,type?{mimeType:type,audioBitsPerSecond:96000}:{})}catch(e){teardown();$("warn").hidden=false;return}
 chunks=[];marks=[{t:0,i:idx}];t0=performance.now();pausedAt=0;pausedTotal=0;phase="rec";
 mr.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};mr.onstop=finish;mr.start(500);
 const b=$("recBtn");b.innerHTML="<i></i>";b.classList.add("on");b.setAttribute("aria-label","녹음 마치기");$("pauseBtn").classList.add("show");
 const upd=()=>{$("clock").textContent=fmt(elapsed());$("state").textContent=pausedAt?"일시정지":`녹음 중 · ${idx+1}절`};upd();tick=setInterval(upd,250)}
function finish(){const dur=elapsed(),type=mr.mimeType||"audio/webm";mr=null;teardown();
 const blob=new Blob(chunks,{type}),vs=[...new Set(marks.map(m=>m.i+1))];
 const r={id:Date.now(),title:cur.t,key,reader:me||nm()[marks[0].i]||"",vs,date:new Date().toISOString(),dur,marks,blob};
 const old=redo&&recs.find(o=>o.id===redo);redo=null;if(old)removeRec(old,true);
 recs.unshift(r);put(r);
 if(old)toast("다시 녹음했어요. 예전 녹음은 지웠어요");
 if(me){const n=nm();for(const v of vs)n[v-1]=me;saveNames();renderAssign()}
 renderRead();renderMix();renderList();showLast(r);$("state").textContent="저장했어요"}
$("recBtn").onclick=()=>{if(phase==="idle")start();else if(phase==="count")phase="cancel";else if(mr&&mr.state!=="inactive")mr.stop()};
$("pauseBtn").onclick=()=>{if(!mr)return;if(mr.state==="recording"){mr.pause();pausedAt=performance.now();$("pauseBtn").textContent="▶"}else if(mr.state==="paused"){pausedTotal+=performance.now()-pausedAt;pausedAt=0;mr.resume();$("pauseBtn").textContent="❚❚"}};

const extOf=b=>{const t=b.type||"";return t.includes("mp4")?"m4a":t.includes("ogg")?"ogg":t.includes("wav")?"wav":t.includes("mpeg")?"mp3":"webm"};
const fname=r=>`${r.title.replace(/\s+/g,"")}_${(r.reader||"이름없음").replace(/[\\/:*?"<>|_]/g,"").trim().replace(/\s+/g,"-")}_${ranges(r.vs)}절${tmOf(r)}.${extOf(r.blob)}`;
const tmOf=r=>{const st=starts(r),a=[...r.vs].sort((x,y)=>x-y).map(v=>Math.round((st[v-1]||0)*10));return a.length>1?"_t"+a.join("-"):""};
const label=r=>`${r.title} ${ranges(r.vs||[])}절${r.reader?" · "+r.reader:""}`;
const urls=new Map();const urlOf=r=>{if(!urls.has(r.id))urls.set(r.id,URL.createObjectURL(r.blob));return urls.get(r.id)};
function stopAll(){if(playing){const p=playing;playing=null;p.pause()}stopQ()}
/* 작은 재생기 */
function player(r){const el=document.createElement("div");el.className="pl";el.innerHTML=`<button aria-label="재생">▶</button><div class="bar"><i></i></div><span class="tm">${fmt(r.dur)}</span>`;
 const a=new Audio(),[btn,bar,tm]=el.children;a.preload="none";
 const D=()=>isFinite(a.duration)&&a.duration>0?a.duration:(r.dur||0);
 btn.onclick=()=>{if(a.paused){stopAll();if(!a.src)a.src=urlOf(r);playing=a;a.play().catch(()=>toast("재생할 수 없어요"))}else a.pause()};
 a.onplay=()=>{btn.textContent="❚❚";if(r.key&&r.key!==key&&(PS[+r.key-1]||r.key==="c"))load(r.key)};
 a.onpause=()=>{btn.textContent="▶"};a.onended=()=>{bar.firstChild.style.width="0";tm.textContent=fmt(r.dur)};
 a.ontimeupdate=()=>{const d=D();bar.firstChild.style.width=d?Math.min(100,a.currentTime/d*100)+"%":"0";tm.textContent=fmt(a.currentTime)+" / "+fmt(d);
  if(r.marks&&r.marks.length){let m=r.marks[0];for(const k of r.marks)if(k.t<=a.currentTime+0.05)m=k;if(m.i!==idx)hl(m.i)}};
 bar.onclick=e=>{if(a.src&&isFinite(a.duration)){const b=bar.getBoundingClientRect();a.currentTime=(e.clientX-b.left)/b.width*a.duration}};
 el.audio=a;return el}
/* 지우기: 녹음과 함께, 이 녹음으로 자동 기재된 이름도 (다른 녹음이 그 절을 갖고 있지 않으면) 지운다 */
function removeRec(r,keepNames){stopAll();recs=recs.filter(y=>y!==r);del(r.id);
 if(urls.has(r.id)){URL.revokeObjectURL(urls.get(r.id));urls.delete(r.id)}
 if(!keepNames&&r.key&&names[r.key]){const n=names[r.key];for(const v of r.vs||[])if(n[v-1]===r.reader&&!recs.some(o=>o.key===r.key&&o.reader===r.reader&&o.vs.includes(v)))delete n[v-1];saveNames()}
 if(!$("last").hidden&&$("last").dataset.id==r.id)$("last").hidden=true;
 if(r.key===key){renderAssign();renderRead()}renderList();renderMix()}
let redo=null;
function reRecord(r){if(phase!=="idle")return;if(r.key&&r.key!==key&&(PS[+r.key-1]||r.key==="c"))load(r.key);
 if(r.reader&&r.reader!=="합본"&&r.reader!==me){me=r.reader;meP=splitMe(me);store.set("me",me);store.set("meP",meP);fillMe();renderRead()}
 redo=r.id;location.hash="read";hl((r.vs&&r.vs[0]||1)-1);toast(`${ranges(r.vs||[])}절을 다시 녹음해요. 끝나면 예전 녹음은 지워져요`);start()}
function showLast(r){$("last").dataset.id=r.id;$("lastRe").onclick=()=>reRecord(r);$("lastDel").onclick=e=>confirmBtn(e.currentTarget,"정말 지울까요?",()=>{removeRec(r);toast("녹음을 지웠어요")});$("lastT").textContent=label(r);$("lastD").textContent=fmt(r.dur);$("lastSave").href=urlOf(r);$("lastSave").download=fname(r);
 $("lastPlay").onclick=()=>{const b=$("list").querySelector(`.rec[data-id="${r.id}"] .pl button`);b&&b.click()};$("last").hidden=false}
$("lastX").onclick=()=>{$("last").hidden=true};
$("akX").onclick=()=>{$("ask").hidden=true;$("state").textContent="붉은 버튼을 눌러 시작"};
$("akGo").onclick=()=>{if(!me){toast("이름을 적어 주세요");$("akN").focus();return}start()};
$("akN").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();$("akGo").click()}});$("lastSave").addEventListener("click",()=>toast("저장한 파일을 담당자에게 보내세요"));
function idb(){return new Promise(res=>{try{const q=indexedDB.open("psalm-rec",2);q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains("r"))q.result.createObjectStore("r",{keyPath:"id"})};q.onsuccess=()=>res(q.result);q.onerror=()=>res(null)}catch(e){res(null)}})}
function put(x){try{db&&db.transaction("r","readwrite").objectStore("r").put(x)}catch(e){}}
function del(id){try{db&&db.transaction("r","readwrite").objectStore("r").delete(id)}catch(e){}}
function renderList(){const L=$("list");
 if(!recs.length){L.innerHTML='<div class="empty">아직 녹음이 없습니다. 아래 붉은 버튼을 누르고 읽으면서 › 로 절을 넘기세요.</div>';return}
 L.innerHTML="";for(const r of recs){const d=new Date(r.date),el=document.createElement("div");el.className="rec";el.dataset.id=r.id;
  el.innerHTML=`<div class="t"><strong>${esc(label(r))}</strong><span>${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}</span></div><div class="row"><a class="btn pri">파일로 저장</a>${r.reader==="합본"?"":`<button class="btn">다시 녹음</button>`}<button class="btn q">지우기</button></div>`;
  el.insertBefore(player(r),el.lastChild);const bs=[...el.lastChild.children],s=bs[0],x=bs[bs.length-1];s.href=urlOf(r);s.download=fname(r);
  if(bs.length===3)bs[1].onclick=()=>reRecord(r);
  x.onclick=()=>confirmBtn(x,"한 번 더 누르면 지워요",()=>{removeRec(r);toast("녹음을 지웠어요")});L.appendChild(el)}}

/* ── 3 모으기 ── */
function parseName(n){const m=n.match(/시편(\d+)편_(.+?)_([\d,\-]+)절(?:_t([\d\-]+))?/);if(m)return{key:m[1],reader:fixName(m[2].replace(/-/g," ")),vs:parseR(m[3]),tm:m[4]?m[4].split("-").map(Number):null};
 const v=n.match(/([\d,\-]+)\s*절/);return{key:null,reader:n.replace(/\.[^.]+$/,""),vs:v?parseR(v[1]):[]}}
function renderMix(){mix.sort((a,b)=>(a.vs[0]||999)-(b.vs[0]||999));const who=i=>{const m=mix.find(m=>m.vs.includes(i+1));return m?(m.reader||"?"):""};
 $("cstrip").innerHTML=stripHTML(who);
 $("mix").innerHTML=mix.length?mix.map((m,i)=>`<div class="r" data-i="${i}"><span class="vs">${m.vs.length?esc(ranges(m.vs))+"절":"절 ?"}</span><span class="n"><em class="tag" style="--c:${pen(m.reader)}">${esc(m.reader||m.name)}</em></span><button class="x" data-x="${i}" aria-label="빼기">×</button></div>`).join("")
  :'<div class="empty">아직 불러온 파일이 없습니다. 파일 이름에 절 번호가 있으면 순서를 알아서 맞춥니다.</div>';
 const got=new Set(mix.flatMap(m=>m.vs)),miss=cur.v.map((_,i)=>i+1).filter(i=>!got.has(i));
 $("mixNote").textContent=mix.length?(miss.length?`${cur.v.length}절 중 ${cur.v.length-miss.length}절 모임 · 아직 없는 절: ${ranges(miss)}절`:`${cur.t} 전체 ${cur.v.length}절이 모였어요.`):`${cur.t} · 전체 ${cur.v.length}절`;rowHi()}
$("mix").onclick=e=>{const b=e.target.closest("[data-x]");if(b){stopAll();mix.splice(+b.dataset.x,1);renderMix();renderRead()}};
$("loadFiles").onchange=e=>{const fl=[...e.target.files];e.target.value="";const k=fl.map(f=>parseName(f.name)).find(p=>p.key&&p.key!==key&&PS[+p.key-1]);if(k)load(k.key);
 const n=nm();for(const f of fl){const p=parseName(f.name);mix.push({name:f.name,blob:f,reader:p.reader,vs:p.vs,tm:p.tm});if(p.key)for(const v of p.vs)if(v>=1&&v<=cur.v.length)n[v-1]=p.reader}saveNames();render()};
$("addMine").onclick=()=>{const mine=recs.filter(r=>r.key===key&&r.reader!=="합본");if(!mine.length){toast("이 편의 내 녹음이 없어요");return}let c=0;for(const r of mine)if(!mix.some(m=>m.id===r.id)){mix.push({id:r.id,name:fname(r),blob:r.blob,reader:r.reader,vs:r.vs,marks:r.marks});c++}renderMix();renderRead();toast(c?`${c}개를 넣었어요`:"이미 다 들어 있어요")};
function rowHi(){[...$("mix").querySelectorAll(".r")].forEach((r,i)=>r.classList.toggle("play",i===qi))}
function nowShow(m,i){$("now").hidden=false;$("nowWho").textContent=m.reader||"?";$("nowWho").style.setProperty("--c",pen(m.reader));$("nowV").textContent=`${i+1}절`;$("nowT").textContent=cur.v[i]||""}
function stopQ(){const p=$("player");if(qi>=0){p.pause()}qi=-1;$("playAll").textContent="▶ 이어 듣기";$("now").hidden=true;rowHi()}
$("playAll").onclick=()=>{if(qi>=0){stopQ();return}if(!mix.length){toast("먼저 녹음 파일을 불러오세요");return}stopAll();qi=0;$("playAll").textContent="■ 멈추기";playQ()};
function playQ(){const p=$("player"),m=mix[qi];if(!m){stopQ();return}rowHi();
 if(p.src)URL.revokeObjectURL(p.src);p.src=URL.createObjectURL(m.blob);let at=m.vs.length?m.vs[0]-1:-1;if(at>=0)nowShow(m,at);else $("now").hidden=true;
 p.ontimeupdate=()=>{if(!m.marks||!m.marks.length)return;let k=m.marks[0];for(const x of m.marks)if(x.t<=p.currentTime+0.05)k=x;if(k.i!==at){at=k.i;nowShow(m,at)}};
 p.onended=()=>setTimeout(()=>{if(qi<0)return;qi++;playQ()},+$("gapSel").value*1000);
 p.play().catch(()=>{stopQ();toast("재생할 수 없는 파일이 있어요")})}
$("merge").onclick=async()=>{if(!mix.length){toast("먼저 녹음 파일을 불러오세요");return}
 const b=$("merge");b.disabled=true;b.textContent="합치는 중…";stopAll();
 try{const AC=window.AudioContext||window.webkitAudioContext,ac=new AC(),bufs=[];
  for(const m of mix){const ab=await m.blob.arrayBuffer();bufs.push(await new Promise((ok,no)=>{const p=ac.decodeAudioData(ab,ok,no);p&&p.then&&p.then(ok,no)}))}
  ac.close&&ac.close();const SR=32000,gap=+$("gapSel").value,total=bufs.reduce((s,x)=>s+x.duration+gap,0.3);
  const off=new OfflineAudioContext(1,Math.ceil(total*SR),SR);let t=0.3;
  for(const x of bufs){const d=x.getChannelData(0);let s2=0,n=0;for(let i=0;i<d.length;i+=4){const a=Math.abs(d[i]);if(a>0.02){s2+=a*a;n++}}
   const rms=n?Math.sqrt(s2/n):0.1,g=off.createGain();g.gain.value=Math.min(6,Math.max(0.3,0.12/rms));
   const s=off.createBufferSource();s.buffer=x;s.connect(g);g.connect(off.destination);s.start(t);t+=x.duration+gap}
  const out=await off.startRendering(),wav=toWav(out.getChannelData(0),SR);
  const r={id:Date.now(),title:cur.t+" 함께 읽기",key,reader:"합본",vs:[...new Set(mix.flatMap(m=>m.vs))],date:new Date().toISOString(),dur:out.duration,marks:[],blob:wav};
  recs.unshift(r);put(r);renderList();const a=document.createElement("a");a.href=urlOf(r);a.download=`${cur.t.replace(/\s+/g,"")}_함께읽기.wav`;document.body.appendChild(a);a.click();a.remove();
  toast(`${fmt(out.duration)} 길이의 파일로 합쳤어요`)}
 catch(e){toast("합치지 못했어요. 이 브라우저가 못 읽는 형식이 섞여 있을 수 있어요")}
 b.disabled=false;b.textContent="한 파일로 합치기"};
function toWav(f,sr){let pk=0;for(const x of f)pk=Math.max(pk,Math.abs(x));const g=pk>0.9?0.9/pk:1;
 const v=new DataView(new ArrayBuffer(44+f.length*2)),w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
 w(0,"RIFF");v.setUint32(4,36+f.length*2,true);w(8,"WAVE");w(12,"fmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,"data");v.setUint32(40,f.length*2,true);
 for(let i=0;i<f.length;i++){const s=Math.max(-1,Math.min(1,f[i]*g));v.setInt16(44+i*2,s<0?s*0x8000:s*0x7fff,true)}
 return new Blob([v],{type:"audio/wav"})}

/* ── 탭 ── */
function route(){const want=location.hash.slice(1);const t=["assign","read","collect"].includes(want)?want:(people().length?"read":"assign");
 if(t!==tab&&phase!=="idle"){if(mr&&mr.state!=="inactive")mr.stop();else phase="cancel"}
 if(t!==tab)stopAll();tab=t;
 for(const s of ["assign","read","collect"])$("v-"+s).hidden=s!==t;
 $("tabs").querySelectorAll("a").forEach(a=>{a.classList.toggle("on",a.dataset.t===t);a.setAttribute("aria-current",a.dataset.t===t?"page":"false")});
 $("dock").hidden=t!=="read";document.body.classList.toggle("read",t==="read");scrollTo(0,0)}
addEventListener("hashchange",route);
$("pick").onchange=e=>{e.target.value==="c"?openPaste():load(e.target.value)};

applyFs();fillMe();{const k=store.get("pick","1");load(k==="c"&&!store.get("custom",null)?"1":k)}renderList();route();
try{if(document.featurePolicy&&!document.featurePolicy.allowsFeature("microphone"))$("warn").hidden=false}catch(e){}
if(!navigator.mediaDevices||!window.MediaRecorder)$("warn").hidden=false;
idb().then(d=>{db=d;if(!d)return;try{const q=d.transaction("r").objectStore("r").getAll();q.onsuccess=()=>{recs=(q.result||[]).filter(r=>r.vs).sort((a,b)=>b.id-a.id);renderList();renderRead()}}catch(e){}});
}
