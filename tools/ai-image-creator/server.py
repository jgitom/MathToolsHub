import json,os,sys,urllib.error,urllib.request
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
ROOT=Path(__file__).parent
class H(SimpleHTTPRequestHandler):
 def __init__(self,*a,**k):super().__init__(*a,directory=str(ROOT),**k)
 def do_POST(self):
  try:
   if self.path!='/api/generate-image':return self.send_error(404)
   key=os.environ.get('OPENAI_API_KEY')
   if not key:raise RuntimeError('OPENAI_API_KEY is not set.')
   x=json.loads(self.rfile.read(int(self.headers['Content-Length'])))
   if x.get('referenceImage'):raise ValueError('Reference editing will be added next; remove the uploaded image.')
   data=json.dumps({'model':'gpt-image-2','prompt':x['prompt'],'size':x.get('size','1024x1024'),'quality':'medium'}).encode()
   q=urllib.request.Request('https://api.openai.com/v1/images/generations',data=data,headers={'Authorization':'Bearer '+key,'Content-Type':'application/json'})
   with urllib.request.urlopen(q,timeout=180) as r:item=json.loads(r.read())['data'][0]
   result={'imageUrl':'data:image/png;base64,'+item['b64_json']};status=200
  except urllib.error.HTTPError as e:
   try:message=json.loads(e.read()).get('error',{}).get('message')
   except Exception:message=None
   result={'error':message or f'OpenAI error {e.code}'};status=e.code;print(result['error'],file=sys.stderr)
  except Exception as e:result={'error':str(e)};status=502;print(e,file=sys.stderr)
  body=json.dumps(result).encode();self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
if __name__=='__main__':
 print('Open http://127.0.0.1:8000');ThreadingHTTPServer(('127.0.0.1',8000),H).serve_forever()
