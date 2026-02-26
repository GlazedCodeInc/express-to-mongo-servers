export type AngleKeys = keyof typeof angles;

export const angles = {
  // 셀카 및 셀피
  "Selfie angle": {
    name: "셀피 앵글",
    description: "피사체가 직접 카메라를 들고 찍은 듯한 구도입니다. 친근하고 자연스러운 분위기를 연출합니다.",
  },
  "Mirror selfie": {
    name: "거울 셀카",
    description:
      "거울 앞에서서 전신 또는 상반신을 촬영하는 구도입니다. 전체적인 스타일이나 의상을 함께 보여줄 때 효과적입니다.",
  },
  "Group selfie": {
    name: "그룹 셀카",
    description:
      "여러 명이 함께 카메라를 바라보며 찍는 구도입니다. 광각으로 여러 인물을 한 프레임에 담아 생동감 있는 분위기를 연출합니다.",
  },
  // 수직 앵글 (Vertical)
  "Low-angle shot": {
    name: "로우 앵글",
    description: "아래에서 위로 올려다보는 구도입니다. 피사체를 거대하고, 강력하며 지배적인 존재로 보이게 만듭니다.",
  },
  "High-angle shot": {
    name: "하이 앵글",
    description: "위에서 아래로 내려다보는 구도입니다. 피사체를 작고, 귀엽거나 혹은 취약하게 보이게 합니다.",
  },
  "Bird's-eye view": {
    name: "버즈 아이 뷰",
    description:
      "새가 하늘에서 내려다보듯 수직으로 찍는 샷입니다. 전체적인 배치나 구도를 한눈에 보여줄 때 효과적입니다.",
  },
  "Worm's-eye view": {
    name: "웜즈 아이 뷰",
    description: "땅바닥에 붙은 벌레의 시선입니다. 로우 앵글보다 더 극적이고 웅장한 느낌을 줍니다.",
  },
  // 수평 앵글 (Horizontal)
  "Front-facing shot": {
    name: "정면 샷",
    description: "피사체와 같은 높이에서 정직하게 바라보는 구도입니다. 증명사진이나 정물화에 적합합니다.",
  },
  "Side profile view": {
    name: "측면 프로필 뷰",
    description: "피사체의 옆모습을 강조하는 구도입니다. 실루엣이나 라인을 보여줄 때 유용합니다.",
  },
  // 특수 앵글 (Specialty)
  "Dutch angle": {
    name: "더치 앵글",
    description: "카메라를 의도적으로 기울여 불안감, 긴장감, 혹은 역동성을 부여합니다. 액션 씬 연출에 필수적입니다.",
  },
  "Over-the-shoulder shot": {
    name: "오버 더 숄더 샷",
    description: "누군가의 어깨너머로 대상을 바라보는 구도입니다. 대화 장면이나 관찰자 시점을 표현할 때 좋습니다.",
  },
  "Point of view shot": {
    name: "POV 샷",
    description: "1인칭 시점 구도입니다. 관객이 직접 체험하는 듯한 강한 몰입감을 줍니다.",
  },
  // 거리/디테일
  "Macro shot": {
    name: "매크로 샷",
    description: "초근접 촬영으로 미세한 질감을 표현합니다. 작은 피사체의 디테일을 극대화할 때 매우 적합합니다.",
  },
  // 수직 확장
  "Aerial shot": {
    name: "항공 샷",
    description: "버즈 아이 뷰보다 훨씬 높은 곳에서 광활한 지역을 담는 샷입니다. 드론이나 헬기 시점을 표현합니다.",
  },
  // 수평 위치
  "Ground-level shot": {
    name: "그라운드 레벨 샷",
    description: "카메라가 지면에 붙어 수평을 유지하는 구도입니다. 발이나 낮은 물체를 강조하는 데 효과적입니다.",
  },
  // 스타일
  "Fish-eye lens": {
    name: "피시아이 렌즈",
    description: "초광각 렌즈를 사용해 이미지가 둥글게 왜곡되는 효과를 줍니다. 재미있고 독특한 분위기를 연출합니다.",
  },
};
