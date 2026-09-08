export function releaseTimestamp(value) {
  if(typeof value!=='string' || !/^\d{4}-\d{2}(?:-\d{2})?$/.test(value))return 0;
  const day=value.length===7?`${value}-01`:value;
  const time=Date.parse(`${day}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0,10)===day?time:0;
}

export function modelComparator(data) {
  const key=sample=>JSON.stringify([sample.provider || '其他',sample.model]);
  const dates=new Map((data.modelReleases || []).map(record=>[key(record),releaseTimestamp(record.releaseDate)]));
  const ranks=new Map((data.modelOrder || []).map((name,index)=>[name,index]));
  return (a,b)=>(dates.get(key(b)) || 0)-(dates.get(key(a)) || 0) || (ranks.get(a.model) ?? 9999)-(ranks.get(b.model) ?? 9999);
}

export function sortModels(data) {
  const compare=modelComparator(data);
  for(const topic of data.topics)topic.samples.sort(compare);
}
