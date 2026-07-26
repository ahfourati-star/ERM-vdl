import { notFound } from "next/navigation";
import { Lesson } from "@/components/leren/Lesson";
import { getTheme, THEMES } from "@/lib/leren/vocabulary";

/**
 * Les thèmes sont connus à l'avance : on génère une page pour chacun au
 * moment de la construction du site. C'est ce qui rend l'ouverture d'une
 * leçon instantanée, même sur une vieille tablette.
 */
export function generateStaticParams() {
  return THEMES.map((theme) => ({ theme: theme.id }));
}

export default async function ThemePage(props: PageProps<"/leren/[theme]">) {
  const { theme: themeId } = await props.params;
  const theme = getTheme(themeId);
  if (!theme) notFound();

  return <Lesson theme={theme} />;
}
