import * as THREE from "./three.module.min.js";

const canvas=document.querySelector("#safari");
const ui={
  score:document.querySelector("#score"),time:document.querySelector("#time"),
  combo:document.querySelector("#combo"),album:document.querySelector("#album"),
  toast:document.querySelector("#toast"),start:document.querySelector("#startScreen"),
  finish:document.querySelector("#finishScreen"),finishTitle:document.querySelector("#finishTitle"),
  finishText:document.querySelector("#finishText")
};
const species=[
  {name:"Zebra",points:100,colour:0xf4f1df,accent:0x1b1b1b,speed:4.2,scale:.9},
  {name:"Lion",points:180,colour:0xd59132,accent:0x71421f,speed:3.5,scale:1},
  {name:"Elephant",points:130,colour:0x87929a,accent:0x667078,speed:2.7,scale:1.2},
  {name:"Giraffe",points:150,colour:0xe2a94f,accent:0x744022,speed:3.1,scale:1.08},
  {name:"Rhino",points:200,colour:0x747f78,accent:0xe7d8ad,speed:3.7,scale:1.15},
  {name:"Cheetah",points:240,colour:0xdca83a,accent:0x29231c,speed:6.4,scale:.88}
];
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x79b8d3);scene.fog=new THREE.Fog(0xd8aa68,28,75);
const camera=new THREE.PerspectiveCamera(48,16/9,.1,120);camera.position.set(0,6.4,16);camera.lookAt(0,2,-14);
const hemi=new THREE.HemisphereLight(0xffe4b0,0x354a25,2.5);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffd39a,4);sun.position.set(-12,20,8);sun.castShadow=true;
sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-28;sun.shadow.camera.right=28;sun.shadow.camera.top=25;sun.shadow.camera.bottom=-15;scene.add(sun);

const ground=new THREE.Mesh(new THREE.PlaneGeometry(140,140,1,1),new THREE.MeshStandardMaterial({color:0x71813b,roughness:1}));
ground.rotation.x=-Math.PI/2;ground.position.z=-28;ground.receiveShadow=true;scene.add(ground);
const hillMat=new THREE.MeshStandardMaterial({color:0x40552e,roughness:1});
for(let i=0;i<9;i++){const hill=new THREE.Mesh(new THREE.ConeGeometry(7+Math.random()*7,7+Math.random()*5,7),hillMat);hill.position.set(-45+i*12,-1,-50-Math.random()*13);hill.scale.z=1.8;scene.add(hill)}
const sunDisk=new THREE.Mesh(new THREE.SphereGeometry(3,24,16),new THREE.MeshBasicMaterial({color:0xffd36c}));
sunDisk.position.set(22,17,-48);scene.add(sunDisk);
const backdropTexture=new THREE.TextureLoader().load("./assets/realistic-savanna.webp",texture=>{texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy())});
const backdropMaterial=new THREE.MeshBasicMaterial({map:backdropTexture,fog:false,depthWrite:false});
const savannaBackdrop=new THREE.Mesh(new THREE.PlaneGeometry(46,30.6),backdropMaterial);savannaBackdrop.position.set(0,10,-62);savannaBackdrop.renderOrder=-2;scene.add(savannaBackdrop);

const trunkMat=new THREE.MeshStandardMaterial({color:0x684526,roughness:1}),leafMat=new THREE.MeshStandardMaterial({color:0x315925,roughness:1});
function tree(x,z,s=1){
  const g=new THREE.Group(),trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22,.38,4.3,7),trunkMat);
  trunk.position.y=2.1;trunk.castShadow=true;g.add(trunk);
  for(let i=0;i<5;i++){const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1.5+Math.random()*.45,1),leafMat);crown.scale.set(1.6,.65,1);crown.position.set((i-2)*.75,4.3+Math.abs(i-2)*-.18,(i%2)*.35);crown.castShadow=true;g.add(crown)}
  g.position.set(x,0,z);g.scale.setScalar(s);scene.add(g)
}
[-30,-24,-18,18,25,32].forEach((x,i)=>tree(x,-12-i*7,.75+Math.random()*.45));
for(let i=0;i<34;i++){const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.25+Math.random()*.65,0),new THREE.MeshStandardMaterial({color:0x766950,roughness:1}));rock.scale.y=.55;rock.position.set((Math.random()-.5)*55,.2,-5-Math.random()*55);rock.rotation.set(Math.random(),Math.random(),Math.random());rock.castShadow=true;scene.add(rock)}
for(let i=0;i<8;i++){const grass=new THREE.Mesh(new THREE.ConeGeometry(.18,.9,5),new THREE.MeshStandardMaterial({color:0x405a25}));grass.position.set((Math.random()-.5)*25,.45,-5-Math.random()*25);scene.add(grass)}

const matCache=new Map();
function material(colour,roughness=.88){const key=`${colour}-${roughness}`;if(!matCache.has(key))matCache.set(key,new THREE.MeshStandardMaterial({color:colour,roughness,metalness:0}));return matCache.get(key)}
function mesh(geometry,colour,parent,x,y,z,sx=1,sy=1,sz=1){
  const m=new THREE.Mesh(geometry,material(colour));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m
}
const sphere=new THREE.SphereGeometry(1,18,13),box=new THREE.BoxGeometry(1,1,1),cone=new THREE.ConeGeometry(1,1,12),hoofGeometry=new THREE.SphereGeometry(1,12,8);
function addEar(parent,x,y,z,colour,size=.28){const ear=mesh(cone,colour,parent,x,y,z,size,size*1.8,size*.48);ear.rotation.z=-.18;return ear}
function addEye(parent,x,y,z){mesh(sphere,0xf7dfb0,parent,x,y,z,.105,.105,.065);mesh(sphere,0x100d09,parent,x+.055,y,z,.055,.065,.04)}
function addLeg(parent,x,z,colour,hoofColour,long=false,heavy=false){
  const leg=new THREE.Group();leg.position.set(x,long?1.15:heavy?.82:.78,z);parent.add(leg);
  const upper=mesh(new THREE.CylinderGeometry(heavy?.19:.13,heavy?.16:.11,long?1.45:1.02,9),colour,leg,0,long?-.64:-.43,0);
  const lower=mesh(new THREE.CylinderGeometry(heavy?.14:.095,heavy?.12:.08,long?1.35:.82,9),colour,leg,0,long?-1.72:-1.25,0);
  mesh(hoofGeometry,hoofColour,leg,.08,long?-2.38:-1.68,0,heavy?.27:.2,.13,heavy?.26:.2);
  leg.userData={upper,lower};return leg
}
function addSpots(parent,colour,bodyLength=2.5,count=16){for(let i=0;i<count;i++){const angle=(i%4)*Math.PI/2,x=-bodyLength*.42+(i%5)*(bodyLength*.2),y=1.58+Math.floor(i/5)*.32,z=Math.sin(angle)*.68;const spot=mesh(sphere,colour,parent,x,y,z,.09,.09,.045);spot.castShadow=false}}
function animalModel(def){
  const root=new THREE.Group(),body=new THREE.Group();root.add(body);
  root.userData={def,legs:[],phase:Math.random()*6.28,head:null,tail:null};
  const name=def.name,elephant=name==="Elephant",rhino=name==="Rhino",giraffe=name==="Giraffe",lion=name==="Lion",zebra=name==="Zebra",cheetah=name==="Cheetah";
  const heavy=elephant||rhino,longLeg=giraffe;
  const bodyLength=elephant?3.25:rhino?3.05:giraffe?2.6:lion?2.5:cheetah?2.65:2.55;
  const bodyHeight=elephant?1.3:rhino?1.18:giraffe?.95:lion?.9:cheetah?.72:.82;
  const torso=mesh(new THREE.CapsuleGeometry(bodyHeight*.72,bodyLength*.62,7,14),def.colour,body,0,1.65,0,1,1,1);torso.rotation.z=Math.PI/2;
  mesh(sphere,def.colour,body,-bodyLength*.38,1.72,0,.72,bodyHeight*.92,.7);
  mesh(sphere,def.colour,body,bodyLength*.38,1.73,0,.75,bodyHeight*.95,.72);
  const headGroup=new THREE.Group();body.add(headGroup);root.userData.head=headGroup;
  const neckX=bodyLength*.46;
  if(giraffe){
    const neck=mesh(new THREE.CylinderGeometry(.24,.4,3.35,12),def.colour,body,neckX,3.15,0);neck.rotation.z=-.08;
    headGroup.position.set(neckX+.16,4.9,0);mesh(sphere,def.colour,headGroup,.22,0,0,.7,.58,.48);mesh(sphere,def.colour,headGroup,.82,-.08,0,.58,.34,.4);
    addEar(headGroup,.12,.58,.42,def.colour,.25);addEar(headGroup,.12,.58,-.42,def.colour,.25);
    [-.24,.24].forEach(z=>{const horn=mesh(new THREE.CylinderGeometry(.055,.075,.38,8),def.accent,headGroup,.08,.73,z);mesh(sphere,def.accent,headGroup,.08,.95,z,.1,.1,.1)});
    addEye(headGroup,.58,.18,.42);addEye(headGroup,.58,.18,-.42);addSpots(body,def.accent,bodyLength,20);addSpots(headGroup,def.accent,1.3,5)
  }else if(elephant){
    const neck=mesh(sphere,def.colour,body,neckX,2.05,0,.72,.9,.78);headGroup.position.set(neckX+.7,2.35,0);
    mesh(sphere,def.colour,headGroup,0,0,0,.88,.82,.82);mesh(sphere,def.accent,headGroup,-.05,.05,.75,.62,.82,.12);mesh(sphere,def.accent,headGroup,-.05,.05,-.75,.62,.82,.12);
    const trunkTop=mesh(new THREE.CylinderGeometry(.2,.3,1.25,12),def.colour,headGroup,.68,-.55,0);trunkTop.rotation.z=-.12;const trunkTip=mesh(new THREE.CylinderGeometry(.13,.19,.72,12),def.colour,headGroup,.6,-1.45,0);trunkTip.rotation.z=.3;
    [1,-1].forEach(side=>{const tusk=mesh(cone,0xf2e3bd,headGroup,.72,-.35,side*.34,.09,.8,.09);tusk.rotation.z=-2.02});addEye(headGroup,.65,.2,.61);addEye(headGroup,.65,.2,-.61)
  }else if(rhino){
    const neck=mesh(sphere,def.colour,body,neckX+.1,2.0,0,.85,.86,.82);headGroup.position.set(neckX+.75,2.12,0);
    mesh(sphere,def.colour,headGroup,.18,0,0,.9,.62,.66);mesh(sphere,def.colour,headGroup,.85,-.13,0,.72,.4,.53);
    const horn=mesh(cone,def.accent,headGroup,.95,.38,0,.17,1.1,.17);horn.rotation.z=-1.2;const horn2=mesh(cone,def.accent,headGroup,.45,.52,0,.11,.6,.11);horn2.rotation.z=-1.05;
    addEar(headGroup,-.12,.65,.43,def.colour,.22);addEar(headGroup,-.12,.65,-.43,def.colour,.22);addEye(headGroup,.55,.22,.56);addEye(headGroup,.55,.22,-.56)
  }else{
    const neck=mesh(new THREE.CylinderGeometry(.3,.48,1.15,12),def.colour,body,neckX+.05,2.08,0);neck.rotation.z=-.7;
    headGroup.position.set(neckX+.72,2.52,0);mesh(sphere,def.colour,headGroup,0,0,0,.72,.66,.58);mesh(sphere,def.colour,headGroup,.62,-.12,0,.58,.34,.42);
    if(lion){mesh(new THREE.TorusGeometry(.72,.22,8,20),def.accent,headGroup,-.05,.02,0,1,1,.8).rotation.y=Math.PI/2;mesh(sphere,0xe7c184,headGroup,.76,-.14,0,.34,.22,.34)}
    addEar(headGroup,-.18,.55,.38,def.accent,.24);addEar(headGroup,-.18,.55,-.38,def.accent,.24);addEye(headGroup,.48,.13,.47);addEye(headGroup,.48,.13,-.47);mesh(sphere,0x211914,headGroup,1.05,-.1,0,.13,.12,.14);
    if(zebra){for(let i=-4;i<=4;i++){const stripe=mesh(new THREE.TorusGeometry(.65,.055,6,18),def.accent,body,i*.26,1.68,0,1,bodyHeight,1);stripe.rotation.y=Math.PI/2}for(let i=0;i<4;i++)mesh(box,def.accent,headGroup,-.25+i*.28,.05,0,.07,.62,.59)}
    if(cheetah)addSpots(body,def.accent,bodyLength,22)
  }
  const legX=[-bodyLength*.34,bodyLength*.34];legX.forEach(x=>[-.48,.48].forEach(z=>root.userData.legs.push(addLeg(body,x,z,def.colour,heavy?0x44443f:0x34291f,longLeg,heavy))));
  const tailPivot=new THREE.Group();tailPivot.position.set(-bodyLength*.58,1.75,0);body.add(tailPivot);root.userData.tail=tailPivot;
  const tailLength=elephant?1.25:rhino?.72:giraffe?1.65:2.0;const tail=mesh(new THREE.CylinderGeometry(.055,.09,tailLength,9),def.colour,tailPivot,-tailLength*.45,-.25,0);tail.rotation.z=-1.15;mesh(sphere,def.accent,tailPivot,-tailLength*.88,-.64,0,.16,.24,.16);
  root.scale.setScalar(def.scale);root.traverse(o=>{if(o.isMesh)o.userData.animalRoot=root});return root
}function rangerModel(){
  const g=new THREE.Group();mesh(box,0x285c32,g,0,.72,0,2.1,.75,1);mesh(box,0xc7d0c4,g,.2,1.35,0,.9,.65,.9);
  [-.82,.82].forEach(x=>[-.58,.58].forEach(z=>{const w=mesh(new THREE.CylinderGeometry(.34,.34,.25,12),0x171717,g,x,.38,z);w.rotation.x=Math.PI/2}));
  g.userData={ranger:true,phase:Math.random()*6.28};g.traverse(o=>{if(o.isMesh)o.userData.animalRoot=g});return g
}
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),targets=[],album=new Set();
let running=false,last=0,remaining=60,score=0,combo=1,lastHit=0,spawnTimer=0,aimX=0,aimY=0;
function spawn(first=false){
  const ranger=!first&&Math.random()<.14,def=species[Math.floor(Math.random()*species.length)],root=ranger?rangerModel():animalModel(def);
  const left=Math.random()<.5;root.position.set(left?-24:24,0,-8-Math.random()*22);root.rotation.y=left?Math.PI/2:-Math.PI/2;
  root.userData.speed=(ranger?4:def.speed)*(.85+Math.random()*.25)*(left?1:-1);root.userData.def=ranger?null:def;
  scene.add(root);targets.push(root)
}
function removeTarget(root){scene.remove(root);const i=targets.indexOf(root);if(i>=0)targets.splice(i,1)}
function reset(){targets.splice(0).forEach(t=>scene.remove(t));album.clear();remaining=60;score=0;combo=1;lastHit=0;spawnTimer=0;updateHud();spawn(true)}
function start(){reset();ui.start.hidden=true;ui.finish.hidden=true;running=true;last=performance.now()}
function updateHud(){ui.score.textContent=score.toLocaleString();ui.time.textContent=Math.ceil(remaining);ui.combo.textContent=`×${combo}`;ui.album.textContent=`${album.size} / ${species.length}`}
function toast(text,good){ui.toast.textContent=text;ui.toast.style.color=good?"#efff91":"#ffd1d1";ui.toast.classList.remove("show");void ui.toast.offsetWidth;ui.toast.classList.add("show")}
function takePhoto(clientX,clientY){
  if(!running)return;const rect=canvas.getBoundingClientRect();
  if(clientX!==undefined){pointer.x=((clientX-rect.left)/rect.width)*2-1;pointer.y=-((clientY-rect.top)/rect.height)*2+1;aimX=pointer.x;aimY=pointer.y}else pointer.set(aimX,aimY);
  raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(targets,true)[0];
  if(!hit){combo=1;toast("Missed! Keep tracking",false);updateHud();return}
  const root=hit.object.userData.animalRoot;if(!root)return;
  if(root.userData.ranger){score=Math.max(0,score-150);combo=1;toast("Ranger jeep — no photo! −150",false)}
  else{const now=performance.now();combo=now-lastHit<1900?Math.min(5,combo+1):1;lastHit=now;const def=root.userData.def,earned=def.points*combo;score+=earned;album.add(def.name);toast(`${def.name} +${earned}`,true)}
  removeTarget(root);updateHud()
}
function finish(){running=false;const complete=album.size===species.length;ui.finishTitle.textContent=complete?"Safari Album Complete!":"Safari Complete!";ui.finishText.textContent=`You scored ${score.toLocaleString()} points and photographed ${album.size} of ${species.length} species. ${complete?"Outstanding wildlife tracking!":"Play again to photograph every species."}`;ui.finish.hidden=false}
function resize(){const width=canvas.clientWidth,height=canvas.clientHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix()}
function animate(now){
  resize();const dt=Math.min(.04,(now-last)/1000||0);last=now;
  if(running){
    remaining-=dt;spawnTimer-=dt;if(spawnTimer<=0){spawn();spawnTimer=.7+Math.random()*.8}
    targets.slice().forEach(root=>{
      root.position.x+=root.userData.speed*dt;root.userData.phase+=dt*Math.abs(root.userData.speed)*1.7;
      root.position.y=Math.abs(Math.sin(root.userData.phase))*0.055;
      if(root.userData.legs)root.userData.legs.forEach((leg,i)=>{const stride=Math.sin(root.userData.phase+(i%2?Math.PI:0))*.34;leg.rotation.z=stride;if(leg.userData.lower)leg.userData.lower.rotation.z=-stride*.42});
      if(root.userData.head){root.userData.head.rotation.z=Math.sin(root.userData.phase*.5)*.035;root.userData.head.rotation.y=Math.sin(root.userData.phase*.23)*.08}
      if(root.userData.tail)root.userData.tail.rotation.y=Math.sin(root.userData.phase*.8)*.48;
      if(Math.abs(root.position.x)>27)removeTarget(root)
    });
    if(now-lastHit>1900)combo=1;if(remaining<=0){remaining=0;finish()}updateHud()
  }
  camera.position.x+=(aimX*2.2-camera.position.x)*.025;camera.lookAt(aimX*3,2+aimY,-14);
  renderer.render(scene,camera);requestAnimationFrame(animate)
}
canvas.addEventListener("pointermove",e=>{const r=canvas.getBoundingClientRect();aimX=((e.clientX-r.left)/r.width)*2-1;aimY=-((e.clientY-r.top)/r.height)*2+1});
canvas.addEventListener("pointerdown",e=>{e.preventDefault();takePhoto(e.clientX,e.clientY)});
document.querySelector("#cameraButton").addEventListener("click",()=>takePhoto());
document.querySelector("#startButton").addEventListener("click",start);document.querySelector("#againButton").addEventListener("click",start);
addEventListener("keydown",e=>{if(e.key==="ArrowLeft")aimX-=.08;if(e.key==="ArrowRight")aimX+=.08;if(e.key==="ArrowUp")aimY+=.08;if(e.key==="ArrowDown")aimY-=.08;aimX=Math.max(-1,Math.min(1,aimX));aimY=Math.max(-1,Math.min(1,aimY));if(e.key===" "){takePhoto();e.preventDefault()}});
reset();last=performance.now();requestAnimationFrame(animate);document.documentElement.dataset.safari3d="ready";window.__safari3DReady=true;
