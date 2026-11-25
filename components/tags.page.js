/**
 * One page per component tag, at /components/tags/<tag>/. They render with
 * the component list layout, which shows only components with that tag.
 */
export const layout = "layouts/component-list.vto";
export const type = "component-tag";

export default function* ({ search }) {
  const tags = new Set(
    search.pages("type=component").flatMap((page) => page.tags ?? []),
  );
  for (const tag of [...tags].sort()) {
    yield {
      url: `/components/tags/${tag}/`,
      title: `Components: ${tag}`,
      description: `Components tagged “${tag}”.`,
      tag,
    };
  }
}
