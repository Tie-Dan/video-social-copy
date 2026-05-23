/**
 * 平台配置
 * 每个平台有独立的标题字数限制、描述风格和标签规则
 */
export const platforms = [
  {
    id: 'douyin',
    name: '抖音',
    icon: '🎵',
    titleLimit: 55,
    descStyle: '口语化、钩子开头、引导互动',
    tagLimit: 5,
    tagStyle: '热门话题标签，带#号',
    rules: [
      '标题要有悬念感，前几个字决定用户是否停留',
      '用「你」「我」拉近关系',
      '结尾引导点赞/评论/关注',
      '标签选平台热门话题，2-5个',
    ],
    example: {
      title: '这个方法我真的后悔没有早知道！',
      desc: '你们一直问的XXX教程来了🔥\n第一步：...\n第二步：...\n学会了的评论区交作业👇',
      tags: '#教程 #生活小妙招 #实用技巧',
    },
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    icon: '📕',
    titleLimit: 20,
    descStyle: '种草笔记风、详细分点、emoji丰富',
    tagLimit: 10,
    tagStyle: '末尾主题标签，不带#或带#均可',
    rules: [
      '标题精简有力，20字以内最佳',
      '正文像一篇mini笔记：开头引出→中间详细→结尾互动',
      '善用emoji增加可读性，但不要太密',
      '关键词密度适中，利于搜索',
    ],
    example: {
      title: '超好用！这个技巧绝了',
      desc: '姐妹们！今天分享一个我用了3个月的宝藏技巧✨\n\n📌 使用场景\n日常通勤、拍照修图都能用\n\n📌 具体步骤\n1️⃣ 先打开...\n2️⃣ 然后选择...\n3️⃣ 最后保存\n\n💡 小tips\n记得选高清模式效果更好哦～\n\n有什么问题评论区问我呀👇',
      tags: '#好物分享 #效率提升 #实用APP #生活小技巧',
    },
  },
  {
    id: 'kuaishou',
    name: '快手',
    icon: '📺',
    titleLimit: 30,
    descStyle: '接地气、「老铁」风、真实感强',
    tagLimit: 3,
    tagStyle: '简短标签，2-3个即可',
    rules: [
      '标题接地气，突出真实感和人设',
      '不要太精致，快手用户喜欢真实的内容',
      '突出「接地气」「真实」「实用」等关键词',
      '避免过于文艺或专业的表达',
    ],
    example: {
      title: '这招真绝了，学会少走弯路',
      desc: '老铁们，今天分享一个干货\n这个方法是真管用，我自己试了好几次\n学会了记得双击支持一下✌️',
      tags: '#生活技巧 #干货',
    },
  },
  {
    id: 'shipinhao',
    name: '视频号',
    icon: '💬',
    titleLimit: 30,
    descStyle: '微信生态风格、偏朋友圈传播、较正式',
    tagLimit: 5,
    tagStyle: '话题标签，带#',
    rules: [
      '标题要有传播力，适合朋友圈转发',
      '语气比抖音正式，比小红书随意',
      '描述可以带入个人观点和感悟',
      '利用视频号的社交属性，引导转发',
    ],
    example: {
      title: '这个方法改变了我对XXX的认知',
      desc: '最近发现一个很有意思的方法，分享给大家\n\n如果你也在做XXX，一定要试试这个思路\n\n觉得有用的话，转发给需要的朋友吧🤝',
      tags: '#认知提升 #方法分享 #实用干货',
    },
  },
]

/** 根据 id 获取平台配置 */
export function getPlatform(id) {
  return platforms.find((p) => p.id === id)
}

/** 获取默认选中的平台 id 列表 */
export function getDefaultPlatformIds() {
  return ['douyin', 'xiaohongshu', 'kuaishou', 'shipinhao']
}
