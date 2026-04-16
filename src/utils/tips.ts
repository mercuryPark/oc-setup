const TIPS = [
  "The balanced preset is our most popular choice ($20-40/mo).",
  "Run 'oc-setup doctor' anytime to check your environment health.",
  "Claude Code users: 'oc-setup migrate claude-code' migrates in seconds.",
  "OMO presets auto-configure oh-my-opencode agent models.",
  "All presets are customizable — edit the generated files anytime.",
]

export function randomTip(): string {
  return TIPS[Math.floor(Math.random() * TIPS.length)]
}
