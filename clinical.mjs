export const sources=[
  {name:'ESHRE Endometriosis Guideline (2022)',url:'https://www.eshre.eu/Guidelines-and-Legal/Guidelines/Endometriosis-guideline',note:'診斷、疼痛、手術、生育與青少年照護'},
  {name:'NICE NG73 Recommendations (last updated 11 Nov 2024)',url:'https://www.nice.org.uk/guidance/ng73/chapter/Recommendations',note:'症狀（1.3）、藥物（1.4）、超音波與轉診（1.5）、生育（1.10）'},
  {name:'ESHRE guideline full text (PDF)',url:'https://www.eshre.eu/-/media/sitecore-files/Guidelines/Endometriosis/ESHRE-GUIDELINE-ENDOMETRIOSIS-2022_2.pdf',note:'正常影像、經驗性治療與腹腔鏡的位置；ART 前囊腫手術；特殊族群與建議編號'},
  {name:'CDC U.S. Medical Eligibility Criteria 2024, Appendix K',url:'https://www.cdc.gov/contraception/hcp/usmec/summary-contraceptive.html',note:'先兆偏頭痛使用複方荷爾蒙與黃體素的分類（病例 07）'}
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
  {level:'住院醫師',q:'下列何者是應懷疑內膜異位症的症狀？',a:['無症狀的 CA125 輕度升高','影響日常生活的經痛','卵巢多囊形態合併月經稀少','單次性交後出血'],correct:1,why:'影響生活的經痛、慢性骨盆痛、深部性交痛及週期性腸道或泌尿症狀都是線索。CA125 不用於診斷。',src:'NICE 1.3.1、1.5.8'},
  {level:'住院醫師',q:'經陰道超音波正常時，應如何向病人說明？',a:['已排除所有內膜異位症病灶','深部與表淺病灶都已排除','再驗一次 CA125 正常就可排除','仍不能排除，必要時仍可轉診'],correct:3,why:'影像陰性不能排除，尤其是表淺腹膜病灶；即使超音波正常，也可能需要轉診。',src:'NICE 1.5.4；ESHRE 5'},
  {level:'住院醫師',q:'NICE 對疑似內膜異位症的影像建議是？',a:['提供經陰道超音波，即使理學檢查正常','只有觸及腫塊時才安排影像','所有病人都先做骨盆 MRI','CA125 升高後才安排影像'],correct:0,why:'經陰道超音波可辨識內膜異位囊腫、深部病灶及其他病因；不適合時考慮經腹超音波。',src:'NICE 1.5.2、1.5.3'},
  {level:'住院醫師',q:'血清 CA125 在診斷中的位置是？',a:['首選的確診工具','正常時可排除表淺病灶','不用於診斷內膜異位症','升高時即可開始 GnRH analogue'],correct:2,why:'NICE 明確不建議用 CA125 診斷；ESHRE 也不建議用血液等生物標記診斷。',src:'NICE 1.5.8；ESHRE 4'},
  {level:'住院醫師',q:'疑似內膜異位症且疼痛、近期不計畫懷孕，合理的初始處置是？',a:['所有病人立即安排腹腔鏡','先驗 CA125，再決定是否治療','腹腔鏡確診後才開始藥物','止痛藥與複方避孕藥或黃體素，同時安排檢查'],correct:3,why:'藥物治療可與超音波、必要的轉診同步進行，不必等確診。',src:'NICE 1.4.2、1.4.6、1.5.1'},
  {level:'住院醫師',q:'疑似腸道、膀胱或輸尿管深部病灶，應如何處理？',a:['轉內膜異位症專責中心','定期追蹤 CA125 即可','視為一般經痛處理','基層用藥 6 個月無效再考慮轉診'],correct:0,why:'深部病灶需要專家影像，以及包含大腸直腸與泌尿專科的團隊。',src:'NICE 1.1.4、1.5.6；ESHRE 30'},
  {level:'住院醫師',q:'17 歲以下疑似內膜異位症，應轉診到哪裡？',a:['等到成年再評估','一般外科門診','兒少婦科或專責中心','腹腔鏡確診後才轉診'],correct:2,why:'NICE 對 17 歲以下者，不論疑似或確診，都建議轉兒少婦科或專責中心。',src:'NICE 1.5.7'},
  {level:'住院醫師',q:'初始藥物無效或不耐受，症狀仍影響生活時，下一步是？',a:['超音波正常即可排除，不需處理','轉婦科進一步評估','維持相同治療，不必再評估','停藥並結束追蹤'],correct:1,why:'初始治療無效、不耐受或有禁忌，以及持續、復發或影響日常生活的症狀，都是轉婦科的條件。',src:'NICE 1.5.5'},
  {level:'住院醫師',q:'內膜異位症的治療選擇應以何者為主？',a:['症狀、偏好與優先目標','rASRM 分期','CA125 數值','影像上的病灶大小'],correct:0,why:'NICE 建議依症狀、偏好與優先目標治療，而不是依分期。',src:'NICE 1.6.1'},
  {level:'住院醫師',q:'希望自然懷孕的病人，荷爾蒙抑制治療的角色是？',a:['可提高自然受孕率','可取代完整不孕評估','不應用於提高自然受孕率','使用 6 個月後再嘗試懷孕最佳'],correct:2,why:'荷爾蒙治療單用或合併手術，都不會提高自然受孕率。',src:'NICE 1.10.4；ESHRE 39'},
  {level:'進階',q:'ESHRE 2022 對診斷性腹腔鏡的定位是？',a:['所有病人治療前都必須做','影像正常就不需要考慮','只有 CA125 升高時才考慮','影像陰性或經驗性治療無效、不適用時考慮'],correct:3,why:'腹腔鏡是特定情境的選項。腹腔鏡與「影像加經驗性治療」兩條路徑沒有已證實的優劣，應討論利弊。',src:'ESHRE 6 與 GDG statement'},
  {level:'進階',q:'疑似深部病灶，手術前的影像安排何者最合適？',a:['由具專長者規劃與判讀的專家超音波或 MRI','只測 CA125','一般經腹超音波即足夠','不需影像，術中再評估範圍'],correct:0,why:'手術前宜考慮專家超音波或 MRI，並由具婦科影像專長者規劃與判讀。',src:'NICE 1.5.9、1.5.10、1.5.12'},
  {level:'進階',q:'腹腔鏡看到疑似病灶，但切片病理為陰性時，如何解讀？',a:['可確定排除內膜異位症','應視為惡性病變','不一定排除內膜異位症','必須立即重做腹腔鏡'],correct:2,why:'病理陰性不能完全排除。這與「系統性腹腔鏡完全正常」不同，後者才會說明不太可能是內膜異位症。',src:'NICE 1.5.14、1.5.15；ESHRE 7'},
  {level:'進階',q:'內膜異位囊腫病人準備 ART，例行術前切除的主要顧慮是？',a:['手術後就無法再進行 ART','未證實改善活產，且可能傷害卵巢儲備','手術只會延後取卵，沒有其他影響','會使 ART 後復發率增加'],correct:1,why:'ESHRE 不建議為提高活產率而例行手術。ART 本身不增加復發，可讓病人放心。',src:'ESHRE 51、56'},
  {level:'進階',q:'為不孕決定是否手術時，ESHRE 列出的考量何者最完整？',a:['疼痛、年齡與偏好、既往手術、其他不孕因素、卵巢儲備、EFI','CA125 數值','囊腫直徑','rASRM 分期'],correct:0,why:'ESHRE 建議整合這些因素共同決策，不以單一數值決定。',src:'ESHRE 46'},
  {level:'進階',q:'術後想盡快懷孕的病人，要不要使用長期荷爾蒙抑制？',a:['一律使用以提高懷孕率','可用來代替伴侶精液檢查','不應只為提高懷孕率而使用','至少用滿 6 個月再開始嘗試'],correct:2,why:'術後抑制不會提高懷孕率。若無法或決定不立即懷孕，才另就疼痛控制討論。',src:'ESHRE 40、41；NICE 1.10.4'},
  {level:'進階',q:'手術後暫不懷孕，希望延長疼痛控制，何者正確？',a:['只追蹤 CA125 即可','一定需要子宮切除','荷爾蒙會傷害日後生育，應避免','可使用術後荷爾蒙，且對生育沒有負面影響'],correct:3,why:'術後荷爾蒙可延長手術效果並改善症狀，對生育沒有負面影響。',src:'ESHRE 36、41；NICE 1.9.7'},
  {level:'進階',q:'深部性交痛與經期排便痛持續，但常規影像正常，下一步是？',a:['已可排除，不需再評估','轉診，考慮專家影像或腹腔鏡','只追蹤 CA125','直接建議子宮切除'],correct:1,why:'常規影像正常不能排除；持續症狀可轉診，並考慮專家影像，影像正常仍可考慮腹腔鏡。',src:'NICE 1.5.4、1.5.5、1.5.9、1.5.11'},
  {level:'進階',q:'分期系統在臨床上的適當用法是？',a:['可直接預測疼痛強度','詳細記錄病灶外觀與位置，治療不以分期決定','可取代病人的生育目標','第一期不需要治療'],correct:1,why:'NICE 要求記錄病灶外觀與部位，但治療依症狀、偏好與優先目標，而不是分期。',src:'NICE 1.6.1、1.6.2'},
  {level:'進階',q:'青少年嚴重經痛且超音波正常，最合適的解讀是？',a:['必須等成年才處理','應測 CA125 確診','影像正常即可排除','仍可能有病灶，需適齡評估與治療'],correct:3,why:'影像正常不能排除，也不應以生物標記判斷。第一線是荷爾蒙避孕藥或黃體素；藥物無效且影像陰性時可考慮腹腔鏡。',src:'NICE 1.5.4、1.5.7；ESHRE 75、76、78'}
];

/* 台灣健保：藥品給付規定 第五節 激素及影響內分泌機轉藥物（115.08.21 更新）。
   只收錄條文中與子宮內膜異位症直接相關的規定。 */
export const nhiSource={name:'健保署 藥品給付規定 第五節 激素及影響內分泌機轉藥物（115.08.21 更新）',url:'https://www.nhi.gov.tw/ch/cp-7593-ad2a9-3397-1.html',note:'5.2.1 Danazol、5.3.5 LNG-IUS、5.5.1 GnRH analogue'};

export function nhi(v){
  const stage=Number(v.stage)||0;
  const items=[];
  const gnrhMissing=[];
  if(stage<2)gnrhMissing.push(stage===1?'rAFS 第一期不符（需第二期以上）':'尚未有客觀診斷的 rAFS 分期（需第二期以上）');
  if(!v.proof)gnrhMissing.push('需附手術紀錄及病理報告證明');
  if(!v.organ&&!v.adverse)gnrhMissing.push('需符合其一：肝／腎功能不全或鬱血性心臟病而不適用荷爾蒙，或曾因荷爾蒙治療過敏／不可逆不良反應');
  const months=Math.max(0,Number(v.months)||0);
  let gnrh;
  if(gnrhMissing.length)gnrh={status:'no',label:'不符給付條件',detail:gnrhMissing};
  else if(months>=6)gnrh={status:'no',label:'已達連續 6 個月上限',detail:['條文規定連續六個月為上限；續用需另行評估，健保不給付超過上限部分。']};
  else gnrh={status:'preauth',label:'符合條件，需事前審查',detail:[`可申請事前審查；核准後連續使用上限 6 個月（已用 ${months} 個月，剩 ${6-months} 個月）。`]};
  items.push({id:'gnrh',drug:'GnRH analogue（leuprorelin、goserelin、triptorelin、buserelin、nafarelin 等）',rule:'5.5.1 (4)',...gnrh});
  items.push({id:'danazol',drug:'Danazol',rule:'5.2.1',status:'yes',label:'可給付',detail:['給付規定列「子宮內膜異位」為適用病例，條文無事前審查要求。']});
  const anemia=!!v.hmb&&Number(v.hb)>0&&Number(v.hb)<=10;
  items.push({id:'lngius',drug:'Levonorgestrel 子宮內投藥系統（如 Mirena）',rule:'5.3.5',status:anemia?(v.lngRecent?'no':'yes'):'no',
    label:anemia?(v.lngRecent?'五年內已用過':'可給付（貧血適應）'):'疼痛適應不給付',
    detail:anemia?[v.lngRecent?'每次使用後五年內不得再次使用。':'連續 ≥3 個月經血過多致 Hb ≤10 g/dL 符合 5.3.5；給付理由是貧血而非內膜異位症疼痛。']
      :['5.3.5 限連續 3 個月以上經血過多導致嚴重貧血（Hb ≤10 g/dL）；單純內膜異位症疼痛需自費。']});
  items.push({id:'dienogest',drug:'Dienogest（如 Visanne）、複方口服避孕藥、NSAID',rule:'—',status:'info',label:'無特別限制條文',detail:['第五節沒有針對這些藥物用於內膜異位症的專屬規定；依通則及藥品許可證適應症，是否收載請查健保用藥品項。']});
  return {items,gnrhEligible:gnrh.status==='preauth'};
}
