export const sources=[
  {name:'ESHRE Endometriosis Guideline (2022)',url:'https://www.eshre.eu/Guidelines-and-Legal/Guidelines/Endometriosis-guideline',note:'診斷、疼痛、手術、生育與青少年照護'},
  {name:'NICE NG73 Recommendations (last updated 11 Nov 2024)',url:'https://www.nice.org.uk/guidance/ng73/chapter/Recommendations',note:'症狀（1.3）、藥物（1.4）、超音波與轉診（1.5）、生育（1.10）'},
  {name:'ESHRE guideline full text (PDF)',url:'https://www.eshre.eu/-/media/sitecore-files/Guidelines/Endometriosis/ESHRE-GUIDELINE-ENDOMETRIOSIS-2022_2.pdf',note:'正常影像、經驗性治療與腹腔鏡的位置；ART 前囊腫手術'}
];

const SYMPTOMS=['dysmenorrhea','pelvicPain','dyspareunia','dyschezia','urinary'];
const SPECIALIST_IMAGING={endometrioma:'卵巢內膜異位囊腫',deep:'深部病灶（腸道、膀胱或輸尿管）',extrapelvic:'骨盆腔外病灶'};

/* 教學分流：主路徑依急症 → 專責中心 → 青少年 → 生育 → 婦科轉診 → 疑似 的順序決定，
   年齡、生育、家族史與骨盆徵象再以附加提醒補充，避免單一路徑吃掉其他重點。 */
export function assess(v){
  const symptoms=SYMPTOMS.some(k=>!!v[k]);
  const suspected=symptoms||(!!v.signs);
  const specialist=Object.hasOwn(SPECIALIST_IMAGING,v.imaging);
  let code,title,description,actions=[],referral='none';
  if(v.acute){
    code='urgent';title='先排除急症';referral='urgent';
    description='突發劇痛、發燒、暈厥或可能懷孕且腹痛，需要即時臨床評估；不可直接歸因於子宮內膜異位症。';
    actions=['確認生命徵象與妊娠檢測，排除子宮外孕、卵巢扭轉、囊腫破裂、骨盆腔感染等急症。','急症處理後再回到內膜異位症評估路徑。'];
  }else if(specialist){
    code='specialist';referral='specialist';title='轉介子宮內膜異位症專責中心';
    description=v.imaging==='deep'?'影像疑似深部病灶，尤其腸道、膀胱或輸尿管受累，需由具經驗團隊評估範圍與治療（NICE 1.5.6）。'
      :v.imaging==='extrapelvic'?'疑似骨盆腔外內膜異位症，應轉專責中心進一步評估（NICE 1.5.6）。'
      :'疑似或確診卵巢內膜異位囊腫，NICE 2024 建議轉專責中心；手術決策須考量卵巢儲備與生育計畫（NICE 1.5.6）。';
    actions=[v.imaging==='endometrioma'?'由具專長者以經陰道超音波確認囊腫特徵與大小，並評估惡性疑慮與卵巢儲備。':'以專家經陰道超音波或骨盆 MRI 評估病灶範圍，由具專長者規劃與判讀（NICE 1.5.9–1.5.10、1.5.12）。','治療依症狀、偏好與優先目標，而不是只依分期（NICE 1.6.1）。'];
    if(v.imaging==='endometrioma')actions.push('未手術者可考慮門診追蹤，特別是囊腫 >3 cm（NICE 1.7.1）。');
  }else if(v.adolescent&&suspected){
    code='adolescent';referral='pag';title='青少年疑似病灶：轉兒少婦科或專責中心';
    description='17 歲以下疑似或確診者，NICE 建議轉兒少婦科或專責中心（1.5.7）；影像正常仍不能排除，避免因年齡而延誤。';
    actions=['經陰道超音波不適合時，考慮經腹骨盆超音波（NICE 1.5.3）。','轉診期間可同步討論止痛與荷爾蒙治療（NICE 1.5.1）。'];
  }else if(v.fertility&&suspected){
    code='fertility';referral='gyn';title='把生育評估納入路徑';
    description='疑似內膜異位症合併不孕，應在多專科（含生殖醫學）參與下評估；荷爾蒙治療無論單用或合併手術，都不提高自然受孕率（NICE 1.10.4）。';
    actions=['安排經陰道超音波與完整不孕檢查（年齡、卵巢儲備、輸卵管、伴侶因素）。','討論腹腔鏡切除／燒灼合併沾黏分離（可提高自然受孕，NICE 1.10.1）與輔助生殖的個別利弊。'];
  }else if(suspected&&(v.failed||v.signs)){
    code='refer';referral='gyn';title='轉介婦科進一步評估';
    description=v.failed?'初始治療無效、不耐受、禁忌，或症狀持續／復發影響生活時應轉婦科（NICE 1.5.5）；即使超音波正常，也不能排除病灶。'
      :'骨盆檢查有內膜異位症徵象、但未懷疑深部病灶時，應轉婦科（NICE 1.5.5）；超音波正常不能排除。';
    actions=['檢視影像品質與深部病灶線索；必要時安排專家影像。','即使超音波或 MRI 正常，仍可考慮腹腔鏡診斷（NICE 1.5.11）；病理陰性不一定排除（1.5.14）。'];
  }else if(suspected){
    code='suspected';title='有疑似症狀：檢查與初始治療同步進行';
    description='記錄週期性症狀與生活影響，安排經陰道超音波（即使內診正常）；可同時開始初始藥物治療（NICE 1.5.1–1.5.2）。正常超音波不排除表淺病灶。';
    actions=['短期（例如 3 個月）試用 paracetamol 或 NSAID，單用或合併（NICE 1.4.2）。','提供荷爾蒙治療（複方口服避孕藥或黃體素）；可減輕疼痛，對日後生育無永久負面影響（NICE 1.4.5–1.4.6）。','症狀影響日常生活、持續或復發時，同步轉介婦科（NICE 1.5.5）。'];
  }else if(v.fertility){
    code='infertility';title='依一般不孕症路徑評估';
    description='NICE 將「不孕合併至少一項典型症狀」列為懷疑線索；單純不孕而無疼痛或徵象時，先依一般不孕症評估。';
    actions=['完整不孕評估（卵巢儲備、輸卵管、伴侶精液等）；評估中若發現囊腫或疼痛線索，再回到本路徑。'];
  }else{
    code='review';title='目前資訊不足，維持鑑別診斷';
    description='此工具不以單一影像或血液檢驗診斷／排除內膜異位症；請重新檢視疼痛型態、骨盆檢查與其他盆腔原因。';
    actions=['可請病人記錄疼痛與症狀日誌，有助後續討論（NICE 1.3.3）。'];
  }
  const notes=[];
  if(code!=='urgent'){
    if(v.adolescent&&code==='specialist')notes.push('17 歲以下：專責中心或兒少婦科皆可（NICE 1.5.7）。');
    if(v.fertility&&code==='specialist')notes.push(v.imaging==='endometrioma'
      ?'希望懷孕：囊腫切除或引流燒灼可提高自然受孕，但須考量卵巢儲備（NICE 1.10.2）；ESHRE 不建議為改善 ART 活產率而例行於 ART 前手術。'
      :'希望懷孕：深部病灶手術對懷孕機會的影響需個別討論，並納入生殖醫學團隊（NICE 1.10.3）。');
    if(v.fertility&&code!=='fertility'&&code!=='infertility')notes.push('想懷孕者不建議以荷爾蒙治療（單用或合併手術）提高自然受孕率（NICE 1.10.4）。');
    if(v.familyHx)notes.push(suspected?'一等親有內膜異位症病史，提高罹病可能性（NICE 1.3.2）。':'一等親病史會提高可能性，但需合併症狀或徵象才進入疑似路徑。');
    if(v.imaging==='normal'&&suspected)notes.push('正常超音波不能排除內膜異位症，仍可能需要轉診（NICE 1.5.4）。');
    if(v.imaging==='none'&&suspected&&!specialist)notes.push('尚未影像：所有疑似者都應提供經陰道超音波，不適合時考慮經腹（NICE 1.5.2–1.5.3）。');
  }
  return {code,title,description,actions,notes,referral,symptoms,suspected};
}

export const cases=[
  {id:'01',group:'疼痛',tag:'青少年',title:'「只是經痛」嗎？',stem:'16 歲，經痛導致每月缺課 2 天，使用一般止痛藥後仍影響生活。經腹超音波沒有明顯異常。',question:'下一步最合適？',options:['正常超音波即可排除內膜異位症','評估可能的內膜異位症並轉青少年婦科／專責服務','等到成年後再處理'],answer:1,why:'青少年也可能罹病，正常影像不能排除，影響生活且持續的症狀需要適合年齡的評估與治療。',next:'記錄症狀與功能影響，討論適當止痛、荷爾蒙選項與轉介。'},
  {id:'02',group:'疼痛',tag:'影像判讀',title:'正常超音波，仍有週期性痛',stem:'28 歲，經痛、深部性交痛與經期排便痛。經陰道超音波未見卵巢囊腫。',question:'正常影像代表什麼？',options:['確定沒有內膜異位症','不能排除，需按症狀追蹤與評估','CA125 正常可排除'],answer:1,why:'超音波對卵巢內膜異位囊腫與部分深部病灶有幫助，對表淺腹膜病灶可能漏診；CA125 不用於診斷。',next:'考慮具專長的影像、經驗性治療與轉診；若治療無效或不適用可討論腹腔鏡。'},
  {id:'03',group:'疼痛',tag:'深部病灶',title:'週期性排便痛與輸尿管疑慮',stem:'35 歲，經期排便痛加劇，影像顯示疑似深部浸潤病灶靠近腸道與輸尿管。',question:'優先的照護配置？',options:['由有經驗的專責團隊評估病灶範圍','只用 CA125 決定手術','不需要進一步評估'],answer:0,why:'疑似腸、膀胱或輸尿管深部內膜異位症應轉專責團隊；專家超音波或 MRI 可協助術前規劃。',next:'整合多專科評估、症狀與生育偏好，說明治療的益處與風險。'},
  {id:'04',group:'疼痛',tag:'疼痛治療',title:'目前不計畫懷孕',stem:'30 歲，週期性骨盆痛，疑似內膜異位症，近期沒有生育計畫；尚未接受治療。',question:'合理的初始策略？',options:['一定先做診斷性腹腔鏡','安排影像，同時討論止痛與複方避孕藥或黃體素','單次 CA125 可確診'],answer:1,why:'可在安排影像與必要轉診的同時開始初始藥物治療；是否腹腔鏡取決於症狀、影像、治療反應與偏好。',next:'確認藥物適用性與禁忌，追蹤疼痛和生活品質。'},
  {id:'05',group:'生育',tag:'生育目標',title:'不孕合併內膜異位症',stem:'33 歲，已嘗試懷孕 18 個月，合併經痛及疑似內膜異位症。希望提高自然受孕機會。',question:'哪個說法正確？',options:['荷爾蒙抑制可提高治療期間的自然受孕率','應進行完整不孕評估；荷爾蒙抑制不能用來提高自然受孕率','不需要評估伴侶因素'],answer:1,why:'希望懷孕時應考慮年齡、卵巢儲備、輸卵管及伴侶因素；荷爾蒙治療雖可減輕痛，卻不改善治療期間自然受孕率。',next:'與婦科及生殖醫學團隊討論：腹腔鏡切除／燒灼合併沾黏分離可提高自然受孕（NICE 1.10.1），或直接進行輔助生殖。'},
  {id:'06',group:'生育',tag:'卵巢囊腫',title:'卵巢內膜異位囊腫與 IVF',stem:'37 歲，超音波顯示 4 cm 卵巢內膜異位囊腫，正準備輔助生殖，AMH 偏低，無嚴重疼痛。',question:'手術決策最重要的考量？',options:['所有囊腫都應先手術以提高 IVF 活產率','討論卵巢儲備、疼痛、惡性疑慮及取卵可及性，避免例行術前手術','只憑囊腫直徑直接決定'],answer:1,why:'ESHRE 不建議為改善 ART 活產率而例行在 ART 前手術內膜異位囊腫；手術可能傷及卵巢儲備，須個別化。',next:'由專責婦科與生殖醫學團隊共同決策。'}
];

export const questions=[
  {level:'住院醫師',q:'下列何者是應懷疑內膜異位症的症狀？',a:['影響生活的經痛','只有無症狀的 CA125 輕度升高','僅有卵巢多囊形態'],correct:0,why:'影響生活的經痛、慢性盆腔痛、深部性交痛及週期性腸尿症狀均是線索。'},
  {level:'住院醫師',q:'經陰道超音波正常時，應如何說明？',a:['確定排除所有病灶','仍不能排除內膜異位症','只要 CA125 正常就排除'],correct:1,why:'表淺腹膜病灶可能無法由影像辨識。'},
  {level:'住院醫師',q:'NICE 對疑似內膜異位症的影像建議？',a:['提供經陰道超音波，即使理學檢查正常','只有觸及腫塊才做影像','所有患者必做 MRI'],correct:0,why:'經陰道超音波有助辨識內膜異位囊腫、深部病灶及其他病因；不適合時考慮經腹檢查。'},
  {level:'住院醫師',q:'血清 CA125 在診斷中的位置？',a:['首選確診工具','不用於診斷內膜異位症','可排除表淺病灶'],correct:1,why:'NICE 不建議以 CA125 診斷。'},
  {level:'住院醫師',q:'無近期懷孕計畫、疑似病灶且疼痛時，合理的初始治療？',a:['討論止痛與複方避孕藥或黃體素','所有患者立即腹腔鏡','只做 CA125'],correct:0,why:'可以在檢查與必要轉診同步進行時開始藥物治療。'},
  {level:'住院醫師',q:'疑似腸道、膀胱或輸尿管深部病灶應如何處理？',a:['轉專責內膜異位症服務','僅追蹤 CA125','視為一般經痛'],correct:0,why:'深部病灶可能需要有經驗的影像、手術與跨專科團隊。'},
  {level:'住院醫師',q:'17 歲以下疑似內膜異位症，轉診何處？',a:['兒少婦科或專責內膜異位症服務','直到成年才評估','只需一般外科'],correct:0,why:'NICE 特別建議青少年轉適當專科。'},
  {level:'住院醫師',q:'藥物初始治療無效或不耐受，且症狀持續影響生活時？',a:['考慮婦科轉診','以正常超音波排除','繼續同樣治療而不評估'],correct:0,why:'持續、復發或影響日常活動的症狀需要進一步評估。'},
  {level:'住院醫師',q:'治療選擇應以何者為主？',a:['只看 rASRM 分期','症狀、生育目標與個人偏好','只看 CA125'],correct:1,why:'分期與疼痛嚴重程度不一定一致，治療應依患者目標。'},
  {level:'住院醫師',q:'希望自然懷孕的患者，荷爾蒙抑制治療？',a:['可提高自然受孕率','不應以提高自然受孕率為目的','取代完整不孕評估'],correct:1,why:'荷爾蒙抑制可治疼痛，但不能提高治療期間的自然受孕率。'},
  {level:'進階',q:'ESHRE 2022 對診斷性腹腔鏡的定位？',a:['每人治療前必做','影像陰性且經驗性治療無效或不適用時可考慮','正常影像便永遠無需'],correct:1,why:'腹腔鏡是特定情境的選項，不再是所有患者治療前的必備步驟。'},
  {level:'進階',q:'疑似深部病灶，術前影像較合適的組合？',a:['專家超音波或 MRI 評估範圍','只有 CA125','完全不需要影像'],correct:0,why:'深部病灶手術前宜評估位置與範圍，由有經驗者規劃及判讀。'},
  {level:'進階',q:'腹腔鏡病理為陰性時？',a:['必然排除內膜異位症','陰性病理不一定排除','等同惡性'],correct:1,why:'採樣與病灶異質性會影響組織學確認。'},
  {level:'進階',q:'疑似內膜異位囊腫且準備 ART，例行手術的主要顧慮？',a:['可能減少卵巢儲備，且例行術前手術未證實改善活產','一定改善 ART 活產','與取卵無關'],correct:0,why:'ESHRE 不建議為提高 ART 活產率而例行術前手術內膜異位囊腫。'},
  {level:'進階',q:'手術決策中與生育相關的考量有哪些？',a:['疼痛、年齡、卵巢儲備、其他不孕因素與既往手術','只有 CA125','只有病灶直徑'],correct:0,why:'共同決策須整合症狀、年齡、其他不孕原因及卵巢功能。'},
  {level:'進階',q:'想提高自然受孕機會的病人，術後長期荷爾蒙抑制？',a:['不應僅為提高自然受孕率而提供','一律應提供','代替伴侶精液檢查'],correct:0,why:'荷爾蒙抑制並不增加自然受孕率；若不立即懷孕，可另就疼痛與復發預防討論。'},
  {level:'進階',q:'手術後不立即懷孕且希望延長疼痛控制，何者可討論？',a:['術後荷爾蒙治療','只追蹤 CA125','一定需要子宮切除'],correct:0,why:'術後可考慮荷爾蒙治療以延長症狀改善。'},
  {level:'進階',q:'深部性交痛與經期排便痛，但常規影像正常，下一步？',a:['若持續可轉診並考慮專家影像或其他檢查','完全排除病灶','只用 CA125'],correct:0,why:'常規影像可能漏診，症狀與治療反應仍需納入。'},
  {level:'進階',q:'對內膜異位症患者使用分期的適當方式？',a:['記錄病灶但不以分期單獨決定疼痛治療','分期可直接預測疼痛強度','分期取代生育目標'],correct:0,why:'NICE 建議治療依症狀、偏好及優先事項，而非僅依分期。'},
  {level:'進階',q:'青少年嚴重經痛與正常超音波，最合適的解讀？',a:['仍可能有病灶，需持續評估與適齡治療','必須等成年才處理','CA125 是確診法'],correct:0,why:'青少年專節強調避免漏診與延誤；正常影像不排除病灶。'}
];
