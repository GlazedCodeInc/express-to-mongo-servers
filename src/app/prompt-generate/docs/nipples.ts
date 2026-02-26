export const nipples = {
  category: "Nipples",
  focus: "Anatomical realism, pigmentation control, projection depth, texture detailing",
  model_support: ["FLUX", "SDXL", "Stable Diffusion 1.5+", "Realistic checkpoints", "Anime checkpoints"],
  principles: {
    kr: "전체 흉부 비율과의 조화를 유지해야 하며, 광원 방향과 피부 질감 표현이 핵심이다. 과도한 대비·샤프닝은 인위적인 결과를 초래할 수 있다.",
    en: "Maintain proportional harmony with overall breast structure. Lighting direction and skin texture control are critical. Excessive contrast or sharpening may cause artificial results.",
  },
  types: [
    {
      name: "Small Nipples",
      point: {
        kr: "유두가 작고 부드러운 형태",
        en: "Small, subtle, and softly defined nipples",
      },
      prompt: "small nipples, compact nipple size, subtle projection, balanced areola",
      description_kr:
        "유두 직경이 작고 돌출이 크지 않은 유형. 전체적인 가슴 비율과 자연스럽게 어우러지며 과장되지 않은 형태가 특징이다. 사실적인 표현에서는 피부 질감과 미세 음영 표현이 중요하다.",
      description_en:
        "Nipples with a small diameter and minimal projection. They blend naturally with the overall breast proportion and appear subtle rather than dominant. Realistic rendering depends on soft shading and fine skin texture.",
      generation_notes: {
        kr: "부드러운 확산광 사용 권장. 과도한 샤프닝은 왜곡을 유발할 수 있음. CFG 5~6 유지.",
        en: "Use soft diffused lighting. Avoid over-sharpening to prevent distortion. Keep CFG scale around 5–6 for stable realism.",
      },
    },
    {
      name: "Large Nipples",
      point: {
        kr: "유두가 크고 존재감이 강함",
        en: "Large and visually prominent nipples",
      },
      prompt: "large nipples, prominent structure, defined contour, realistic shading",
      description_kr:
        "유두의 직경과 돌출이 비교적 큰 형태. 시각적 중심이 되기 쉬우므로 광원과 명암 대비 조절이 중요하다.",
      description_en:
        "Nipples with a larger diameter and stronger projection. They naturally draw visual focus, requiring careful light and contrast balancing.",
      generation_notes: {
        kr: "측면 조명으로 입체감 강조. 과한 대비는 경계 아티팩트 발생 가능.",
        en: "Use side lighting to enhance dimensionality. Avoid excessive contrast to prevent edge artifacts.",
      },
    },
    {
      name: "Protruding Nipples",
      point: {
        kr: "앞으로 돌출된 구조",
        en: "Clearly projecting outward structure",
      },
      prompt: "protruding nipples, defined projection, soft highlight on tip",
      description_kr: "유두가 명확하게 앞으로 돌출된 형태. 중심부 하이라이트와 주변 음영의 자연스러운 연결이 핵심이다.",
      description_en:
        "Nipples that extend outward clearly. A natural highlight at the tip and smooth shadow transition are essential for realism.",
      generation_notes: {
        kr: "광원 방향 명확히 지정. 왜곡 방지를 위해 과도한 depth 표현 금지.",
        en: "Specify light direction clearly. Avoid exaggerating depth to maintain anatomical accuracy.",
      },
    },
    {
      name: "Flat Nipples",
      point: {
        kr: "돌출이 거의 없는 평평한 형태",
        en: "Minimal projection with a flat appearance",
      },
      prompt: "flat nipples, minimal projection, smooth areola transition, soft gradient shading",
      description_kr: "유두 돌출이 거의 없으며 표면과 자연스럽게 이어지는 형태. 명암 대비가 강하지 않다.",
      description_en:
        "Nipples with little to no projection, blending smoothly into the areola. Contrast levels remain low and subtle.",
      generation_notes: {
        kr: "저대비 조명 권장. 중앙부 블러 아티팩트 주의.",
        en: "Use low-contrast lighting. Watch for unwanted blur artifacts in the center.",
      },
    },
    {
      name: "Inverted Nipples",
      point: {
        kr: "안쪽으로 들어간 구조",
        en: "Indented inward instead of projecting",
      },
      prompt: "inverted nipples, subtle indentation, soft central shadow",
      description_kr: "유두가 안쪽으로 들어가 중앙에 음영이 형성되는 형태. 과장되면 비현실적으로 보일 수 있다.",
      description_en:
        "Nipples that retract inward, forming a subtle central indentation. Overemphasis can break realism.",
      generation_notes: {
        kr: "부드러운 측광 사용. 과도한 음영 깊이 표현 금지.",
        en: "Use soft side lighting. Avoid deep shadow exaggeration.",
      },
    },
    {
      name: "Puffy Nipples / Raised Areola",
      point: {
        kr: "유륜 전체가 살짝 부풀어 있음",
        en: "Areola slightly raised with rounded contour",
      },
      prompt: "puffy nipples, raised areola, smooth rounded contour, natural skin gradient",
      description_kr: "유륜 전체가 약간 부풀어 오른 형태. 경계선이 부드럽고 곡면이 자연스럽게 이어져야 한다.",
      description_en:
        "The entire areola appears slightly raised with soft rounded transitions. Smooth contour blending is crucial.",
      generation_notes: {
        kr: "확산광 활용. 하드 아웃라인 발생 주의.",
        en: "Use diffused lighting. Avoid hard outlines around the areola.",
      },
    },
    {
      name: "Dark Areolas",
      point: {
        kr: "색 대비가 강한 유륜",
        en: "Deep pigmentation with strong contrast",
      },
      prompt: "dark areolas, rich pigmentation, natural tone variation, balanced saturation",
      description_kr: "주변 피부보다 진한 색조를 가진 유형. 채도 과다 시 인위적으로 보일 수 있다.",
      description_en:
        "Areolas with deeper pigmentation compared to surrounding skin. Excessive saturation may look artificial.",
      generation_notes: {
        kr: "화이트 밸런스 중립 유지. 채도 조절 필수.",
        en: "Maintain neutral white balance. Control saturation carefully.",
      },
    },
    {
      name: "Light Areolas",
      point: {
        kr: "피부와 유사한 연한 색조",
        en: "Soft, low-contrast pigmentation",
      },
      prompt: "light areolas, subtle pigmentation, soft gradient blending, natural skin tone",
      description_kr: "주변 피부와 큰 차이가 없는 색상. 미묘한 색 변화 표현이 중요하다.",
      description_en: "Areolas with minimal tonal difference from surrounding skin. Subtle gradient control is key.",
      generation_notes: {
        kr: "과노출 방지. 대비를 미세하게 조정.",
        en: "Prevent overexposure. Slightly adjust contrast for visibility.",
      },
    },
    {
      name: "Asymmetrical Nipples",
      point: {
        kr: "좌우 크기·형태가 약간 다름",
        en: "Slight natural left-right variation",
      },
      prompt: "asymmetrical nipples, natural anatomical variation, slight size difference",
      description_kr: "좌우 형태가 완전히 동일하지 않은 자연스러운 구조. 현실감을 높이는 요소다.",
      description_en: "Naturally uneven shape or size between sides. Enhances anatomical realism.",
      generation_notes: {
        kr: "극단적 차이는 피할 것. 자연스러운 범위 내 유지.",
        en: "Avoid extreme mismatch. Keep variation subtle and realistic.",
      },
    },
  ],
};
