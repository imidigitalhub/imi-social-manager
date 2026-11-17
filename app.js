(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const store = {
    read(key, fallback) { try { return JSON.parse(localStorage.getItem("imi-social-" + key)) ?? fallback; } catch { return fallback; } },
    write(key, value) { localStorage.setItem("imi-social-" + key, JSON.stringify(value)); }
  };
  const today = new Date();
  const dateISO = d => [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-");
  const plusDays = n => { const d = new Date(); d.setDate(d.getDate()+n); return dateISO(d); };
  let posts = store.read("posts", [
    {id:"p1",title:"Welcome to a new week",caption:"A fresh week is a fresh opportunity to create, connect and grow. What are you working on this week?",platform:"Instagram",status:"Scheduled",date:plusDays(1)},
    {id:"p2",title:"Three tips for growing your brand",caption:"Be consistent, understand your audience and share content that solves real problems.",platform:"LinkedIn",status:"Draft",date:plusDays(3)},
    {id:"p3",title:"Behind the scenes at IMI",caption:"A little look at the work behind the ideas. More useful digital solutions coming soon.",platform:"Facebook",status:"Published",date:plusDays(-2)},
    {id:"p4",title:"Quick business growth reminder",caption:"Your online presence is an asset. Give your audience a reason to remember you.",platform:"Instagram",status:"Draft",date:plusDays(5)}
  ]);
  let snapshots = store.read("snapshots", []);
  let currentFilter = "All";
  let calendarDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const savePosts = () => store.write("posts", posts);
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const formatDate = value => value ? new Date(value + "T12:00:00").toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"}) : "No date";
  const toast = message => { const el=$("#toast"); el.textContent=message; el.classList.add("show"); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove("show"),2600); };
  function navigate(view) {
    $$(".view").forEach(el=>el.classList.toggle("active",el.id===view+"View"));
    $$(".nav-link").forEach(el=>el.classList.toggle("active",el.dataset.view===view));
    $("#pageName").textContent=({overview:"Overview",planner:"Content planner",posts:"Posts",analytics:"Analytics"})[view]||"Overview";
    $("#sidebar").classList.remove("open");
    if(view==="planner") renderCalendar();
    if(view==="posts") renderPosts();
    if(view==="overview") renderUpcoming();
    if(view==="analytics") renderSnapshots();
  }
  document.addEventListener("click", e => {
    const nav=e.target.closest("[data-view]");
    const link=e.target.closest("[data-view-link]");
    if(nav) navigate(nav.dataset.view);
    if(link) navigate(link.dataset.viewLink);
    const action=e.target.closest("[data-action]");
    if(action && action.dataset.action==="new-post") openPost();
  });
  $("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
  $(".notice-close").addEventListener("click",()=>$(".notice").remove());

  function renderUpcoming(){
    const upcoming=posts.filter(p=>p.status==="Scheduled").sort((a,b)=>(a.date||"").localeCompare(b.date||"")).slice(0,4);
    $("#upcomingList").innerHTML=upcoming.length?upcoming.map(p=>{const d=p.date?new Date(p.date+"T12:00:00"):new Date();return `<div class="upcoming-item"><div class="date-chip"><b>${d.getDate()}</b><small>${d.toLocaleDateString(undefined,{month:"short"})}</small></div><div class="upcoming-copy"><strong>${escapeHTML(p.title)}</strong><small>${escapeHTML(p.platform)} · ${formatDate(p.date)}</small></div><span class="status-pill">Scheduled</span></div>`}).join(""):'<div class="empty-state">No scheduled posts yet. Add content to your planner to see it here.</div>';
    $("#publishedCount").textContent=24+posts.filter(p=>p.status==="Published").length;
  }
  const platformIcon = p => ({Instagram:"◎",Facebook:"f",LinkedIn:"in",TikTok:"♪",YouTube:"▶"})[p]||"✦";
  function renderPosts(){
    const query=$("#postSearch").value.trim().toLowerCase();
    const list=posts.filter(p=>(currentFilter==="All"||p.status===currentFilter)&&(!query||(p.title+" "+p.caption+" "+p.platform).toLowerCase().includes(query)));
    $("#postList").innerHTML=list.length?list.map(p=>`<div class="post-item"><div class="post-symbol">${platformIcon(p.platform)}</div><div class="post-copy"><strong>${escapeHTML(p.title)}</strong><small>${escapeHTML(p.platform)} · ${formatDate(p.date)}</small></div><span class="post-status ${p.status}">${p.status}</span><div class="post-actions"><button class="mini-btn" data-edit="${p.id}">Edit</button><button class="mini-btn" data-delete="${p.id}" aria-label="Delete ${escapeHTML(p.title)}">×</button></div></div>`).join(""):'<div class="empty-state">No posts match this view. Create a post or change your filters.</div>';
  }
  $$(".filter-tab").forEach(btn=>btn.addEventListener("click",()=>{$$(".filter-tab").forEach(b=>b.classList.remove("active"));btn.classList.add("active");currentFilter=btn.dataset.filter;renderPosts();}));
  $("#postSearch").addEventListener("input",renderPosts);
  $("#postList").addEventListener("click",e=>{
    const edit=e.target.closest("[data-edit]"); const del=e.target.closest("[data-delete]");
    if(edit){const p=posts.find(x=>x.id===edit.dataset.edit);if(p)openPost(p);}
    if(del){posts=posts.filter(x=>x.id!==del.dataset.delete);savePosts();renderPosts();renderUpcoming();toast("Post deleted.");}
  });
  const dialog=$("#postDialog"), form=$("#postForm");
  function openPost(post){
    form.reset(); form.elements.id.value=post?.id||""; form.elements.title.value=post?.title||""; form.elements.caption.value=post?.caption||""; form.elements.platform.value=post?.platform||"Instagram"; form.elements.status.value=post?.status||"Draft"; form.elements.date.value=post?.date||"";
    $("#dialogTitle").textContent=post?"Edit post":"Create a post"; dialog.showModal();
  }
  $("#closeDialog").addEventListener("click",()=>dialog.close());
  $("#cancelDialog").addEventListener("click",()=>dialog.close());
  form.addEventListener("submit",e=>{
    e.preventDefault();const data=Object.fromEntries(new FormData(form));const id=data.id||"post-"+Date.now();const item={id,title:data.title.trim(),caption:data.caption.trim(),platform:data.platform,status:data.status,date:data.date};
    const index=posts.findIndex(p=>p.id===id);if(index>=0)posts[index]=item;else posts.unshift(item);
    savePosts();dialog.close();renderPosts();renderUpcoming();renderCalendar();toast(index>=0?"Post updated.":"Post saved to your workspace.");
  });

  function renderCalendar(){
    const year=calendarDate.getFullYear(),month=calendarDate.getMonth();
    $("#plannerMonth").textContent=calendarDate.toLocaleDateString(undefined,{month:"long",year:"numeric"});
    const first=new Date(year,month,1),start=new Date(year,month,1-first.getDay());
    const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    let html=days.map(d=>`<div class="calendar-cell calendar-day-name">${d}</div>`).join("");
    for(let i=0;i<42;i++){
      const d=new Date(start);d.setDate(start.getDate()+i);const iso=dateISO(d);
      const dayPosts=posts.filter(p=>p.date===iso);
      html+=`<div class="calendar-cell ${d.getMonth()!==month?"outside":""} ${iso===dateISO(today)?"today":""}"><span class="calendar-date">${d.getDate()}</span>${dayPosts.map(p=>`<div class="calendar-event ${p.platform==="Facebook"?"facebook-event":p.platform==="LinkedIn"?"linkedin-event":""}" data-calendar-edit="${p.id}" title="${escapeHTML(p.title)}">${escapeHTML(p.title)}</div>`).join("")}</div>`;
    }
    $("#calendarGrid").innerHTML=html;
  }
  $("#prevMonth").addEventListener("click",()=>{calendarDate.setMonth(calendarDate.getMonth()-1);renderCalendar();});
  $("#nextMonth").addEventListener("click",()=>{calendarDate.setMonth(calendarDate.getMonth()+1);renderCalendar();});
  $("#todayBtn").addEventListener("click",()=>{calendarDate=new Date(today.getFullYear(),today.getMonth(),1);renderCalendar();});
  $("#calendarGrid").addEventListener("click",e=>{const el=e.target.closest("[data-calendar-edit]");if(el){const p=posts.find(x=>x.id===el.dataset.calendarEdit);if(p)openPost(p);}});

  function renderSnapshots(){
    if(!snapshots.length){$("#snapshotHistory").innerHTML='<div class="empty-state">No snapshots recorded yet. Add your first set of metrics above.</div>';return;}
    $("#snapshotHistory").innerHTML=[...snapshots].sort((a,b)=>b.date.localeCompare(a.date)).map(s=>`<div class="snapshot-row"><strong>${escapeHTML(s.platform)} · ${formatDate(s.date)}</strong><span>${Number(s.followers).toLocaleString()} followers · ${Number(s.reach).toLocaleString()} reach · ${s.engagement}% engagement · ${Number(s.visits).toLocaleString()} visits</span></div>`).join("");
    const latest=snapshots.slice().sort((a,b)=>b.date.localeCompare(a.date))[0];
    $("#analyticsFollowers").textContent=Number(latest.followers).toLocaleString();$("#analyticsReach").textContent=Number(latest.reach).toLocaleString();$("#analyticsEngagement").textContent=latest.engagement+"%";$("#analyticsVisits").textContent=Number(latest.visits).toLocaleString();
  }
  $("#metricsForm").elements.date.value=dateISO(today);
  $("#metricsForm").addEventListener("submit",e=>{
    e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));snapshots.push({...data,followers:Number(data.followers),reach:Number(data.reach),engagement:Number(data.engagement),visits:Number(data.visits)});store.write("snapshots",snapshots);renderSnapshots();$("#snapshotMessage").textContent="Snapshot saved in this browser.";e.currentTarget.reset();e.currentTarget.elements.date.value=dateISO(today);
  });
  $("#exportMetrics").addEventListener("click",()=>{
    if(!snapshots.length){toast("Record at least one snapshot before exporting.");return;}
    const headers=["platform","date","followers","reach","engagement_rate","profile_visits"];
    const rows=snapshots.map(s=>headers.map(h=>JSON.stringify(s[h]??"")).join(","));
    const blob=new Blob([[headers.join(","),...rows].join("\n")],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="imi-social-manager-metrics.csv";a.click();URL.revokeObjectURL(url);toast("CSV export prepared.");
  });

  renderUpcoming();renderPosts();renderCalendar();renderSnapshots();
})();