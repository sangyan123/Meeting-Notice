/** 会议材料共享数据 */
const agendas = [
  {
    id: 1,
    index: 1,
    title: '《习近平浙江足迹》专题学习会',
    count: 2,
    expanded: false,
    files: [
      {
        id: 'f1',
        title: '政府工作报告',
        pages: 28,
        size: '2.3 MB',
        type: 'PDF',
        category: 'main'
      },
      {
        id: 'f2',
        title: '全国人民代表大会常务委员会工作报告',
        pages: 18,
        size: '1.5 MB',
        type: 'PDF',
        category: 'main'
      }
    ]
  },
  {
    id: 2,
    index: 2,
    title: '听取与审议关于人民政府2022年工作情况的报告',
    count: 2,
    expanded: false,
    files: [
      {
        id: 'f3',
        title: '关于2023年国民经济和社会发展计划执行情况与2024年国民经济和社会发展计划草案的报告',
        pages: 32,
        size: '2.8 MB',
        type: 'PDF',
        category: 'work'
      },
      {
        id: 'f4',
        title: '关于2023年中央和地方预算执行情况与2024年中央和地方预算草案的报告',
        pages: 24,
        size: '2.1 MB',
        type: 'PDF',
        category: 'work'
      }
    ]
  },
  {
    id: 3,
    index: 3,
    title: '听取与审议最高人民法院、最高人民检察院工作报告',
    count: 2,
    expanded: false,
    files: [
      {
        id: 'f5',
        title: '最高人民法院工作报告',
        pages: 20,
        size: '1.8 MB',
        type: 'PDF',
        category: 'work'
      },
      {
        id: 'f6',
        title: '最高人民检察院工作报告',
        pages: 16,
        size: '1.4 MB',
        type: 'PDF',
        category: 'work'
      }
    ]
  },
  {
    id: 4,
    index: 4,
    title: '审议关于修改《中华人民共和国国务院组织法》的决定草案',
    count: 1,
    expanded: false,
    files: [
      {
        id: 'f7',
        title: '关于修改《中华人民共和国国务院组织法》的决定草案',
        pages: 12,
        size: '0.9 MB',
        type: 'PDF',
        category: 'draft'
      }
    ]
  }
]

/** 预览页模拟正文（按页） */
const previewContents = {
  f1: {
    title: '政府工作报告',
    pages: 28,
    size: '2.3 MB',
    type: 'PDF',
    pageTexts: [
      '中华人民共和国\n\n政府工作报告\n\n——在第十四届全国人民代表大会第三次会议上\n\n2024年3月\n\n一、过去一年工作回顾\n\n过去一年，是全面贯彻党的二十大精神的开局之年，是本届政府依法履职的第一年。面对异常复杂的国际环境和艰巨繁重的改革发展稳定任务，在以习近平同志为核心的党中央坚强领导下，全国各族人民砥砺奋进、攻坚克难，经济社会发展取得新的重大成就。\n\n二、今年发展主要预期目标\n\n今年发展主要预期目标是：国内生产总值增长5%左右；城镇新增就业1200万人左右，城镇调查失业率5.5%左右；居民消费价格涨幅3%左右；居民收入增长和经济增长同步；国际收支保持基本平衡；粮食产量1.3万亿斤以上；单位国内生产总值能耗降低2.5%左右。',
      '三、政府工作任务\n\n（一）大力推进现代化产业体系建设，加快发展新质生产力。\n\n充分发挥创新主导作用，以科技创新推动产业创新，加快推进新型工业化，提高全要素生产率，不断塑造发展新动能新优势，促进社会生产力实现新的跃升。\n\n推动产业链供应链优化升级。保持工业经济平稳运行，实施制造业重点产业链高质量发展行动，加强质量支撑和标准引领。\n\n积极培育新兴产业和未来产业。实施产业创新工程，完善产业生态，拓展应用场景，促进战略性新兴产业融合集群发展。',
      '（二）深入实施科教兴国战略，强化高质量发展的基础支撑。\n\n坚持教育优先发展、科技自立自强、人才引领驱动，推进教育强国、科技强国、人才强国建设。\n\n加强高质量教育体系建设。全面贯彻党的教育方针，落实立德树人根本任务。推进义务教育优质均衡发展和城乡一体化。\n\n加快推动高水平科技自立自强。充分发挥新型举国体制优势，全面提升自主创新能力。'
    ]
  },
  f2: {
    title: '全国人民代表大会常务委员会工作报告',
    pages: 18,
    size: '1.5 MB',
    type: 'PDF',
    pageTexts: [
      '全国人民代表大会常务委员会工作报告\n\n——在第十四届全国人民代表大会第三次会议上\n\n各位代表：\n\n现在，我受全国人大常委会委托，向大会报告工作，请予审议。\n\n过去一年，常委会坚持以习近平新时代中国特色社会主义思想为指导，全面贯彻党的二十大和二十届二中、三中全会精神，坚持党的领导、人民当家作主、依法治国有机统一，认真行使宪法法律赋予的职权，各项工作取得新进展新成效。'
    ]
  },
  f3: {
    title: '关于2023年国民经济和社会发展计划执行情况与2024年国民经济和社会发展计划草案的报告',
    pages: 32,
    size: '2.8 MB',
    type: 'PDF',
    pageTexts: [
      '关于2023年国民经济和社会发展计划执行情况与2024年国民经济和社会发展计划草案的报告\n\n各位代表：\n\n受国务院委托，现将2023年国民经济和社会发展计划执行情况与2024年国民经济和社会发展计划草案提请十四届全国人大三次会议审查，并请全国政协各位委员提出意见。'
    ]
  },
  f4: {
    title: '关于2023年中央和地方预算执行情况与2024年中央和地方预算草案的报告',
    pages: 24,
    size: '2.1 MB',
    type: 'PDF',
    pageTexts: [
      '关于2023年中央和地方预算执行情况与2024年中央和地方预算草案的报告\n\n各位代表：\n\n受国务院委托，现将2023年中央和地方预算执行情况与2024年中央和地方预算草案提请十四届全国人大三次会议审查，并请全国政协各位委员提出意见。'
    ]
  },
  f5: {
    title: '最高人民法院工作报告',
    pages: 20,
    size: '1.8 MB',
    type: 'PDF',
    pageTexts: [
      '最高人民法院工作报告\n\n——在第十四届全国人民代表大会第三次会议上\n\n各位代表：\n\n现在，我代表最高人民法院向大会报告工作，请予审议，并请全国政协委员提出意见。'
    ]
  },
  f6: {
    title: '最高人民检察院工作报告',
    pages: 16,
    size: '1.4 MB',
    type: 'PDF',
    pageTexts: [
      '最高人民检察院工作报告\n\n——在第十四届全国人民代表大会第三次会议上\n\n各位代表：\n\n现在，我代表最高人民检察院向大会报告工作，请予审议，并请全国政协委员提出意见。'
    ]
  },
  f7: {
    title: '关于修改《中华人民共和国国务院组织法》的决定草案',
    pages: 12,
    size: '0.9 MB',
    type: 'PDF',
    pageTexts: [
      '关于修改《中华人民共和国国务院组织法》的决定（草案）\n\n第十四届全国人民代表大会第三次会议审议了《关于修改〈中华人民共和国国务院组织法〉的决定（草案）》，现予通过。'
    ]
  }
}

function getAgendas() {
  return agendas.map((item) => ({
    ...item,
    files: item.files.map((f) => ({ ...f }))
  }))
}

/**
 * 按分类筛选议程
 * @param {'all'|'main'|'work'|'draft'} category
 */
function filterAgendas(category) {
  const list = getAgendas()
  if (!category || category === 'all') {
    return {
      agendas: list,
      totalCount: list.reduce((sum, item) => sum + item.files.length, 0)
    }
  }

  const agendasFiltered = list
    .map((item) => {
      const files = item.files.filter((f) => f.category === category)
      return {
        ...item,
        files,
        count: files.length,
        expanded: false
      }
    })
    .filter((item) => item.files.length > 0)

  return {
    agendas: agendasFiltered,
    totalCount: agendasFiltered.reduce((sum, item) => sum + item.files.length, 0)
  }
}

function getPreview(fileId) {
  return previewContents[fileId] || previewContents.f1
}

module.exports = {
  getAgendas,
  filterAgendas,
  getPreview
}
