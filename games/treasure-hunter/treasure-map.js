(function(){
  function addLabel(map){
    if(map.previousElementSibling && map.previousElementSibling.classList.contains("treasure-map-label")) return;
    var label=document.createElement("div");
    label.className="treasure-map-label";
    label.textContent="🗺️ Treasure Adventure Map";
    map.parentNode.insertBefore(label,map);
  }
  function enhanceDynamicMap(map){
    map.classList.add("treasure-route-map");
    addLabel(map);
  }
  function enhanceWorldRoute(map){
    var raw=map.textContent.trim();
    var stops=raw.split(/s*(?:➜|→|➡)s*/).filter(Boolean);
    if(stops.length<2) return;
    map.textContent="";
    map.classList.add("treasure-route-map");
    var track=document.createElement("div");
    track.className="route-track";
    stops.forEach(function(symbol,index){
      var stop=document.createElement("button");
      stop.type="button";
      stop.className="treasure-stop";
      stop.innerHTML='<span class="stop-icon">'+symbol+'</span><span>World '+(index+1)+'</span>';
      track.appendChild(stop);
    });
    map.appendChild(track);
    addLabel(map);
    var worlds=document.getElementById("worlds");
    function syncRoute(){
      if(!worlds) return;
      var cards=Array.prototype.slice.call(worlds.children);
      var openCards=cards.filter(function(card){return !card.classList.contains("locked")});
      var lastOpen=Math.max(0,openCards.length-1);
      Array.prototype.forEach.call(track.children,function(stop,index){
        var card=cards[index];
        var locked=!card || card.classList.contains("locked");
        stop.classList.toggle("locked",locked);
        stop.classList.toggle("completed",!locked && index<lastOpen);
        stop.classList.toggle("current",!locked && index===lastOpen);
        stop.disabled=locked;
        stop.setAttribute("aria-label",(locked?"Locked ":"Open ")+"world "+(index+1));
        stop.onclick=function(){if(card && !locked)card.click()};
      });
    }
    syncRoute();
    if(worlds)new MutationObserver(syncRoute).observe(worlds,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
  }
  var route=document.querySelector(".mapline");
  if(route)enhanceWorldRoute(route);
  var dynamic=document.querySelector(".map");
  if(dynamic)enhanceDynamicMap(dynamic);
})();