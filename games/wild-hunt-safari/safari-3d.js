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
function material(colour){if(!matCache.has(colour))matCache.set(colour,new THREE.MeshStandardMaterial({color:colour,roughness:.78}));return matCache.get(colour)}
function mesh(geometry,colour,parent,x,y,z,sx=1,sy=1,sz=1){
  const m=new THREE.Mesh(geometry,material(colour));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m
}
const sphere=new THREE.SphereGeometry(1,12,9),box=new THREE.BoxGeometry(1,1,1),cylinder=new THREE.CylinderGeometry(.17,.2,1.5,7),cone=new THREE.ConeGeometry(.18,.7,8);
function animalModel(def){
  const root=new THREE.Group(),body=new THREE.Group();root.add(body);root.userData={def,legs:[],phase:Math.random()*6.28};
  const longNeck=def.name==="Giraffe",large=def.name==="Elephant"||def.name==="Rhino";
  mesh(sphere,def.colour,body,0,1.65,0,large?1.75:1.45,large?1.05:.88,large?.82:.68);
  const neckHeight=longNeck?3.3:def.name==="Elephant"?.75:1.05;
  mesh(cylinder,def.colour,body,.93,2.05+neckHeight*.38,0,longNeck?1.5:1,neckHeight,longNeck?1.5:1).rotation.z=longNeck?-.05:-.45;
  const head=mesh(sphere,def.colour,body,longNeck?1.05:1.25,longNeck?4.65:2.45,0,longNeck?.62:.72,longNeck?.68:.62,longNeck?.62:.68);
  if(def.name==="Lion")mesh(sphere,def.accent,body,1.18,2.48,0,.91,.86,.38);
  if(def.name==="Elephant"){
    const trunk=mesh(cylinder,def.colour,body,1.78,1.64,0,.72,1.35,.72);trunk.rotation.z=-.13;
    mesh(sphere,def.accent,body,1.05,2.55,.64,.55,.78,.16);mesh(sphere,def.accent,body,1.05,2.55,-.64,.55,.78,.16)
  }
  if(def.name==="Rhino"){const horn=mesh(cone,def.accent,body,1.9,2.55,0,1.2,1.3,1.2);horn.rotation.z=-Math.PI/2}
  if(def.name==="Giraffe"){mesh(cone,def.accent,body,.92,5.32,.25,.55,.65,.55);mesh(cone,def.accent,body,.92,5.32,-.25,.55,.65,.55)}
  [-.88,.82].forEach(x=>[-.42,.42].forEach(z=>{const leg=mesh(cylinder,def.colour,body,x,large?.65:.68,z,large?1.18:.82,large?1.28:1,large?1.18:.82);root.userData.legs.push(leg)}));
  const tail=mesh(cylinder,def.accent,body,-1.35,1.65,0,.38,.7,.38);tail.rotation.z=-1.05;
  if(def.name==="Zebra")for(let i=-2;i<=2;i++)mesh(box,def.accent,body,i*.38,1.7,0,.09,.86,.72);
  if(def.name==="Cheetah")for(let i=0;i<8;i++){const spot=mesh(sphere,def.accent,body,-.9+(i%4)*.55,1.55+Math.floor(i/4)*.45,.61,.11,.11,.05);spot.castShadow=false}
  mesh(sphere,0x111111,head,.55,.18,.48,.08,.08,.08);mesh(sphere,0x111111,head,.55,.18,-.48,.08,.08,.08);
  root.scale.setScalar(def.scale);root.traverse(o=>{if(o.isMesh)o.userData.animalRoot=root});return root
}
function rangerModel(){
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
      root.position.y=Math.abs(Math.sin(root.userData.phase))*0.08;
      if(root.userData.legs)root.userData.legs.forEach((leg,i)=>leg.rotation.z=Math.sin(root.userData.phase+i*Math.PI)*.35);
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
