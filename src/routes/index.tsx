import { createFileRoute } from "@tanstack/react-router";
import { SolarWatch } from '@/game/SolarWatch';
export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({ meta: [
    { title: 'Solar Watch — Selene Moon Outpost' },
    { name: 'description', content: 'Direct a lunar outpost, explore south-pole craters and protect four astronauts from space weather in Solar Watch.' },
    { property: 'og:title', content: 'Solar Watch — Selene Moon Outpost' },
    { property: 'og:description', content: 'Build, explore and survive on the Moon in this educational space mission.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: SolarWatch,
});
