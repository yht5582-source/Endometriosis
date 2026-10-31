import test from 'node:test';import assert from 'node:assert/strict';
import {assess,cases,questions} from '../dist/clinical.mjs';
const base={dysmenorrhea:false,pelvicPain:false,dyschezia:false,urinary:false,dyspareunia:false,adolescent:false,fertility:false,failed:false,acute:false,imaging:'none'};
test('urgent symptoms take priority over imaging and fertility',()=>{assert.equal(assess({...base,acute:true,imaging:'deep',fertility:true}).code,'urgent');});
test('deep disease and endometrioma route to specialist care',()=>{assert.equal(assess({...base,imaging:'deep'}).code,'specialist');assert.equal(assess({...base,imaging:'endometrioma'}).code,'specialist');});
test('normal imaging does not dismiss persistent symptoms',()=>{const r=assess({...base,dysmenorrhea:true,imaging:'normal',failed:true});assert.equal(r.code,'refer');assert.match(r.description,/不能排除/);});
test('adolescent and fertility paths remain distinct',()=>{assert.equal(assess({...base,adolescent:true,dysmenorrhea:true}).code,'adolescent');assert.equal(assess({...base,fertility:true,dysmenorrhea:true}).code,'fertility');});
test('case and quiz answer indexes valid',()=>{assert.equal(cases.length,6);for(const c of cases)assert.ok(c.answer>=0&&c.answer<c.options.length);for(const level of ['住院醫師','進階']){const qs=questions.filter(q=>q.level===level);assert.equal(qs.length,10);for(const q of qs)assert.ok(q.correct>=0&&q.correct<q.a.length);}});
