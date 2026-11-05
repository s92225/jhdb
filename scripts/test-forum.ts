import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { ForumError, postInput, profileInput, isAdminEmail, text, validId } from '../lib/forum/validation'
import { jsonInput, sameOrigin } from '../lib/forum/http'

async function main() {
  assert.equal(isAdminEmail(' Admin@Example.com ',true,'admin@example.com'),true)
  assert.equal(isAdminEmail('admin@example.com',false,'admin@example.com'),false)
  assert.equal(isAdminEmail('admin@example.com.attacker.invalid',true,'admin@example.com'),false)
  assert.equal(isAdminEmail('other@example.com',true,'admin@example.com'),false)
  assert.equal(isAdminEmail('admin@example.com',true,''),false)
  assert.equal(text('  甲\r\n乙  ','文字',2,5),'甲\n乙')
  assert.equal(text('😀😀','文字',2,2),'😀😀')
  assert.throws(()=>text('\u0000test','文字',1,10),ForumError)
  assert.throws(()=>text('short','文字',10,100),ForumError)
  const post={title:'氣勢系統問題',body:'請問氣勢值如何影響招架？',category:'questions'}
  assert.deepEqual(postInput(post),post)
  assert.throws(()=>postInput({...post,category:'admin'}),ForumError)
  assert.throws(()=>postInput({...post,title:'  '}),ForumError)
  assert.throws(()=>postInput({...post,body:'a'.repeat(12001)}),ForumError)
  assert.equal(profileInput({displayName:'江湖同道',gameId:'ＡＢ１２３'}).gameId,'AB123')
  assert.equal(profileInput({displayName:'江湖同道'}).gameId,'')
  for(const field of ['role','isAdmin','email','userId']) assert.throws(()=>profileInput({displayName:'江湖同道',[field]:'admin'}),ForumError)
  assert.throws(()=>profileInput({displayName:'江湖同道',gameId:'<script>'}),ForumError)
  assert.throws(()=>profileInput({displayName:'江湖同道',gameId:'㍿'.repeat(20)}),ForumError)
  assert.equal(validId(randomUUID()).length,36)
  assert.throws(()=>validId("' OR true;--"),ForumError)
  assert.doesNotThrow(()=>sameOrigin(new Request('http://localhost:3014/api/forum',{headers:{origin:'http://localhost:3014'}})))
  assert.throws(()=>sameOrigin(new Request('http://localhost:3014/api/forum',{headers:{origin:'https://attacker.invalid'}})),ForumError)
  assert.throws(()=>sameOrigin(new Request('http://localhost:3014/api/forum')),ForumError)
  const request=(body:string)=>new Request('http://localhost/api/forum',{method:'POST',headers:{'Content-Type':'application/json'},body})
  assert.deepEqual(await jsonInput(request('{"body":"hello"}')),{body:'hello'})
  await assert.rejects(jsonInput(request('[]')),ForumError)
  await assert.rejects(jsonInput(request('{broken')),ForumError)
  await assert.rejects(jsonInput(request(JSON.stringify({body:'x'.repeat(65536)}))),ForumError)
  console.log('Forum validation, verified-admin allowlist, CSRF and body limits: passed')
}
main().catch((e)=>{console.error(e);process.exitCode=1})
