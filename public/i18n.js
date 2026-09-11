const en={
 '观模':'Guanmo','默认':'Default','未标注':'Unspecified','无思考':'None','未标注模型':'Unlabelled model','个人样本':'Personal collection','其他':'Other',
 '跳到作品':'Skip to artworks','观模首页':'Guanmo home','主导航':'Main navigation','作品画廊':'Gallery','高级比较':'Advanced compare','在 GitHub 上为观模 Star（新标签页）':'Star Guanmo on GitHub (opens a new tab)','看作品，自己判断。':'Explore the work. Judge for yourself.','作品大图':'Artwork preview','正在打开画廊…':'Loading gallery…',
 '这份作品暂时无法预览':'This artwork could not be displayed','样本 {n}':'Sample {n}','并排比较':'Compare','这道题的提示词':'Prompt for this topic','复制原文':'Copy prompt',
 '观察模型表现，识别行为风格。':'Observe performance. Recognize model styles.','用 SVG 动画比较模型与思考深度，为中转站掺水检测提供直观线索。':'Compare models and reasoning levels through animated SVGs to spot signs of substitution or downgrading by API relay services.',
 '道绘画题目':'drawing topics','个模型 / 来源':'models / sources','份 SVG 作品':'SVG artworks','选择题目':'Choose a topic','可切换思考深度':'Explore reasoning levels','看提示词':'View prompt',
 '搜索模型或提供方':'Search models or providers','提供方':'Provider','全部提供方':'All providers','全部重播':'Replay all','作品分页':'Artwork pages','点击作品放大查看，点击右下角「＋」加入对比。':'Click an artwork to enlarge it, or use + to add it to a comparison.','并排比较与更多样本':'Compare and explore more samples',
 '份作品':'artworks','没有找到匹配的作品':'No matching artworks','这个题目还没有默认强度的作品':'No homepage artworks for this topic yet','换个模型名称，或试试其他提供方。':'Try another model name or provider.','可以到高级比较查看已收录的其它样本。':'Explore other samples in Advanced compare.','清除筛选':'Clear filters','第 {n} 页':'Page {n}','上一页':'Previous','下一页':'Next',
 '放大 {model} 的作品':'Enlarge artwork by {model}','{model} 思考深度':'Reasoning level for {model}','加入对比：{model}':'Add to comparison: {model}','取消对比：{model}':'Remove from comparison: {model}','最多同时比较 4 份作品':'You can compare up to 4 artworks','已选 {n} / 4':'Selected {n} / 4','清空':'Clear',
 '返回画廊':'Back to gallery','放在一起，慢慢看。':'Side by side. Take a closer look.','每一栏都可以独立选择模型和思考强度，最多同时展示四份作品。':'Choose a model and reasoning level for each panel. Compare up to four artworks.',
 '题目':'Topic','提示词':'Prompt','复制链接':'Copy link','同步重播':'Replay together','这个题目还没有作品':'No artworks for this topic yet','换一道题看看，新的作品会陆续加入。':'Try another topic. More artworks will be added.','添加一份对照作品':'Add an artwork','同一模型的不同强度也可以':'You can compare reasoning levels of the same model',
 '这个题目目前只收录了默认强度的样本。以后新增其它强度，会自动出现在每栏的选项中。':'This topic currently contains default-level samples only. Other levels will appear here when added.',
 '思考强度选项来自已收录的数据。可以比较不同模型，也可以选择同一模型的不同强度或重复样本。':'Available levels reflect the collection. Compare models, reasoning levels, or repeated samples of the same model.',
 '模型':'Model','思考强度':'Reasoning','样本':'Sample','第 {n} 栏模型':'Model for panel {n}','第 {n} 栏思考强度':'Reasoning level for panel {n}','第 {n} 栏样本':'Sample for panel {n}','移除第 {n} 栏':'Remove panel {n}','关闭大图':'Close preview','重播':'Replay','下载 SVG':'Download SVG','加入对比':'Add to comparison',
 '复制未成功，请手动复制地址栏或提示词':'Copy failed. Please copy the URL or prompt manually.','提示词已复制':'Prompt copied','已重新播放当前作品':'Replaying current artworks','比较链接已复制':'Comparison link copied',
 '{topics} 个题目 / {samples} 份作品 · 人工收录':'{topics} topics / {samples} artworks · Curated collection','暂时无法打开画廊':'Unable to load the gallery','请检查 data.json 是否存在且格式正确，再刷新页面。':'Please check that data.json exists and is valid, then reload.','重新加载':'Reload',
 '通过 SVG 动画观察模型表现差距与行为风格，辅助识别中转服务的模型混用或降级。':'Compare model performance and recurring behavioral styles through animated SVGs to spot possible model substitution or downgrading by API relay services.'
};
let language='zh';
try{if(localStorage.getItem('guanmo-language')==='en')language='en';}catch{}
export const getLanguage=()=>language;
export function setLanguage(next){language=next==='en'?'en':'zh';try{localStorage.setItem('guanmo-language',language);}catch{}}
export function t(key,values={}){return (language==='en' && Object.hasOwn(en,key)?en[key]:key).replace(/\{(\w+)\}/g,(match,name)=>values[name] ?? match);}
export function topicTitle(topic){return language==='en'?(topic.titleEn || topic.title):topic.title;}
