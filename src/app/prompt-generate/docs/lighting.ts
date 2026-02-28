export const lightingOptions = {
  photo: {
    "야외/자연광": [
      {
        name: "자연광",
        prompt: "natural lighting",
        description: "야외에서 찍은 듯한 자연스러운 빛",
      },
      {
        name: "골든아워",
        prompt: "golden hour lighting",
        description: "해질녘의 따뜻하고 노란 빛",
      },
      {
        name: "부드러운 햇살",
        prompt: "soft diffused sunlight",
        description: "구름 낀 날처럼 부드럽게 퍼진 빛",
      },
      {
        name: "역광",
        prompt: "backlight",
        description: "뒤에서 비치는 빛으로 인물 테두리가 빛남",
      },
    ],
    "실내/촬영장": [
      {
        name: "스튜디오 조명",
        prompt: "studio lighting",
        description: "프로필 사진처럼 깔끔하고 균일한 빛",
      },
      {
        name: "림라이트",
        prompt: "rim lighting",
        description: "인물 외곽선이 빛나서 배경과 확실히 분리되는 효과",
      },
      {
        name: "소프트박스",
        prompt: "softbox lighting",
        description: "그림자가 거의 없는 부드럽고 깨끗한 빛",
      },
      {
        name: "렘브란트 조명",
        prompt: "Rembrandt lighting",
        description: "얼굴 한쪽만 밝히는 클래식한 인물 조명",
      },
    ],
    "모던/트렌디": [
      {
        name: "시네마틱",
        prompt: "cinematic lighting",
        description: "영화 한 장면 같은 깊은 명암",
      },
      {
        name: "네온",
        prompt: "neon lighting",
        description: "도시 간판 같은 형형색색 인공 빛",
      },
      {
        name: "어두운 분위기",
        prompt: "low-key lighting",
        description: "배경이 어둡고 인물만 부각되는 조명",
      },
      {
        name: "따뜻한 실내등",
        prompt: "warm ambient lighting",
        description: "카페나 거실처럼 아늑한 실내 조명",
      },
    ],
  },
  comic: {
    "기본 조명": [
      {
        name: "부드러운 조명",
        prompt: "soft lighting",
        description: "그림자가 자연스럽고 부드러운 기본 조명",
      },
      {
        name: "평면 조명",
        prompt: "flat lighting",
        description: "그림자가 거의 없는 깔끔한 느낌",
      },
      {
        name: "드라마틱 조명",
        prompt: "dramatic lighting",
        description: "밝은 곳과 어두운 곳의 차이가 큰 강렬한 조명",
      },
    ],
    "효과 조명": [
      {
        name: "역광 실루엣",
        prompt: "backlit, silhouette lighting",
        description: "뒤에서 비치는 빛으로 감성적인 장면 연출",
      },
      {
        name: "마법/글로우",
        prompt: "glowing light, magical aura",
        description: "빛이 나는 마법 같은 효과",
      },
      {
        name: "석양빛",
        prompt: "sunset glow",
        description: "노을처럼 따뜻하고 붉은 빛",
      },
      {
        name: "달빛",
        prompt: "moonlight",
        description: "밤하늘 아래 푸른 빛",
      },
      {
        name: "렌즈플레어",
        prompt: "lens flare, light rays",
        description: "빛줄기가 화면에 퍼지는 효과",
      },
    ],
  },
} as const;

export const moodOptions = {
  photo: [
    {
      name: "따뜻한 톤",
      prompt: "warm tones",
      description: "오렌지/노란 계열의 편안한 색감",
    },
    {
      name: "차가운 톤",
      prompt: "cool tones",
      description: "파란/회색 계열의 세련된 색감",
    },
    {
      name: "파스텔 톤",
      prompt: "soft pastel tones",
      description: "연하고 부드러운 색감",
    },
    {
      name: "선명한 색감",
      prompt: "vivid colors",
      description: "강렬하고 눈에 띄는 색감",
    },
    {
      name: "필름 느낌",
      prompt: "film grain, analog film look",
      description: "옛날 필름 카메라로 찍은 듯한 감성",
    },
    {
      name: "배경 흐림",
      prompt: "bokeh, shallow depth of field",
      description: "인물은 선명하고 배경은 뿌옇게",
    },
    {
      name: "무디/감성적",
      prompt: "moody atmosphere",
      description: "전체적으로 어둡고 감정이 깊은 느낌",
    },
    {
      name: "밝고 화사한",
      prompt: "bright and airy",
      description: "환하고 깨끗한 느낌",
    },
  ],
  comic: [
    {
      name: "선명하고 화려한",
      prompt: "vibrant colors",
      description: "화려하고 역동적인 색감",
    },
    {
      name: "파스텔",
      prompt: "pastel colors, soft palette",
      description: "연하고 부드러운 동화 같은 색감",
    },
    {
      name: "따뜻한 색감",
      prompt: "warm color palette",
      description: "오렌지/핑크 계열의 포근한 색감",
    },
    {
      name: "차가운 색감",
      prompt: "cool color palette",
      description: "파란/보라 계열의 차분한 색감",
    },
    {
      name: "수채화풍",
      prompt: "watercolor style",
      description: "물감이 번진 듯 투명하고 은은한 느낌",
    },
    {
      name: "네온/사이버",
      prompt: "neon glow, cyberpunk colors",
      description: "형광빛이 도는 미래 도시 느낌",
    },
    {
      name: "어둡고 무거운",
      prompt: "dark atmosphere, muted colors",
      description: "어둡고 긴장감 있는 분위기",
    },
    {
      name: "일본 애니메이션 스타일",
      prompt: "Makoto Shinkai style, beautiful detailed sky",
      description: "하늘이 아름답고 빛이 반짝이는 감성 애니 느낌",
    },
  ],
} as const;

export type LightingKeys =
  | (typeof lightingOptions.photo)[keyof typeof lightingOptions.photo][number]["prompt"]
  | (typeof lightingOptions.comic)[keyof typeof lightingOptions.comic][number]["prompt"];

export type MoodKeys = (typeof moodOptions.photo)[number]["prompt"] | (typeof moodOptions.comic)[number]["prompt"];
